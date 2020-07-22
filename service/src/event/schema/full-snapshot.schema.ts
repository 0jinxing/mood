import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { EventType, AddedNodeMutation } from "@traps/common/types";

@Schema({})
export class FullSnapshot extends Document {
  @Prop({ required: true })
  type: EventType.FULL_SNAPSHOT;

  @Prop({
    required: true,
    type: raw({
      adds: [AddedNodeMutation],
      offset: { top: Number, left: Number },
    }),
  })
  data: {
    adds: AddedNodeMutation[];
    offset: { top: Number; left: Number };
  };
}

export const FullSnapshotSchema = SchemaFactory.createForClass(
  FullSnapshot
);
