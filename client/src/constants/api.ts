const URL_PREFIX = process.env.URL_PREFIX || '';

const API = {
  LOGIN: URL_PREFIX + '/api/auth/login',
  LOGOUT: URL_PREFIX + '/api/auth/logout',
  REGISTER: URL_PREFIX + '/api/auth/register',
  REFRESH: URL_PREFIX + '/api/auth/refresh',

  QUERY_CURRENT: URL_PREFIX + '/api/auth/current',

  INSTANCE: URL_PREFIX + '/api/instance'
};

export default API;
