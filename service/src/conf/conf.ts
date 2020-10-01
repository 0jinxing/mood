const isTest = process.env.NODE_ENV === 'test';

const {
  MONGO_URI,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRES,
  JWT_REFRESH_EXPIRES
} = process.env;

export default () => ({
  JWT_SECRET: JWT_SECRET || '172601673@qq.com#access',
  JWT_REFRESH_SECRET: JWT_REFRESH_SECRET || '172601673@qq.com#refresh',
  JWT_EXPIRES: JWT_EXPIRES || '2h',
  JWT_REFRESH_EXPIRES: JWT_REFRESH_EXPIRES || '2d',

  MONGO_URI:
    MONGO_URI || isTest
      ? 'mongodb://127.0.0.1/db_test_mood'
      : 'mongodb://127.0.0.1/db_mood'
});
