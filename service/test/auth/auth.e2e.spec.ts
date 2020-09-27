import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createApp } from '../create-app';
import { cleanUp } from 'test/clean-up';
import { after } from 'mocha';

describe('auth e2e test', async () => {
  let app: INestApplication;

  before(async () => {
    await cleanUp();
    app = await createApp();
  });

  after(async () => {
    await app.close();
  });

  it('unauthorized', () => {
    return request(app.getHttpServer()).post('/auth/logout').expect(401);
  });

  let token: string;

  it('register', async () => {
    const data = { email: 'test@domain.com', password: 'password' };
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(data)
      .expect(200);

    token = res.body.token;
  });

  it('re-register', () => {
    const data = { email: 'test@domain.com', password: 'password' };
    request(app.getHttpServer()).post('/auth/register').send(data).expect(403);
  });

  it('login', async () => {
    const data = { email: 'test@domain.com', password: 'password' };

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(200);

    token = res.body.token;
  });

  it('authorized', () => {
    return request(app.getHttpServer())
      .get('/user')
      .set('Authorization', `bearer ${token}`)
      .expect(200);
  });
});
