import { combineReducers } from 'redux';

import authReducer, { AuthState } from './auth';

export type RootState = {
  auth: AuthState;
};

export default combineReducers({ auth: authReducer });
