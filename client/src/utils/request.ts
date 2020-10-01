import ms from 'ms';
import Token from './token';
import API from '@/constants/api';
import qs from 'qs';

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

interface ExtendsRequestInit extends Omit<RequestInit, 'body'> {
  body?: object | BodyInit;
}

const request = async <T = Record<string, any>>(
  input: RequestInfo,
  init: ExtendsRequestInit = {}
) => {
  let token = accessToken.get();

  init = { mode: 'cors', ...init };

  if (token) {
    init = {
      ...init,
      headers: { ...init?.headers, authorization: `bearer ${token}` }
    };
  }

  if (
    (!init?.method || /get/i.test(init?.method)) &&
    init?.body !== undefined
  ) {
    if (typeof input === 'string') {
      const queryString =
        typeof init.body === 'string' ? init.body : qs.stringify(init.body);

      delete init.body;

      input =
        input.indexOf('?') >= 0
          ? `${input}&${queryString}`
          : `${input}?${queryString}`;
    }
    delete init.body;
  } else if (init.body) {
    const body =
      typeof init?.body === 'object' ? JSON.stringify(init.body) : '';

    init = { ...init, body };
  }

  let res = await fetch(input, init as RequestInit);

  if (res.ok) {
    const data: T = await res.json();
    return data;
  }

  if (res.status === 401 && refreshToken.get()) {
    await refresh();
  } else {
    throw res;
  }

  token = accessToken.get();

  init = {
    ...init,
    headers: { ...init?.headers, authorization: `bearer ${token}` }
  };
  res = await fetch(input, init as RequestInit);
  if (res.ok) {
    const data: T = await res.json();
    return data;
  } else {
    throw res;
  }
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

  if (!res.ok) throw res;

  const data: AuthData = await res.json();

  accessToken.set(data.token, rememberMe ? ms(data.expires) : 0);

  refreshToken.set(data.refreshToken, rememberMe ? ms(data.refreshExpires) : 0);

  return data;
};

export const register = async (
  email: string,
  password: string,
  remember: boolean
) => {
  rememberMe = remember;

  const res = await fetch(API.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) throw res;

  const data: AuthData = await res.json();

  accessToken.set(data.token, rememberMe ? ms(data.expires) : 0);

  refreshToken.set(data.refreshToken, rememberMe ? ms(data.refreshExpires) : 0);

  return res;
};

export const logout = async () => {
  const res = await request(API.LOGOUT);

  if (!res.ok) throw res;
  const data = await res.json();

  accessToken.clear();
  refreshToken.clear();

  return data;
};

export const refresh = async () => {
  const token = refreshToken.get();

  if (token) {
    const res = await fetch(API.REFRESH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token })
    });

    if (res.status === 401) {
      accessToken.clear();
      refreshToken.clear();

      throw res;
    }

    if (!res.ok) throw res;

    const data: AuthData = await res.json();

    accessToken.set(data.token, rememberMe ? ms(data.expires) : 0);

    refreshToken.set(
      data.refreshToken,
      rememberMe ? ms(data.refreshExpires) : 0
    );

    return data;
  } else {
    throw new Error('empty refresh token');
  }
};

export default request;
