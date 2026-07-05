import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

import { baseUrl } from '@/lib/apiOrigin';

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    return headers;
  },
});

/**
 * @param {string | import('@reduxjs/toolkit/query/react').FetchArgs} args
 * @param {import('@reduxjs/toolkit/query/react').BaseQueryApi} api
 * @param {{}} extraOptions
 */
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
    // A custom retryCondition replaces RTK's built-in maxRetries cap (the two
    // options are mutually exclusive), so the attempt cap lives here instead.
    retryCondition: (error, _args, { attempt }) => {
      if (attempt > 3) return false;
      const { status } = /** @type {import('@reduxjs/toolkit/query/react').FetchBaseQueryError} */ (error);
      return status !== 401 && status !== 403;
    },
  }),
  endpoints: () => ({}),
});
