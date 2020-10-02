import React, { FC } from 'react';
import { Layout } from 'antd';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import logo from '@/assets/logo.svg';
import LINK from '@/constants/link';
import { RootState } from '@/reducers';

import styles from './index.scss';

const PageHeader: FC = () => {
  const email = useSelector((state: RootState) => state.auth.email);

  return (
    <Layout.Header className={styles.pageHeader}>
      <Link to={LINK.HOME} className={styles.logo}>
        <img src={logo} />
        MOOD
      </Link>
      {email ? (
        <div className={styles.user}>
          <span className={styles.email}>{email}</span>
          <span className={styles.logout}>[logout]</span>
        </div>
      ) : null}
    </Layout.Header>
  );
};

export default PageHeader;
