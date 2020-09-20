import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Event extends Document {
  @Prop({ required: true })
  instance: string;

  @Prop({ required: true })
  events: object[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
