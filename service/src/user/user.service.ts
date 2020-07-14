import { Injectable } from "@nestjs/common";
import { User } from "./user.schema";
import { hashPassword, genSalt } from "../_common/password";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async query(conditions: FilterQuery<User>) {
    const query = this.userModel.find(conditions);
    const result = await query.exec();

    return result;
  }

  add(username: string, email: string, password: string) {
    const { hash, salt } = hashPassword(password, genSalt());
    const newUser = new this.userModel({
      username,
      email,
      passwordHash: hash,
      passwordSalt: salt,
    });

    return newUser.save();
  }

  delete(user: User) {}

  update(user: User) {}
}
