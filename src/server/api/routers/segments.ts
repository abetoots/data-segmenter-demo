/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  createTRPCRouter,
  getSearchQueries,
  getSkipLimit,
  isPaginable,
  isSearchable,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import {
  composedSegmentSchema,
  segmentSelectionGroupsSchema,
} from "~/server/validations";
import { getDb } from "~/server/mongo";
import { env } from "~/env.mjs";
import type {
  GetOptionsFn,
  SegmentOptionValue,
} from "@satoshibits/data-segmenter";
import type {
  GrowthDefinitonKeys,
  MarketingDefinitionKeys,
  ProfileDefinitionKeys,
  TransactionDefinitionKeys,
} from "~/server/services/segments/definitions";
import {
  getSegmentAggregateQuery,
  queryParser,
} from "~/server/services/segments/helpers";
import type { AccountProfile } from "~/server/types/account";
import type { Filter } from "mongodb";
import { getProspectQuery } from "~/server/mongo-helpers";
import { subMonths } from "date-fns";

const segmentGroups = [
  "growth",
  "transaction",
  "profile",
  "marketing events",
] as const;

const accountSegmentsRouter = createTRPCRouter({
  getSegmentGroups: publicProcedure.query(() => segmentGroups),
  getSegmentOptions: publicProcedure.query(async () => {
    const [growth, profile, transaction, marketing] = await Promise.all([
      await getGrowthOptions(),
      await getProfileSegmentOptions(),
      await getTransactionSegmentOptions(),
      await getMarketingSegmentOptions(),
    ]);

    type ReturnData = {
      [Key in (typeof segmentGroups)[number]]:
        | typeof growth
        | typeof profile
        | typeof transaction
        | typeof marketing;
    };

    const data: ReturnData = {
      growth,
      "marketing events": marketing,
      profile,
      transaction,
    };

    return data;
  }),
  runComposedSegment: publicProcedure
    .input(
      isPaginable.merge(isSearchable).merge(
        z.object({
          countOnly: z.boolean().optional(),
          composedSegment: composedSegmentSchema,
          queryState: segmentSelectionGroupsSchema,
        })
      )
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const parsedQuery = queryParser(input.composedSegment);
      const pipeline = getSegmentAggregateQuery({
        accountId: env.ACCOUNT_ID,
        parsedQuery,
        segmentSelectionsGroup: input.queryState,
      });

      if (input.countOnly) {
        pipeline.push({ $count: "totalCount" });
        const docs = await db.profiles.aggregate(pipeline).toArray();
        const totalCount: number = docs[0]?.totalCount || 0;
        return { data: [], totalCount, totalPages: -1, parsedQuery };
      }
      const { shouldSearch, searchQueries } = getSearchQueries<AccountProfile>(
        ["email", "firstname"],
        input?.q
      );
      const { skip, limit } = getSkipLimit(input?.p, input?.ps);
      let filter: Filter<AccountProfile> = { accountId: env.ACCOUNT_ID };
      if (shouldSearch) filter = { ...filter, $or: searchQueries };

      pipeline.push({
        $project: {
          id: 1,
          accountId: 1,
          email: 1,
          firstname: 1,
          lastname: 1,
          lists: 1,
          lifetimeValue: 1,
        },
      });
      pipeline.push({ $sort: { email: 1 } });
      pipeline.push({
        $facet: {
          data: [{ $match: filter }, { $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      });

      const docs = await db.profiles.aggregate(pipeline).toArray();

      const data: Pick<
        AccountProfile,
        | "id"
        | "accountId"
        | "email"
        | "firstname"
        | "lastname"
        | "lists"
        | "lifetimeValue"
      > = docs[0]?.data || [];
      const totalCount: number = docs[0]?.totalCount[0]?.count || 0;
      const totalPages: number = Math.ceil(totalCount / limit);

      return { data, totalCount, totalPages, parsedQuery };
    }),
});

export default accountSegmentsRouter;

const getGrowthOptions: GetOptionsFn<GrowthDefinitonKeys> = async () => {
  const accountDb = await getDb();
  //get prospects within 12 months
  const prospectQuery = getProspectQuery(subMonths(new Date(), 12));
  const data = await accountDb.profiles
    .aggregate([
      {
        $project: {
          originalSource: 1,
          totalTransactions: 1,
          lifetimeValue: 1,
          customerCreatedAt: 1,
        },
      },
      {
        $facet: {
          originalSourceOptions: [
            { $match: { originalSource: { $exists: true, $ne: null } } },
            { $group: { _id: "$originalSource", count: { $sum: 1 } } },
            { $project: { _id: 0, value: "$_id", count: 1 } },
          ],
          lifetimeValueOptions: [
            { $match: { lifetimeValue: { $exists: true, $ne: null } } },
            { $group: { _id: "$lifetimeValue", count: { $sum: 1 } } },
            { $project: { _id: 0, value: "$_id", count: 1 } },
          ],
          numberOfTransactionsOptions: [
            { $match: { totalTransactions: { $exists: true, $ne: null } } },
            { $group: { _id: "$totalTransactions", count: { $sum: 1 } } },
            { $project: { _id: 0, value: "$_id", count: 1 } },
          ],
          customers: [
            { $match: { totalTransactions: { $gt: 0 } } },
            { $count: "count" },
          ],
          prospects: [{ $match: prospectQuery }, { $count: "count" }],
        },
      },
    ])
    .toArray();

  const originalSourceOptions = data[0]
    ?.originalSourceOptions as SegmentOptionValue[];
  const lifetimeValueOptions = data[0]
    ?.lifetimeValueOptions as SegmentOptionValue[];
  const numberOfTransactionsOptions = data[0]
    ?.numberOfTransactionsOptions as SegmentOptionValue[];
  const customersCount = data[0]?.customers.count as number;
  const prospectsCount = data[0]?.prospects.count as number;

  return {
    originalsource: originalSourceOptions,
    "customer or prospect": [
      { value: "Customer", count: customersCount },
      { value: "Prospect", count: prospectsCount },
    ],
    "lifetime value": lifetimeValueOptions,
    "number of transactions": numberOfTransactionsOptions,
    retention: [
      { value: "With Transactions", count: null },
      { value: "Without Transactions", count: null },
    ],
  };
};

const getProfileSegmentOptions: GetOptionsFn<
  ProfileDefinitionKeys
> = async () => {
  const accountDb = await getDb();
  const data = await accountDb.profiles
    .aggregate([
      {
        $project: {
          updatedsource: 1,
          address: 1,
          street: 1,
          city: 1,
          zip: 1,
          country: 1,
          company: 1,
          jobTitle: 1,
          sector: 1,
        },
      },
      {
        $facet: {
          updatedsourceOptions: [
            { $match: { updatedsource: { $exists: true, $ne: null } } },
            { $group: { _id: "$updatedsource", count: { $sum: 1 } } },
            { $project: { _id: 0, value: "$_id", count: 1 } },
          ],
          addressOptions: [
            { $match: { address: { $exists: true, $ne: null } } },
            { $group: { _id: "$address", count: { $sum: 1 } } },
            { $project: { _id: 0, value: "$_id", count: 1 } },
          ],
          streetOptions: [
            { $match: { street: { $exists: true, $ne: null } } },
            { $group: { _id: "$street", count: { $sum: 1 } } },
            { $project: { _id: 0, value: "$_id", count: 1 } },
          ],
          cityOptions: [
            { $match: { city: { $exists: true, $ne: null } } },
            { $group: { _id: "$city", count: { $sum: 1 } } },
            { $project: { _id: 0, value: "$_id", count: 1 } },
          ],
          zipOptions: [
            { $match: { zip: { $exists: true, $ne: null } } },
            { $group: { _id: "$zip", count: { $sum: 1 } } },
            { $project: { _id: 0, value: "$_id", count: 1 } },
          ],
          countryOptions: [
            { $match: { country: { $exists: true, $ne: null } } },
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $project: { _id: 0, value: "$_id", count: 1 } },
          ],
          companyOptions: [
            { $match: { company: { $exists: true, $ne: null } } },
            { $group: { _id: "$company", count: { $sum: 1 } } },
            { $project: { _id: 0, value: "$_id", count: 1 } },
          ],
          jobTitleOptions: [
            { $match: { jobTitle: { $exists: true, $ne: null } } },
            { $group: { _id: "$jobTitle", count: { $sum: 1 } } },
            { $project: { _id: 0, value: "$_id", count: 1 } },
          ],
          sectorOptions: [
            { $match: { sector: { $exists: true, $ne: null } } },
            { $group: { _id: "$sector", count: { $sum: 1 } } },
            { $project: { _id: 0, value: "$_id", count: 1 } },
          ],
        },
      },
    ])
    .toArray();

  const updatedsourceOptions = data[0]
    ?.updatedsourceOptions as SegmentOptionValue[];
  const addressOptions = data[0]?.addressOptions as SegmentOptionValue[];
  const streetOptions = data[0]?.streetOptions as SegmentOptionValue[];
  const cityOptions = data[0]?.cityOptions as SegmentOptionValue[];
  const zipOptions = data[0]?.zipOptions as SegmentOptionValue[];
  const countryOptions = data[0]?.countryOptions as SegmentOptionValue[];
  const companyOptions = data[0]?.companyOptions as SegmentOptionValue[];
  const jobTitleOptions = data[0]?.jobTitleOptions as SegmentOptionValue[];
  const sectorOptions = data[0]?.sectorOptions as SegmentOptionValue[];

  return {
    address: addressOptions,
    city: cityOptions,
    company: companyOptions,
    country: countryOptions,
    interest: [],
    jobtitle: jobTitleOptions,
    sector: sectorOptions,
    street: streetOptions,
    tags: [],
    updatedsource: updatedsourceOptions,
    zip: zipOptions,
  };
};

const getTransactionSegmentOptions: GetOptionsFn<
  TransactionDefinitionKeys
> = async () => {
  const accountDb = await getDb();
  const data = await accountDb.events
    .aggregate([
      { $match: { event: "transaction" } },
      {
        $project: {
          event: 1,
          total: 1,
          discountcode: 1,
          utm: 1,
          line_items: 1,
          customer: 1,
          currency: 1,
          profile: 1,
        },
      },
      {
        $facet: {
          spendOptions: [
            { $match: { total: { $exists: true, $ne: null } } },
            {
              $group: {
                _id: "$total",
                profilesSet: {
                  $addToSet: "$profile.id",
                },
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id",
                count: { $size: "$profilesSet" },
              },
            },
          ],
          currencyOptions: [
            { $match: { currency: { $exists: true, $ne: null } } },
            {
              $group: {
                _id: "$currency",
                profilesSet: {
                  $addToSet: "$profile.id",
                },
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id",
                count: { $size: "$profilesSet" },
              },
            },
          ],
          discountcodeOptions: [
            { $match: { discountcode: { $exists: true, $ne: null } } },
            {
              $group: {
                _id: "$discountcode",
                profilesSet: {
                  $addToSet: "$profile.id",
                },
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id",
                count: { $size: "$profilesSet" },
              },
            },
          ],
          utmOptions: [
            { $match: { utm: { $exists: true, $ne: null } } },
            {
              $group: {
                _id: "$utm",
                profilesSet: {
                  $addToSet: "$profile.id",
                },
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id",
                count: { $size: "$profilesSet" },
              },
            },
          ],
          productNameOptions: [
            {
              $group: {
                _id: "$line_items.name",
                profilesSet: {
                  $addToSet: "$profile.id",
                },
              },
            },
            {
              $project: {
                _id: 0,
                value: { $first: "$_id" },
                count: { $size: "$profilesSet" },
              },
            },
          ],
          variantOptions: [
            {
              $group: {
                _id: "$line_items.variant",
                profilesSet: {
                  $addToSet: "$profile.id",
                },
              },
            },
            {
              $project: {
                _id: 0,
                value: { $first: "$_id" },
                count: { $size: "$profilesSet" },
              },
            },
          ],
          vendorOptions: [
            {
              $group: {
                _id: "$line_items.vendor",
                profilesSet: {
                  $addToSet: "$profile.id",
                },
              },
            },
            {
              $project: {
                _id: 0,
                value: { $first: "$_id" },
                count: { $size: "$profilesSet" },
              },
            },
          ],
        },
      },
    ])
    .toArray();

  const spendOptions = data[0]?.spendOptions as SegmentOptionValue[];
  const currencyOptions = data[0]?.currencyOptions as SegmentOptionValue[];
  const discountcodeOptions = data[0]
    ?.discountcodeOptions as SegmentOptionValue[];
  const utmOptions = data[0]?.utmOptions as SegmentOptionValue[];
  const productNameOptions = data[0]
    ?.productNameOptions as SegmentOptionValue[];
  const variantOptions = data[0]?.variantOptions as SegmentOptionValue[];
  const vendorOptions = data[0]?.vendorOptions as SegmentOptionValue[];

  return {
    "product name": productNameOptions,
    currency: currencyOptions,
    discountcode: discountcodeOptions,
    spend: spendOptions,
    tags: [],
    utm: utmOptions,
    variant: variantOptions,
    vendor: vendorOptions,
  };
};

const getMarketingSegmentOptions: GetOptionsFn<
  MarketingDefinitionKeys
> = async () => {
  const accountDb = await getDb();
  const data = await accountDb.events
    .aggregate([
      {
        $match: {
          event: new RegExp("email", "g"),
          campaign: { $exists: true, $ne: null },
          campaignId: { $exists: true, $ne: null },
        },
      },
      {
        $project: {
          campaign: 1,
          campaignId: 1,
          profile: 1,
        },
      },
      {
        $facet: {
          deliveredOptions: [
            {
              $match: { event: "email_delivered" },
            },
            {
              $group: {
                _id: { campaign: "$campaign", campaignId: "$campaignId" },
                profilesSet: {
                  $addToSet: "$profile.id",
                },
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id.campaignId",
                label: "$_id.campaign",
                count: { $size: "$profilesSet" },
              },
            },
          ],
          openedOptions: [
            {
              $match: { event: "email_open" },
            },
            {
              $group: {
                _id: { campaign: "$campaign", campaignId: "$campaignId" },
                profilesSet: {
                  $addToSet: "$profile.id",
                },
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id.campaignId",
                label: "$_id.campaign",
                count: { $size: "$profilesSet" },
              },
            },
          ],
          clickedOptions: [
            {
              $match: { event: "email_click" },
            },
            {
              $group: {
                _id: { campaign: "$campaign", campaignId: "$campaignId" },
                profilesSet: {
                  $addToSet: "$profile.id",
                },
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id.campaignId",
                label: "$_id.campaign",
                count: { $size: "$profilesSet" },
              },
            },
          ],
          bouncedOptions: [
            {
              $match: { event: "email_bounce" },
            },
            {
              $group: {
                _id: { campaign: "$campaign", campaignId: "$campaignId" },
                profilesSet: {
                  $addToSet: "$profile.id",
                },
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id.campaignId",
                label: "$_id.campaign",
                count: { $size: "$profilesSet" },
              },
            },
          ],
          unsubscribedOptions: [
            {
              $match: { event: "email_unsubscribe" },
            },
            {
              $group: {
                _id: { campaign: "$campaign", campaignId: "$campaignId" },
                profilesSet: {
                  $addToSet: "$profile.id",
                },
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id.campaignId",
                label: "$_id.campaign",
                count: { $size: "$profilesSet" },
              },
            },
          ],
        },
      },
    ])
    .toArray();

  const deliveredOptions = data[0]?.deliveredOptions as SegmentOptionValue[];
  const openedOptions = data[0]?.openedOptions as SegmentOptionValue[];
  const clickedOptions = data[0]?.clickedOptions as SegmentOptionValue[];
  const bouncedOptions = data[0]?.bouncedOptions as SegmentOptionValue[];
  const unsubscribedOptions = data[0]
    ?.unsubscribedOptions as SegmentOptionValue[];

  return {
    bounced: bouncedOptions,
    clicked: clickedOptions,
    delivered: deliveredOptions,
    opened: openedOptions,
    unsubscribed: unsubscribedOptions,
  };
};
