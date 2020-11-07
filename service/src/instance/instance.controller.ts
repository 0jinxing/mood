import { Controller, Post, Body, UseGuards, Get, Delete } from '@nestjs/common';
import { InstanceService } from './instance.service';
import { InstanceCreateDTO } from './dto/create.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { InstanceDeleteDTO } from './dto/delete.dto';
import { QueryConditions } from '@/_common/conditions';
import { Instance } from './instance.schema';

@Controller('instance')
export class InstanceController {
  constructor(private instanceService: InstanceService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() { domain }: InstanceCreateDTO) {
    return this.instanceService.create(domain);
  }

  @Get()
  @UseGuards(AuthGuard)
  query(@Body() conditions: QueryConditions<Instance>) {
    return this.instanceService.query(conditions);
  }

  @Delete()
  @UseGuards(AuthGuard)
  delete(@Body() ids: InstanceDeleteDTO) {
    return this.instanceService.delete(ids);
  }
}
