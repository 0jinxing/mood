import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import rootReducer from '@/reducers';

const enhancer =
  process.env.NODE_ENV === 'development'
    ? applyMiddleware(logger)
    : applyMiddleware();

const store = createStore(rootReducer, enhancer);

export default store;
