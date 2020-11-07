import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Instance } from './instance.schema';
import { Model, Connection, Types } from 'mongoose';
import { genUID } from '@/_common/uid';
import { AuthService } from '@/auth/auth.service';
import { genQueryConditions, QueryConditions } from '@/_common/conditions';

@Injectable()
export class InstanceService {
  constructor(
    @InjectModel(Instance.name) private instanceModel: Model<Instance>,
    @InjectConnection() private connection: Connection,
    private authService: AuthService
  ) {}

  async create(domain: string) {
    const uid = await genUID();
    const session = await this.connection.startSession();
    const current = await this.authService.getCurrent();

    try {
      session.startTransaction();

      const instance = await this.instanceModel.create({ uid, domain });
      await current.updateOne({
        $push: { uids: instance.uid }
      });

      await session.commitTransaction();

      return instance;
    } catch (err) {
      await session.abortTransaction();

      throw err;
    } finally {
      session.endSession();
    }
  }

  async query(conditions: QueryConditions<Instance>) {
    const current = await this.authService.getCurrent();

    const { skip, limit } = conditions;
    const query = genQueryConditions(conditions, ['skip', 'limit']);

    const instances = await this.instanceModel
      .find(query)
      .where({ uid: { $in: current.uids } })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = current.uids.length;

    return { list: instances, total };
  }

  async delete(uids: string | string[]) {
    uids = Array.isArray(uids) ? uids : [uids];

    const current = await this.authService.getCurrent();

    const isOwner = uids.every(id => current.uids.includes(id));

    if (isOwner) {
      const session = await this.connection.startSession();

      try {
        await current.updateOne({ $pullAll: { uids: uids } });

        const { deletedCount } = await this.instanceModel.deleteMany({
          uid: { $in: uids }
        });

        return { deletedCount };
      } catch (err) {
        session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    }

    throw new ForbiddenException();
  }
}
