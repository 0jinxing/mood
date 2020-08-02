import React, { FC } from "react";
import { Layout } from "antd";
import { b, e } from "@/utils/bem";
import logo from "@/assets/favicon.svg";

import "./PageHeader.scss";

const PageHeader: FC = () => {
  return (
    <Layout.Header className={b("page-header")}>
      <div className={e("logo")}>
        <img src={logo} />
        MOOD
      </div>
    </Layout.Header>
  );
};

export default PageHeader;
