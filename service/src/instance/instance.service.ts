import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Instance } from './instance.schema';
import { Model, Connection } from 'mongoose';
import { genUID } from '@/_common/uid';
import { AuthService } from '@/auth/auth.service';

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
      await current.updateOne({ $push: { instances: instance._id } });

      await session.commitTransaction();

      return instance;
    } catch (err) {
      await session.abortTransaction();

      throw err;
    } finally {
      session.endSession();
    }
  }

  async query(domain?: string, skip?: number, limit?: number) {
    const current = await this.authService.getCurrent();

    const conditions = domain ? { domain } : {};

    const instances = await this.instanceModel
      .find(conditions)
      .where({ _id: { $in: current.instances } })
      .skip(skip)
      .limit(limit)
      .exec();

    return instances;
  }

  async delete(id: string | string[]) {
    const ids = Array.isArray(id) ? id : [id];
    const current = await this.authService.getCurrent();

    const isOwner = ids.every((id) => {
      return current.instances.includes(id);
    });

    if (isOwner) {
      const session = await this.connection.startSession();

      try {
        await current.updateOne({ $pullAll: { instances: ids } });

        const { deletedCount } = await this.instanceModel.deleteMany({
          _id: { $in: ids }
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
