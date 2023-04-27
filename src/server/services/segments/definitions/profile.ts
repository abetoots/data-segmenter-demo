import { createSegmentDefinitions } from '@satoshibits/data-segmenter';

export const profileSegmentDefinitions = createSegmentDefinitions([
  {
    name: 'updatedsource',
    description: 'Get all profiles that are from this updated source.',
    buildQuery: (value) => {
      return { updatedsource: value } as const;
    },
  },
  {
    name: 'address',
    description: 'Get all profiles that are from this address.',
    buildQuery: (value) => {
      return { address: value } as const;
    },
  },
  {
    name: 'street',
    description: 'Get all profiles that are from this street.',
    buildQuery: (value) => {
      return { street: value } as const;
    },
  },
  {
    name: 'city',
    description: 'Get all profiles that are from this city.',
    buildQuery: (value) => {
      return { city: value } as const;
    },
  },
  {
    name: 'zip',
    description: 'Get all profiles that are from this zip.',
    buildQuery: (value) => {
      return { zip: value } as const;
    },
  },
  {
    name: 'country',
    description: 'Get all profiles that are from this country.',
    buildQuery: (value) => {
      return { country: value } as const;
    },
  },
  {
    name: 'company',
    description: 'Get all profiles that are from this company.',
    buildQuery: (value) => {
      return { company: value } as const;
    },
  },
  {
    name: 'jobtitle',
    description: 'Get all profiles that are from this jobtitle.',
    buildQuery: (value) => {
      return { jobtitle: value } as const;
    },
  },
  {
    name: 'sector',
    description: 'Get all profiles that are from this sector.',
    buildQuery: (value) => {
      return { sector: value } as const;
    },
  },
  {
    name: 'interest',
    description: 'Get all profiles that are from this interest.',
    buildQuery: (value) => {
      return { interest: value } as const;
    },
  },
  {
    name: 'tags',
    description: 'Get all profiles that are from this tags.',
    buildQuery: (value) => {
      return { tags: { $in: [value] } } as const;
    },
  },
]);

export type ProfileDefinitionKeys = (typeof profileSegmentDefinitions)[number]['name'];
