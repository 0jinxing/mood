import ms from 'ms';
import Token from './token';
import API from '@/constant/api';

const accessToken = new Token('access');
const refreshToken = new Token('refresh');

let rememberMe = false;

type AuthData = {
  email: string;

  token: string;
  expires: string;

  refreshToken: string;
  refreshExpires: string;
};

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

export const login = async (
  email: string,
  password: string,
  remember: boolean
) => {
  rememberMe = remember;

  const res = await fetch(API.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data: AuthData = await res.json();

  accessToken.set(data.token, rememberMe ? ms(data.expires) : 0);

  refreshToken.set(data.refreshToken, rememberMe ? ms(data.refreshExpires) : 0);
};

export const refresh = async () => {
  const token = refreshToken.get();

  if (token) {
    const res = await fetch(API.REFRESH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token })
    });

    const data: AuthData = await res.json();

    accessToken.set(data.token, rememberMe ? ms(data.expires) : 0);

    refreshToken.set(
      data.refreshToken,
      rememberMe ? ms(data.refreshExpires) : 0
    );
  }
};

export default request;
