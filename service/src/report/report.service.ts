import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TEvent } from '@mood/record';
import { EventType, IncrementalSource } from '@mood/record/constant';
import { Report } from './report.schema';
import { genQueryConditions } from '@/_common/conditions';
import { AuthService } from '@/auth/auth.service';
import { InstanceService } from '@/instance/instance.service';
import { ReportQueryDTO } from './dto/query.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    private authService: AuthService,
    private instanceService: InstanceService
  ) {}

  async report(uid: string, session: string, events: TEvent[]) {
    const reports = events.map(e => ({ uid, session, data: e }));
    return this.reportModel.insertMany(reports);
  }

  async query({
    domain,
    uid,
    session,
    type,
    source,
    skip,
    limit
  }: ReportQueryDTO) {
    const current = await this.authService.getCurrent();

    const conditions = genQueryConditions({
      domain,
      uid,
      session,
      'data.type': type,
      'data.source': source
    });

    console.log(skip, limit);
    const query = () => {
      return this.reportModel.find({
        uid: { $in: current.uids },
        ...conditions
      });
    };

    const total = await query().countDocuments();

    const list = await query().skip(skip).limit(limit);

    return { total, list };
  }
}
