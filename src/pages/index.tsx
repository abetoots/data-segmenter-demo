//Components
import { type NextPage } from "next";
import Head from "next/head";
import Notification from "~/components/notification";
import * as Accordion from "@radix-ui/react-accordion";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import JSONInput from "react-json-editor-ajrm";
import * as Separator from "@radix-ui/react-separator";

//MISC
import cloneDeep from "lodash.clonedeep";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { createComposer } from "@satoshibits/data-segmenter";

//Types
import type { ToastOptions } from "react-toastify";
import type { RouterOutput } from "~/server/api/root";
import type {
  DateFilter,
  SegmentSelectionGroup,
  SegmentTimeValues,
} from "~/server/types/segments";
import type { MySegmentSelection } from "~/server/types/segments";
import { useEffect, useState } from "react";
import type {
  ComposableSegments,
  TimePeriodComposableSegment,
  SegmentOptionValue,
} from "@satoshibits/data-segmenter";
import type { SegmentTimeFields } from "~/server/types/segments";
import type { TimePeriodDateFilter } from "~/server/types/segments";
import type { AllSegmentDefinitionKeys } from "~/server/services/segments/definitions";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/accordion";
import RadioGroup from "~/components/radio-group";
import upperFirst from "lodash.upperfirst";
import Paper from "~/components/paper";
import SegmentOptionValues from "~/components/segment-option-values";
import StatCard from "~/components/stat-card";
import { ErrorBadge } from "~/components/badge";
import Button from "~/components/buttons";
import classNames from "classnames";
import SegmentSelections from "~/components/segment-selections";
import locale from "~/utils/locale";

const getLastItem = <T,>(items: T[]): T | undefined => {
  const cloned = cloneDeep(items[items.length - 1]);
  return cloned;
};

export const dateFilterOptions: DateFilter<SegmentTimeValues>[] = [
  { type: "timeperiod", value: "all", name: "All" },
  { type: "timeperiod", value: "30days", name: "30 Days" },
  { type: "timeperiod", value: "90days", name: "90 Days" },
  { type: "timeperiod", value: "180days", name: "180 Days" },
  { type: "timeperiod", value: "1year", name: "12 Months" },
];

type GetSegmentOptionsQueryData = RouterOutput["segments"]["getSegmentOptions"];

//utility helper to extract all keys of a nested objects
type OptionKeys<T> = {
  [K in keyof T]: keyof T[K];
}[keyof T];

export type MySegmentOptionGroups =
  RouterOutput["segments"]["getSegmentGroups"][number];
export type MySegmentOptionsKeys = OptionKeys<GetSegmentOptionsQueryData>;
export type MySegmentSelectionGroup = SegmentSelectionGroup<
  MySegmentOptionGroups,
  MySegmentSelection<MySegmentOptionsKeys>,
  SegmentTimeValues
>;

/**
 * Updates the query at the proper index with the new properties' value.
 */
export type UpdateQueryFn = (
  key: keyof MySegmentSelectionGroup,
  value: MySegmentSelectionGroup[keyof MySegmentSelectionGroup],
  index: number
) => void;

/**
 * Removes a query at the proper index
 */
export type RemoveQueryFn = (index: number) => void;

const QUERY_LIMIT = 2;

