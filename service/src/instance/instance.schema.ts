import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Instance extends Document {
  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  domain: string;
}

export const InstanceSchema = SchemaFactory.createForClass(Instance);
