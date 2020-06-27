import { Controller, Get, Req } from "@nestjs/common";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";

@Controller("user")
export class AuthController {
  constructor(private configService: ConfigService) {}

  @Get()
  getInfo(@Req() request: Request): string {
    return "hello request";
  }

  @Get("test")
  test() {
    return this.configService.get<string>("JWT_SECRET");
  }
}
