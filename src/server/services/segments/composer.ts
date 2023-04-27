import { QueryComposer } from "@satoshibits/data-segmenter";
import { subDays } from "date-fns";
import type {
  MongoDBQuery,
  SegmentTimeFields,
  SegmentTimeValues,
} from "~/server/types/segments";

export const segmentComposer = new QueryComposer<
  MongoDBQuery,
  SegmentTimeFields,
  SegmentTimeValues
>({
  combineQueries: (queries) =>
    queries.reduce((prevVal, currVal) => ({ ...prevVal, ...currVal }), {}),
  negateQuery: (field, value) => ({ [field]: { $ne: value } }),
  composeOrQuery: (queries) => ({ $or: queries }),
  composeAndQuery: (queries) => ({ $and: queries }),
  composeNotQuery: (queries) => ({ $not: queries }),
  composeTimePeriodQuery: (field, value, operator) => {
    let op = "";
    switch (operator) {
      case "GT":
        op = "$gt";
        break;
      case "GTE":
        op = "$gte";
        break;
      case "LT":
        op = "$lt";
        break;
      case "LTE":
        op = "$lte";
        break;
      default:
        break;
    }
    let dateValue: Date | undefined = undefined;
    switch (value) {
      case "30days":
        dateValue = subDays(new Date(), 30);
        break;
      case "90days":
        dateValue = subDays(new Date(), 90);
        break;
      case "180days":
        dateValue = subDays(new Date(), 180);
        break;
      case "1year":
        dateValue = subDays(new Date(), 365);
        break;
      default:
        break;
    }
    return { [field]: { [op]: dateValue } };
  },
  composeTimeRangeQuery: (field, start, end) => {
    //up to you how to resolve fields
    return { [field]: { $gte: start, $lte: end } };
  },
});
