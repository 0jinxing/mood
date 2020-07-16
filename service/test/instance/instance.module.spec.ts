import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { createApp } from "../_common/create-app";

describe("instance e2e", async () => {
  let app: INestApplication;
  let accessToken: string;

  before(async () => {
    app = await createApp();

    const data = { email: "test@domain.com", password: "password" };

    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send(data);

    accessToken = res.body.accessToken;
  });

  after(async () => {
    app.close();
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
