//Components
import Button from "./buttons";
import { PlusCircledIcon, TrashIcon } from "@radix-ui/react-icons";

//Misc
import upperFirst from "lodash.upperfirst";
import React from "react";
import cloneDeep from "lodash.clonedeep";

//Types
import type {
  MySegmentSelectionGroup,
  RemoveQueryFn,
  UpdateQueryFn,
} from "~/pages";
import type {
  DateFilter,
  FilterOption,
  LogicalOperator,
  MySegmentSelection,
  SegmentTimeValues,
} from "~/server/types/segments";
import Select, { SelectItem } from "./select";
import Toggle from "./toggle";
import Badge from "./badge";

type RenderQueriesProps<TQuery extends MySegmentSelectionGroup[]> = {
  selections: TQuery;
  updateQuery: UpdateQueryFn;
  timePeriodOptions: DateFilter<SegmentTimeValues>[];
  removeQuery: RemoveQueryFn;
  addNewQuery: () => void;
};

const SegmentSelections = <T extends MySegmentSelectionGroup[]>({
  selections,
  updateQuery,
  timePeriodOptions,
  removeQuery,
  addNewQuery,
}: RenderQueriesProps<T>) => {
  const logicalOperatorClickHandler = (
    value: LogicalOperator,
    index: number
  ) => {
    updateQuery("logicalOperator", value, index);
  };

  const selectFilterOptionHandler = (value: FilterOption, index: number) => {
    updateQuery("filterOption", value, index);
  };

  const selectFieldsToggleHandler = (value: boolean, index: number) => {
    const newVal: MySegmentSelectionGroup["segmentsRelation"] = value
      ? "OR"
      : "AND";
    updateQuery("segmentsRelation", newVal, index);
  };

  const removeFieldsHandler = (
    { value }: MySegmentSelection<string>,
    index: number
  ) => {
    const copy = cloneDeep(selections);
    const q = copy[index];
    if (q) {
      //remove from extra selections first
      if (q.extraSelections.length > 0) {
        const newVal = q.extraSelections.filter((f) => f.value !== value);
        updateQuery("extraSelections", newVal, index);
      } else {
        if (q.mainSegmentSelection) {
          updateQuery("mainSegmentSelection", null, index);
        }
      }
    }
  };

  const selectTimePeriodHandler = (
    value: DateFilter<SegmentTimeValues>,
    index: number
  ) => {
    updateQuery("dateFilter", value, index);
  };

  return (
    <>
      {selections.map((query, index) => {
        let logicalOperators;
        if (index > 0) {
          logicalOperators = (
            <div className="mb-6 flex space-x-3">
              <Button
                theme={query.logicalOperator === "AND" ? "primary" : "white"}
                onClick={() => logicalOperatorClickHandler("AND", index)}
              >
                AND
              </Button>
              <Button
                theme={query.logicalOperator === "OR" ? "primary" : "white"}
                onClick={() => logicalOperatorClickHandler("OR", index)}
              >
                OR
              </Button>
              <Button
                theme={query.logicalOperator === "NOT" ? "primary" : "white"}
                onClick={() => logicalOperatorClickHandler("NOT", index)}
              >
                NOT
              </Button>
            </div>
          );
        }
        return (
          <div className="mb-6" key={query.groupKey}>
            {logicalOperators}
            <SelectionCard
              group={query.groupKey}
              filterOption={query.filterOption}
              onSelectFilterOption={(newVal) =>
                selectFilterOptionHandler(newVal, index)
              }
              timePeriodOptions={timePeriodOptions}
              fieldsToggle={query.segmentsRelation === "OR" ? true : false}
              onSelectFieldsToggle={(newVal) =>
                selectFieldsToggleHandler(newVal, index)
              }
              fieldsSelection={
                query.mainSegmentSelection
                  ? [query.mainSegmentSelection, ...query.extraSelections]
                  : []
              }
              onDeleteQuery={() => removeQuery(index)}
              onRemoveFields={(newVal) => removeFieldsHandler(newVal, index)}
              timePeriodOption={query.dateFilter}
              onSelectTimePeriod={(newVal) =>
                selectTimePeriodHandler(newVal, index)
              }
            />
          </div>
        );
      })}
      <div className="flex w-full">
        <button
          onClick={() => addNewQuery()}
          type="button"
          className="ml-auto flex items-center justify-center rounded-full bg-indigo-800 p-1 text-white hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
        >
          <PlusCircledIcon width={20} aria-hidden="true" />
          <span className="sr-only">Add another selection</span>
        </button>
      </div>
    </>
  );
};

