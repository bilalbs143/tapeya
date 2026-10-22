import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

import { rebuildCart, shopMock } from './shopMockState';

export const orderHandlers = [
  http.get(`${env.VITE_API_URL}/shop/orders`, () =>
    HttpResponse.json({
      data: shopMock.orders,
      meta: { current_page: 1, last_page: 1, per_page: 30, total: shopMock.orders.length },
      type: 'SUCCESS',
    })
  ),

  http.get(`${env.VITE_API_URL}/shop/orders/:id`, ({ params }) => {
    const order = shopMock.orders.find((o) => o.id === Number(params.id));
    if (!order) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: order, type: 'SUCCESS' });
  }),

  http.post(`${env.VITE_API_URL}/shop/orders`, async ({ request }) => {
    const body = (await request.json()) as {
      address: string;
      city: string;
      country: string;
      notes?: string;
    };
    const subtotal = shopMock.cartState.subtotal || 21000;
    const shipping = 250;
    const order = {
      id: shopMock.nextOrderId++,
      order_number: `ORD-${String(shopMock.nextOrderId).padStart(4, '0')}`,
      status: 'pending',
      status_label: 'Pending',
      payment_status: 'unpaid',
      payment_status_label: 'Unpaid',
      subtotal,
      shipping_amount: shipping,
      discount_amount: 0,
      total: subtotal + shipping,
      currency: 'PKR',
      address: body.address,
      city: body.city,
      country: body.country,
      notes: body.notes ?? null,
      items: shopMock.cartState.items.map((i, idx) => ({
        id: idx + 1,
        product_id: i.product_id,
        product_snapshot: {
          name: i.product.name,
          image_url: i.product.images[0]?.path ?? null,
          store_name: i.vendor.store_name,
        },
        quantity: i.quantity,
        unit_price: i.price_snapshot,
        total_price: i.subtotal,
      })),
      vendor_orders: [],
      created_at: new Date().toISOString(),
    };
    shopMock.orders.unshift(order);
    shopMock.cartState.items = [];
    rebuildCart();
    return HttpResponse.json({ data: order, type: 'CREATED', message: 'Order placed successfully.' }, { status: 201 });
  }),

  http.post(`${env.VITE_API_URL}/shop/orders/:id/cancel`, ({ params }) => {
    const order = shopMock.orders.find((o) => o.id === Number(params.id));
    if (!order) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    order.status = 'cancelled';
    order.status_label = 'Cancelled';
    return HttpResponse.json({ data: order, type: 'SUCCESS', message: 'Order cancelled.' });
  }),
];
