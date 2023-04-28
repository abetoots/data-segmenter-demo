import { parse } from "@satoshibits/data-segmenter";
import type {
  MongoDBQuery,
  MyComposedSegment,
  MySegmentSelectionGroup,
  SegmentTimeFields,
  SegmentTimeValues,
} from "~/server/types/segments";
import type { AllSegmentDefinitionKeys } from "./definitions";
import { segmentComposer } from "./composer";
import { allDefinitions } from "./definitions";
import { addEventsToProfiles } from "~/server/mongo-helpers";

/**
 * Parses a composed segment to MongoDB queries
 */
export const queryParser = (composedSegment: MyComposedSegment) => {
  return parse<
    MongoDBQuery,
    AllSegmentDefinitionKeys | string,
    SegmentTimeFields,
    SegmentTimeValues
  >(composedSegment, segmentComposer, allDefinitions);
};

type GetSegmentAggregateQuery = {
  parsedQuery: MongoDBQuery;
  accountId: string;
  initialMatch?: MongoDBQuery;
  segmentSelectionsGroup: MySegmentSelectionGroup[];
};

/**
 * Returns an optimized aggregate pipeline by checking if the segment queryState
 * (or segmentSelectionsGroup) contains a group that needs a lookup to the events collection.
 *
 * Can receive an initialMatch MongoDB query to append to the first $match in the pipeline.
 *
 * The returned pipeline should is for the profiles collection.
 */
export const getSegmentAggregateQuery = ({
  parsedQuery,
  initialMatch,
  accountId,
  segmentSelectionsGroup,
}: GetSegmentAggregateQuery) => {
  let match = { ...parsedQuery, accountId };
  if (initialMatch) match = { ...match, ...initialMatch };
  const aggregatePipeline: Record<string, unknown>[] = [{ $match: match }];
  //NOTE: Add a lookup to events only if the segment selection groups contain a marketing
  //or transaction group as these depend on the events. This avoids
  //having to join the the potentially big events collection  unnecessarily
  let eventsLookupMatch: Record<string, unknown>[] = [];
  if (segmentSelectionsGroup && segmentSelectionsGroup.length > 0) {
    //When segment selections contain a transaction group
    // add a match to pipeline to match transaction events
    if (segmentSelectionsGroup.find((s) => s.groupKey === "transaction")) {
      eventsLookupMatch = [...eventsLookupMatch, { event: "transaction" }];
    }

    //When segment selections contain a marketing group
    // add a match to pipeline to match marketing events
    if (segmentSelectionsGroup.find((s) => s.groupKey === "marketing events")) {
      eventsLookupMatch = [
        ...eventsLookupMatch,
        {
          event: new RegExp("email", "g"), //add email events that have campaigns
          campaign: { $exists: true, $ne: null },
          campaignId: { $exists: true, $ne: null },
        },
      ];
    }
  }

  //Only add the lookup if needed
  if (eventsLookupMatch.length > 0) {
    const lookup = addEventsToProfiles([
      {
        $match: {
          $or: eventsLookupMatch,
        },
      },
    ]);
    aggregatePipeline.unshift(lookup);
  }
  return aggregatePipeline;
};
