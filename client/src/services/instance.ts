import request from '@/utils/request';
import API from '@/constants/api';
import { Pagination, PaginationResult } from '@/utils/pagination';

type QueryInstanceListParams = { domain?: string } & Pagination;

export type Instance = {
  domain: string;
  uid: string;
  createdAt: string;
  updatedAt: string;
};

export const queryInstance = (param: QueryInstanceListParams) => {
  return request<PaginationResult<Instance>>(API.INSTANCE, {
    headers: { 'Content-Type': 'application/json' },
    body: param
  });
};

type CreateInstanceParams = {
  domain: string;
};

export const createInstance = (param: CreateInstanceParams) => {
  return request(API.INSTANCE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: param
  });
};

type DeleteInstanceParams = string | string[];

export const deleteInstance = (param: DeleteInstanceParams) => {
  return request(API.INSTANCE, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: param
  });
};
