import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "@/app.module";
import { LoginDTO } from "./dto/login.dto";
import { assert, expect } from "chai";

describe("auth e2e", async () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("unauthorized", () => {
    return request(app.getHttpServer()).post("/auth/logout").expect(401);
  });

  let accessToken: string;

  it("login", async () => {
    const loginDTO: LoginDTO = {
      email: "172601673@qq.com",
      password: "123456",
    };
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send(loginDTO)
      .expect(200);

    accessToken = res.body.accessToken;
  });

  it("Authorized", () => {
    return request(app.getHttpServer())
      .get("/user")
      .set("Authorization", `bearer ${accessToken}`)
      .expect(200);
  });

  afterEach(async () => {
    app.close();
  });
});
