import {
  compositionOperatorSchema,
  defaultComposableSegmentSchema,
  timePeriodComposableSegmentSchema,
  timeRangeComposableSegmentSchema,
} from "@satoshibits/data-segmenter";
import { z } from "zod";
import type { MyComposedSegment } from "./types/segments";

export const timePeriodDateFilterSchema = z.object({
  type: z.literal("timeperiod"),
  value: z.string(),
  name: z.string(),
});

export const timeRangeDateFilterSchema = z.object({
  type: z.literal("timerange"),
  start: z.string(),
  end: z.string(),
  name: z.string(),
});

export const dateFilterSchema = z.union([
  timePeriodDateFilterSchema,
  timeRangeDateFilterSchema,
]);

export const logicalOperatorSchema = z.union([
  z.literal("AND"),
  z.literal("OR"),
  z.literal("NOT"),
]);

export const filterOptionSchema = z.object({
  name: z.string(),
  value: z.union([z.literal("AND"), z.literal("NOT")]),
});

export const segmentOptionValueSchema = z.object({
  label: z.string().nullish(),
  value: z.union([z.string(), z.number()]),
  count: z.number().nullable(),
});

export const segmentSelectionGroupSchema = z.object({
  id: z.string(),
  groupKey: z.string(),
  mainSegmentSelection: segmentOptionValueSchema
    .and(
      z.object({
        segmentKey: z.string(),
      })
    )
    .nullable(),
  extraSelections: z.array(
    segmentOptionValueSchema.and(
      z.object({
        segmentKey: z.string(),
      })
    )
  ),
  segmentsRelation: z.union([z.literal("AND"), z.literal("OR")]),
  filterOption: filterOptionSchema.nullable(),
  logicalOperator: logicalOperatorSchema,
  dateFilter: dateFilterSchema.optional(),
});

export const segmentSelectionGroupsSchema = z.array(
  segmentSelectionGroupSchema
);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
export const composedSegmentSchema: z.ZodSchema<MyComposedSegment> = z.lazy(
  () =>
    z.object({
      type: z.literal("composed"),
      operator: compositionOperatorSchema,
      segments: z.array(
        z.union([
          defaultComposableSegmentSchema,
          composedSegmentSchema,
          timePeriodComposableSegmentSchema,
          timeRangeComposableSegmentSchema,
        ])
      ),
    })
);
