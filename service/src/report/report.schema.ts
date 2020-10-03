import { TEvent } from '@mood/record';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Report extends Document {
  @Prop({ required: true })
  uid: string;

  @Prop({ required: true, type: Object })
  data: TEvent;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
