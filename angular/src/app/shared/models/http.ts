export interface HttpResponse<T> {
  data: T;
  errors?: Array<any>;
  message?: string;
  return_code: number;
}

export interface HttpPaginatedResponse<T> {
  code: string;
  currentPage: number;
  data: T;
  firstPageUrl: string;
  from: number;
  lastPage: number;
  lastPageUrl: string;
  nextPageUrl: string;
  path: string;
  perPage: number;
  prevPageUrl: string;
  return_code: number;
  to: number;
  total: number;
}
export interface SocketEvent {
  action: 'created' | 'updated' | 'deleted';
  id: string;
  model: string;
}
