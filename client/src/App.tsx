import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Home from './routes/Home';
import Login from './routes/Login';
import Register from './routes/Register';
import Instance from './routes/instance';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
      </Route>

        <Route path="/register">
          <Register />
        </Route>

        <Route path="/instance">
          <Instance />
        </Route>

        <Route exact path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
