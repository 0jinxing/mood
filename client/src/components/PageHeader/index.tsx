import React, { FC } from 'react';
import { Layout } from 'antd';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import LINK from '@/constants/link';
import { RootState } from '@/reducers';
import { clearCurrent } from '@/actions/auth';

import logo from '@/assets/logo.svg';
import styles from './index.scss';
import { AuthState } from '@/reducers/auth';

const mapStateToProps = (state: RootState) => {
  return { auth: state.auth };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    logout: () => {
      dispatch(clearCurrent());
    }
  };
};

export type PageHeaderProps = {
  auth: AuthState;
  logout: () => void;
};

const PageHeader: FC<PageHeaderProps> = ({ auth, logout }) => {
  return (
    <Layout.Header className={styles.pageHeader}>
      <Link to={LINK.HOME} className={styles.logo}>
        <img src={logo} />
        MOOD
      </Link>
      {auth.email ? (
        <div className={styles.user}>
          <span className={styles.email}>{auth.email}</span>
          <span className={styles.logout} onClick={logout}>
            [logout]
          </span>
        </div>
      ) : null}
    </Layout.Header>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader);
