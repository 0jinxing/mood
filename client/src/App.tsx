import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from '@/store';
import Home from './routes/Home';
import Login from './routes/Login';
import Register from './routes/Register';
import BasicLayout from './layouts/BasicLayout';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route component={Login} path="/login" />
          <Route component={Register} path="/register" />
          <Route component={Home} exact path="/" />
          <Route component={BasicLayout} path="/" />
        </Switch>
      </Router>
    </Provider>
  );
};

export default App;
