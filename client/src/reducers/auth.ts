import type {
  ClearCurrentAction,
  SetCurrentAction
} from '@/actions/auth';

export type AuthAction = ClearCurrentAction | SetCurrentAction;

export type AuthState = {
  email: string;
};

const initialState = {
  email: ''
};

export default function authReducer(
  state: AuthState = initialState,
  action: AuthAction
): AuthState {
  switch (action.type) {
    case 'CLEAR_CURRENT': {
      return initialState;
    }
    case 'SET_CURRENT': {
      const email = action.payload.email;
      return { email };
    }
    default: {
      return state;
    }
  }
}
