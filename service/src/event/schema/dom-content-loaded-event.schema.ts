import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { EventType } from "@traps/record";

@Schema()
export class DomContentLoadedEvent extends Document {
  @Prop({ required: true })
  type: EventType.DOM_CONTENT_LOADED;
}

export const DomContentLoadedEventSchema = SchemaFactory.createForClass(
  DomContentLoadedEvent
);
