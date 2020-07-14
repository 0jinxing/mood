import { Controller, Post, UseGuards, Body, HttpCode } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./dto/login.dto";
import { AuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  login(@Body() payload: LoginDTO) {
    return this.authService.sign(payload.email, payload.password);
  }

  @Post("logout")
  @HttpCode(200)
  @UseGuards(AuthGuard)
  logout() {
    return "logout";
  }
}