export default SegmentSelections;

type SelectionCardProps<TTimePeriodOption> = {
  group: string;
  filterOption: MySegmentSelectionGroup["filterOption"];
  onSelectFilterOption: (val: FilterOption) => void;
  fieldsToggle?: boolean;
  onSelectFieldsToggle?: (val: boolean) => void;
  fieldsSelection: MySegmentSelection<string>[];
  onDeleteQuery: () => void;
  onRemoveFields: (val: MySegmentSelection<string>) => void;
  disabled?: boolean;
  timePeriodOption?: TTimePeriodOption;
  timePeriodOptions: TTimePeriodOption[];
  onSelectTimePeriod: (val: TTimePeriodOption) => void;
};

export const SelectionCard = <T extends DateFilter<SegmentTimeValues>>({
  group,
  filterOption,
  onSelectFilterOption,
  fieldsToggle,
  onSelectFieldsToggle,
  fieldsSelection,
  onDeleteQuery,
  onRemoveFields,
  disabled,
  timePeriodOption,
  timePeriodOptions,
  onSelectTimePeriod,
}: SelectionCardProps<T>) => {
  let filterOptions: FilterOption[] = [{ name: "that have", value: "AND" }];
  let textBefore = "";
  let textAfter = "";

  if (group === "growth") {
    textBefore = "People";
    filterOptions = [
      { name: "that have", value: "AND" },
      { name: "that have NOT", value: "NOT" },
    ];
  }

  if (group === "profile") {
    textBefore = "People";
    textAfter = "their";
    filterOptions = [
      { name: "that have", value: "AND" },
      { name: "that have NOT", value: "NOT" },
    ];
  }

  if (group === "marketing events") {
    textBefore = "People that";
    filterOptions = [
      { name: "have", value: "AND" },
      { name: "have NOT", value: "NOT" },
    ];
  }

  if (group === "transaction") {
    textBefore = "People that";
    filterOptions = [
      { name: "have bought", value: "AND" },
      { name: "have NOT bought", value: "NOT" },
    ];
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p>{`${upperFirst(group)} selection`}</p>
        <TrashIcon
          width={15}
          className="rounded border-red-800 bg-red-100 text-red-600"
          onClick={onDeleteQuery}
        />
      </div>
      <div className="rounded border bg-gray-50 p-3 shadow">
        <div className="mb-3 flex items-center">
          <p className="mr-3">{textBefore} </p>
          <div className="flex-1">
            <Select
              value={filterOption?.value || filterOptions[0]?.value}
              onValueChange={(newVal) => {
                const selectedVal = filterOptions.find(
                  (i) => i.value === newVal
                );
                selectedVal && onSelectFilterOption(selectedVal);
              }}
            >
              {filterOptions.map((i) => {
                return (
                  <SelectItem key={i.value} value={i.value}>
                    {i.name}
                  </SelectItem>
                );
              })}
            </Select>
          </div>
          {textAfter ? <p className="ml-6">{textAfter}</p> : null}
        </div>

        <div className="flex flex-wrap items-center space-x-1">
          {fieldsSelection.map((field, index) => {
            let toggle;
            if (
              index === 1 &&
              fieldsToggle !== undefined &&
              onSelectFieldsToggle
            ) {
              toggle = (
                <div className="mb-2 w-full pb-1.5">
                  <Toggle
                    id=""
                    checked={fieldsToggle}
                    onCheckedChange={onSelectFieldsToggle}
                    rightText="OR"
                    leftText="AND"
                  />
                </div>
              );
            }
            return (
              <React.Fragment key={field.value}>
                {toggle}
                <Badge
                  key={field.value}
                  className="mb-2 rounded-sm"
                  withRemove
                  onRemove={() => onRemoveFields(field)}
                >
                  {field.segmentKey}
                  {": "}
                  {field.value}
                </Badge>
              </React.Fragment>
            );
          })}
        </div>

        <div className="w-full">
          <Select
            value={timePeriodOption?.name}
            onValueChange={(newVal) => {
              const selectedVal = timePeriodOptions.find(
                (i) => i.name === newVal
              );
              selectedVal && onSelectTimePeriod(selectedVal);
            }}
          >
            {timePeriodOptions.map((i) => {
              return (
                <SelectItem key={i.name} value={i.name}>
                  {i.name}
                </SelectItem>
              );
            })}
          </Select>
        </div>
      </div>
    </section>
  );
};
