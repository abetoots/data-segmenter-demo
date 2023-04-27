import classNames from 'classnames';
import React from 'react';

export type BadgeProps = React.ComponentPropsWithoutRef<'div'> & {
  withRemove?: boolean;
  onRemove?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'gray';
};

const Badge = ({
  className,
  children,
  withRemove = false,
  onRemove,
  size = 'md',
  color = 'blue',
  ...props
}: BadgeProps) => {
  const sizeSet = {
    xs: 'px-2.5 py-0.5 text-xs leading-tight',
    sm: 'px-3 py-1 text-xs leading-5',
    md: 'px-3  py-1.5 text-sm',
    lg: 'px-4 py-2 text-md',
  };

  const colorSet = {
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  let removeButton;
  if (withRemove)
    removeButton = (
      <button
        type="button"
        className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
        onClick={onRemove}
      >
        <span className="sr-only">
          Remove {typeof children === 'string' ? children : null} option
        </span>
        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
        </svg>
      </button>
    );
  return (
    <div
      className={classNames(
        'inline-flex items-center font-semibold rounded-full',
        sizeSet[size],
        colorSet[color],
        className,
      )}
      {...props}
    >
      {children}
      {removeButton}
    </div>
  );
};

export default Badge;

export const ErrorBadge = (props: React.PropsWithChildren<unknown>) => (
  <div className="mb-3 rounded p-3 bg-red-100 text-red-500">{props.children}</div>
);
