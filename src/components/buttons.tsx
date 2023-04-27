import React from 'react';
import classNames from 'classnames';

type ButtonProps = React.ComponentPropsWithRef<'button'> & {
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  children: React.ReactNode;
  className?: string;
  theme?: 'primary' | 'secondary' | 'white' | 'red' | 'disabled';
  shape?: 'rounded' | 'default';
  leftIcon?: React.ReactNode;
  disabled?: boolean;
};

const sizeLookup = {
  xs: 'px-2.5 py-1.5 text-xs ',
  s: 'px-3 py-2 text-sm leading-4 ',
  m: 'px-4 py-2 text-sm',
  l: 'px-4 py-2 text-lg',
  xl: 'px-6 py-3 text-xl',
};

const themeLookup = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 border-transparent',
  secondary: 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500 border-transparent',
  white: 'bg-white hover:bg-gray-50 focus:ring-indigo-500 border-gray-300',
  red: 'bg-red-600 hover-bg-red-700 text-white focus:ring-red-500 border-transparent',
  redInverse: 'text-red-500 bg-white hover:bg-red-500 hover:text-white',
  disabled: 'bg-gray-400 text-white focus:ring-indigo-500',
};

const shapeLookup = {
  rounded: 'rounded-full',
  default: 'rounded',
};

export default function Button({
  size = 'm',
  theme = 'primary',
  shape = 'default',
  leftIcon = null,
  type = 'button',
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      type={type}
      className={classNames(
        sizeLookup[size],
        'border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
        themeLookup[theme],
        shapeLookup[shape],
        className,
        { 'cursor-not-allowed': disabled },
      )}
    >
      {leftIcon}

      {children}
    </button>
  );
}

type BoxProps = React.ComponentPropsWithRef<'div'> & {
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  children: React.ReactNode;
  className?: string;
  theme?: 'primary' | 'secondary' | 'white';
  shape?: 'rounded' | 'default';
  leftIcon?: React.ReactNode;
  disabled?: boolean;
};

export const Box = ({
  size = 'm',
  theme = 'primary',
  shape = 'default',
  leftIcon = null,
  children,
  className,
  disabled,
  ...props
}: BoxProps) => (
  <div
    {...props}
    className={classNames(
      sizeLookup[size],
      'border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
      themeLookup[theme],
      shapeLookup[shape],
      className,
      { 'cursor-not-allowed': disabled },
    )}
  >
    {leftIcon}

    {children}
  </div>
);
