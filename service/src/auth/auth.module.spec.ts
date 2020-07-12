import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "@/app.module";
import { SignInDTO } from "./dto/sign-in.dto";
import { assert, expect } from "chai";

describe("AuthModule", async () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("Unauthorized", () => {
    return request(app.getHttpServer()).post("/auth/password").expect(401);
  });

  let accessToken: string;

  it("SignIn", async () => {
    const signInDTO: SignInDTO = {
      email: "172601673@qq.com",
      password: "123456",
    };
    const res = await request(app.getHttpServer())
      .post("/auth/sign-in")
      .send(signInDTO)
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
