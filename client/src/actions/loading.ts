import LOADING from '@/constants/loading';

type SetLoadingPayload = {
  status: LOADING;
  key: string;
};

export type SetLoadingAction = {
  type: 'SET_LOADING_ACTION';
  payload: SetLoadingPayload;
};

export const setLoading = (payload: SetLoadingPayload): SetLoadingAction => {
  return {
    type: 'SET_LOADING_ACTION',
    payload
  };
};
