export type Paginated<T> = {
  items: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null | undefined;
    to?: number | null | undefined;
  } | null;
};

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
  perPage: number;
};

export type MutationResult<T> = {
  data: T | null;
  message: string | undefined;
  created: boolean;
};
