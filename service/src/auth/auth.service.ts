import { Injectable, Inject } from "@nestjs/common";
import { sign, verify } from "jsonwebtoken";

import { validatePassword } from "../_common/password";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "@/user/user.schema";
import { Model } from "mongoose";
import { Request } from "express";
import { REQUEST } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

export type BearerPayload = {
  email: string;
  sub: string;
};

@Injectable()
export class AuthService {
  private refreshSecret: string;
  private secret: string;

  private expires: string;
  private refreshExpires: string;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService
  ) {
    this.refreshSecret = this.configService.get("JWT_REFRESH_SECRET");
    this.secret = this.configService.get("JWT_SECRET");

    this.expires = this.configService.get("JWT_EXPIRES");
    this.refreshExpires = this.configService.get("JWT_REFRESH_EXPIRES");
  }

  verify(token: string, secret: string) {
    const payload = verify(token, secret) as BearerPayload;
    return payload;
  }

  async sign(email: string, password: string) {
    const query = this.userModel.findOne({ email });
    const user = await query.exec();

    if (
      !user ||
      !validatePassword(password, user.passwordHash, user.passwordSalt)
    ) {
      return null;
    }

    const payload = { email: user.email, sub: user.id };

    const accessToken = sign(payload, this.secret, { expiresIn: this.expires });

    const refreshToken = sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpires,
    });

    return { accessToken, refreshToken };
  }

  async refresh(token: string) {
    const payload = verify(token, this.refreshSecret);

    const accessToken = sign(payload, this.secret, { expiresIn: this.expires });

    const refreshToken = sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpires,
    });

    return { accessToken, refreshToken };
  }

  async register(email: string, password: string) {
    
  }

  getBearerToken() {
    const authorization = this.request.headers.authorization ?? "";
    const [, token] = authorization.match(/bearer\s+(\S+)/) ?? [];

    return token;
  }

  getBearPayload() {
    const token = this.getBearerToken();
    if (token) {
      return this.verify(token, this.configService.get("JWT_SECRET"));
    }
  }

  private current: User;

  async getCurrent() {
    if (this.current) {
      return this.current;
    }
    const { sub } = this.getBearPayload();
    const query = this.userModel.findOne({ _id: sub });
    const user = await query.exec();
    if (user) {
      this.current = user;
    }
    return this.current;
  }
}
