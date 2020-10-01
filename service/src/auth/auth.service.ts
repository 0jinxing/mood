import {
  Injectable,
  Inject,
  ForbiddenException,
  UnauthorizedException
} from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

import { validatePassword, hashPassword } from '../_common/password';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@/user/user.schema';
import { Model } from 'mongoose';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { genUID } from '@/_common/uid';

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
    @Inject(REQUEST) private request: Request,
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService
  ) {
    this.refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
    this.secret = this.configService.get('JWT_SECRET');

    this.expires = this.configService.get('JWT_EXPIRES');
    this.refreshExpires = this.configService.get('JWT_REFRESH_EXPIRES');
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
      throw new ForbiddenException();
    }

    const payload = { email: user.email, sub: user._id };

    const token = sign(payload, this.secret, { expiresIn: this.expires });

    const refreshToken = sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpires
    });

    return {
      email: user.email,
      token,
      expires: this.expires,
      refreshToken,
      refreshExpires: this.refreshExpires
    };
  }

  async refresh(refreshToken: string) {
    const payload = verify(refreshToken, this.refreshSecret);

    const { expires, secret, refreshExpires, refreshSecret } = this;

    return {
      token: sign(payload, secret, { expiresIn: expires }),
      refreshToken: sign(payload, refreshSecret, { expiresIn: refreshExpires }),

      expires,
      refreshExpires
    };
  }

  async register(email: string, password: string) {
    const passwordSalt = await genUID();
    const passwordHash = hashPassword(password, passwordSalt);

    const exist = await this.userModel.findOne({ email }).exec();
    if (exist) {
      throw new ForbiddenException();
    }

    await this.userModel.create({
      email,
      username: email,
      passwordSalt,
      passwordHash,
      instances: []
    });
    return this.sign(email, password);
  }

  getBearerToken() {
    const authorization = this.request.headers.authorization ?? '';
    const [, token] = authorization.match(/bearer\s+(\S+)/) ?? [];
    if (token) {
      return token;
    }
    throw new UnauthorizedException();
  }

  getBearPayload() {
    const token = this.getBearerToken();
    if (token) {
      return this.verify(token, this.configService.get('JWT_SECRET'));
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
