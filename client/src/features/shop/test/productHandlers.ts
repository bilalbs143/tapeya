import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

import { popularOnly, productFixture, shopMock } from './shopMockState';

export const productHandlers = [
  http.get(`${env.VITE_API_URL}/shop/products`, ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
    const popular = url.searchParams.get('filter[is_popular]');
    const offer = url.searchParams.get('filter[is_special_offer]');
    const featured = url.searchParams.get('filter[is_featured]');
    const brandId = url.searchParams.get('filter[brand_id]');
    const categoryId = url.searchParams.get('filter[category_id]');
    const vendorId = url.searchParams.get('filter[vendor_id]');

    let data = [productFixture, popularOnly];
    if (popular === '1') data = data.filter((p) => p.is_popular);
    if (offer === '1') data = data.filter((p) => p.is_special_offer);
    if (featured === '1') data = data.filter((p) => p.is_featured);
    if (brandId) data = data.filter((p) => String(p.brand_id) === brandId);
    if (categoryId) data = data.filter((p) => String(p.category_id) === categoryId);
    if (vendorId) data = data.filter((p) => String(p.vendor_id) === vendorId);
    if (search) {
      data = data.filter((p) => `${p.name} ${p.brand?.name ?? ''}`.toLowerCase().includes(search));
    }

    return HttpResponse.json({
      data,
      meta: { current_page: 1, last_page: 1, per_page: 15, total: data.length },
      type: 'SUCCESS',
    });
  }),

  http.get(`${env.VITE_API_URL}/shop/products/:slug`, ({ params }) => {
    const slug = String(params.slug);
    const product = [productFixture, popularOnly].find((p) => p.slug === slug || String(p.id) === slug);
    if (!product) {
      return HttpResponse.json({ message: 'Product not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: product, type: 'SUCCESS' });
  }),

  http.get(`${env.VITE_API_URL}/shop/vendors/:vendor/products/:slug`, ({ params }) => {
    const slug = String(params.slug);
    const vendor = String(params.vendor);
    const product = [productFixture, popularOnly].find((p) => p.slug === slug && p.vendor?.slug === vendor);
    if (!product) {
      return HttpResponse.json({ message: 'Product not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: product, type: 'SUCCESS' });
  }),

  http.get(`${env.VITE_API_URL}/shop/brands`, () =>
    HttpResponse.json({
      data: shopMock.brands,
      meta: { current_page: 1, last_page: 1, per_page: 30, total: shopMock.brands.length },
      type: 'SUCCESS',
    })
  ),

  http.get(`${env.VITE_API_URL}/shop/categories`, () =>
    HttpResponse.json({
      data: [
        { id: 1, name: 'Bat', slug: 'bat', parent_id: null, image: null, sort_order: 0 },
        { id: 2, name: 'Bats', slug: 'bats', parent_id: null, image: null, sort_order: 1 },
        { id: 3, name: 'Ball', slug: 'ball', parent_id: null, image: null, sort_order: 2 },
      ],
      meta: { current_page: 1, last_page: 1, per_page: 50, total: 3 },
      type: 'SUCCESS',
    })
  ),

  http.get(`${env.VITE_API_URL}/shop/vendors/:slug`, ({ params }) => {
    const slug = String(params.slug);
    if (slug !== productFixture.vendor.slug && slug !== String(productFixture.vendor.id)) {
      return HttpResponse.json({ message: 'Vendor not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    const products = [productFixture, popularOnly].filter((p) => p.vendor_id === productFixture.vendor_id);
    return HttpResponse.json({
      data: {
        id: productFixture.vendor.id,
        store_name: productFixture.vendor.store_name,
        slug: productFixture.vendor.slug,
        description: 'Factory gear for match day.',
        logo: productFixture.vendor.logo,
        banner: null,
        city: 'Sialkot',
        country: 'Pakistan',
        phone: productFixture.vendor.phone,
        products,
      },
      type: 'SUCCESS',
    });
  }),
];
