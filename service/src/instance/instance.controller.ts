import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete
} from '@nestjs/common';
import { InstanceService } from './instance.service';
import { CreateDTO } from './dto/create.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { QueryDTO } from './dto/query.dto';
import { DeleteDTO } from './dto/delete.dto';

@Controller('instance')
export class InstanceController {
  constructor(private instanceService: InstanceService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() { domain }: CreateDTO) {
    return this.instanceService.create(domain);
  }

  @Get()
  @UseGuards(AuthGuard)
  query(@Body() { domain, skip, limit }: QueryDTO) {
    return this.instanceService.query(domain, skip, limit);
  }

  @Delete()
  @UseGuards(AuthGuard)
  delete(@Body() ids: DeleteDTO) {
    return this.instanceService.delete(ids);
  }
}
