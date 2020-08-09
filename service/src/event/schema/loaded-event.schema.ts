import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EventType } from '@mood/record';

@Schema()
export class LoadedEvent extends Document {
  @Prop({ required: true })
  type: EventType.LOADED;
}

export const LoadedEventSchema = SchemaFactory.createForClass(LoadedEvent);
