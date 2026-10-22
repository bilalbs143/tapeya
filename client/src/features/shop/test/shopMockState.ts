/** Shared mutable MSW fixtures for shop handlers — single bag so reassigns stay live across modules. */

export const productFixture = {
  id: 101,
  name: 'English Willow Bat',
  slug: 'english-willow-bat',
  description: 'Grade 1 willow.',
  sku: 'BAT-101',
  price: 25000,
  sale_price: 21000,
  brand_id: 1,
  brand: {
    id: 1,
    name: 'SS',
    slug: 'ss',
    logo: 'https://cdn.example/ss.png' as string | null,
  },
  category_id: 2,
  category: { id: 2, name: 'Bats', slug: 'bats' },
  vendor_id: 7,
  vendor: {
    id: 7,
    store_name: 'Sialkot Sports',
    slug: 'sialkot-sports',
    phone: '+923001234567',
    logo: null as string | null,
  },
  stock_quantity: 8,
  low_stock_threshold: 5,
  is_active: true,
  is_featured: true,
  is_popular: true,
  is_special_offer: true,
  discount_type: null as string | null,
  discount_value: null as number | null,
  discount_starts_at: null as string | null,
  discount_ends_at: null as string | null,
  images: [{ id: 1, path: 'https://cdn.example/bat.jpg', alt: 'Bat', sort_order: 0 }],
};

export const popularOnly = {
  ...productFixture,
  id: 102,
  name: 'Match Ball',
  slug: 'match-ball',
  price: 1200,
  sale_price: null as number | null,
  is_special_offer: false,
  is_featured: false,
  is_popular: true,
  stock_quantity: 40,
  images: [] as typeof productFixture.images,
};

export type VendorProductFixture = typeof productFixture | typeof popularOnly;

export type CartItemFixture = {
  id: number;
  product_id: number;
  vendor_id: number;
  vendor: (typeof productFixture)['vendor'];
  product: typeof productFixture | typeof popularOnly;
  quantity: number;
  price_snapshot: number;
  subtotal: number;
};

