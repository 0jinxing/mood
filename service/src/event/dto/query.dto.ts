import { EventType } from '@mood/record';

export class EventQueryDTO {
  domain?: string;
  instance?: string;
  type?: EventType;
  skip?: number;
  limit?: number;
}
