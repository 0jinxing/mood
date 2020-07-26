import { Injectable } from "@nestjs/common";
import { Model, Connection } from "mongoose";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { EventType } from "@traps/record";

import { FullSnapshot } from "./schema/full-snapshot.schema";
import { IEvent } from "./schema/event";

@Injectable()
export class EventService {
  constructor(
    @InjectModel(FullSnapshot.name)
    private fullSnapshotEvent: Model<FullSnapshot>,
    @InjectConnection() private connection: Connection
  ) {}

  async create(event: IEvent) {
    if (event.type === EventType.FULL_SNAPSHOT) {
      await this.fullSnapshotEvent.create(event);
    }
  }
}
