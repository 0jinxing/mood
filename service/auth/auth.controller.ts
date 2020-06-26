import { Controller, Get, Req } from "@nestjs/common";
import { Request } from "express";

@Controller("user")
export class AuthController {
  @Get()
  getInfo(@Req() request: Request): string {
    return "hello request";
  }
}
