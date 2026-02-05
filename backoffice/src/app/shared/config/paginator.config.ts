import { InjectionToken } from '@angular/core';

export interface PaginatorConfig {
  pageSize: number;
  pageSizeOptions: number[];
  showFirstLastButtons: boolean;
}

export const defaultPaginatorConfig: PaginatorConfig = {
  pageSize: 10,
  pageSizeOptions: [5, 10, 25, 50],
  showFirstLastButtons: true,
};

export const PAGINATOR_CONFIG = new InjectionToken<PaginatorConfig>('PAGINATOR_CONFIG', {
  providedIn: 'root',
  factory: () => defaultPaginatorConfig,
});
