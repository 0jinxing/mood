const isTest = process.env.NODE_ENV === 'test';

export default () => ({
  JWT_SECRET: '172601673@qq.com_ACCESS',
  JWT_REFRESH_SECRET: '172601673@qq.com_REFRESH',
  JWT_EXPIRES: '2h',
  JWT_REFRESH_EXPIRES: '2d',

  MONGO_URI: isTest
    ? 'mongodb://192.168.31.2/db_test_mood'
    : 'mongodb://192.168.31.2/db_mood'
});
