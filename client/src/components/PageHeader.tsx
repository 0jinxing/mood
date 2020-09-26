import React, { FC } from 'react';
import { Layout } from 'antd';
import logo from '@/assets/logo.svg';

import styles from './PageHeader.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/reducers';
import { Link } from 'react-router-dom';
import LINK from '@/constants/link';

const PageHeader: FC = () => {
  const email = useSelector((state: RootState) => state.auth.email);

  return (
    <Layout.Header className={styles.pageHeader}>
      <Link to={LINK.HOME} className={styles.logo}>
        <img src={logo} />
        MOOD
      </Link>
      <div className={styles.user}>
        <span className={styles.email}>{email}</span>
        <span className={styles.logout}>[logout]</span>
      </div>
    </Layout.Header>
  );
};

export default PageHeader;
