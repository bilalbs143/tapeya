# Multi-Vendor Marketplace — Implementation Plan

**Status:** Final — Phase 0–4 scoped MVP implemented; payouts & address-book simplified out (2026-08-07)  
**Date:** 2026-08-04  
**Revised:** 2026-08-07 — Removed seller payout settlement (tables/API/UI), payout bank fields, `shop_shipping_rules`, and `shop_addresses`. Shipping = vendor `default_shipping_amount` only. Checkout prefills from last `shop_orders` address. Vendor may record payment like admin. Earlier: COD payment model; no product moderation; vendor **`rejected`** for denied applies.  
**Related:** [Shop Ecommerce Design](./SHOP_ECOMMERCE_DESIGN.md), [Actors & Roles](./actors_and_roles.md), [Broadcaster Role](./BROADCASTER_ROLE.md), [App capabilities](./APP_CAPABILITIES.md) (do **before** Phase 0)

**Prerequisite:** [APP_CAPABILITIES.md](./APP_CAPABILITIES.md) is live (assignment-based app auth; **no** app-guard roles). Vendor auth gates on `shop_vendors` + status — **do not** introduce a vendor app role or seed `shop.vendor.*` app permissions.

---

## 0. Revision notes (vs first draft)

This revision closes defects found in review against the live plan and the real repo. Do not code from the first draft.

| # | Issue | Resolution in this doc |
|---|--------|------------------------|
| B1 | `admin.permission:shop.admin.*` wildcards do not work (`hasPermissionTo` is exact slug) | Exact slugs only; wired on money/trust routes (§5) |
| B2 | Broadcast Operator can reach `admin/shop/*` via `canAccessBackofficeApi()` | Shop money/trust routes require `isAdmin()` **or** exact shop permission; broadcaster seeder gets **zero** shop permissions (§5.3) |
| B3 | Derived parent-status table incomplete (`{pending,dispatched}`, etc.) | Replaced with exhaustive aggregator algorithm (§4.2) |
| B4 | Offline payment needs partial + full received states | `PaymentStatusEnum`: `unpaid` \| `advance` \| `paid` \| `refunded` (§4.4); COD; no in-app Pay Now |
| B5 | Bare `_patch()` would reintroduce cancel/stock bugs on new endpoints | Mandatory transition services; no bare status/stock/payment PATCH (§6.4, §8) |
| G1 | Payouts underspecified vs “#1 must-have” | **Superseded 2026-08-07:** payout settlement removed from v1 (no tables/API/UI). Focus = vendors + selling. Reintroduce later if needed. |
| G2 | Public catalog never actually opens | Explicit Phase 2: unauthenticated catalog GETs (§6.1, §12) |
| G3 | Checkout deadlock / stale commission / stale sellability | Ordered locks, re-read vendor+rate+sellability inside txn (§6.3) |
| G4 | Dashboard drift / indexes / cache | Shared enum source; indexes; cache owner (§9) |
| G5 | Required FKs before checkout split | **House vendor** from day 1 — every order always has vendor-orders (§12 Phase 0) |
| G6 | “Wipe everything” vs ShopSeeder/export | Wipe transactional data; re-seed catalog via adapted seeder (§1, §12) |
| G7 | Policies presented as existing pattern | Flagged as **new** infra; User boolean helpers remain primary for middleware (§5.5) |
| G8 | File list omitted controllers that must change | Expanded (§16) |
| G9 | Cart/OrderDetail/nav/RTK contract gaps | Locked contracts (§11, §17) |
| G10 | Bank details in unvalidated `meta` JSON | **Superseded 2026-08-07:** no payout bank columns; settlement out of scope for v1 |
| G11 | Address book + shipping rules overhead | **2026-08-07:** drop `shop_addresses` / `shop_shipping_rules`; last-order prefill; flat vendor shipping |

---

## 1. Executive summary

Tapeya already has a **working single-merchant shop**: brands, hierarchical categories, products (stock, discounts, images), authenticated cart/checkout, orders with status lifecycle, notifications (DB / mail / SMS / push), Angular backoffice CRUD + ecommerce dashboard, and a full React shop UX.

This plan converts that into a **multi-vendor marketplace** where:

| Actor | Owns |
|-------|------|
| **Platform admin** (`type = administrator`) | Categories, brands, vendor lifecycle, platform catalog & order oversight, payment verification, commissions |
| **Vendor** | Store profile, own products & inventory, own vendor-orders, payment record on owned slices, lightweight metrics dashboard (app-first) |
| **Buyer (app user)** | Browse catalog, multi-vendor cart, checkout, own parent-order history |

**Data approach:** Wipe **transactional** shop data (carts, orders). Rebuild schema. Re-seed catalog via adapted `ShopSeeder` / `shop:export-seeder` output assigned to a **platform house vendor** so demos and curated product media are not thrown away casually. Update [SHOP_ECOMMERCE_DESIGN.md](./SHOP_ECOMMERCE_DESIGN.md) to match this schema after Phase 0 lands.

**Known production bugs this plan must fix (not optional):**

1. Cancel does not restore stock (`Admin\Shop\OrderController` bare `_patch`).
2. No inventory audit trail.
3. Admin product `images` in `StoreProductRequest` are stripped before create — real upload is a **separate media API** step; vendor product UI must use that path, not “multipart images on create”.

---

## 2. Current state (baseline)

### 2.1 What exists

