import classNames from "classnames";
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import type { ToastContentProps } from "react-toastify";

type NotificationProps = Partial<ToastContentProps> & {
  className?: string;
  primaryText: string;
  infoText?:
    | string
    | ((close: ToastContentProps["closeToast"]) => React.ReactNode);
  leftIcon?: JSX.Element | JSX.Element[] | null;
  actionButton?: JSX.Element | JSX.Element[];
  actionPosition?: "bottom" | "right";
  disableClose?: boolean;
  closeIcon?: JSX.Element | JSX.Element[] | null;
  type?: "success" | "error" | "info";
};

export default function Notification({
  primaryText = "Success!",
  actionPosition = "right",
  disableClose = false,
  closeToast,
  type = "success",
  ...props
}: NotificationProps) {
  let icon;
  if (props.leftIcon || props.leftIcon === null) {
    icon = props.leftIcon;
  } else {
    switch (type) {
      case "success":
        icon = (
          <div className="flex-shrink-0">
            <CheckCircledIcon
              className="h-6 w-6 text-green-400"
              aria-hidden="true"
            />
          </div>
        );
        break;
      case "error":
        icon = (
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon
              className="h-6 w-6 text-red-400"
              aria-hidden="true"
            />
          </div>
        );
        break;
      case "info":
        icon = (
          <div className="flex-shrink-0">
            <InfoCircledIcon
              className="h-6 w-6 text-blue-400"
              aria-hidden="true"
            />
          </div>
        );
        break;
      default:
        icon = null;
        break;
    }
  }

  let actionRight;
  let actionBottom;
  if (props.actionButton) {
    if (actionPosition === "right") {
      actionRight = props.actionButton;
    } else {
      actionBottom = props.actionButton;
    }
  }

  let info;
  if (props.infoText) {
    info =
      typeof props.infoText === "function" ? (
        <div className="mt-1 text-sm text-gray-500">
          {props.infoText(closeToast)}
        </div>
      ) : (
        <div className="mt-1 text-sm text-gray-500">{props.infoText}</div>
      );
  }

  let close;
  if (!disableClose) {
    close = (
      <div className="ml-4 flex flex-shrink-0">
        <button
          className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={closeToast}
        >
          <span className="sr-only">Close</span>
          {props.closeIcon ? (
            props.closeIcon
          ) : (
            <Cross2Icon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div className={classNames(props.className)}>
        <div className="flex items-start">
          {icon}
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{primaryText}</p>
            <div className="mb-3">{info}</div>
            {actionBottom}
          </div>
          {actionRight}
          {close}
        </div>
      </div>
    </>
  );
}
