import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Report extends Document {
  @Prop({ required: true })
  instance: string;

  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  events: object[];
}

export const ReportSchema = SchemaFactory.createForClass(Report);
