import type { SetLoadingAction } from '@/actions/loading';
import LOADING from '@/constants/loading';

export type LoadingState = Record<string | symbol, LOADING | undefined>;

const initialState: LoadingState = {};

export default function loadingReducer(
  state: LoadingState = initialState,
  action: SetLoadingAction
) {
  if (action.type === 'SET_LOADING_ACTION') {
    return {
      ...state,
      [action.payload.key]: action.payload.status
    };
  }
  return state;
}
