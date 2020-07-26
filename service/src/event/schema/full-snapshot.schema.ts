import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { Document } from "mongoose";

import type { AddedNode } from "@traps/snapshot";
import type { EventType } from "@traps/record";

@Schema({ typePojoToMixed: true })
export class FullSnapshot extends Document {
  @Prop({ required: true })
  type: EventType.FULL_SNAPSHOT;

  @Prop({
    required: true,
    type: raw({
      adds: [Object],
      offset: {
        top: { type: Number, required: true },
        left: { type: Number, required: true },
      },
    }),
  })
  data: {
    adds: AddedNode[];
    offset: { top: Number; left: Number };
  };
}

export const FullSnapshotSchema = SchemaFactory.createForClass(FullSnapshot);
