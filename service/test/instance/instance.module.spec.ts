import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createApp } from '../create-app';
import { cleanUp } from 'test/clean-up';
import { expect } from 'chai';

function queryInstance(
  app: INestApplication,
  accessToken: string,
  skip: number = 0,
  limit?: number
) {
  return request(app.getHttpServer())
    .get('/instance')
    .set('Authorization', `bearer ${accessToken}`)
    .send({ skip, limit })
    .expect(200);
}

function createInstance(
  app: INestApplication,
  accessToken: string,
  domain: string
) {
  return request(app.getHttpServer())
    .post('/instance')
    .set('Authorization', `bearer ${accessToken}`)
    .send({ domain })
    .expect(201);
}

describe('instance e2e', async () => {
  let app: INestApplication;
  let accessToken: string;

  before(async () => {
    app = await createApp();

    const data = { email: 'test@domain.com', password: 'password' };

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(data);

    accessToken = res.body.accessToken;
  });

  after(async () => {
    await app.close();
    await cleanUp();
  });

  it('create instance', async () => {
    await createInstance(app, accessToken, 'baidu.com');
    await createInstance(app, accessToken, 'bing.com');
    await createInstance(app, accessToken, 'google.com');

    const { body } = await queryInstance(app, accessToken);

    expect(body.length).eq(3);
  });

  let instances: string[];
  it('query instance', async () => {
    const { body } = await queryInstance(app, accessToken);
    instances = body.map(({ _id }) => _id);
    expect(instances.length).eq(3);

    const { body: limit } = await queryInstance(app, accessToken, 0, 2);
    expect(limit.map(({ _id }) => _id)).deep.eq(instances.slice(0, 2));

    const { body: skip } = await queryInstance(app, accessToken, 1, 2);
    expect(skip.map(({ _id }) => _id)).deep.eq(instances.slice(1, 3));
  });

  it('delete instance', async () => {
    const { body } = await request(app.getHttpServer())
      .delete('/instance')
      .set('Authorization', `bearer ${accessToken}`)
      .send(instances.slice(0, 1))
      .expect(200);

    expect(body.deletedCount).eq(1);

    const { body: list }: { body: any[] } = await request(app.getHttpServer())
      .get('/instance')
      .set('Authorization', `bearer ${accessToken}`)
      .send()
      .expect(200);

    expect(instances.length - list.length).eq(1);

    instances = list.map((i) => i._id);
  });

  it('batch delete instance', async () => {
    const {
      body: { deletedCount }
    } = await request(app.getHttpServer())
      .delete('/instance')
      .set('Authorization', `bearer ${accessToken}`)
      .send(instances)
      .expect(200);

    expect(deletedCount).eq(instances.length);
  });
});
