import React, { FC } from 'react';
import { Layout } from 'antd';

import PageSider from '@/components/PageSider';
import PageHeader from '@/components/PageHeader';
import PageContainer from '@/components/PageContainer';
import Authorized from '@/components/Authorized';

const BasicLayout: FC = ({ children }) => {
  return (
    <Authorized>
      <Layout style={{ minHeight: '100%' }}>
        <PageHeader />
        <Layout>
          <PageSider />
          <PageContainer>{children}</PageContainer>
        </Layout>
      </Layout>
    </Authorized>
  );
};

export default BasicLayout;
