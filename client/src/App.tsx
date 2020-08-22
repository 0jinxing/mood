import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Home from './routes/Home';
import Login from './routes/Login';
import Register from './routes/Register';
import Instance from './routes/instance';
import NotFound from './routes/404';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route component={Login} path="/login" />
        <Route component={Register} path="/register" />
        <Route component={Instance} path="/instance" />
        <Route component={Home} exact path="/" />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default App;
