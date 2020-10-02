import React, { FC } from 'react';
import { Layout } from 'antd';
import styles from './index.scss';

const PageContainer: FC = ({ children }) => {
  return (
    <Layout.Content className={styles.pageContainer}>
      <main className={styles.wrapper}>{children}</main>
    </Layout.Content>
  );
};

export default PageContainer;
