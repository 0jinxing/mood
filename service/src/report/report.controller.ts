import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { inflate } from 'pako';
import { AuthGuard } from '@/auth/auth.guard';
import { ReportEventDTO } from './dto/report.dto';
import { ReportService } from './report.service';
import { TEvent } from '@mood/record';
import { ReportQueryDTO } from './dto/query.dto';

@Controller('event')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get()
  @UseGuards(AuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  )
  query(@Query() conditions: ReportQueryDTO) {
    console.log(conditions);
    return this.reportService.query(conditions);
  }

  @Post()
  async report(@Body() { uid, session, data }: ReportEventDTO) {
    const events = JSON.parse(inflate(data, { to: 'string' })) as TEvent[];
    const res = await this.reportService.report(uid, session, events);
    return { count: res.length };
  }
}
