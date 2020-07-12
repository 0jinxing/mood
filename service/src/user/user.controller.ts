import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@/auth/auth.guard";

@Controller("user")
export class UserController {
  @Get()
  @UseGuards(AuthGuard)
  getInfo() {
    return "user";
  }
}
