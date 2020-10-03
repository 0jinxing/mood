import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { inflate } from 'pako';
import { AuthGuard } from '@/auth/auth.guard';
import { ReportQueryDTO } from './dto/query.dto';
import { ReportEventDTO } from './dto/report.dto';
import { ReportService } from './report.service';
import { TEvent } from '@mood/record';

@Controller('event')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get()
  @UseGuards(AuthGuard)
  query(@Body() { domain, uid, type, skip, limit }: ReportQueryDTO) {
    return this.reportService.query(domain, uid, type, skip, limit);
  }

  @Post()
  async report(@Body() { uid, data }: ReportEventDTO) {
    const events = JSON.parse(inflate(data, { to: 'string' })) as TEvent[];
    const res = await this.reportService.report(uid, events);
    return { count: res.length };
  }
}
