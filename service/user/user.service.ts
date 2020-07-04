import { Injectable } from "@nestjs/common";
import { IUser } from "./user.model";

@Injectable()
export class UserService {
  queryUser(filter: Partial<IUser>) {}

  addUser() {}

  deleteUser() {}

  updateUser() {}
}
