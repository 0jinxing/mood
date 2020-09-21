import { EventType } from '@mood/record';

export class ReportQueryDTO {
  domain?: string;
  instance?: string;
  uid?: string;
  type?: EventType;
  skip?: number;
  limit?: number;
}
