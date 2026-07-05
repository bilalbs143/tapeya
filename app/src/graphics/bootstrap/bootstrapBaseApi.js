import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

import { baseUrl } from '@/lib/apiOrigin';

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    return headers;
  },
});

const baseQueryWithHeaders = async (args, api, extraOptions) => {
  if (args && typeof args === 'object') {
    const method = (args.method ?? 'GET').toUpperCase();
    const isFormData = 'body' in args && args.body instanceof FormData;

    if (method !== 'GET' && !isFormData) {
      args.headers = {
        'Content-Type': 'application/json',
        ...(args.headers || {}),
      };
    }
  }

  return rawBaseQuery(args, api, extraOptions);
};

export const graphicsBootstrapBaseApi = createApi({
  reducerPath: 'graphicsBootstrapApi',
  baseQuery: retry(baseQueryWithHeaders, {
    maxRetries: 3,
    retryCondition: (error) => {
      const status = error?.status;
      return status !== 401 && status !== 403;
    },
  }),
  endpoints: () => ({}),
});
