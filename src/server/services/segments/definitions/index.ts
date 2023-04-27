import { growthSegmentDefinitions } from "./growth";
import { profileSegmentDefinitions } from "./profile";
import { transactionSegmentDefinitions } from "./transaction";
import { marketingSegmentDefinitions } from "./marketing";

//Types
import type { GrowthDefinitonKeys } from "./growth";
import type { ProfileDefinitionKeys } from "./profile";
import type { TransactionDefinitionKeys } from "./transaction";
import type { MarketingDefinitionKeys } from "./marketing";

export * from "./growth";
export * from "./profile";
export * from "./transaction";
export * from "./marketing";

export const allDefinitions = [
  ...growthSegmentDefinitions,
  ...profileSegmentDefinitions,
  ...transactionSegmentDefinitions,
  ...marketingSegmentDefinitions,
];

export type AllSegmentDefinitionKeys =
  | GrowthDefinitonKeys
  | ProfileDefinitionKeys
  | TransactionDefinitionKeys
  | MarketingDefinitionKeys;
