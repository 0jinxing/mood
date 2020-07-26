import { Schema, Prop } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Event extends Document {
  @Prop({ required: true })
  type: string;
}
