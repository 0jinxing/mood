type SetCurrentActionPayload = {
  email: string;
};

export type SetCurrentAction = {
  type: 'SET_CURRENT';
  payload: SetCurrentActionPayload;
};

export function setCurrent(
  payload: SetCurrentActionPayload
): SetCurrentAction {
  return {
    type: 'SET_CURRENT',
    payload
  };
}

export type ClearCurrentAction = {
  type: 'CLEAR_CURRENT';
};
export function clearCurrent(): ClearCurrentAction {
  return {
    type: 'CLEAR_CURRENT'
  };
}
