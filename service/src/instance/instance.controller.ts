import {
  Controller,
  Post,
  HttpCode,
  Body,
  UseGuards,
  Get,
} from "@nestjs/common";
import { InstanceService } from "./instance.service";
import { CreateDTO } from "./dto/create.dto";
import { AuthGuard } from "@/auth/auth.guard";
import { QueryDTO } from "./dto/query.dto";

@Controller("instance")
export class InstanceController {
  constructor(private instanceService: InstanceService) {}

  @Post("create")
  @UseGuards(AuthGuard)
  create(@Body() { domain }: CreateDTO) {
    return this.instanceService.create(domain);
  }

  @Get("query")
  @UseGuards(AuthGuard)
  query(@Body() { domain, skip, limit }: QueryDTO) {
    return this.instanceService.query(domain, skip, limit);
  }
}
