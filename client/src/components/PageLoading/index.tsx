import React from 'react';
import { Spin } from 'antd';
import styles from './index.scss';

function PageLoading() {
  return (
    <div className={styles.pageLoading}>
      <Spin tip="Loading..." />
    </div>
  );
}

export default PageLoading;
