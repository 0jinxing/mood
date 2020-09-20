import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TEvent } from '@mood/record';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventSchema, Event } from './event.schema';
import { InstanceModule } from '@/instance/instance.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    InstanceModule
  ],
  controllers: [EventController],
  providers: [EventService]
})
export class EventModule {}

export type EventModuleType = EventModule | TEvent;
