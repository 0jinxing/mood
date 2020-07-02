import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Connection } from "mongoose";
import { InjectConnection } from "@nestjs/mongoose";

@Controller()
export class AppController {
  constructor(
    @InjectConnection() private connection: Connection,
    private readonly appService: AppService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
