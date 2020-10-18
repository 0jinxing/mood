import { EventType } from '@mood/record/constant';

export class ReportQueryDTO {
  domain?: string;
  instance?: string;
  uid?: string;
  type?: EventType;
  skip?: number;
  limit?: number;
}
