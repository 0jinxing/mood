import { Injectable, Global } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { User } from "../user/user.schema";
import { JwtService } from "@nestjs/jwt";
import { verifyPass } from "../_common/password";

export type TokenPayload = {
  email: string;
  sub: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  verify(token: string) {
    const payload: TokenPayload = this.jwtService.verify(token);
    if (payload) {
      return payload;
    }
    return null;
  }

  async sign(email: string, password: string) {
    const user = (await this.userService.query({ email }))[0];
    if (!user || !verifyPass(password, user.passwordHash, user.passwordSalt)) {
      return null;
    }

    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
