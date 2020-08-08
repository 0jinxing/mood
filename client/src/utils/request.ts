import Token from './token';

const accessToken = new Token('access');
const refreshToken = new Token('refresh');

const request: typeof fetch = async (...args) => {
  let [input, init] = args;

  const token = accessToken.get();
  if (token) {
    init = {
      ...init,
      headers: { ...init?.headers, authorization: `bearer ${token}` }
    };
  }

  const resp = await fetch(input, init);
  if (resp.ok) {
    return resp;
  }

  if (resp.status === 401) {
    await refresh();
  }

  return resp;
};

export const login = () => {};

export const refresh = async () => {
  const token = refreshToken.get();
  if (token) {
    fetch('');
  }
};

export default request;
