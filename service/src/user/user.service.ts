import { Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async query(conditions: FilterQuery<User>) {
    const query = this.userModel.find(conditions);
    const result = await query.exec();

    return result;
  }

  delete(user: User) {}

  update(user: User) {}
}
