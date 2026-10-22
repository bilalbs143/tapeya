import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

import { productFixture, shopMock, type VendorProductFixture } from './shopMockState';

export const vendorHandlers = [
  http.post(`${env.VITE_API_URL}/shop/vendor/apply`, async ({ request }) => {
    const body = (await request.json()) as { store_name: string };
    return HttpResponse.json(
      {
        data: {
          ...shopMock.vendorStore,
          store_name: body.store_name,
          status: 'pending',
          status_label: 'Pending',
        },
        type: 'CREATED',
        message: 'Vendor application submitted.',
      },
      { status: 201 }
    );
  }),

  http.get(`${env.VITE_API_URL}/shop/vendor/dashboard`, () =>
    HttpResponse.json({
      data: {
        total_products: 12,
        active_products: 10,
        pending_orders: 3,
        net_earnings: 84500,
        low_stock_count: 2,
      },
      type: 'SUCCESS',
    })
  ),

  http.get(`${env.VITE_API_URL}/shop/vendor/store`, () =>
    HttpResponse.json({ data: shopMock.vendorStore, type: 'SUCCESS' })
  ),

  http.get(`${env.VITE_API_URL}/shop/vendor/brands`, () =>
    HttpResponse.json({
      data: shopMock.brands,
      meta: { current_page: 1, last_page: 1, per_page: 50, total: shopMock.brands.length },
      type: 'SUCCESS',
    })
  ),

  http.post(`${env.VITE_API_URL}/shop/vendor/brands`, async ({ request }) => {
    const contentType = request.headers.get('content-type') ?? '';
    let name = 'New Brand';
    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData();
      name = String(fd.get('name') ?? name);
    } else {
      const body = (await request.json()) as { name?: string };
      name = body.name?.trim() || name;
    }
    const created = {
      id: 90 + shopMock.brands.length,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      logo: null as string | null,
      sort_order: shopMock.brands.length + 1,
    };
    shopMock.brands.push(created);
    return HttpResponse.json({ data: created, type: 'CREATED' }, { status: 201 });
  }),

  http.patch(`${env.VITE_API_URL}/shop/vendor/brands/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as { name?: string };
    const current = shopMock.brands.find((b) => b.id === id);
    if (!current) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    Object.assign(current, { name: body.name?.trim() || current.name });
    return HttpResponse.json({ data: current, type: 'SUCCESS' });
  }),

  http.post(`${env.VITE_API_URL}/shop/vendor/brands/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const fd = await request.formData();
    const current = shopMock.brands.find((b) => b.id === id);
    if (!current) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    Object.assign(current, { name: String(fd.get('name') ?? current.name) });
    return HttpResponse.json({ data: current, type: 'SUCCESS' });
  }),

  http.get(`${env.VITE_API_URL}/shop/vendor/categories`, () =>
    HttpResponse.json({
      data: [
        { id: 1, name: 'Bat', slug: 'bat', parent_id: null, image: null, sort_order: 0 },
        { id: 2, name: 'Ball', slug: 'ball', parent_id: null, image: null, sort_order: 1 },
      ],
      meta: { current_page: 1, last_page: 1, per_page: 50, total: 2 },
      type: 'SUCCESS',
    })
  ),

  http.post(`${env.VITE_API_URL}/shop/vendor/categories`, async ({ request }) => {
    const contentType = request.headers.get('content-type') ?? '';
    let name = 'New Category';
    let parentId: number | null = null;
    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData();
      name = String(fd.get('name') ?? name);
      const rawParent = String(fd.get('parent_id') ?? '');
      parentId = rawParent ? Number(rawParent) : null;
    } else {
      const body = (await request.json()) as { name?: string; parent_id?: number | null };
      name = body.name?.trim() || name;
      parentId = body.parent_id ?? null;
    }
    const created = {
      id: 50,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      parent_id: parentId,
      image: null as string | null,
      sort_order: 0,
    };
    return HttpResponse.json({ data: created, type: 'CREATED' }, { status: 201 });
  }),

  http.patch(`${env.VITE_API_URL}/shop/vendor/categories/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as { name?: string; parent_id?: number | null };
    return HttpResponse.json({
      data: {
        id,
        name: body.name?.trim() || 'Category',
        slug: 'category',
        parent_id: body.parent_id ?? null,
        image: null,
        sort_order: 0,
      },
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/shop/vendor/categories/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const fd = await request.formData();
    const rawParent = String(fd.get('parent_id') ?? '');
    return HttpResponse.json({
      data: {
        id,
        name: String(fd.get('name') ?? 'Category'),
        slug: 'category',
        parent_id: rawParent ? Number(rawParent) : null,
        image: null,
        sort_order: 0,
      },
      type: 'SUCCESS',
    });
  }),

  http.patch(`${env.VITE_API_URL}/shop/vendor/store`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    shopMock.vendorStore = {
      ...shopMock.vendorStore,
      store_name: typeof body.store_name === 'string' ? body.store_name : shopMock.vendorStore.store_name,
      description:
        body.description === null
          ? null
          : typeof body.description === 'string'
            ? body.description
            : shopMock.vendorStore.description,
      phone: body.phone === null ? null : typeof body.phone === 'string' ? body.phone : shopMock.vendorStore.phone,
      email: body.email === null ? null : typeof body.email === 'string' ? body.email : shopMock.vendorStore.email,
      address:
        body.address === null ? null : typeof body.address === 'string' ? body.address : shopMock.vendorStore.address,
      city: body.city === null ? null : typeof body.city === 'string' ? body.city : shopMock.vendorStore.city,
      country:
        body.country === null ? null : typeof body.country === 'string' ? body.country : shopMock.vendorStore.country,
      default_shipping_amount:
        typeof body.default_shipping_amount === 'number'
          ? body.default_shipping_amount
          : shopMock.vendorStore.default_shipping_amount,
    };
    return HttpResponse.json({ data: shopMock.vendorStore, type: 'SUCCESS', message: 'Store updated.' });
  }),

  http.get(`${env.VITE_API_URL}/shop/vendor/products`, () =>
    HttpResponse.json({
      data: shopMock.vendorProducts,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 50,
        total: shopMock.vendorProducts.length,
      },
      type: 'SUCCESS',
    })
  ),

  http.get(`${env.VITE_API_URL}/shop/vendor/products/:id`, ({ params }) => {
    const product = shopMock.vendorProducts.find((p) => p.id === Number(params.id));
    if (!product) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: product, type: 'SUCCESS' });
  }),

  http.post(`${env.VITE_API_URL}/shop/vendor/products`, async ({ request }) => {
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      price?: number;
      brand_id?: number;
      category_id?: number;
      stock_quantity?: number;
      is_active?: boolean;
      discount_type?: string | null;
      discount_value?: number | null;
      discount_starts_at?: string | null;
      discount_ends_at?: string | null;
    };
    const brand = shopMock.brands.find((b) => b.id === body.brand_id) ?? shopMock.brands[0];
    const created: VendorProductFixture = {
      ...productFixture,
      id: shopMock.nextVendorProductId++,
      name: body.name?.trim() || 'Product',
      slug: (body.name?.trim() || 'product').toLowerCase().replace(/\s+/g, '-'),
      description: body.description?.trim() || '',
      price: body.price ?? 0,
      sale_price: null,
      brand_id: brand?.id ?? 1,
      brand: brand ? { id: brand.id, name: brand.name, slug: brand.slug, logo: brand.logo } : productFixture.brand,
      category_id: body.category_id ?? 2,
      category: { id: body.category_id ?? 2, name: 'Bats', slug: 'bats' },
      stock_quantity: body.stock_quantity ?? 0,
      is_active: body.is_active !== false,
      is_featured: false,
      is_popular: false,
      is_special_offer: false,
      discount_type: body.discount_type ?? null,
      discount_value: body.discount_value ?? null,
      discount_starts_at: body.discount_starts_at ?? null,
      discount_ends_at: body.discount_ends_at ?? null,
      images: [],
    };
    shopMock.vendorProducts = [created, ...shopMock.vendorProducts];
    return HttpResponse.json({ data: created, type: 'CREATED' }, { status: 201 });
  }),

  http.patch(`${env.VITE_API_URL}/shop/vendor/products/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const idx = shopMock.vendorProducts.findIndex((p) => p.id === id);
    if (idx < 0) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    const body = (await request.json()) as Record<string, unknown>;
    const current = shopMock.vendorProducts[idx];
    if (!current) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    const nextBrand =
      typeof body.brand_id === 'number' ? shopMock.brands.find((b) => b.id === body.brand_id) : undefined;
    const updated: VendorProductFixture = {
      ...current,
      name: typeof body.name === 'string' ? body.name : current.name,
      description: typeof body.description === 'string' ? body.description : current.description,
      price: typeof body.price === 'number' ? body.price : current.price,
      brand_id: typeof body.brand_id === 'number' ? body.brand_id : current.brand_id,
      brand: nextBrand
        ? {
            id: nextBrand.id,
            name: nextBrand.name,
            slug: nextBrand.slug,
            logo: nextBrand.logo,
          }
        : current.brand,
      category_id: typeof body.category_id === 'number' ? body.category_id : current.category_id,
      stock_quantity: typeof body.stock_quantity === 'number' ? body.stock_quantity : current.stock_quantity,
      is_active: typeof body.is_active === 'boolean' ? body.is_active : current.is_active,
      discount_type:
        body.discount_type === null
          ? null
          : typeof body.discount_type === 'string'
            ? body.discount_type
            : current.discount_type,
      discount_value:
        body.discount_value === null
          ? null
          : typeof body.discount_value === 'number'
            ? body.discount_value
            : current.discount_value,
      discount_starts_at:
        body.discount_starts_at === null
          ? null
          : typeof body.discount_starts_at === 'string'
            ? body.discount_starts_at
            : current.discount_starts_at,
      discount_ends_at:
        body.discount_ends_at === null
          ? null
          : typeof body.discount_ends_at === 'string'
            ? body.discount_ends_at
            : current.discount_ends_at,
    };
    shopMock.vendorProducts[idx] = updated;
    return HttpResponse.json({ data: updated, type: 'SUCCESS' });
  }),

  http.get(`${env.VITE_API_URL}/shop/vendor/orders`, () =>
    HttpResponse.json({
      data: shopMock.vendorOrders,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 50,
        total: shopMock.vendorOrders.length,
      },
      type: 'SUCCESS',
    })
  ),

  http.get(`${env.VITE_API_URL}/shop/vendor/orders/:id`, ({ params }) => {
    const order = shopMock.vendorOrders.find((o) => o.id === Number(params.id));
    if (!order) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: order, type: 'SUCCESS' });
  }),

  http.post(`${env.VITE_API_URL}/shop/vendor/orders/:id/status`, async ({ params, request }) => {
    const id = Number(params.id);
    const idx = shopMock.vendorOrders.findIndex((o) => o.id === id);
    const current = shopMock.vendorOrders[idx];
    if (idx < 0 || !current) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    const body = (await request.json()) as {
      status?: string;
      tracking_number?: string | null;
      carrier?: string | null;
    };
    const status = body.status ?? current.status;
    const labels: Record<string, string> = {
      pending: 'Pending',
      processing: 'Processing',
      dispatched: 'Dispatched',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    const updated = {
      ...current,
      status,
      status_label: labels[status] ?? status,
      tracking_number: body.tracking_number === undefined ? current.tracking_number : body.tracking_number,
      carrier: body.carrier === undefined ? current.carrier : body.carrier,
    };
    shopMock.vendorOrders[idx] = updated;
    return HttpResponse.json({
      data: updated,
      type: 'SUCCESS',
      message: 'Order status updated.',
    });
  }),

  http.post(`${env.VITE_API_URL}/shop/vendor/orders/:id/payment`, async ({ params, request }) => {
    const id = Number(params.id);
    const idx = shopMock.vendorOrders.findIndex((o) => o.id === id);
    const current = shopMock.vendorOrders[idx];
    if (idx < 0 || !current) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    const body = (await request.json()) as {
      payment_status?: string;
      amount_received?: number | null;
    };
    const paymentStatus = body.payment_status ?? current.order.payment_status;
    const labels: Record<string, string> = {
      unpaid: 'Unpaid',
      advance: 'Advance',
      paid: 'Paid',
    };
    const updated = {
      ...current,
      order: {
        ...current.order,
        payment_status: paymentStatus,
        payment_status_label: labels[paymentStatus] ?? paymentStatus,
        amount_received: body.amount_received === undefined ? current.order.amount_received : body.amount_received,
      },
    };
    shopMock.vendorOrders[idx] = updated;
    return HttpResponse.json({
      data: updated,
      type: 'SUCCESS',
      message: 'Payment updated.',
    });
  }),

  http.post(`${env.VITE_API_URL}/media/product/:id/images`, async ({ params, request }) => {
    const id = Number(params.id);
    const idx = shopMock.vendorProducts.findIndex((p) => p.id === id);
    const current = shopMock.vendorProducts[idx];
    if (idx < 0 || !current) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    const fd = await request.formData();
    const files = fd.getAll('files[]');
    const added = files.map((_, i) => ({
      id: (current.images?.length ?? 0) + i + 1,
      path: `https://cdn.example/product-${id}-${i}.jpg`,
      alt: current.name,
      sort_order: (current.images?.length ?? 0) + i,
    }));
    const updated = {
      ...current,
      images: [...(current.images ?? []), ...added],
    };
    shopMock.vendorProducts[idx] = updated;
    return HttpResponse.json({
      data: updated,
      type: 'SUCCESS',
      message: 'Images uploaded.',
    });
  }),
];
