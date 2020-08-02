import React, { FC } from "react";
import { Layout } from "antd";
import { b, e } from "@/utils/bem";
import "./PageContainer.scss";

const PageContainer: FC = ({ children }) => {
  return (
    <Layout.Content className={b("page-container")}>
      <main className={e("wrapper")}>{children}</main>
    </Layout.Content>
  );
};

export default PageContainer;
