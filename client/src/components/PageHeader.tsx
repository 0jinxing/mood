import React, { FC } from 'react';
import { Layout } from 'antd';
import logo from '@/assets/logo.svg';

import styles from './PageHeader.scss';

const PageHeader: FC = () => {
  return (
    <Layout.Header className={styles.pageHeader}>
      <div className={styles.logo}>
        <img src={logo} />
        MOOD
      </div>
    </Layout.Header>
  );
};

export default PageHeader;
