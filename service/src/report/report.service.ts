import { ForbiddenException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TEvent, EventType } from '@mood/record';
import { Report } from './report.schema';
import { genQueryConditions } from '@/_common/conditions';
import { AuthService } from '@/auth/auth.service';
import { InstanceService } from '@/instance/instance.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    private authService: AuthService,
    private instanceService: InstanceService
  ) {}

  async report(uid: string, events: TEvent[]) {
    const reports = events.map(e => ({ uid, data: e }));
    return this.reportModel.insertMany(reports);
  }

  async query(
    domain?: string,
    uid?: string,
    type?: EventType,
    skip: number = 0,
    limit: number = Number.MAX_SAFE_INTEGER
  ) {
    const current = await this.authService.getCurrent();

    const conditions = genQueryConditions({
      domain,
      uid,
      'data.type': type
    });

    const total = await this.reportModel
      .find({
        instance: { $in: current.instances },
        ...conditions
      })
      .countDocuments();

    const list = await this.reportModel
      .find({
        instance: { $in: current.instances },
        ...conditions
      })
      .skip(skip)
      .limit(limit);

    return { total, list };
  }
}
