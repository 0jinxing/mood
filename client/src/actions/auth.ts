type SetCurrentUserActionPayload = {
  email: string;
};
type SetCurrentUserAction = {
  type: 'SET_CURRENT_USER';
  payload: SetCurrentUserActionPayload;
};
export function setCurrentUser(
  payload: SetCurrentUserActionPayload
): SetCurrentUserAction {
  return {
    type: 'SET_CURRENT_USER',
    payload
  };
}

type ClearCurrentUserAction = {
  type: 'CLEAR_CURRENT_USER';
};
export function clearCurrentUser(): ClearCurrentUserAction {
  return {
    type: 'CLEAR_CURRENT_USER'
  };
}
