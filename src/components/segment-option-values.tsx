//Components
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Checkbox from "@radix-ui/react-checkbox";

//Misc
import { useState } from "react";

//Types
import type { SegmentOptionValue } from "@satoshibits/data-segmenter";
import { paginate } from "~/utils/helpers";
import type { DateFilter, SegmentTimeValues } from "~/server/types/segments";
import Pagination from "./pagination";
import Badge from "./badge";
import { CheckIcon } from "@radix-ui/react-icons";

type MiddleColumnProps<TTimePeriodOption, TGroup extends string> = {
  timePeriodOptions: TTimePeriodOption[];
  timeValue?: TTimePeriodOption;
  group?: TGroup;
  onSelectTimePeriod: (val: TTimePeriodOption) => void;
  segmentOptionValues: SegmentOptionValue[];
  segmentOptionValue?: SegmentOptionValue[];
  onSelectSegmentOptionValue: (
    checked: boolean,
    value: SegmentOptionValue
  ) => void;
  search?: string;
};

const SegmentOptionValues = <
  TTimePeriodOption extends DateFilter<SegmentTimeValues>,
  TGroup extends string
>({
  group,
  timePeriodOptions,
  onSelectTimePeriod,
  timeValue,
  segmentOptionValues,
  segmentOptionValue,
  onSelectSegmentOptionValue,
}: MiddleColumnProps<TTimePeriodOption, TGroup>) => {
  const [pageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);

  console.log("segmentOptionValues", segmentOptionValues);

  const sorted = [...segmentOptionValues]
    .sort((a, b) => {
      if (b.count && a.count) {
        return b.count - a.count;
      }
      if (!b.count && a.count) {
        return -1;
      }
      if (!a.count && b.count) {
        return 1;
      }
      return 0;
    })
    .filter((i) => !!i.value);

  const paginatedArray = paginate(sorted, pageSize, pageNumber);

  let heading = "";
  if (group === "transaction") {
    heading = "Transaction / Product Name";
  }
  if (group === "marketing") {
    heading = "Marketing";
  }
  if (group === "profile") {
    heading = "Profile";
  }

  return (
    <section className="rounded border p-6 shadow">
      <div className="mb-6">
        <h4 className="mb-3 border-b pb-1">
          Select a time period for your segment
        </h4>
        <ToggleGroup.Root
          className="flex space-x-4"
          type="single"
          aria-label="Time periods"
          value={timeValue?.name}
          onValueChange={(newVal) => {
            const f = timePeriodOptions.find((x) => x.name === newVal);
            f && onSelectTimePeriod(f);
          }}
        >
          {timePeriodOptions.map((i) => {
            return (
              <ToggleGroup.Item
                key={i.name}
                className="flex cursor-pointer  items-center justify-center rounded-md border border-gray-200  bg-white px-4 py-2 text-center text-xs font-medium uppercase leading-4 text-gray-900 ring-indigo-500 ring-offset-2 hover:bg-gray-50 focus:z-10 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none focus:ring-2 data-[state=on]:bg-indigo-600 data-[state=on]:text-white sm:flex-1"
                value={i.name}
                aria-label={i.name}
              >
                {i.name.toUpperCase()}
              </ToggleGroup.Item>
            );
          })}
        </ToggleGroup.Root>
      </div>
      <div className="mb-6">
        <h4 className="mb-3">
          Select the {group} fields you want to create your segment
        </h4>
        <div className="divide-y divide-gray-200">
          {paginatedArray.map((i) => {
            return (
              <div key={i.value} className="flex items-center py-4">
                <label
                  className="flex-1 text-sm leading-none"
                  htmlFor={`c-${i.value}`}
                >
                  {i.label ? i.label : i.value}
                </label>
                {i.count ? (
                  <Badge className="mr-4 rounded-sm" color="gray" size="sm">
                    {i.count}
                  </Badge>
                ) : null}
                <Checkbox.Root
                  key={i.value}
                  className="flex h-5 w-5 appearance-none items-center justify-center rounded-md border border-gray-300 bg-white  outline-none ring-indigo-600 ring-offset-2 focus:ring-2"
                  id={`c-${i.value}`}
                  checked={
                    !!segmentOptionValue?.find((x) => x.value === i.value)
                  }
                  onCheckedChange={(newVal) =>
                    onSelectSegmentOptionValue(
                      newVal === true ? true : false,
                      i
                    )
                  }
                >
                  <Checkbox.Indicator>
                    <CheckIcon />
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex w-full">
        <Pagination
          pageCount={Math.ceil(segmentOptionValues.length / pageSize)}
          containerClassName="ml-auto"
          onPageChange={(e) => setPageNumber(e.selected + 1)}
        />
      </div>
    </section>
  );
};

export default SegmentOptionValues;