| Layer | Capability |
|-------|------------|
| **Schema** | `shop_brands`, `shop_categories`, `shop_products`, `shop_product_images`, `shop_carts`, `shop_cart_items`, `shop_orders`, `shop_order_items` |
| **Buyer API** | Catalog, cart, checkout, my orders (`shop/*`, all `auth:api`) |
| **Admin API** | Brand/category/product CRUD, order status update, ecommerce dashboard |
| **Backoffice** | Angular shop-management + `/ecommerce` |
| **App** | Buyer shop only — **no vendor UI** |
| **Auth** | Custom roles/permissions; `admin.only` → `canAccessBackofficeApi()` = `isAdmin() \|\| hasBroadcastBackofficeRole()`; `EnsureAdminPermission` = **exact** slug match; administrators bypass permission checks |
| **Authorization style** | Boolean methods on `User` (e.g. tournament staff). **`app/Policies/` is empty** — policies are new infrastructure if introduced |
| **Events** | `OrderPlaced`, `OrderStatusUpdated` + mail/SMS/push/broadcast listeners |
| **Media** | `MediaRegistry` type `product` (admin media upload). App-guard media whitelist does **not** expose product images for vendor app uploads yet |

### 2.2 Gaps for marketplace

- No vendor entity, role, product ownership, or vendor-order split  
- No shop permissions; broadcast operators inherit shop routes via `admin.only`  
- No commission / payment_status model  
- No transition guards on order status  
- Fat controllers; no shop tests/factories  

### 2.3 Preserve

- `shop_` prefix and `App\Models\Shop\`  
- Guard-based roles (`app` / `admin`)  
- Price / product snapshots on cart & order lines  
- PKR default; tax later  
- Prefer one API + scoped authorization over duplicated Admin vs Vendor controller trees  

---

## 3. Target product model

### 3.1 Personas

```
┌──────────────────┐   create / approve / suspend   ┌──────────────┐
│ Platform Admin   │ ─────────────────────────────▶│   Vendor     │
│ (administrator)  │   commission + payments       │ (shop_vendors)│
└────────┬─────────┘                               └──────┬───────┘
         │ categories & brands                             │ products
         ▼                                                 ▼
┌──────────────────┐                               ┌──────────────┐
│ Platform catalog │◀──── sellable listings ───────│  Products    │
└──────────────────┘                               └──────┬───────┘
                                                          │
┌──────────────────┐     one checkout                     ▼
│ Buyer (app user) │ ─────────────────────────────▶┌──────────────┐
└──────────────────┘                               │ Parent Order │
                                                   │ + VendorOrders│
                                                   └──────────────┘
```

**Broadcast Operator** is **not** a shop actor. Tournament backoffice access must not imply marketplace admin powers (§5.3).

### 3.2 Ownership

| Resource | Owner | Admin power |
|----------|-------|-------------|
| Category / Brand | Platform | Full CRUD |
| Vendor / store | `shop_vendors` ↔ user | Create, approve, suspend, commission |
| Product | Vendor | Oversee, force-unpublish, featured flags |
| Inventory | Vendor | Adjust with audit |
| Parent order | Buyer-facing | Payment verification, support overrides via services |
| Vendor order | Vendor slice | Status transitions for own slice only |

### 3.3 Order model (locked)

1. One **parent order** (`shop_orders`) — buyer-facing (`TAP-2026-00042`).  
2. One **vendor order** per vendor in that checkout (`shop_vendor_orders`, e.g. `TAP-2026-00042-V1`).  
3. Line items belong to a vendor-order.  
4. Parent `status` is **derived only** by `OrderStatusAggregator` — never set by bare client PATCH.  
5. **Payment** lives on the parent (`payment_status`); fulfillment lives on vendor-orders.

Even single-vendor checkouts create exactly one vendor-order (keeps one code path; enables **house vendor** in Phase 0).

---

## 4. Database / schema

Fresh shop migrations (replace or migrate-wipe). Catalog re-seeded; carts/orders wiped.

### 4.1 New tables

#### `shop_vendors`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint PK | |
| `user_id` | FK → `users`, unique, nullable | Null only for system **house vendor** |
| `store_name` | string | |
| `slug` | string, unique | |
| `description` | text, nullable | |
| `logo` / `banner` | string, nullable | Media paths |
| `phone` / `email` | string, nullable | |
| `address` / `city` / `country` | | Business address |
| `status` | string | `pending` \| `approved` \| `suspended` \| `rejected` |
| `commission_rate` | decimal(5,2), nullable | Null → `config('shop.default_commission_rate')` |
| `default_shipping_amount` | decimal(12,2), default 0 | Per-store flat shipping; quoted/checkout sum across cart vendors |
| `is_platform` | boolean, default false | House vendor flag |
| `approved_at` / `suspended_at` | timestamps, nullable | |
| `suspension_reason` | text, nullable | |
| `timestamps` | | |

Indexes: `status`, `slug`, `user_id`, `is_platform`.

`meta` JSON is allowed only for non-financial extras (e.g. WhatsApp). **No** payout bank columns on vendors in v1.

#### `shop_vendor_orders`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint PK | |
| `order_id` | FK → `shop_orders` cascade | |
| `vendor_id` | FK → `shop_vendors` restrict | |
| `vendor_order_number` | string, unique | `{parent}-V{n}` assigned in same txn |
| `status` | string | `pending` \| `processing` \| `dispatched` \| `delivered` \| `cancelled` |
| `subtotal` / `shipping_amount` / `discount_amount` | decimal(12,2) | |
| `commission_rate_snapshot` | decimal(5,2) | Rate used at checkout |
| `commission_amount` | decimal(12,2) | |
| `vendor_earnings` | decimal(12,2) | See formula §8.5 |
| `total` | decimal(12,2) | Buyer-facing share for this slice |
| `tracking_number` | string, nullable | Forward shipping (phase 3+) |
| `carrier` | string, nullable | |
| `notes` | text, nullable | |
| `timestamps` | | |

Constraints: `UNIQUE(order_id, vendor_id)`.  
Indexes: `(vendor_id, status)`, `(vendor_id, created_at)`, `order_id`.

#### ~~`shop_vendor_payouts` + `shop_vendor_payout_items`~~ — **removed (2026-08-07)**

Seller settlement batches are **out of v1**. Do not create these tables or admin/vendor payout APIs. Commission/`vendor_earnings` still snapshot on vendor-orders for reporting.

#### `shop_inventory_logs` (required Phase 0 — not optional)

| Column | Notes |
|--------|-------|
| `product_id` | FK |
| `vendor_id` | FK |
| `delta` | int (negative = sale) |
| `quantity_after` | int |
| `reason` | `sale` \| `cancel_restore` \| `restock` \| `admin_adjust` \| `manual` |
| `reference_type` / `reference_id` | morph-ish (order item, vendor order, etc.) |
| `actor_user_id` | nullable |
| `timestamps` | |

**All** stock mutations go through `InventoryService` → log row. Feature tests assert cancel restore writes a log. This is the enforcement mechanism against reintroducing the bare-PATCH bug.

#### `shop_product_moderations`

**Removed / not shipped (locked §17 #4).** There is no moderation queue table in the live schema. When an approved vendor publishes a product (`status = published`), it is **immediately sellable**. Admin/house products behave the same. Reintroduce a queue later only if abuse warrants it.

#### ~~`shop_addresses`~~ — **removed (2026-08-07)**

No buyer address book. Delivery is the `address` / `city` / `country` snapshot on `shop_orders`. Checkout prefills from the buyer’s **latest order** (`GET shop/orders?per_page=1`, ordered by `created_at` desc).

#### ~~`shop_shipping_rules`~~ — **removed (2026-08-07)**

No platform city/country rules table. Quote + checkout shipping = **sum of each cart vendor’s `default_shipping_amount`**.

**Not** in `config/shop.php` — no global `default_shipping_amount` env key.

### 4.2 Altered tables

#### `shop_products`

| Change | Decision |
|--------|----------|
| `vendor_id` FK, **required** | Ownership |
| `status` | `draft` \| `published` \| `archived` — **single source of truth** (drop dual `is_active` over time; Phase 0 may map `is_active` → status for compat then remove) |
| Brand / category FKs | Platform taxonomy |
| Merchandising | Vendor: publish/archive, price, stock, discount. Admin-only: `is_featured`, `is_popular`, `is_special_offer` |
| Slug | `UNIQUE(vendor_id, slug)` |
| SKU | `UNIQUE(vendor_id, sku)` |

#### `shop_order_items`

| Change | Decision |
|--------|----------|
| `vendor_order_id` FK, required | **Source of truth** for vendor ownership of the line |
| `vendor_id` FK, required | Denormalized; **invariant:** must equal `vendor_order.vendor_id` (enforced in `CheckoutService` + DB check constraint or model boot assert in tests) |
| `product_snapshot` | Include `vendor_id`, `store_name`, `sku`, `image_url` |

#### `shop_orders` (parent)

| Change | Decision |
|--------|----------|
| `status` | **Derived aggregate only** via `OrderStatusAggregator` |
| `payment_status` | See enum §4.4 |
| `payment_method` | `cod` (Cash on Delivery — collected outside the app) |
| `amount_received` | decimal(12,2), nullable — for under/over recording |
| `payment_verified_at` / `payment_verified_by` | Admin verification |
| `placed_at` | Checkout timestamp |

#### Parent status aggregator (exhaustive — locked)

Implement exactly this in `OrderStatusAggregator::fromVendorStatuses(array $statuses): OrderStatusEnum`.

```
inputs: non-empty list of vendor-order statuses

