import React, { FC } from "react";
import { Layout } from "antd";

import PageSider from "@/components/PageSider";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";

const BasicLayout: FC = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100%" }}>
      <PageHeader />
      <Layout>
        <PageSider />
        <PageContainer>{children}</PageContainer>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
