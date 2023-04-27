import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import ReactPaginate from "react-paginate";
import type { ReactPaginateProps } from "react-paginate";

const DefaultPreviousLabel = () => (
  <div>
    <span className="sr-only">Previous</span>
    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
  </div>
);

const DefaultNextLabel = () => (
  <div>
    <span className="sr-only">Next</span>
    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
  </div>
);

type PaginationProps = Omit<
  ReactPaginateProps,
  "pageRangeDisplayed" | "marginPagesDisplayed"
> & {
  pageRangeDisplayed?: number;
  marginPagesDisplayed?: number;
};

export default function Pagination({
  pageRangeDisplayed = 5,
  marginPagesDisplayed = 1,
  pageCount,
  previousLabel = <DefaultPreviousLabel />,
  nextLabel = <DefaultNextLabel />,
  breakLabel = "...",
  containerClassName,
  previousClassName,
  nextClassName,
  pageLinkClassName,
  activeLinkClassName,
  breakClassName,
  ...props
}: PaginationProps) {
  return (
    <ReactPaginate
      breakLabel={breakLabel}
      containerClassName={classNames(
        "relative z-0 inline-flex rounded-md shadow-sm -space-x-px",
        containerClassName
      )}
      previousClassName={classNames(
        "relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50",
        previousClassName
      )}
      nextClassName={classNames(
        "relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50",
        nextClassName
      )}
      pageLinkClassName={classNames(
        "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium",
        pageLinkClassName
      )}
      activeLinkClassName={classNames(
        "z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium",
        activeLinkClassName
      )}
      breakClassName={classNames(
        "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700",
        breakClassName
      )}
      pageRangeDisplayed={pageRangeDisplayed}
      marginPagesDisplayed={marginPagesDisplayed}
      pageCount={pageCount}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      {...props}
    />
  );
}
