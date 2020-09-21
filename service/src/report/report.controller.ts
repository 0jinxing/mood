import { AuthGuard } from '@/auth/auth.guard';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ReportQueryDTO } from './dto/query.dto';
import { ReportEventDTO } from './dto/report.dto';
import { ReportService } from './report.service';

@Controller('event')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get()
  @UseGuards(AuthGuard)
  query(@Body() { domain, instance, uid, type, skip, limit }: ReportQueryDTO) {
    return this.reportService.query(domain, instance, uid, type, skip, limit);
  }

  @Post()
  async report(@Body() { uid, events }: ReportEventDTO) {
    const res = await this.reportService.report(uid, events);
    return { _id: res._id, count: res.events.length };
  }
}
