import { createSegmentDefinitions } from "@satoshibits/data-segmenter";

export const marketingSegmentDefinitions = createSegmentDefinitions([
  {
    name: "delivered",
    description: "Get all profiles that have been delivered this campaign.",
    buildQuery: (value) => {
      return {
        "events.event": "email_delivered",
        "events.campaignId": value,
      } as const;
    },
  },
  {
    name: "opened",
    description: "Get all profiles that have opened this campaign.",
    buildQuery: (value) => {
      return {
        "events.event": "email_open",
        "events.campaignId": value,
      } as const;
    },
  },
  {
    name: "clicked",
    description: "Get all profiles that have clicked this campaign.",
    buildQuery: (value) => {
      return {
        "events.event": "email_click",
        "events.campaignId": value,
      } as const;
    },
  },
  {
    name: "bounced",
    description: "Get all profiles that have bounced this campaign.",
    buildQuery: (value) => {
      return {
        "events.event": "email_bounce",
        "events.campaignId": value,
      } as const;
    },
  },
  {
    name: "unsubscribed",
    description: "Get all profiles that have unsubscribed from this campaign.",
    buildQuery: (value) => {
      return {
        "events.event": "email_unsubscribe",
        "events.campaignId": value,
      } as const;
    },
  },
]);

export type MarketingDefinitionKeys =
  (typeof marketingSegmentDefinitions)[number]["name"];
