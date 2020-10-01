import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createApp } from 'test/create-app';
import { cleanUp } from 'test/clean-up';
import { expect } from 'chai';

function queryInstance(
  app: INestApplication,
  token: string,
  skip: number = 0,
  limit?: number
) {
  return request(app.getHttpServer())
    .get('/instance')
    .set('Authorization', `bearer ${token}`)
    .send({ skip, limit })
    .expect(200);
}

function createInstance(app: INestApplication, token: string, domain: string) {
  return request(app.getHttpServer())
    .post('/instance')
    .set('Authorization', `bearer ${token}`)
    .send({ domain })
    .expect(201);
}

describe('instance e2e', async () => {
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
    await app.close();
  });

  it('create instance', async () => {
    await createInstance(app, token, 'baidu.com');
    await createInstance(app, token, 'bing.com');
    await createInstance(app, token, 'google.com');

    const res = await queryInstance(app, token);
    const { list } = res.body;
    expect(list.length).eq(3);
  });

  let instances: string[];
  it('query instance', async () => {
    const queryRes = await queryInstance(app, token);
    const { list } = queryRes.body;
    instances = list.map(({ _id }) => _id);
    expect(instances.length).eq(3);

    const limitRes = await queryInstance(app, token, 0, 2);
    const { list: limitList } = limitRes.body;

    expect(limitList.map(({ _id }) => _id)).deep.eq(instances.slice(0, 2));

    const skipRes = await queryInstance(app, token, 1, 2);
    const { list: skipList } = skipRes.body;
    expect(skipList.map(({ _id }) => _id)).deep.eq(instances.slice(1, 3));
  });

  it('delete instance', async () => {
    const { body } = await request(app.getHttpServer())
      .delete('/instance')
      .set('Authorization', `bearer ${token}`)
      .send(instances.slice(0, 1))
      .expect(200);

    expect(body.deletedCount).eq(1);

    const res = await queryInstance(app, token);
    const { list } = res.body;

    expect(instances.length - list.length).eq(1);

    instances = list.map((i: { _id: string }) => i._id);
  });

  it('batch delete instance', async () => {
    const {
      body: { deletedCount }
    } = await request(app.getHttpServer())
      .delete('/instance')
      .set('Authorization', `bearer ${token}`)
      .send(instances)
      .expect(200);

    expect(deletedCount).eq(instances.length);
  });
});
