import request from '@/utils/request';
import API from '@/constants/api';

type QueryInstanceListParams = {
  domain?: string;
  skip?: number;
  limit?: number;
};

export type Instance = {
  domain: string;
  uid: string;
  createdAt: string;
  updatedAt: string;
};

export const queryInstance = (params: QueryInstanceListParams) => {
  return request<{ list: Instance[]; total: number }>(API.INSTANCE, {
    headers: { 'Content-Type': 'application/json' },
    body: params
  });
};

type CreateInstanceParams = {
  domain: string;
};

export const createInstance = (params: CreateInstanceParams) => {
  return request(API.INSTANCE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: params
  });
};

type DeleteInstanceParams = string | string[];

export const deleteInstance = (params: DeleteInstanceParams) => {
  return request(API.INSTANCE, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: params
  });
};
