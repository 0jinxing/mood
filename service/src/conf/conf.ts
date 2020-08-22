const isTest = process.env.NODE_ENV === 'test';

export default () => ({
  JWT_SECRET: '172601673@qq.com#access',
  JWT_REFRESH_SECRET: '172601673@qq.com#refresh',
  JWT_EXPIRES: '2h',
  JWT_REFRESH_EXPIRES: '2d',

  MONGO_URI: isTest
    ? 'mongodb://127.0.0.1/db_test_mood'
    : 'mongodb://127.0.0.1/db_mood'
});
