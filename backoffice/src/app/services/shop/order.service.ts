import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { MessageService } from '../message.service';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_snapshot: Record<string, unknown>;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: number;
  user_id: number;
  user?: { id: number; name: string; email: string | null; phone: string | null };
  order_number: string;
  status: string;
  status_label: string;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  address: string;
  city: string;
  country: string;
  notes: string | null;
  items?: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface OrdersListResponse {
  data: Order[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
  links?: Record<string, string | null>;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly baseUrl = 'v1/admin/shop/orders';

  public getList(params: Partial<ListParams> & Record<string, unknown> = {}): Observable<OrdersListResponse> {
    return this.http.get<OrdersListResponse>(this.baseUrl, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }

  public getById(id: number): Observable<{ data: Order }> {
    return this.http.get<{ data: Order }>(`${this.baseUrl}/${id}`);
  }

  public updateStatus(id: number, status: string): Observable<{ data: Order }> {
    return this.http
      .patch<{ data: Order }>(`${this.baseUrl}/${id}`, { status })
      .pipe(tap(() => this.messageService.success('Order status updated successfully.')));
  }
}
