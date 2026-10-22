import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

import { popularOnly, productFixture, rebuildCart, shopMock } from './shopMockState';

export const cartHandlers = [
  http.get(`${env.VITE_API_URL}/shop/cart`, () => HttpResponse.json({ data: rebuildCart(), type: 'SUCCESS' })),

  http.post(`${env.VITE_API_URL}/shop/cart/items`, async ({ request }) => {
    const body = (await request.json()) as { product_id: number; quantity: number };
    const product = [productFixture, popularOnly].find((p) => p.id === body.product_id) ?? productFixture;
    const price = product.sale_price ?? product.price;
    const existing = shopMock.cartState.items.find((i) => i.product_id === product.id);
    if (existing) {
      existing.quantity += body.quantity;
      existing.price_snapshot = price;
      existing.subtotal = existing.quantity * price;
    } else {
      shopMock.cartState.items.push({
        id: shopMock.cartState.items.length + 1,
        product_id: product.id,
        vendor_id: product.vendor_id,
        vendor: product.vendor,
        product,
        quantity: body.quantity,
        price_snapshot: price,
        subtotal: body.quantity * price,
      });
    }
    return HttpResponse.json({ data: rebuildCart(), type: 'SUCCESS', message: 'Cart updated.' });
  }),

  http.patch(`${env.VITE_API_URL}/shop/cart/items/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { quantity: number };
    const item = shopMock.cartState.items.find((i) => i.id === Number(params.id));
    if (!item) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    item.quantity = body.quantity;
    item.subtotal = item.quantity * item.price_snapshot;
    return HttpResponse.json({ data: rebuildCart(), type: 'SUCCESS' });
  }),

  http.delete(`${env.VITE_API_URL}/shop/cart/items/:id`, ({ params }) => {
    shopMock.cartState.items = shopMock.cartState.items.filter((i) => i.id !== Number(params.id));
    return HttpResponse.json({ data: rebuildCart(), type: 'SUCCESS' });
  }),

  http.get(`${env.VITE_API_URL}/shop/shipping/quote`, () =>
    HttpResponse.json({ data: { amount: 250 }, type: 'SUCCESS' })
  ),
];