1. If EVERY status is cancelled → cancelled
2. Let active = statuses excluding cancelled
   (if active empty, step 1 already returned)
3. If EVERY active status is delivered → delivered
4. If ANY active is pending OR processing:
     a. If EVERY active is pending → pending
     b. Else → processing
     // covers {pending,dispatched}, {pending,delivered}, {pending,dispatched,delivered}, etc.
5. If ANY active is dispatched → dispatched
   // remaining actives are dispatched and/or delivered
6. Else → delivered
```

Unit-test matrix (required):

| Set | Parent |
|-----|--------|
| `{cancelled}` / `{cancelled, cancelled}` | cancelled |
| `{pending}` / `{pending, pending}` | pending |
| `{pending, processing}` | processing |
| `{pending, dispatched}` | processing |
| `{pending, delivered}` | processing |
| `{pending, dispatched, delivered}` | processing |
| `{processing}` / `{processing, delivered}` | processing |
| `{dispatched}` / `{dispatched, delivered}` | dispatched |
| `{delivered}` / `{delivered, cancelled}` | delivered |

Parent status is rewritten inside the same DB transaction as the vendor-order status change, locking the parent row (`lockForUpdate` on `shop_orders`). Concurrent vendor updates serialize on the parent lock (self-healing under contention; acknowledged).

#### `shop_carts` / `shop_cart_items`

- `UNIQUE(shop_carts.user_id)`  
- `shop_cart_items.vendor_id` denormalized from product (required)  
- Sellability re-checked at cart read and at checkout  

### 4.3 ER

```
User (buyer) 1──* Cart 1──* CartItem *──1 Product
User (buyer) 1──* Order 1──* VendorOrder *──1 Vendor
                      └──* OrderItem *──1 VendorOrder