export type VendorOrderFixture = {
  id: number;
  order_id: number;
  vendor_id: number;
  vendor_order_number: string;
  status: string;
  status_label: string;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  commission_rate_snapshot: number;
  commission_amount: number;
  vendor_earnings: number;
  total: number;
  tracking_number: string | null;
  carrier: string | null;
  notes: string | null;
  items: Array<{
    id: number;
    product_id: number;
    vendor_id: number;
    product_snapshot: {
      name: string;
      image_url: string | null;
      store_name: string;
      sku?: string;
    };
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  order: {
    id: number;
    order_number: string;
    total: number;
    currency: string;
    payment_status: string;
    payment_status_label: string;
    amount_received: number | null;
    address: string;
    city: string;
    country: string;
    notes: string | null;
    placed_at: string;
  };
  customer: {
    id: number;
    name: string;
    phone: string;
    avatar_url: string | null;
  };
  created_at: string;
};

export const shopMock = {
  vendorProducts: [{ ...productFixture }, { ...popularOnly }] as VendorProductFixture[],
  nextVendorProductId: 200,
  brands: [
    { id: 1, name: 'SS', slug: 'ss', logo: 'https://cdn.example/ss.png', sort_order: 1 },
    { id: 2, name: 'GM', slug: 'gm', logo: 'https://cdn.example/gm.png', sort_order: 2 },
  ] as Array<{
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    sort_order: number;
  }>,
  cartState: {
    id: 1,
    items: [],
    items_count: 0,
    subtotal: 0,
    vendor_groups: [],
  } as {
    id: number;
    items: CartItemFixture[];
    items_count: number;
    subtotal: number;
    vendor_groups: Array<{
      vendor: (typeof productFixture)['vendor'];
      items: CartItemFixture[];
      subtotal: number;
    }>;
  },
  nextOrderId: 50,
  orders: [
    {
      id: 40,
      order_number: 'ORD-0040',
      status: 'pending',
      status_label: 'Pending',
      payment_status: 'unpaid',
      payment_status_label: 'Unpaid',
      subtotal: 21000,
      shipping_amount: 250,
      discount_amount: 0,
      total: 21250,
      currency: 'PKR',
      address: 'House 42, DHA',
      city: 'Karachi',
      country: 'Pakistan',
      notes: null,
      items: [
        {
          id: 1,
          product_id: 101,
          vendor_id: 7,
          product_snapshot: {
            name: 'English Willow Bat',
            image_url: 'https://cdn.example/bat.jpg',
            store_name: 'Sialkot Sports',
          },
          quantity: 1,
          unit_price: 21000,
          total_price: 21000,
        },
      ],
      vendor_orders: [
        {
          id: 1,
          vendor_id: 7,
          vendor: productFixture.vendor,
          vendor_order_number: 'ORD-0040-V1',
          status: 'pending',
          status_label: 'Pending',
          total: 21250,
        },
      ],
      created_at: '2026-10-01T10:00:00+00:00',
    },
    {
      id: 39,
      order_number: 'ORD-0039',
      status: 'delivered',
      status_label: 'Delivered',
      payment_status: 'paid',
      payment_status_label: 'Paid',
      subtotal: 1200,
      shipping_amount: 150,
      discount_amount: 0,
      total: 1350,
      currency: 'PKR',
      address: 'House 42, DHA',
      city: 'Karachi',
      country: 'Pakistan',
      items: [
        {
          id: 2,
          product_id: 102,
          product_snapshot: { name: 'Match Ball', image_url: null, store_name: 'Sialkot Sports' },
          quantity: 1,
          unit_price: 1200,
          total_price: 1200,
        },
      ],
      vendor_orders: [],
      created_at: '2026-09-10T10:00:00+00:00',
    },
  ] as Array<Record<string, unknown>>,
  vendorStore: {
    id: 7,
    store_name: 'Sialkot Sports',
    slug: 'sialkot-sports',
    description: 'Factory gear.',
    logo: null,
    phone: '+923001234567',
    email: 'shop@example.com',
    address: 'Factory Road',
    city: 'Sialkot',
    country: 'Pakistan',
    status: 'approved',
    status_label: 'Approved',
    suspension_reason: null,
    default_shipping_amount: 250,
  } as {
    id: number;
    store_name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    status: string;
    status_label: string;
    suspension_reason: string | null;
    default_shipping_amount: number;
  },
  vendorOrders: [
    {
      id: 11,
      order_id: 40,
      vendor_id: 7,
      vendor_order_number: 'ORD-0040-V1',
      status: 'pending',
      status_label: 'Pending',
      subtotal: 21000,
      shipping_amount: 250,
      discount_amount: 0,
      commission_rate_snapshot: 0.08,
      commission_amount: 1680,
      vendor_earnings: 19570,
      total: 21250,
      tracking_number: null,
      carrier: null,
      notes: null,
      items: [
        {
          id: 1,
          product_id: 101,
          vendor_id: 7,
          product_snapshot: {
            name: 'English Willow Bat',
            image_url: 'https://cdn.example/bat.jpg',
            store_name: 'Sialkot Sports',
            sku: 'BAT-101',
          },
          quantity: 1,
          unit_price: 21000,
          total_price: 21000,
        },
      ],
      order: {
        id: 40,
        order_number: 'ORD-0040',
        total: 21250,
        currency: 'PKR',
        payment_status: 'unpaid',
        payment_status_label: 'Unpaid',
        amount_received: null,
        address: 'House 42, DHA',
        city: 'Karachi',
        country: 'Pakistan',
        notes: 'Leave at gate',
        placed_at: '2026-10-01T10:00:00+00:00',
      },
      customer: {
        id: 3,
        name: 'Ali Khan',
        phone: '+923001112233',
        avatar_url: null,
      },
      created_at: '2026-10-01T10:00:00+00:00',
    },
    {
      id: 10,
      order_id: 39,
      vendor_id: 7,
      vendor_order_number: 'ORD-0039-V1',
      status: 'delivered',
      status_label: 'Delivered',
      subtotal: 1200,
      shipping_amount: 150,
      discount_amount: 0,
      commission_rate_snapshot: 0.08,
      commission_amount: 96,
      vendor_earnings: 1254,
      total: 1350,
      tracking_number: 'TCS-99102',
      carrier: 'TCS',
      notes: null,
      items: [
        {
          id: 2,
          product_id: 102,
          vendor_id: 7,
          product_snapshot: {
            name: 'Match Ball',
            image_url: null,
            store_name: 'Sialkot Sports',
          },
          quantity: 1,
          unit_price: 1200,
          total_price: 1200,
        },
      ],
      order: {
        id: 39,
        order_number: 'ORD-0039',
        total: 1350,
        currency: 'PKR',
        payment_status: 'paid',
        payment_status_label: 'Paid',
        amount_received: 1350,
        address: 'House 42, DHA',
        city: 'Karachi',
        country: 'Pakistan',
        notes: null,
        placed_at: '2026-09-10T10:00:00+00:00',
      },
      customer: {
        id: 3,
        name: 'Ali Khan',
        phone: '+923001112233',
        avatar_url: null,
      },
      created_at: '2026-09-10T10:00:00+00:00',
    },
  ] as VendorOrderFixture[],
};

export function rebuildCart() {
  const items = shopMock.cartState.items;
  const subtotal = items.reduce((s, i) => s + i.price_snapshot * i.quantity, 0);
  shopMock.cartState = {
    ...shopMock.cartState,
    items,
    items_count: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    vendor_groups: items.length
      ? [
          {
            vendor: productFixture.vendor,
            items,
            subtotal,
          },
        ]
      : [],
  };
  return shopMock.cartState;
}
