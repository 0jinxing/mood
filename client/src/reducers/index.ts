import { combineReducers } from 'redux';

import authReducer, { AuthState } from './auth';
import loadingReducer, { LoadingState } from './loading';

export type RootState = {
  auth: AuthState;
  loading: LoadingState;
};

export default combineReducers({ auth: authReducer, loading: loadingReducer });
