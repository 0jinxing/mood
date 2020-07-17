import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { createApp } from "../create-app";
import { cleanUp } from "test/clean-up";

describe("instance e2e", async () => {
  let app: INestApplication;
  let accessToken: string;

  beforeEach(async () => {
    app = await createApp();

    const data = { email: "test@domain.com", password: "password" };

    const res = await request(app.getHttpServer())
      .post("/auth/register")
      .send(data);

    accessToken = res.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
    await cleanUp();
  });

  it("create instance", () => {
    const data = {
      domain: "baidu.com",
    };
    return request(app.getHttpServer())
      .post("/instance/create")
      .set("Authorization", `bearer ${accessToken}`)
      .send(data)
      .expect(201);
  });
});
