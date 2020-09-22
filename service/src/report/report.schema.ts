import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Report extends Document {
  @Prop({ required: true })
  instance: Types.ObjectId;

  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  events: object[];
}

export const ReportSchema = SchemaFactory.createForClass(Report);
