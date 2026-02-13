# Shop / Ecommerce Design (Cricket Accessories)

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
| **shop_products** | Main product (name, description, price, stock, brand, category) |
| **shop_product_images** | Multiple images per product |
| **shop_carts** | One cart per logged-in user |
| **shop_cart_items** | Line items in cart (product, quantity, price snapshot) |
| **shop_orders** | Placed order (totals, status, single address: address + city + country) |
| **shop_order_items** | Order lines (product snapshot, quantity, price) |

Optional later: `shop_reviews`, `shop_wishlists`, `shop_coupons`, `shop_inventory_logs`.

---

## 3. Schema summary

- **shop_brands** – `id`, `name`, `slug`, `logo` (nullable), `is_active`, `timestamps`
- **shop_categories** – `id`, `name`, `slug`, `parent_id` (nullable), `description`, `image`, `sort_order`, `is_active`, `timestamps`
- **shop_products** – `id`, `name`, `slug`, `description`, `sku`, `price`, `compare_at_price`, `brand_id`, `category_id`, `stock_quantity`, `low_stock_threshold`, `is_active`, `is_featured`, `timestamps`
- **shop_product_images** – `id`, `product_id`, `path`, `alt`, `sort_order`, `timestamps`
- **shop_carts** – `id`, `user_id`, `timestamps`
- **shop_cart_items** – `id`, `cart_id`, `product_id`, `quantity`, `price_snapshot`, `timestamps`
- **shop_orders** – `id`, `user_id`, `order_number` (unique), `status`, `subtotal`, `shipping_amount`, `discount_amount`, `total`, `currency` (default PKR), `address`, `city`, `country`, `notes`, `timestamps`
- **shop_order_items** – `id`, `order_id`, `product_id`, `product_snapshot` (json), `quantity`, `unit_price`, `total_price`, `timestamps`

Order status can be an **enum** (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) to keep the first version simple.

---

## 4. Code layout (aligned with existing API)

- **Models:** `App\Models\Shop\Brand`, `Category`, `Product`, `ProductImage`, `Cart`, `CartItem`, `Order`, `OrderItem` (all with `$table = 'shop_*'`).
- **Controllers:**  
  - Admin: `App\Http\Controllers\Admin\Shop\*` (manage products, categories, brands, orders).  
  - User: `App\Http\Controllers\User\Shop\*` (catalog, cart, checkout, my orders).
- **Resources:** `App\Http\Resources\Admin\Shop\*` and `App\Http\Resources\User\Shop\*`.
- **Routes:** e.g. `api/v1/shop/products`, `api/v1/shop/cart`, `api/v1/shop/orders` for app; `api/v1/admin/shop/*` for backoffice.
- **Migrations:** `*_create_shop_*_table.php` or `*_create_shop_*_tables.php` so they sort together.

---

## 5. Important design choices

1. **Price and product snapshots** – Store `price_snapshot` in `shop_cart_items` and `product_snapshot` + `unit_price` in `shop_order_items` so history is correct even if product price or name changes.
2. **Carts** – Logged-in users only; one cart per user (`user_id` required).
3. **Checkout address** – Single address per order: three fields `address`, `city`, `country` stored on `shop_orders` (no separate addresses table).
4. **Order number** – Unique human-readable `order_number` (e.g. TAP-2026-00001) for display and support; keep `id` for internal use.
5. **Currency** – Default `PKR`; no tax_amount on orders.
6. **Categories** – `parent_id` allows “Bats > Cricket Bats > English Willow” later without new tables.

This gives you a clear, scalable shop domain that fits your existing Admin/User structure and keeps the DB unambiguous as the cricket app grows.
