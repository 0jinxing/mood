import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "@/app.module";
import { LoginDTO } from "@/auth/dto/login.dto";
import { CreateDTO } from "./dto/create.dto";

describe("instance e2e", async () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    app.close();
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

  it("create instance", () => {
    const createDTO: CreateDTO = {
      domain: "baidu.com",
    };
    return request(app.getHttpServer())
      .post("/instance/create")
      .set("Authorization", `bearer ${accessToken}`)
      .send(createDTO)
      .expect(201);
  });
});
