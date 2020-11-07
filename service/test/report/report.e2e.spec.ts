import { TEvent } from '@mood/record';
import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import * as request from 'supertest';
import { cleanUp } from 'test/clean-up';
import { createApp } from 'test/create-app';
import { deflate } from 'pako';

const eventData = require('./event-data.json');

describe('report e2e', async () => {
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
      .send({
        uid,
        session: 'mock_session',
        data: deflate(JSON.stringify(eventData), { to: 'string' })
      });
    const { count } = reportRes.body;
    expect(count).eq(eventData.length);
  });

  it('report query', async () => {
    const queryRes = await request(app.getHttpServer())
      .get('/event')
      .set('Authorization', `bearer ${token}`)
      .send({ uid });

    const { total, list } = queryRes.body;

    expect(total).eq(eventData.length).eq(list.length);
  });

  it('report filter query', async () => {
    const filterRes = await request(app.getHttpServer())
      .get('/event')
      .set('Authorization', `bearer ${token}`)
      .send({ uid, type: 2 });

    const { total, list } = filterRes.body;
    expect(total)
      .eq(list.length)
      .eq(eventData.filter((d: TEvent) => d.type === 2).length);
  });
});
