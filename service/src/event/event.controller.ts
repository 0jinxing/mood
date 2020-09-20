import { AuthGuard } from '@/auth/auth.guard';
import { TEvent } from '@mood/record';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { EventQueryDTO } from './dto/query.dto';
import { ReportEventDTO } from './dto/report.dto';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(private eventService: EventService) {}

  @Get()
  @UseGuards(AuthGuard)
  query(@Body() { domain, instance, type, skip, limit }: EventQueryDTO) {
    return this.eventService.query(domain, instance, type, skip, limit);
  }

  @Post()
  async report(@Body() { uid, events }: ReportEventDTO) {
    const res = await this.eventService.report(uid, events);
    return { _id: res._id };
  }
}
