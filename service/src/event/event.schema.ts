import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ strict: false })
export class Event extends Document {}

export const EventSchema = SchemaFactory.createForClass(Event);
