import { createSegmentDefinitions } from '@satoshibits/data-segmenter';

export const transactionSegmentDefinitions = createSegmentDefinitions([
  {
    name: 'spend',
    description: 'Get all customers that spent this amount.',
    buildQuery: (value) => {
      return { 'events.total': value } as const;
    },
  },
  {
    name: 'currency',
    description: 'Get all customers that spent this currency.',
    buildQuery: (value) => {
      return { 'events.currency': value } as const;
    },
  },
  {
    name: 'discountcode',
    description: 'Get all customers that used this discountcode.',
    buildQuery: (value) => {
      return { 'events.discountcode': value } as const;
    },
  },
  {
    name: 'utm',
    description: 'Get all customers that have this utm tracking.',
    buildQuery: (value) => {
      return { 'events.utm': value } as const;
    },
  },
  {
    name: 'product name',
    description: 'Get all customers that bought this product name.',
    buildQuery: (value) => {
      return { 'events.line_items.name': value } as const;
    },
  },
  {
    name: 'variant',
    description: 'Get all customers that bought this product variant.',
    buildQuery: (value) => {
      return { 'events.line_items.variant': value } as const;
    },
  },
  {
    name: 'vendor',
    description: 'Get all customers that bought from this vendor.',
    buildQuery: (value) => {
      return { 'events.line_items.vendor': value } as const;
    },
  },
  {
    name: 'tags',
    description: 'Get all customers with this tag.',
    buildQuery: (value) => {
      return { 'events.customer.tags': { $in: [value] } } as const;
    },
  },
]);

export type TransactionDefinitionKeys = (typeof transactionSegmentDefinitions)[number]['name'];
