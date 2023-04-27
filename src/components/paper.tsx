import classNames from 'classnames';
import React from 'react';

type PaperProps = {
  className?: string;
  style?: React.CSSProperties;
};

const Paper = (props: React.PropsWithChildren<PaperProps>) => (
  <div
    style={props.style}
    className={classNames('bg-white shadow overflow-hidden sm:rounded-lg p-6 border', props.className)}
  >
    {props.children}
  </div>
);

export default Paper;
