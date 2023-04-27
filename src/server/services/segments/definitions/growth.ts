import { createSegmentDefinitions } from '@satoshibits/data-segmenter';

export const growthSegmentDefinitions = createSegmentDefinitions([
  {
    name: 'originalsource',
    description: 'Segment by originalSource of profiles.',
    buildQuery: (value) => {
      return { originalSource: value } as const;
    },
  },
  {
    name: 'customer or prospect',
    description: 'Get all profiles based on whether they had transactions or not',
    buildQuery: (value) => {
      if (value === 'Customer') {
        return {
          totalTransactions: { $gt: 0 } as const,
        };
      }
      return {
        totalTransactions: { $eq: 0 } as const,
      };
    },
  },
  {
    name: 'retention',
    description: 'Get all profiles that had or had no transaction events ',
    buildQuery: (value) => {
      if (value === 'Without Transactions') {
        return { $not: { $elemMatch: { 'events.event': 'transaction' } } } as const;
      }
      return {
        'events.event': 'transaction' as const,
      };
    },
  },
  {
    name: 'number of transactions',
    description: 'Get all profiles that had this number of transactions.',
    buildQuery: (value) => {
      return { totalTransactions: value as number } as const;
    },
  },
  {
    name: 'lifetime value',
    description: 'Get all profiles that have this lifetime value.',
    buildQuery: (value) => {
      return { lifetimeValue: value as number } as const;
    },
  },
]);

export type GrowthDefinitonKeys = (typeof growthSegmentDefinitions)[number]['name'];
