import React, { FC } from 'react';
import classnames from 'classnames';
import styles from './index.scss';

type PageToolbarProps = {
  className?: string;
};

const PageToolbar: FC<PageToolbarProps> = ({ children, className }) => {
  return (
    <div className={classnames(styles.toolbar, className)}>{children}</div>
  );
};

export default PageToolbar;
