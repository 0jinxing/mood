import { ForbiddenException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TEvent, EventType } from '@mood/record';
import { Event } from './event.schema';
import { genQueryConditions } from '@/_common/conditions';
import { AuthService } from '@/auth/auth.service';
import { InstanceService } from '@/instance/instance.service';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private authService: AuthService,
    private instanceService: InstanceService
  ) {}

  async report(uid: string, events: TEvent[]) {
    const current = await this.authService.getCurrent();
    
    const {
      list: [{ _id: instance }]
    } = await this.instanceService.query({ uid });

    if (current.instances.includes(instance)) {
      return this.eventModel.create({ instance, events });
    }
    throw new ForbiddenException();
  }

  async query(
    domain?: string,
    instance?: string,
    type?: EventType,
    skip?: number,
    limit?: number
  ) {
    const current = await this.authService.getCurrent();

    const conditions = genQueryConditions({ domain, type, instance });
    const events = await this.eventModel
      .find(conditions)
      .where({ instance: { $in: current.instances } })
      .skip(skip)
      .limit(limit)
      .exec();

    return events;
  }
}
