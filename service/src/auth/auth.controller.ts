import { Controller, Post, UseGuards, Body, HttpCode } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDTO } from "./dto/sign-in.dto";
import { AuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-in")
  @HttpCode(200)
  signIn(@Body() payload: SignInDTO) {
    return this.authService.sign(payload.email, payload.password);
  }

  @Post("password")
  @UseGuards(AuthGuard)
  passwordReset() {
    return "password";
  }
}
