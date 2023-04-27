import type {
  ComposedSegment,
  SegmentOptionValue,
} from "@satoshibits/data-segmenter";

export type MongoDBQuery = Record<string, any>;

export type LogicalOperator = "AND" | "OR" | "NOT";

export type TimePeriodDateFilter<T extends string> = {
  type: "timeperiod";
  value: T;
  name: string;
};

export type TimeRangeDateFilter<T extends string> = {
  type: "timerange";
  start: T;
  end: T;
  name: string;
};

export type DateFilter<T extends string> =
  | TimePeriodDateFilter<T>
  | TimeRangeDateFilter<T>;

/**
 * Represents if a segment group is negated or not
 */
export type FilterOption = {
  name: string;
  value: "AND" | "NOT";
};

/**
 * Represents a segment group that may contain one or more segments
 *
 */
export type SegmentSelectionGroup<
  TGroupKey extends string,
  TSegmentValue extends object,
  TDateFilterValues extends string
> = {
  id: string;
  groupKey: TGroupKey;
  mainSegmentSelection: TSegmentValue | null;
  extraSelections: TSegmentValue[];
  segmentsRelation: "AND" | "OR"; // represents the relation between the main and extra selections
  filterOption: FilterOption | null; // used whether to negate the main selection
  logicalOperator: LogicalOperator; // NOTE: represents the relation to the previous group
  dateFilter?: DateFilter<TDateFilterValues>;
};

export type MySegmentSelection<T extends string> = SegmentOptionValue & {
  segmentKey: T;
};
export type MySegmentSelectionGroup = SegmentSelectionGroup<
  string,
  MySegmentSelection<string>,
  string
>;

export type MyComposedSegment = ComposedSegment<
  string,
  SegmentTimeFields,
  SegmentTimeValues
>;

export interface AccountSegment {
  accountId: string;
  id: string;
  name: string;
  queryState: MySegmentSelectionGroup[];
  composedSegment: MyComposedSegment;
}

/**
 * Represents all possible properties containing dates in our data
 */
export type SegmentTimeFields =
  | "timestamp"
  | "customerCreatedAt"
  | "profileCreatedAt"
  | "orderdate"
  | "lastupdated";

/**
 * Represents all possible time values we can parse for segments
 */
export type SegmentTimeValues =
  | "30days"
  | "90days"
  | "180days"
  | "1year"
  | "all";
