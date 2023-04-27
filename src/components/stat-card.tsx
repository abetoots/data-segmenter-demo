import classNames from "classnames";

type StatCardProps = {
  heading: string;
  stat: string | number;
  className?: string;
  style?: React.CSSProperties;
  color?: "blue" | "green" | "red";
  headingClassName?: string;
  statClassName?: string;
};

const StatCard = ({
  heading,
  stat,
  className,
  style,
  color = "blue",
  ...props
}: StatCardProps) => {
  const colorSet = {
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800",
  };
  return (
    <div
      style={style}
      className={classNames(
        "overflow-hidden rounded-lg border px-4 py-5 sm:p-6",
        colorSet[color],
        className
      )}
    >
      <div
        className={classNames(
          "truncate text-sm font-medium",
          props.headingClassName
        )}
      >
        {heading}
      </div>
      <div
        className={classNames(
          "mt-1 text-3xl font-semibold",
          props.statClassName
        )}
      >
        {stat}
      </div>
    </div>
  );
};

export default StatCard;
