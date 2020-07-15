import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Instance } from "./instance.schema";
import { Model, Connection } from "mongoose";
import { genUID } from "@/_common/uid";
import { AuthService } from "@/auth/auth.service";

@Injectable()
export class InstanceService {
  constructor(
    @InjectModel(Instance.name) private instanceModel: Model<Instance>,
    @InjectConnection() private connection: Connection,
    private authService: AuthService
  ) {}

  async createInstance(domain: string) {
    const uid = await genUID();
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const instance = await this.instanceModel.create({ uid, domain });

      const current = await this.authService.getCurrent();
      await current.update({ $push: { instances: instance.id } });
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

    const instances = await this.instanceModel
      .find({ domain })
      .where({ id: { $in: current.instances } })
      .skip(skip)
      .limit(limit)
      .exec();

    return instances;
  }
}
