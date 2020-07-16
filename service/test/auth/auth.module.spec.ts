import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { createApp } from "../_common/create-app";

describe("auth e2e test", async () => {
  let app: INestApplication;

  before(async () => {
    app = await createApp();
  });

  after(() => {
    app.close();
  });

  it("unauthorized", () => {
    return request(app.getHttpServer()).post("/auth/logout").expect(401);
  });

  let accessToken: string;

  it("register", async () => {
    const data = { email: "test@domain.com", password: "password" };
    const res = await request(app.getHttpServer())
      .post("/auth/register")
      .send(data)
      .expect(200);

    accessToken = res.body.accessToken;
  });

  it("re-register", () => {
    const data = { email: "test@domain.com", password: "password" };
    request(app.getHttpServer()).post("/auth/register").send(data).expect(403);
  });

  it("login", async () => {
    const data = { email: "test@domain.com", password: "password" };

    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send(data)
      .expect(200);

    accessToken = res.body.accessToken;
  });

  it("authorized", () => {
    return request(app.getHttpServer())
      .get("/user")
      .set("Authorization", `bearer ${accessToken}`)
      .expect(200);
  });
});
