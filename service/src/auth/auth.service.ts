import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { User } from "../user/user.schema";
import { JwtService } from "@nestjs/jwt";
import { validatePass } from "../_common/password";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async validate(email: string, password: string): Promise<any> {
    const user = (await this.userService.query({ email }))[0];

    if (
      !user ||
      !validatePass(password, user.passwordHash, user.passwordSalt)
    ) {
      return null;
    }

    return user;
  }

  async sign(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
