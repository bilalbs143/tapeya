# Shop / Ecommerce Design (Cricket Accessories)

> **Multi-vendor update (2026-08-07):** The live marketplace schema and behavior are defined in [MULTI_VENDOR_MARKETPLACE_PLAN.md](./MULTI_VENDOR_MARKETPLACE_PLAN.md). Key locked choices:
>
> - **No product moderation** — vendor publish is immediately sellable.
> - **Shipping** — sum of each cart vendor’s `shop_vendors.default_shipping_amount` only (no platform city rules table).
> - **Payment** — COD; admin or vendor can record `unpaid` / `advance` / `paid` / `refunded` on the parent order.
> - **Checkout address** — snapshot on `shop_orders` (`address` / `city` / `country`); checkout prefills from the buyer’s **last order**. No `shop_addresses` book.
> - **No seller payout settlement** — no payout tables, bank fields, or admin payout UI (v1 focuses on vendors selling).
>
> Sections below remain useful for original single-merchant naming and layout; treat the marketplace plan as the coding contract where they conflict.

## 1. Naming strategy: **`shop_` table prefix**

We use a **`shop_`** prefix for all ecommerce tables and a **`Shop`** namespace in code.

| Approach | Pros | Cons |
|----------|------|------|
| **No prefix** (`products`, `orders`) | Short names, Laravel default | "orders" can later mean match orders, tournament orders; ambiguous in a cricket app |
| **Prefix `shop_`** ✅ | Clear domain, no collisions, self-documenting DB | Slightly longer table names |
| **Prefix `ecommerce_`** | Same as shop_ | Longer; "shop" is clearer for B2C selling |

**Recommendation:** **`shop_`** for tables; **`App\Models\Shop\`** for models; **`App\Http\Controllers\User\Shop\`** and **`App\Http\Controllers\Admin\Shop\`** for controllers. Models use `protected $table = 'shop_products'` etc., so class names stay clean (`Product`, `Order`).

---

## 2. Table list and purpose

| Table | Purpose |
|-------|--------|
| **shop_brands** | Cricket brands (e.g. GM, Kookaburra, MRF) |
| **shop_categories** | Product taxonomy, optional hierarchy (Bats, Balls, Gloves, Clothing) |
| **shop_products** | Main product (name, description, price, stock, brand, category, `vendor_id`, `status`) |
| **shop_product_images** | Multiple images per product |
| **shop_vendors** | Seller stores (platform house + human vendors) |
| **shop_vendor_orders** | Per-vendor slice of a parent order (fulfillment + earnings) |
| **shop_inventory_logs** | Stock mutation audit trail |
| **shop_carts** | One cart per logged-in user |
| **shop_cart_items** | Line items in cart (product, quantity, price snapshot, `vendor_id`) |
| **shop_orders** | Placed order (totals, status, payment fields, shipping snapshot: address + city + country) |
| **shop_order_items** | Order lines (product snapshot, quantity, price, vendor FKs) |

Optional later: `shop_reviews`, `shop_wishlists`, `shop_coupons`. **Not in v1:** `shop_addresses`, `shop_shipping_rules`, payout tables.

---

## 3. Schema summary

- **shop_brands** – `id`, `name`, `slug`, `logo` (nullable), `is_active`, `timestamps`
- **shop_categories** – `id`, `name`, `slug`, `parent_id` (nullable), `description`, `image`, `sort_order`, `is_active`, `timestamps`
- **shop_products** – `id`, `vendor_id`, `name`, `slug`, `description`, `sku`, `price`, `compare_at_price`, `brand_id`, `category_id`, `stock_quantity`, `low_stock_threshold`, `is_active`, `status`, `is_featured`, `timestamps` — uniques `(vendor_id, slug)`, `(vendor_id, sku)`
- **shop_product_images** – `id`, `product_id`, `path`, `alt`, `sort_order`, `timestamps`
- **shop_vendors** – store profile, `status`, `commission_rate`, `default_shipping_amount`, `is_platform`, …
- **shop_vendor_orders** – per-vendor fulfillment + commission snapshots / `vendor_earnings`
- **shop_carts** – `id`, `user_id` (unique), `timestamps`
- **shop_cart_items** – `id`, `cart_id`, `vendor_id`, `product_id`, `quantity`, `price_snapshot`, `timestamps`
- **shop_orders** – `id`, `user_id`, `order_number` (unique), `status`, `payment_status`, `payment_method`, `amount_received`, …, `subtotal`, `shipping_amount`, `discount_amount`, `total`, `currency` (default PKR), `address`, `city`, `country`, `notes`, `placed_at`, `timestamps`
- **shop_order_items** – `id`, `order_id`, `vendor_id`, `vendor_order_id`, `product_id`, `product_snapshot` (json), `quantity`, `unit_price`, `total_price`, `timestamps`

Order fulfillment status: `pending` \| `processing` \| `dispatched` \| `delivered` \| `cancelled`.  
Payment status: `unpaid` \| `advance` \| `paid` \| `refunded`. Payment method: `cod`.

---

## 4. Code layout (aligned with existing API)

- **Models:** `App\Models\Shop\Brand`, `Category`, `Product`, `ProductImage`, `Vendor`, `VendorOrder`, `Cart`, `CartItem`, `Order`, `OrderItem`, `InventoryLog` (all with `$table = 'shop_*'`).
- **Controllers:**  
  - Admin: `App\Http\Controllers\Admin\Shop\*` (brands, categories, vendors, products, orders, payments).  
  - User: `App\Http\Controllers\User\Shop\*` (catalog, cart, checkout, my orders).  
  - Vendor: `App\Http\Controllers\Vendor\Shop\*` (store, products, orders, dashboard).
- **Resources:** `App\Http\Resources\Admin\Shop\*`, `User\Shop\*`, `Vendor\Shop\*`.
- **Routes:** `api/v1/shop/*` for app; `api/v1/shop/vendor/*` for sellers; `api/v1/admin/shop/*` for backoffice.
- **Migrations:** base `create_shop_*` plus `2026_08_05_100000_marketplace_phase0_shop_vendors.php` for marketplace columns/tables.

---

## 5. Important design choices

1. **Price and product snapshots** – Store `price_snapshot` in `shop_cart_items` and `product_snapshot` + `unit_price` in `shop_order_items` so history is correct even if product price or name changes.
2. **Carts** – Logged-in users only; one cart per user (`user_id` unique).
3. **Checkout address** – Written onto `shop_orders` at place-order. Next checkout prefills from the buyer’s most recent order (`GET shop/orders?per_page=1`). No separate address book.
4. **Order number** – Unique human-readable `order_number` (e.g. TAP-2026-00001) for display and support; keep `id` for internal use.
5. **Currency** – Default `PKR`; no tax_amount on orders.
6. **Categories** – `parent_id` allows “Bats > Cricket Bats > English Willow” later without new tables.
7. **Shipping** – Flat sum of vendor `default_shipping_amount` values in the cart (quote + checkout).
8. **Sellers** – App Seller Hub (`/seller`); Become a Seller apply (`/seller/apply`). Settlement/payouts deferred / removed from v1.

This gives you a clear, scalable shop domain that fits your existing Admin/User structure and keeps the DB unambiguous as the cricket app grows.
