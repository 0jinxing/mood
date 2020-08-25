import React, { FC } from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import InstanceList from './InstanceList';

const Instance: FC = () => {
  const { url } = useRouteMatch();

  return (
    <Route path={`${url}/list`}>
      <InstanceList />
    </Route>
  );
};

export default Instance;
