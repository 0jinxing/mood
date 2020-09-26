import React, { FC } from 'react';
import { Layout } from 'antd';

import PageHeader from '@/components/PageHeader';
import useAsyncEffect from '@/hooks/useAsyncEffect';
import request from '@/utils/request';
import API from '@/constants/api';
import { useDispatch } from 'react-redux';
import { setCurrent } from '@/actions/auth';
import { Route, Switch } from 'react-router-dom';
import NotFound from '@/routes/404';
import DashboardLayout from './DashboardLayout';
import { setLoading } from '@/actions/loading';
import { LOADING_QUERY_CURRENT } from '@/constants/symbol';
import LOADING from '@/constants/loading';

const BasicLayout: FC = () => {
  const dispatch = useDispatch();
  useAsyncEffect(async () => {
    try {
      dispatch(
        setLoading({ key: LOADING_QUERY_CURRENT, status: LOADING.LOADING })
      );
      const { email } = await request<{ email: string }>(API.QUERY_CURRENT);
      dispatch(setCurrent({ email }));
    } finally {
      dispatch(
        setLoading({ key: LOADING_QUERY_CURRENT, status: LOADING.DONE })
      );
    }
  });

  return (
    <Layout style={{ minHeight: '100%' }}>
      <PageHeader />
      <Layout>
        <Switch>
          <Route component={NotFound} path="/404" />
          <Route component={DashboardLayout} />
        </Switch>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