const Home: NextPage = () => {
  const [segmentSelectionsGroup, setSegmentSelectionsGroup] = useState<
    MySegmentSelectionGroup[]
  >([]);
  const [currentSelectedSegmentOption, setCurrentSelectedSegmentOption] =
    useState<MySegmentOptionsKeys>();
  const [currentSelectedGroup, setCurrentSelectedGroup] =
    useState<MySegmentOptionGroups>();
  const [segmentSize, setSegmentSize] = useState(0);
  const [queryError, setQueryError] = useState("");
  const [parsedQuery, setParsedQuery] = useState<Record<string, unknown>>();
  const [composedSegment, setComposedSegment] =
    useState<ReturnType<typeof composer>>();

  const segmentOptionsQuery = api.segments.getSegmentOptions.useQuery(
    undefined,
    {
      onError: () => notifyError("Could not get segment options"),
      refetchOnWindowFocus: false,
    }
  );

  const segmentGroupsQuery = api.segments.getSegmentGroups.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const runMutation = api.segments.runComposedSegment.useMutation({
    onError: () => notifyError("Could not run segment query"),
  });

  useEffect(() => {
    if (segmentSize) {
      toast(
        <Notification
          type="info"
          primaryText="Segment matched!"
          infoText={`${segmentSize} profiles found that match this segment. Would you like to send a marketing campaign to this segment?`}
          actionButton={
            <Button
              className="!ml-3 self-center"
              onClick={() => {
                notifySuccess("Campaign sent!");
              }}
            >
              Yes
            </Button>
          }
        />
      );
    }
  }, [segmentSize]);

  /**
   * Get all the possibile segment groups
   */
  const segmentGroups = segmentGroupsQuery.data || [];

  /**
   * Get all the possible segment options and spread to a dictionary
   */
  // | undefined
  let allSegmentOptions:
    | { [Key in AllSegmentDefinitionKeys]: SegmentOptionValue[] }
    | undefined;
  for (const group of segmentGroups) {
    if (segmentOptionsQuery.data) {
      if (allSegmentOptions) {
        allSegmentOptions = {
          ...segmentOptionsQuery.data[group],
          ...allSegmentOptions,
        };
      } else {
        allSegmentOptions = { ...segmentOptionsQuery.data[group] } as {
          [Key in AllSegmentDefinitionKeys]: SegmentOptionValue[];
        };
      }
    }
  }

  const optionValues: SegmentOptionValue[] =
    allSegmentOptions && currentSelectedSegmentOption
      ? allSegmentOptions[currentSelectedSegmentOption]
      : [];

  /**
   * Always get a clone of the last item in the segment selections. A lot of actions and changes will be
   * applied to this item. You can mutate as you wish since this does not contain a reference
   * to the actual last item in the state.
   */
  const LAST_SELECTION = getLastItem(segmentSelectionsGroup);

  const calculateSegmentHandler = async (
    selections: MySegmentSelectionGroup[]
  ) => {
    const composedSegments = composeSegments(selections);
    if (composedSegments) {
      //TODO Request parsedQuery and segment size, set parsedQuery response to jsonQuery for JSONInput
      const data = await runMutation.mutateAsync({
        composedSegment: composedSegments,
        countOnly: true,
        queryState: selections,
      });
      setSegmentSize(data.totalCount);
      setParsedQuery(data.parsedQuery);
      setComposedSegment(composedSegments);
    }
  };

  /**
   * Adds a new query if the lastSelection's dataType (or group)
   * does not match the new selected option's group (e.target.name)
   */
  const selectSegmentOptionHandler = (
    selectedOption: MySegmentOptionsKeys,
    group: MySegmentOptionGroups,
    lastSelection?: MySegmentSelectionGroup
  ) => {
    if (lastSelection?.groupKey !== group) {
      addNewQuery(group);
    }
    console.log("selectedOption", selectedOption);
    setCurrentSelectedSegmentOption(selectedOption);
    setCurrentSelectedGroup(group);
  };

  const updateLastQuery = (query: MySegmentSelectionGroup) => {
    const copy = cloneDeep(segmentSelectionsGroup);
    copy.splice(copy.length - 1, 1);
    copy.push(query);
    setSegmentSelectionsGroup(copy);
  };

  const selectSegmentOptionValueHandler = (
    checked: boolean,
    option: SegmentOptionValue,
    segmentKey: MySegmentOptionsKeys,
    lastSelection?: MySegmentSelectionGroup
  ) => {
    const value =
      typeof option.value === "number"
        ? +option.value
        : typeof option.value === "string"
        ? option.value
        : null;

    if (lastSelection && value) {
      const segmentSelection = {
        count: option.count,
        value,
        label: option.label,
        segmentKey,
      };
      if (checked) {
        if (!lastSelection.mainSegmentSelection) {
          lastSelection.mainSegmentSelection = segmentSelection;
        } else {
          lastSelection.extraSelections.push(segmentSelection);
        }
      } else {
        if (lastSelection.extraSelections.length > 0) {
          lastSelection.extraSelections = lastSelection.extraSelections.filter(
            (item) => item.value !== value
          );
        } else if (lastSelection.mainSegmentSelection) {
          lastSelection.mainSegmentSelection = null;
        }
      }
      updateLastQuery(lastSelection);
    }
  };

  //START IMPURE FUNCTIONS. be careful not to mutate state

  const addNewQuery = (group: MySegmentOptionGroups) => {
    const copy = cloneDeep(segmentSelectionsGroup);
    if (copy.length === QUERY_LIMIT) {
      //start replacing the last item
      copy.splice(copy.length - 1, 1);
    }
    copy.push({
      id: `${group}-${copy.length + 1}`,
      mainSegmentSelection: null,
      extraSelections: [],
      segmentsRelation: "OR",
      filterOption: null,
      logicalOperator: "AND",
      groupKey: group,
      dateFilter: dateFilterOptions[0],
    });
    setSegmentSelectionsGroup(copy);
  };

  const queryUpdateHandler: UpdateQueryFn = (key, val, index) => {
    const copy = cloneDeep(segmentSelectionsGroup);
    let toEdit = copy[index];
    if (toEdit) {
      toEdit = { ...toEdit, [key]: val };
      copy[index] = toEdit;
    }

    setSegmentSelectionsGroup(copy);
  };

  const removeQueryHandler: RemoveQueryFn = (index) => {
    const copy = cloneDeep(segmentSelectionsGroup);
    copy.splice(index, 1);
    setSegmentSelectionsGroup(copy);
  };

  /**
   * Adds new segmentSelectionsGroup depending the currentSelectedGroup and
   * currentSelectedSegmentOption in context
   */
  const addNewQueryInContextHandler = () => {
    if (currentSelectedGroup === undefined && !currentSelectedSegmentOption) {
      setQueryError("Please select a data type first");
      return;
    }
    setQueryError("");
    addNewQuery(
      currentSelectedGroup as NonNullable<typeof currentSelectedGroup>
    );
  };
  //END IMPURE FUNCTIONS. be careful not to mutate state
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-r from-cyan-500 to-blue-500 p-4 md:p-8">
        {segmentGroupsQuery.isLoading ? (
          <div className="flex min-h-screen w-full items-center justify-center">
            <ClimbingBoxLoader color="#85FF9E" size={30} />
          </div>
        ) : (
          <>
            <h1 className="mb-6 text-4xl font-bold">Data Segmenter Demo</h1>
            <p className="mb-6 text-slate-50">
              The tool below uses the data-segmenter SegmentComposer API to mix
              and match segments.
              <br />
              <br />
              Left Column: The different segment options defined and fetched
              from the backend, grouped for easier navigation. You pick among
              these options with the intention to pick data that match these
              criteria (e.g. Under Transaction, when you pick product name, your
              intention is &quot;I want to match profiles that bought this
              product name&quot;)
              <br />
              <br />
              Middle Column: The possible values of the segment option. You can
              also filter against a time period.
              <br />
              <br />
              Right Column: Your selected segments. You can calculate how many
              from the data source matches your composed segments.
            </p>
            <div
              className="mb-6 gap-6 px-3 py-9 md:grid md:px-9"
              style={{ gridTemplateColumns: "1fr 2fr 1fr" }}
            >
              <section>
                <Accordion.Root
                  className="w-[300px] rounded-md shadow-[0_2px_10px] shadow-black/5"
                  type="single"
                  defaultValue="item-1"
                  collapsible
                >
                  {segmentGroups.map((group) => {
                    const opts = Object.keys(
                      segmentOptionsQuery.data?.[group] || {}
                    );
                    return (
                      <AccordionItem key={group} value={group}>
                        <AccordionTrigger>{upperFirst(group)}</AccordionTrigger>
                        <AccordionContent className="bg-slate-50">
                          <RadioGroup
                            options={opts}
                            stateHandler={(newVal) =>
                              selectSegmentOptionHandler(
                                newVal as MySegmentOptionsKeys,
                                group,
                                LAST_SELECTION
                              )
                            }
                            value={currentSelectedSegmentOption}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion.Root>
              </section>
              <section>
                <Paper>
                  <h3 className="mb-6">Define Your Segment</h3>
                  <SegmentOptionValues
                    segmentOptionValues={optionValues}
                    group={currentSelectedGroup}
                    segmentOptionValue={
                      LAST_SELECTION?.mainSegmentSelection
                        ? [
                            LAST_SELECTION?.mainSegmentSelection,
                            ...LAST_SELECTION.extraSelections,
                          ]
                        : []
                    }
                    onSelectSegmentOptionValue={(checked, option) =>
                      currentSelectedSegmentOption &&
                      selectSegmentOptionValueHandler(
                        checked,
                        option,
                        currentSelectedSegmentOption,
                        LAST_SELECTION
                      )
                    }
                    timePeriodOptions={dateFilterOptions}
                    onSelectTimePeriod={(val) => {
                      if (LAST_SELECTION) {
                        LAST_SELECTION.dateFilter = val;
                        updateLastQuery(LAST_SELECTION);
                      }
                    }}
                    timeValue={LAST_SELECTION?.dateFilter}
                  />
                </Paper>
              </section>
              <section>
                <Paper className="Column">
                  <section className="mb-6">
                    <StatCard
                      heading="Segment Size"
                      stat={segmentSize.toString()}
                      className="mb-6"
                    />
                    {queryError ? <ErrorBadge>{queryError}</ErrorBadge> : null}
                    <Button
                      disabled={runMutation.isLoading}
                      className={classNames("mb-6 w-full uppercase", {
                        "cursor-wait": runMutation.isLoading,
                      })}
                      onClick={() =>
                        void calculateSegmentHandler(segmentSelectionsGroup)
                      }
                    >
                      Calculate Segment
                    </Button>
                    <p>
                      Segments will be based on contacts that meet the following
                      selected criteria.
                    </p>
                  </section>
                  <SegmentSelections
                    timePeriodOptions={dateFilterOptions}
                    removeQuery={removeQueryHandler}
                    selections={segmentSelectionsGroup}
                    addNewQuery={addNewQueryInContextHandler}
                    updateQuery={queryUpdateHandler}
                  />
                </Paper>
              </section>
            </div>
            <Separator.Root className="my-[15px] bg-white data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px" />
            <section className="flex justify-center px-4 py-6 sm:px-6 lg:px-6">
              <div className="md:min-w-screen-lg mx-auto w-full max-w-screen-lg">
                <h2 className="mb-2 text-3xl">
                  Data Segmenter Composed Segments JSON
                </h2>
                <p className="mb-2 text-slate-50">
                  Built in the client using data segmenter&apos;s segment
                  composer API
                </p>
                <JSONInput
                  placeholder={composedSegment}
                  locale={locale}
                  width="100%"
                  height="550px"
                />
              </div>
            </section>
            <Separator.Root className="my-[15px] bg-white data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px" />{" "}
            <section className="flex justify-center px-4 py-6 sm:px-6 lg:px-6">
              <div className="md:min-w-screen-lg mx-auto w-full max-w-screen-lg">
                <h2 className="mb-2 text-3xl">Parsed Query JSON</h2>
                <p className="mb-2 text-slate-50">
                  Parsed in the backend using data segmenter&apos;s parse
                  function and query composer API
                </p>
                <JSONInput
                  placeholder={parsedQuery}
                  locale={locale}
                  width="100%"
                  height="550px"
                />
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
};

export default Home;

const composer = createComposer<
  MySegmentOptionsKeys,
  SegmentTimeFields,
  SegmentTimeValues
>();

export const composeSegments = (
  segmentSelectionsGroup: MySegmentSelectionGroup[]
) => {
  let composedQuery: ReturnType<typeof composer> | undefined;
  for (const selection of segmentSelectionsGroup) {
    const mainSelection = selection.mainSegmentSelection;
    if (!mainSelection) {
      continue;
    }

    const dateFilter = selection.dateFilter;
    const segmentRelation = selection.segmentsRelation;
    const logicalOperator = selection.logicalOperator;

    const segments: ComposableSegments<
      MySegmentOptionsKeys,
      SegmentTimeFields,
      SegmentTimeValues
    >[] = [];

    if (composedQuery) segments.push(composedQuery);

    const segmentKey = mainSelection.segmentKey;
    const value = mainSelection.value;
    //add the time query first for this group
    if (
      dateFilter &&
      dateFilter.type === "timeperiod" &&
      dateFilter.value !== "all"
    ) {
      const dateSegment = dateFilterToTimePeriodComposableSegment({
        group: selection.groupKey,
        value: dateFilter.value,
        operator: "GTE",
        segmentKey,
      });
      segments.push(dateSegment);
    }

    const composedMainSelection: (typeof segments)[number] = {
      type: "default",
      name: segmentKey,
      value,
      negate: selection.filterOption?.value === "NOT" ? true : false,
    };

    segments.push(composedMainSelection);

    const composedExtraSelections: typeof segments = [];

    selection.extraSelections.forEach((s) => {
      composedExtraSelections.push({
        type: "default",
        name: s.segmentKey,
        value: s.value,
      });
    });

    if (composedExtraSelections.length > 0) {
      segments.push({
        type: "composed",
        operator: segmentRelation,
        segments: composedExtraSelections,
      });
    }

    composedQuery = composer(logicalOperator, segments);
  }

  return composedQuery;
};

type TimePeriodSegment = TimePeriodComposableSegment<
  SegmentTimeFields,
  SegmentTimeValues
>;

type DateFilterToTimePeriodComposableSegmentProps = {
  value: TimePeriodDateFilter<SegmentTimeValues>["value"];
  group: MySegmentOptionGroups;
  operator: TimePeriodSegment["operator"];
  segmentKey?: MySegmentOptionsKeys;
};

const dateFilterToTimePeriodComposableSegment = ({
  group,
  value,
  operator,
  segmentKey,
}: DateFilterToTimePeriodComposableSegmentProps): TimePeriodSegment => {
  let field: SegmentTimeFields = "timestamp";
  if (group === "growth") {
    if (segmentKey === "originalsource") {
      field = "profileCreatedAt";
    } else {
      field = "orderdate";
    }
  }

  return { type: "timeperiod", field, value, operator };
};

export const validateSegmentSelectionGroup = (
  items: MySegmentSelectionGroup[]
) => {
  console.log("validating items", items);
  let error = "";

  if (items.length === 0) {
    error = "Please build a query first";
  }
  //check if user picked a logical operator
  for (let i = 0, l = items.length; i < l; i++) {
    if (i > 0 && !items[i]?.logicalOperator) {
      error = "Please select your logical operator";
      break;
    }
    if (!items[i]?.mainSegmentSelection) {
      error =
        "A selection doesn't contain any fields. Please add some fields or delete that selection";
    }
  }

  return error;
};

const notifyError = (
  primaryText = "Error",
  infoText?: string,
  options?: ToastOptions
) =>
  toast(
    <Notification type="error" primaryText={primaryText} infoText={infoText} />,
    {
      autoClose: 3000,
      ...options,
    }
  );

export const notifySuccess = (
  primaryText = "Success",
  infoText?: string,
  options?: ToastOptions
) =>
  toast(
    <Notification
      type="success"
      primaryText={primaryText}
      infoText={infoText}
    />,
    {
      autoClose: 3000,
      ...options,
    }
  );
