import { Controller, Post, Body } from "@nestjs/common";
import { IEvent } from "./schema/event";
import { EventService } from "./event.service";

@Controller("event")
export class EventController {
  constructor(private eventService: EventService) {}

  @Post()
  async report(@Body() data: IEvent) {
    await this.eventService.create(data);
    return data;
  }
}
