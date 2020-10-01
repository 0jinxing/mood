import request from '@/utils/request';
import API from '@/constants/api';

export async function queryCurrent() {
  const data = await request<{ email: string }>(API.QUERY_CURRENT);
  return data;
}
