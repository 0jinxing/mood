import type {
  ClearCurrentUserAction,
  SetCurrentUserAction
} from '@/actions/auth';

export type AuthAction = ClearCurrentUserAction | SetCurrentUserAction;

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
    case 'CLEAR_CURRENT_USER': {
      return initialState;
    }
    case 'SET_CURRENT_USER': {
      const email = action.payload.email;
      return { email };
    }
    default: {
      return state;
    }
  }
}
