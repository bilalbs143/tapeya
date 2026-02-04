import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_BASE_URL } from '../api.config';

export const apiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
  // Do not touch absolute URLs
  if (/^https?:\/\//i.test(req.url)) {
    return next(req);
  }

  const baseUrl = inject(API_BASE_URL);

  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = req.url.replace(/^\/+/, '');
  const url = `${normalizedBase}/${normalizedPath}`;

  return next(req.clone({ url }));
};
