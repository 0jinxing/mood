import { Injectable, PlainLiteralObject } from "@nestjs/common";
import { User } from "./user.schema";
import { hashPassword, genSalt } from "utils/password";

@Injectable()
export class UserService {
  
  queryUser(filter: Partial<User>) {
    
  }

  addUser(username: string, email: string, password: string) {
    const { hash, salt } = hashPassword(password, genSalt());
  }

  deleteUser(user: User) {}

  updateUser(user: User) {}
}
