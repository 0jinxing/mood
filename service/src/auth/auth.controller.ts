import { Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-in")
  signIn() {
    return "sign-in";
  }

  @UseGuards(JwtAuthGuard)
  @Post("password")
  passwordReset() {
    return "password";
  }
}
