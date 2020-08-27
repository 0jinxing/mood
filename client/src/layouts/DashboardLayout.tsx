import React, { useEffect } from 'react';
import PageSider from '@/components/PageSider';
import PageContainer from '@/components/PageContainer';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import EventDetail from '@/routes/event/EventDetail';
import EventList from '@/routes/event/EventList';
import Overview from '@/routes/overview';
import InstanceDetail from '@/routes/instance/InstanceDetail';
import InstanceList from '@/routes/instance/InstanceList';
import { useSelector } from 'react-redux';
import { RootState } from '@/reducers';
import { LOADING_QUERY_CURRENT } from '@/constants/symbol';
import LOADING from '@/constants/loading';
import LINK from '@/constants/link';

const DashboardLayout = () => {
  const { loading, email } = useSelector((state: RootState) => {
    const loading = state.loading[LOADING_QUERY_CURRENT];
    const email = state.auth.email;
    return { loading, email };
  });

  const history = useHistory();

  useEffect(() => {
    if (loading === LOADING.DONE && !email) {
      history.push(LINK.LOGIN);
    }
  }, [loading, email]);

  if (loading !== LOADING.DONE) {
    return <div>PAGE LOADING</div>;
  }

  return (
    <>
      <PageSider />
      <PageContainer>
        <Switch>
          <Route path="/overview" component={Overview} />

          <Route path="/instance/list" component={InstanceList} />
          <Route path="/instance/detail/:id?" component={InstanceDetail} />
          <Redirect exact path="/instance" to="/instance/list" />

          <Route path="/event/list" component={EventList} />
          <Route path="/event/detail/:id?" component={EventDetail} />
          <Redirect exact path="/event" to="/event/list" />

          <Redirect to="/404" />
        </Switch>
      </PageContainer>
    </>
  );
};

export default DashboardLayout;
