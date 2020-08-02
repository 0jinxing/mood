import React, { FC } from "react";
import BasicLayout from "@/layouts/BasicLayout";
import { Route, useRouteMatch } from "react-router-dom";
import InstanceList from "./InstanceList";

const Instance: FC = () => {
  const { url } = useRouteMatch();

  return (
    <BasicLayout>
      <Route path={`${url}/list`}>
        <InstanceList />
      </Route>
    </BasicLayout>
  );
};

export default Instance;
