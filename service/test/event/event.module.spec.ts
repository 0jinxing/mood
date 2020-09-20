import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { cleanUp } from 'test/clean-up';
import { createApp } from 'test/create-app';

describe('event e2e', async () => {
  let app: INestApplication;
  let token: string;
  before(async () => {
    await cleanUp();
    app = await createApp();

    const data = { email: 'test@domain.com', password: 'password' };

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(data);

    token = res.body.token;
  });

  after(async () => {
    app.close();
    await cleanUp();
  });

  let uid: string;
  it('create intance', async () => {
    const instanceRes = await request(app.getHttpServer())
      .post('/instance')
      .set('Authorization', `bearer ${token}`)
      .send({ domain: 'https://baidu.comm' });

    uid = instanceRes.body.uid;
  });

  it('report events', async () => {
    const reportRes = await request(app.getHttpServer())
      .post('/event')
      .set('Authorization', `bearer ${token}`)
      .send({ uid, events: [] });

    console.log(reportRes.body);
  });
});