Product *──1 Vendor
User (vendor) 0..1──1 Vendor   (null user_id iff is_platform)
```

### 4.4 Enums

| Enum | Values |
|------|--------|
| `VendorStatusEnum` | `pending`, `approved`, `suspended`, `rejected` |
| `PaymentStatusEnum` | `unpaid`, `advance`, `paid`, `refunded` |
| `OrderStatusEnum` | `pending`, `processing`, `dispatched`, `delivered`, `cancelled` |
| `InventoryReasonEnum` | `sale`, `cancel_restore`, `restock`, `admin_adjust`, `manual` |
| App roles | **No** `VENDOR` — see [APP_CAPABILITIES.md](./APP_CAPABILITIES.md) |

---

## 5. Authentication & authorization

### 5.1 Vendor identity (assignment — no app role)

Aligned with [APP_CAPABILITIES.md](./APP_CAPABILITIES.md):

| Piece | Choice |
|-------|--------|
| Account | `users.type = user` |
| App role | **None** — gate on `shop_vendors` only |
| Profile | `shop_vendors.user_id` (1:1 for human vendors) — **source of truth** |
| Login | App Sanctum |
| `/me` | Optional `vendor`: `{ id, store_name, status }` when `shop_vendors` exists; omit when not |

Admin creates/approves a `shop_vendors` row; that assignment alone unlocks the Seller hub. No role-attach helper.

### 5.2 Permission slugs (exact only — no wildcards)

**App guard:** no `shop.vendor.*` permission seeds. Vendor routes authorize via `EnsureVendor` (row + status) and query scopes.

**Admin guard (attach to `super_admin` only — never to `broadcaster`):**

| Slug | Intent |
|------|--------|
| `shop.catalog.manage` | Brands, categories |
| `shop.vendors.manage` | Vendor CRUD / approve / suspend / commission |
| `shop.products.oversee` | Cross-vendor product CRUD / featured flags |
| `shop.orders.oversee` | Parent + vendor-order support |
| `shop.payments.verify` | Record unpaid / advance / paid / refunded |

`EnsureAdminPermission` must be called with **one exact slug**, e.g. `admin.permission:shop.vendors.manage`. Never `shop.admin.*`.

### 5.3 Route gating (closes broadcast privilege escalation)

| Route group | Gate |
|-------------|------|
| Buyer `shop/*` | `auth:api` |
| Vendor `shop/vendor/*` | `auth:api` + `EnsureVendor` (owns `shop_vendors` row; status rules in §5.4; house vendor N/A) |
| Admin brands/categories | `admin.only` + `admin.permission:shop.catalog.manage` |
| Admin vendors / commission | `admin.only` + `admin.permission:shop.vendors.manage` |
| Admin payments | `admin.only` + `admin.permission:shop.payments.verify` |
| Admin order oversee | `admin.only` + `admin.permission:shop.orders.oversee` |

Because `User::isAdmin()` bypasses permission checks inside `EnsureAdminPermission`, platform administrators keep full access. Broadcast Operators fail these middleware checks unless mistakenly given shop slugs — **PermissionSeeder must not attach shop slugs to broadcaster**.

Optional belt-and-suspenders: `User::canManageShopBackoffice(): bool` = `isAdmin()` (and later shop_manager role). Prefer middleware + exact permissions as the enforceable gate.

Angular sidebar: hide Shop money sections unless user is administrator (or has shop permission flags from `/me`).

### 5.4 `EnsureVendor`

Split middleware or route groups: **read** vs **mutate**.

| Vendor row state | Mutations | Read (dashboard, store, historical orders) |
|------------------|-----------|-----------------------------------------------|
| missing | 403 `VENDOR_PROFILE_REQUIRED` | 403 |
| `rejected` | 403 `VENDOR_NOT_APPROVED` | 403 — no Seller hub (Become-a-seller apply was denied) |
| `pending` | 403 `VENDOR_NOT_APPROVED` | **yes** — read-only “awaiting approval” |
| `suspended` | 403 `VENDOR_SUSPENDED` | **yes** — read-only |
| `approved` | allow | allow |

**`rejected` vs `suspended`:** reject is for **self-serve apply** still in `pending` (never went live). Suspend is for an already **`approved`** store that must be taken down. Approved vendors cannot be rejected — use suspend.

Matches `vendor.status` UI rules in [APP_CAPABILITIES.md](./APP_CAPABILITIES.md) §1.

### 5.5 Policies vs User booleans

**New infrastructure:** Laravel Policies may be introduced for `Product`, `VendorOrder`, `Vendor`. Flag in PR description — this repo has no Policies today.

**Minimum viable auth (required even without Policies):**

- Query scopes: `Product::forVendor($id)`, `VendorOrder::forVendor($id)`  
- Controllers load by id **within scope** (404 if other vendor’s id)  
- Feature tests for IDOR on product update / vendor-order status  

Do not rely on “hide in UI” only.

### 5.6 Admin creates vendor

1. Select/create app user.  
2. Create `shop_vendors` linked to that user (`pending` or `approved`) — **no app role attach**. Optionally set `default_shipping_amount` on create.  
3. Vendor completes store profile in app (Seller Hub / Store Settings).

Self-serve apply = Phase 4 (`POST shop/vendor/apply` → `pending`; admin **approve** or **reject**).

---

## 6. Backend API

### 6.1 Routes

#### Buyer (`shop/`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `shop/products`, `shop/products/{slug}` | Sellable only; include vendor summary |
| GET | `shop/brands`, `shop/categories` | Unchanged semantics |
| GET | `shop/vendors`, `shop/vendors/{slug}` | Store pages |
| GET/POST/PATCH/DELETE | `shop/cart*` | See cart contract §11.1 |
| POST | `shop/orders` | CheckoutService |
| GET | `shop/orders`, `shop/orders/{id}` | Parent + nested `vendor_orders` |

**Public catalog (Phase 2 — locked):** Move **read-only** catalog + vendor store GETs outside `auth:api` (or dual route). Cart/checkout/orders remain authenticated. Until Phase 2, keep auth as today.

#### Vendor (`shop/vendor/`)

| Method | Path |
|--------|------|
| GET | `shop/vendor/dashboard` |
| GET/PATCH | `shop/vendor/store` |
| apiResource | `shop/vendor/products` |
| POST/DELETE | media via existing media API (`type=product`) after whitelist (§11.2) |
| GET | `shop/vendor/orders` |
| GET | `shop/vendor/orders/{vendorOrder}` |
| POST | `shop/vendor/orders/{vendorOrder}/status` | **Action endpoint**, not bare PATCH |
| POST | `shop/vendor/orders/{vendorOrder}/payment` | Same verify path as admin (`OrderPaymentService`) |

#### Admin (`admin/shop/`)

| Method | Path | Permission |
|--------|------|------------|
| apiResource brands, categories | | `shop.catalog.manage` |
| apiResource vendors + approve/suspend | | `shop.vendors.manage` |
| products oversee / featured | | `shop.products.oversee` |
| orders / vendor-orders support | | `shop.orders.oversee` |
| POST `orders/{id}/payment` | mark unpaid/advance/paid | `shop.payments.verify` |
| POST `orders/{id}/refund` | refund workflow | `shop.payments.verify` |
| dashboard-stats | | any of shop.* or admin |

### 6.2 Services (required)

| Service | Responsibility |
|---------|----------------|
| `VendorService` | Create/approve/suspend; role attach |
| `CartService` | Add/update; sellability |
| `CheckoutService` | Split checkout txn |
| `CommissionService` | Rate resolve + amounts |
| `InventoryService` | **Only** path to change `stock_quantity`; always logs |
| `VendorOrderStatusService` | State machine + stock restore + parent recompute |
| `OrderStatusAggregator` | Pure function + tests |
| `OrderPaymentService` | Payment status transitions + `amount_received` (admin + vendor) |
| `VendorDashboardService` / `AdminEcommerceDashboardService` | Metrics; shared status lists from enums |
| ~~`PayoutService`~~ | **Removed 2026-08-07** |

**Controllers never** call `$model->update(['status' => …])` or adjust stock directly.

### 6.3 Checkout algorithm (locked)

```
1. Load cart with items.product.vendor
2. Preflight validate (UX errors): non-empty; quantities
3. DB::transaction:
   a. Collect distinct product_ids; lock Product rows ORDER BY id ASC
      (canonical lock order — prevents cross-vendor deadlocks)
   b. Lock Vendor rows for those products ORDER BY id ASC
   c. Re-read commission_rate / status from locked vendor rows
   d. Re-validate sellability (approved vendor, published product, stock)
   e. Create parent order (payment_status = unpaid)
   f. Group items by vendor_id; for each group in vendor_id ASC order:
        - create vendor_order with commission snapshots
        - create order_items (vendor_id == vendor_order.vendor_id)
        - InventoryService::decrement(..., reason: sale)
   g. Clear cart items
4. Fire OrderPlaced (includes vendor_order ids)
5. Notify buyer + each vendor user + admin
```

On stock shortfall inside txn: **fail whole checkout** (clear error listing product ids). Acceptable amplification of today’s fail-fast pattern; document in API error shape `STOCK_UNAVAILABLE` + `product_ids[]`.

Optional later: `Idempotency-Key` on POST orders.

### 6.4 Status / payment / stock mutations (no bare PATCH)

| Action | Endpoint style | Service |
|--------|----------------|---------|
| Vendor advances fulfillment | `POST .../status` body `{status}` | `VendorOrderStatusService` |
| Admin support status override | `POST admin/.../status` | same service (+ reason) |
| Admin payment | `POST admin/shop/orders/{id}/payment` | `OrderPaymentService` |
| Vendor payment | `POST shop/vendor/orders/{id}/payment` | same service (owned slice only) |
| Cancel path | only via status service | must call `InventoryService::restore` + log |

**Allowed vendor transitions:**

```
pending → processing | cancelled
processing → dispatched | cancelled
dispatched → delivered | cancelled   # cancel-after-dispatch: product decision; default allow with reason for support, vendors maybe not
delivered → (none)
cancelled → (none)
```

v1 recommendation: vendors may cancel only from `pending` or `processing`. After `dispatched`, only admin cancels.

### 6.5 Events

| Event | Notes |
|-------|-------|
| `OrderPlaced` | Notify buyer, admin, **each vendor** |
| `VendorOrderStatusUpdated` | Vendor + buyer; may trigger parent `OrderStatusUpdated` when aggregate changes |
| `VendorApplicationSubmitted` | Admin inbox when a user applies as seller |
| Payment recorded | Via `OrderPaymentService` (admin or owning vendor); parent payment fields exposed on vendor order resources |

### 6.6 SKU / slug

- Slug: `UNIQUE(vendor_id, slug)`  
- SKU: per-vendor unique; generator prefixes vendor code  
- Buyer URLs: keep brand browse; add `/shop/vendors/:vendorSlug`; product detail shows vendor  

---

## 7. Catalog rules

Sellable iff:

1. `product.status = published`  
2. `stock_quantity >= requested`  
3. `vendor.status = approved` (and not `is_platform` restrictions — house vendor is approved)  

Suspended vendor → hidden from catalog; open vendor-orders remain completable; new cart adds of their products fail sellability checks.

**Brand ≠ Vendor.** Brand = equipment brand (GM, etc.). Vendor = seller. Ad `brand_partners` remain separate ([SPONSORED_BRAND_POSTS.md](./SPONSORED_BRAND_POSTS.md)).

**Brand authorization (phase 4+):** shared taxonomy has no “authorized to sell brand X” today — call out counterfeit risk for cricket gear; future `shop_vendor_brands` allowlist.

---

## 8. Order, payment & shipping

### 8.1 Buyer

- Cart may mix vendors; UI groups by vendor (§11).  
- Checkout creates parent order with `payment_status = unpaid` and `payment_method = cod`.  
- **Payment is cash on delivery (COD)** — collection outside the app; there is no in-app Pay Now.  
- Shipping address is required on checkout and stored on `shop_orders`; next visit prefills from the **last order**.  
- Order detail shows fulfillment per vendor-order; payment status may appear as a parent label.

### 8.2 Vendor

- Notified per vendor-order (placed / status).  
- Sees own items, shared shipping address, earnings, tracking.  
- May record parent payment (`amount_received` / status) on orders they own (same rules as admin verify).  
- Collects payment from the customer manually outside the app.

### 8.3 Admin

- Records payments / refunds on the parent: `amount_received` vs `total` → `advance` or `paid`; also `unpaid` / `refunded`.  
- Support status overrides via status service.  
- **No** payout batch UI in v1.

### 8.4 Cancel + stock

Any transition to `cancelled` on a vendor-order **must** restore stock through `InventoryService` (feature-tested). Parent totals display cancelled slices; GMV metrics exclude cancelled.

Buyer self-cancel is allowed only while every vendor-order is still `pending` **and** parent `payment_status` is not `advance` or `paid` (recorded payment requires admin refund instead).

### 8.5 Commission & shipping (specified)

**Earnings formula (locked):**

```
commission_amount = round(subtotal * commission_rate_snapshot / 100, 2)
vendor_earnings   = subtotal + shipping_amount - discount_amount - commission_amount
```

(Tax later.) Each vendor-order gets its own `default_shipping_amount`; parent `shipping_amount` is the sum across vendors in the cart.

**Seller settlement / payouts:** out of scope for v1 (removed 2026-08-07). `vendor_earnings` remains for dashboards/reporting only.

---

## 9. Dashboards

### 9.1 Vendor dashboard

`total_products`, `active_products`, `total_orders`, `pending_orders`, `gross_revenue`, `net_earnings`, `low_stock_count`, `recent_orders`, optional `revenue_series`.  
Params: `from`, `to`.

Indexes: `(vendor_id, created_at)` on vendor-orders; products `(vendor_id, status)`.

### 9.2 Admin dashboard

Extend existing KPIs; add vendors-by-status, GMV by vendor, commission accrued, payment verification queue.

**Consistency rules:**

- Status breakdowns iterate `OrderStatusEnum::cases()` — **never** hardcode string lists (today’s `EcommerceDashboardController` inline list is a drift hazard).  
- Single query module / service shared by admin endpoint.  
- Cache: `Cache::remember("shop.vendor.dash.{id}.{from}.{to}", 60, …)` owned by `VendorDashboardService`; invalidate on `VendorOrderStatusUpdated` / checkout (optional v1; enable when p95 requires it). Trigger threshold: when vendor-order count > 10k or dashboard p95 > 500ms.

---

## 10. Backoffice (Angular)

| Module | Notes |
|--------|-------|
| Vendors | Approve/suspend; commission; store defaults (shipping) |
| Products | Vendor column; featured toggles; no dead multipart images-on-create — keep **two-step media upload** |
| Orders | Parent + vendor-orders; payment action dialog |
| Dashboard | Enum-driven widgets |
| Brands / Categories | Unchanged ownership |

Nav visibility: administrators only for shop money modules (broadcast operators excluded). ~~Payouts nav~~ removed 2026-08-07.

---

## 11. Mobile / API contracts (locked)

### 11.1 Cart response (backward compatible)

Keep flat `items` (required for `useCartItemCount`, `ShopCart`, `ShopCheckout`). **Add**:

```json
{
  "id": 1,
  "items": [ /* existing CartItemResource shape + vendor_id, vendor: {id, store_name, slug} */ ],
  "items_count": 3,
  "subtotal": 1500,
  "vendor_groups": [
    {
      "vendor": { "id": 1, "store_name": "…", "slug": "…" },
      "items": [ /* same item objects / ids */ ],
      "subtotal": 900
    }
  ]
}
```

UI may render from `vendor_groups` when present; hooks keep using flat `items` + `quantity` sum.

### 11.2 Order detail

| UI element | Source field |
|------------|--------------|
| Payment label | Parent `payment_status` / `payment_status_label` (informational; no Pay Now) |
| Line “Delivered on …” | that line’s `vendor_order.status` (fallback parent only if single vendor-order) |
| Section headers | Group items by `vendor_order` |

### 11.3 Vendor app UX

| Decision | Choice |
|----------|--------|
| Nav | **Profile entry** (“Seller hub”) — do **not** add a 6th bottom-nav tab (`BOTTOM_NAV_ITEMS` is a fixed 5-item grid) |
| Gate | `/me` `vendor` ([APP_CAPABILITIES.md](./APP_CAPABILITIES.md) §1) — omit when no store; show read-only hub when `suspended` / `pending` |
| Product images | Create product → then media upload `type=product` (extend app media allowlist + authorize owner vendor). Never expect images in store-product JSON body |
| API slice | Prefer `vendorShopApi.js` **or** separate RTK tags: `Shop` (buyer) vs `VendorShop` — vendor mutations must **not** `invalidatesTags: ['Shop']` only |

### 11.4 Buyer UX additions

- “Sold by {store}” on cards/detail  
- Store page `ShopVendorStore.jsx`  
- Cart grouped UI  
- Multi vendor-order statuses on order detail  

---

## 12. Phases (deployment-safe)

### Phase 0 — Foundations (no half-migrated FKs)

1. Replace shop migrations: vendors, vendor_orders, inventory_logs, product.vendor_id, payment fields (no payout tables).  
2. Seed **platform house vendor** (`is_platform = true`, approved).  
3. Adapt `ShopSeeder` / export: all products → house vendor.  
4. Refactor checkout to **always** create one vendor-order (even single seller) + `InventoryService` + cancel restore.  
5. Exact **admin** shop permissions (**not** on broadcaster). No app `VENDOR` role.  
6. `VendorOrderStatusService` + aggregator tests.  
7. Wire admin order status through status service (fixes production cancel bug).  
8. Feature flag optional: hide multi-vendor UI until Phase 1.

**Exit:** Existing buyer shop works; every order has vendor_order rows; cancel restores stock with logs.

### Phase 1 — Real vendors + catalog ownership

1. Admin vendors CRUD / approve / suspend.  
2. Vendor product APIs + app Seller hub.  
3. Buyer “Sold by” + store page.  
4. Media allowlist for vendor product images.  
5. Admin featured flags only.

### Phase 2 — Multi-vendor cart + public catalog

1. Multi-vendor checkout path (already structurally ready).  
2. Cart `vendor_groups` + app UI.  
3. Payment fields + admin verify (offline collection; no buyer Pay Now).  
4. **Unauthenticated catalog GETs.**  
5. Per-vendor notifications.

### Phase 3 — Dashboards (+ tracking)

1. Vendor + admin dashboard extensions.  
2. ~~PayoutService + admin payout UI~~ — **removed 2026-08-07**; do not ship.  
3. Tracking number fields on vendor-order (optional UI).

### Phase 4 — Hardening (scoped MVP — Done)

Shipped (§14 “should-have soon”), without gateway/RMA/SEO:

1. Self-serve vendor apply (`POST shop/vendor/apply` → pending; admin approve/reject).  
2. Vendor publish is immediately sellable (**no** product moderation queue — locked).  
3. Buyer cancel when every vendor-order is still `pending` (stock restore via status service).  
4. Checkout address on `shop_orders`; prefill from **last order** (no `shop_addresses`).  
5. Shipping: sum of vendor `default_shipping_amount` only (no `shop_shipping_rules`).  
6. Manual full-refund workflow (`refunded` via `OrderPaymentService`).  
7. Seller orders UI for `tracking_number` / `carrier` + vendor payment record.  
8. Payment is COD (no pay-before-dispatch gate).

**Deferred (still §14 later):** JazzCash/card gateway, Returns/RMA, brand allowlist, public SEO, reviews/variants/coupons/wishlist/tax, courier webhooks, **seller payout settlement**. Product moderation stays deferred unless abuse requires it.

---

## 13. Edge cases & scalability

| Case | Handling |
|------|----------|
| Vendor suspended mid-cart | Checkout txn sellability fail; cart flags unavailable |
| Lock deadlock | Product/vendor locks by ascending id; Laravel/Postgres retry once on `40001` if needed |
| Commission edited mid-checkout | Re-read rate under vendor lock inside txn |
| Partial cancel | Aggregator + cancelled slice UX |
| Buyer is also vendor | Allowed; rankings should exclude self-purchase later (§14) |
| House vendor | No app login; admin manages like today |
| Dual `vendor_id` on items | Invariant tested; source of truth = vendor_order |

Scalability: composite indexes §4; dashboard cache §9; queue notifications per vendor.

---

## 14. Production roadmap (beyond MVP)

### Must-have (this plan’s Phase 0–3)

Commission snapshots, payment_status (unpaid/advance/paid/refunded), inventory logs + cancel restore, vendor suspension cascade, exact admin shop permissions, IDOR tests.

### Should-have soon

~~Self-serve vendor apply, buyer cancel, public catalog, refund workflow, tracking, last-order checkout prefill, flat vendor shipping~~ — **shipped in Phases 2–4** (address book / shipping rules / payouts later removed 2026-08-07).

### Later / missing from first draft — now tracked

| Feature | Note |
|---------|------|
| Product moderation queue | **Not chosen for v1** — publish is live immediately (§17 #4) |
| Returns / RMA | Refund enum ≠ reverse logistics |
| Courier integration | Labels + webhooks |
| Brand authorization | Anti-counterfeit for cricket gear |
| Wash-trading / self-purchase exclusion | Rankings & future ratings |
| Gateway (JazzCash / card) | Replace manual COD recording |
| Seller payout settlement | Reintroduce batches/IBAN only if ops need it |
| Reviews, variants, coupons, wishlist, tax | Prioritize after core selling is stable |

### Non-goals v1

In-app buyer↔vendor inbox (WhatsApp remains), multi-warehouse, auctions, FX.

---

## 15. Testing

| Layer | Must cover |
|-------|------------|
| Unit | Aggregator matrix §4.2; commission math; transition matrix |
| Feature | IDOR vendor product/order; checkout split; suspend hides products; cancel restores stock **and** inventory log; broadcast user **403** on `shop.vendors.manage`; payment advance/paid path |
| Feature | House-vendor single-seller checkout still works after Phase 0 |

Factories: `VendorFactory`, `ProductFactory`, `OrderFactory`, `VendorOrderFactory`.

Success criteria in §18 are API/test-checkable (no “looks right in UI” only).

---

## 16. File / module touch list

```
api/
  app/Enums/Shop/*                          # VendorStatus, ProductStatus, PaymentStatus, OrderStatus, …
  app/Models/Shop/Vendor.php                # auth source of truth
  app/Models/Shop/VendorOrder.php
  app/Models/Shop/InventoryLog.php
  app/Models/Shop/Product.php               # vendor_id, status, uniques
  app/Models/Shop/Order.php                 # payment_*, aggregator hook
  app/Models/Shop/OrderItem.php             # vendor_order_id invariant
  app/Models/Shop/Cart.php / CartItem.php
  app/Services/Shop/*                       # services §6.2 (no PayoutService)
  app/Http/Controllers/User/Shop/*          # ProductController, CartController, OrderController
  app/Http/Controllers/Vendor/Shop/*        # store, products, orders (+ payment), dashboard
  app/Http/Controllers/Admin/Shop/*         # OrderController, ProductController, VendorController, EcommerceDashboardController
  app/Http/Middleware/EnsureVendor.php
  app/Http/Requests|Resources/…/Shop/*
  app/Support/MediaRegistry.php             # vendor/app access rules for product
  database/migrations/2026_08_05_100000_marketplace_phase0_shop_vendors.php
  database/seeders/{Permission,Shop}Seeder.php  # admin shop perms only; no payouts.manage; no app vendor role
  tests/Feature/Shop/*

backoffice/
  pages/shop-management/vendors/**
  pages/shop-management/orders/**           # payment + vendor-orders
  services/shop/*                           # no payout.service

app/
  pages/shop/*                              # Sold by, cart groups, checkout last-order prefill
  pages/vendor/*                            # Seller hub / apply / store / orders
  components/Sidebar.jsx                    # Seller Hub / Become a Seller
  store/api/shopApi.js                      # buyer tags
  store/api/vendorShopApi.js                # separate tags
  auth /me                                  # optional vendor { id, store_name, status }
```

Also keep in sync: `docs/SHOP_ECOMMERCE_DESIGN.md`, `docs/actors_and_roles.md`, `docs/APP_CAPABILITIES.md`.

---

## 17. Locked decisions (was “open”)

| # | Decision | Locked choice |
|---|----------|---------------|
| 1 | Product URLs | Brand browse kept; add vendor store pages; detail shows vendor |
| 2 | Slug uniqueness | `UNIQUE(vendor_id, slug)` |
| 3 | Admin products | On-behalf-of house or any vendor with required `vendor_id` |
| 4 | Product moderation | **None** — approved vendor publish → `published` and sellable immediately (no queue / no `pending_moderation`) |
| 5 | Vendor statuses | `pending` \| `approved` \| `suspended` \| `rejected` — reject = deny Become-a-seller apply; suspend = take down a live approved store |
| 6 | Vendor desktop | App Seller hub first; Angular vendor portal later if demanded |
| 7 | Default commission | `config('shop.default_commission_rate')` = **10**; per-vendor override |
| 8 | Pay before ship | **No** — COD; payment recorded by admin or owning vendor |
| 9 | Shipping amount | Sum of each cart vendor’s `default_shipping_amount` only — **not** platform rules / `config('shop.default_shipping_amount')` |
| 10 | Public catalog | **Phase 2** unauthenticated GETs |
| 11 | `is_active` vs status | **`status` only** (`draft`/`published`/`archived`) |
| 12 | Cart API shape | Flat `items` + additive `vendor_groups` |
| 13 | Vendor nav | Sidebar **Seller Hub** / **Become a Seller**; profile CTA optional |
| 14 | `/me` gate | Optional `vendor` object; no app VENDOR role |
| 15 | RTK cache | Separate `VendorShop` tag namespace |
| 16 | Payouts | **Out of v1** (removed 2026-08-07) |
| 17 | Authz style | Exact **admin** permission middleware + scopes; Policies optional; app vendor = `shop_vendors` status ([APP_CAPABILITIES](./APP_CAPABILITIES.md)) |
| 18 | App auth | Assignment model already shipped ([APP_CAPABILITIES](./APP_CAPABILITIES.md)); marketplace must not reintroduce app roles |
| 19 | Checkout address | Snapshot on `shop_orders`; prefill from last order — **no** `shop_addresses` |

---

## 18. Success criteria (testable)

1. Broadcast Operator receives **403** on vendor approve and payment verify routes.  
2. Admin can create/approve/suspend vendors; categories/brands remain admin-owned.  
3. Vendor can CRUD own products only (IDOR test fails cross-vendor).  
4. Multi-vendor checkout creates 1 parent + N vendor-orders; commission snapshots present.  
5. Cancelled vendor-order restores stock and writes `shop_inventory_logs` reason `cancel_restore`.  
6. Aggregator unit tests pass the full matrix in §4.2.  
7. Admin or owning vendor records `amount_received` → `advance` or `paid`; buyer has no Pay Now; cancel blocked once payment is recorded.  
8. Suspended vendor products are not sellable inside checkout txn.  
9. Phase 0 single house-vendor path: buyer shop regression green.  
10. Checkout stores address on `shop_orders`; shipping quote equals sum of vendor flat amounts.  
11. No payout / address-book / shipping-rules routes or tables in the live schema.

---

## 19. Next step

1. ~~Ship [APP_CAPABILITIES.md](./APP_CAPABILITIES.md)~~ **Done** (assignment-based app auth).  
2. ~~Implement marketplace **Phase 0**~~ **Done** (house vendor schema, CheckoutService, InventoryService, VendorOrderStatusService, admin shop permission slugs).  
3. ~~Implement **Phase 1**~~ **Done** (admin vendors CRUD/approve/suspend, EnsureVendor + seller product APIs, app Seller hub, buyer Sold-by + store page, vendor product media allowlist, admin-only featured flags).  
4. ~~Implement **Phase 2**~~ **Done** (cart `vendor_groups`, payment verify, public catalog GETs, per-vendor order notifications). Later: COD model (no Pay Now).  
5. ~~Implement **Phase 3**~~ **Done** (VendorDashboardService + admin marketplace KPIs, optional tracking). ~~Payouts~~ removed 2026-08-07.  
6. ~~Implement **Phase 4** scoped MVP~~ **Done** (self-serve apply, immediate vendor publish, buyer cancel, last-order checkout prefill, flat vendor shipping, COD + refund, seller tracking + vendor payment).  
7. Keep [SHOP_ECOMMERCE_DESIGN.md](./SHOP_ECOMMERCE_DESIGN.md) in sync with the live schema.

This document is the coding contract for marketplace work until superseded by a dated revision.
