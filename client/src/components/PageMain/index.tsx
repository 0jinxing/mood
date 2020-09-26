import React, { FC } from 'react';
import styles from './index.scss';

const PageMain: FC = ({ children }) => {
  return <main className={styles.pageMain}>{children}</main>;
};

export default PageMain;
