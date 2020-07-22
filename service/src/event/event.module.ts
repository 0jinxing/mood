import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  FullSnapshot,
  FullSnapshotSchema,
} from "./schema/full-snapshot.schema";
import { EventController } from "./event.controller";
import { EventService } from "./event.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FullSnapshot.name, schema: FullSnapshotSchema },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
