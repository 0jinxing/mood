import React, { FC } from 'react';
import { Layout } from 'antd';

import PageSider from '@/components/PageSider';
import PageHeader from '@/components/PageHeader';
import PageContainer from '@/components/PageContainer';
import useAsyncEffect from '@/hooks/useAsyncEffect';
import request from '@/utils/request';
import API from '@/constants/api';
import { useDispatch } from 'react-redux';
import { setCurrent } from '@/actions/auth';
import { useHistory, Route, Switch } from 'react-router-dom';
import LINK from '@/constants/link';
import InstanceList from '@/routes/instance/InstanceList';
import NotFound from '@/routes/404';

const BasicLayout: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  useAsyncEffect(async () => {
    try {
      const { email } = await request<{ email: string }>(API.QUERY_CURRENT);
      dispatch(setCurrent({ email }));
    } catch {
      history.push(LINK.LOGIN);
    }
  });

  return (
    <Layout style={{ minHeight: '100%' }}>
      <PageHeader />
      <Layout>
        <PageSider />
        <PageContainer>
          <Switch>
            <Route path={'/instance/list'} component={InstanceList} />
            <Route component={NotFound} />
          </Switch>
        </PageContainer>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
