import { EventType, IncrementalSource } from '@mood/record/constant';
import { TEventWithTime } from '@mood/record';
import { Pagination, PaginationResult } from '@/utils/pagination';
import request from '@/utils/request';
import API from '@/constants/api';

export type EventItem = {
  uid: string;
  session: string;
  data: TEventWithTime;
};

export type QueryEventListParams = {
  domain?: string;
  uid?: string;
  session?: string;
  type?: EventType;
  source?: IncrementalSource;
} & Pagination;

export function queryEvent(param: QueryEventListParams) {
  return request<PaginationResult<EventItem>>(API.EVENT, {
    headers: { 'Content-Type': 'application/json' },
    body: param
  });
}
