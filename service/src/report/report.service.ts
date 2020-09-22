import { ForbiddenException, Injectable } from '@nestjs/common';
import { Model, Promise } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TEvent, EventType } from '@mood/record';
import { Report } from './report.schema';
import { genQueryConditions } from '@/_common/conditions';
import { AuthService } from '@/auth/auth.service';
import { InstanceService } from '@/instance/instance.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private eventModel: Model<Report>,
    private authService: AuthService,
    private instanceService: InstanceService
  ) {}

  async report(uid: string, events: TEvent[]) {
    const current = await this.authService.getCurrent();

    const {
      list: [{ _id: instance }]
    } = await this.instanceService.query({ uid });

    if (current.instances.includes(instance)) {
      return this.eventModel.create({ instance, uid, events });
    }
    throw new ForbiddenException();
  }

  async query(
    domain?: string,
    instance?: string,
    uid?: string,
    type?: EventType,
    skip: number = 0,
    limit: number = Infinity
  ) {
    const current = await this.authService.getCurrent();

    const conditions = genQueryConditions({ domain, instance, uid });

    const query = this.eventModel
      .aggregate()
      .match({
        ['instance' as keyof Report]: {
          $in: current.instances
        },
        ...conditions
      })
      .unwind('events' as keyof Report)
      .project({ data: '$events' });

    const [total, list] = await Promise.all([
      query.group({ _id: null, total: { $sum: 1 } }).exec(),
      query.skip(skip).limit(limit).exec()
    ]);
    return { total, list };

    // const events = await this.eventModel
    //   .find(conditions)
    //   .where('instance' as keyof Report)
    //   .in(current.instances)
    //   .where('events' as keyof Report)
    //   .elemMatch(elem => {
    //     if (type) {
    //       elem.where('type' as keyof TEvent).equals(type);
    //     }
    //   })
    //   .skip(skip)
    //   .limit(limit)
    //   .exec();
  }
}
