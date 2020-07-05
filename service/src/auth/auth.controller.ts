import { Controller, Get, Req, Post, Body, HttpCode } from "@nestjs/common";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../user/user.service";
import { SignUpDTO } from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private configService: ConfigService,
    private userService: UserService
  ) {}

  @Get()
  getInfo(@Req() request: Request): string {
    return "hello request";
  }

  @Get("test")
  test() {
    return this.configService.get<string>("JWT_SECRET");
  }

  @Post("sign-up")
  @HttpCode(201)
  async signUp(@Body() signUpDTO: SignUpDTO) {
    const newUser = await this.userService.addUser(
      signUpDTO.username,
      signUpDTO.email,
      signUpDTO.password
    );
    return newUser._id;
  }

  @Post("sign-in")
  signIn() {}

  @Post("sign-out")
  signOut() {}
}
