import { Injectable } from "@nestjs/common";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  getToken(authorization: string) {
    const match = authorization.match(/Bearer\s+(\S+)/);
    if (match) return match[1];
    return null;
  }

  getCurrent(req: Request) {
    const authorization = req.header("authorization");
    const token = this.getToken(authorization);

    try {
      const payload = jwt.verify(
        token,
        this.configService.get<string>("JWT_SECRET")
      );
    } catch (err) {}
  }

  validateUser(username: string, password: string): string {
    // TODO
    return "token";
  }
}
