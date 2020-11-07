function pagination({ page = 1, pageSize = Number.MAX_SAFE_INTEGER }) {
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  return { skip, limit };
}

export type Pagination = {
  skip?: number;
  limit?: number;
};

export type Conditions<T extends Pagination> = Omit<T, 'skip' | 'limit'>;

export type PaginationResult<T> = {
  list: T[];
  total: number;
};

export default pagination;
