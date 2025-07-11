export type IPaginationOptions = {
  page?: number;
  limit?: number;
};

export type IPaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
};