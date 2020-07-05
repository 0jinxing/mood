import { Injectable, PlainLiteralObject } from "@nestjs/common";
import { User } from "./user.schema";
import { hashPassword, genSalt } from "../utils/password";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  queryUser(filter: Partial<User>) {}

  addUser(username: string, email: string, password: string) {
    const { hash, salt } = hashPassword(password, genSalt());
    const newUser = new this.userModel({
      username,
      email,
      passwordHash: hash,
      passwordSalt: salt,
    });

    return newUser.save();
  }

  deleteUser(user: User) {}

  updateUser(user: User) {}
}
