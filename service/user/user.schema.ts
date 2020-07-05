import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  passwordSalt: string;

  @Prop({ required: true })
  createAt: number;

  @Prop({ required: true })
  updateAt: number;

  @Prop({ required: true })
  deleted: boolean;

  @Prop([{ type: Types.ObjectId }])
  instances: Array<Types.ObjectId>;
}

export const UserSchema = SchemaFactory.createForClass(User);
