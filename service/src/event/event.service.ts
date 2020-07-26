import { Injectable } from "@nestjs/common";
import { Model, Connection } from "mongoose";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { EventType } from "@traps/record";

@Injectable()
export class EventService {}
