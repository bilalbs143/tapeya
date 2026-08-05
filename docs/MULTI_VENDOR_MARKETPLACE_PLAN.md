# Multi-Vendor Marketplace — Implementation Plan

**Status:** Final (ready for Phase 0)  
**Date:** 2026-08-04  
**Revised:** 2026-08-04 — adversarial review pass incorporated  
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
| B4 | No underpayment state for manual bank transfer | `PaymentStatusEnum` includes `underpaid` (§4.4) |
| B5 | Bare `_patch()` would reintroduce cancel/stock bugs on new endpoints | Mandatory transition services; no bare status/stock/payment PATCH (§6.4, §8) |
| G1 | Payouts underspecified vs “#1 must-have” | Full payout model + manual settlement runbook; schema Phase 0, ops Phase 3 (§4.1, §8.5, §12) |
| G2 | Public catalog never actually opens | Explicit Phase 2: unauthenticated catalog GETs (§6.1, §12) |
| G3 | Checkout deadlock / stale commission / stale sellability | Ordered locks, re-read vendor+rate+sellability inside txn (§6.3) |
| G4 | Dashboard drift / indexes / cache | Shared enum source; indexes; cache owner (§9) |
| G5 | Required FKs before checkout split | **House vendor** from day 1 — every order always has vendor-orders (§12 Phase 0) |
| G6 | “Wipe everything” vs ShopSeeder/export | Wipe transactional data; re-seed catalog via adapted seeder (§1, §12) |
| G7 | Policies presented as existing pattern | Flagged as **new** infra; User boolean helpers remain primary for middleware (§5.5) |
| G8 | File list omitted controllers that must change | Expanded (§16) |
| G9 | Cart/OrderDetail/nav/RTK contract gaps | Locked contracts (§11, §17) |
| G10 | Bank details in unvalidated `meta` JSON | First-class payout columns + ownership checks (§4.1) |

---

## 1. Executive summary

Tapeya already has a **working single-merchant shop**: brands, hierarchical categories, products (stock, discounts, images), authenticated cart/checkout, orders with status lifecycle, notifications (DB / mail / SMS / push), Angular backoffice CRUD + ecommerce dashboard, and a full React shop UX.

This plan converts that into a **multi-vendor marketplace** where:

| Actor | Owns |
|-------|------|
| **Platform admin** (`type = administrator`) | Categories, brands, vendor lifecycle, platform catalog & order oversight, payment verification, commissions & payouts |
| **Vendor** | Store profile, own products & inventory, own vendor-orders, lightweight metrics dashboard (app-first) |
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
- No commission / payout / payment_status model  
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
│ (administrator)  │   commission + payouts         │ (shop_vendors)│
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
| Vendor / store | `shop_vendors` ↔ user | Create, approve, suspend, commission, payouts |
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
| `is_platform` | boolean, default false | House vendor flag |
| `approved_at` / `suspended_at` | timestamps, nullable | |
| `suspension_reason` | text, nullable | |
| **Payout identity (first-class, not JSON)** | | |
| `payout_account_title` | string, nullable | |
| `payout_bank_name` | string, nullable | |
| `payout_iban` | string, nullable | Encrypted at rest if available |
| `payout_details_verified_at` | timestamp, nullable | Admin-verified |
| `timestamps` | | |

Indexes: `status`, `slug`, `user_id`, `is_platform`.

`meta` JSON is allowed only for non-financial extras (e.g. WhatsApp). **Never** store IBAN solely in `meta`.

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

#### `shop_vendor_payouts` + `shop_vendor_payout_items`

Ship schema in Phase 0; **ops UI/API in Phase 3**.

**`shop_vendor_payouts`**

| Column | Notes |
|--------|-------|
| `vendor_id` | FK |
| `amount` | decimal(12,2) |
| `currency` | default PKR |
| `status` | `pending` \| `paid` \| `failed` \| `cancelled` |
| `period_start` / `period_end` | date |
| `reference` | bank transfer ref |
| `paid_at` | nullable |
| `created_by` | admin user id |
| `notes` | nullable |
| `timestamps` | |

**`shop_vendor_payout_items`** (required link — do not omit)

| Column | Notes |
|--------|-------|
| `payout_id` | FK cascade |
| `vendor_order_id` | FK, **unique** (a vendor-order settles at most once) |
| `amount` | earnings included |

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

Defer table until self-serve vendor signup. Admin-created vendors in Phase 0–2 publish immediately.

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
| `payment_method` | `bank_transfer` (v1) |
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
Vendor 1──* Payout 1──* PayoutItem *──1 VendorOrder
User (vendor) 0..1──1 Vendor   (null user_id iff is_platform)
```

### 4.4 Enums

| Enum | Values |
|------|--------|
| `VendorStatusEnum` | `pending`, `approved`, `suspended`, `rejected` |
| `ProductStatusEnum` | `draft`, `published`, `archived` |
| `PaymentStatusEnum` | `unpaid`, `pending_verification`, `underpaid`, `paid`, `refunded`, `partially_refunded` |
| `OrderStatusEnum` | `pending`, `processing`, `dispatched`, `delivered`, `cancelled` |
| `PayoutStatusEnum` | `pending`, `paid`, `failed`, `cancelled` |
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
| `/me` | `capabilities.vendor_status`: `null` \| `pending` \| `approved` \| `suspended` \| `rejected` (not a boolean) |

Admin creates/approves a `shop_vendors` row; that assignment alone unlocks the Seller hub. No role-attach helper.

### 5.2 Permission slugs (exact only — no wildcards)

**App guard:** no `shop.vendor.*` permission seeds. Vendor routes authorize via `EnsureVendor` (row + status) and query scopes.

**Admin guard (attach to `super_admin` only — never to `broadcaster`):**

| Slug | Intent |
|------|--------|
| `shop.catalog.manage` | Brands, categories |
| `shop.vendors.manage` | Vendor CRUD / approve / suspend / commission |
| `shop.products.oversee` | Cross-vendor product moderation / featured |
| `shop.orders.oversee` | Parent + vendor-order support |
| `shop.payments.verify` | Mark paid / underpaid |
| `shop.payouts.manage` | Settlement batches |

`EnsureAdminPermission` must be called with **one exact slug**, e.g. `admin.permission:shop.vendors.manage`. Never `shop.admin.*`.

### 5.3 Route gating (closes broadcast privilege escalation)

| Route group | Gate |
|-------------|------|
| Buyer `shop/*` | `auth:api` |
| Vendor `shop/vendor/*` | `auth:api` + `EnsureVendor` (owns `shop_vendors` row; status rules in §5.4; house vendor N/A) |
| Admin brands/categories | `admin.only` + `admin.permission:shop.catalog.manage` |
| Admin vendors / commission | `admin.only` + `admin.permission:shop.vendors.manage` |
| Admin payments | `admin.only` + `admin.permission:shop.payments.verify` |
| Admin payouts | `admin.only` + `admin.permission:shop.payouts.manage` |
| Admin order oversee | `admin.only` + `admin.permission:shop.orders.oversee` |

Because `User::isAdmin()` bypasses permission checks inside `EnsureAdminPermission`, platform administrators keep full access. Broadcast Operators fail these middleware checks unless mistakenly given shop slugs — **PermissionSeeder must not attach shop slugs to broadcaster**.

Optional belt-and-suspenders: `User::canManageShopBackoffice(): bool` = `isAdmin()` (and later shop_manager role). Prefer middleware + exact permissions as the enforceable gate.

Angular sidebar: hide Shop money sections unless user is administrator (or has shop permission flags from `/me`).

### 5.4 `EnsureVendor`

Split middleware or route groups: **read** vs **mutate**.

| Vendor row state | Mutations | Read (dashboard, store, historical orders) |
|------------------|-----------|-----------------------------------------------|
| missing | 403 `VENDOR_PROFILE_REQUIRED` | 403 |
| `rejected` | 403 `VENDOR_NOT_APPROVED` | 403 (or apply CTA later) |
| `pending` | 403 `VENDOR_NOT_APPROVED` | **yes** — read-only “awaiting approval” |
| `suspended` | 403 `VENDOR_SUSPENDED` | **yes** — read-only |
| `approved` | allow | allow |

Matches `capabilities.vendor_status` UI rules in [APP_CAPABILITIES.md](./APP_CAPABILITIES.md) §3.4.

### 5.5 Policies vs User booleans

**New infrastructure:** Laravel Policies may be introduced for `Product`, `VendorOrder`, `Vendor`. Flag in PR description — this repo has no Policies today.

**Minimum viable auth (required even without Policies):**

- Query scopes: `Product::forVendor($id)`, `VendorOrder::forVendor($id)`  
- Controllers load by id **within scope** (404 if other vendor’s id)  
- Feature tests for IDOR on product update / vendor-order status  

Do not rely on “hide in UI” only.

### 5.6 Admin creates vendor

1. Select/create app user.  
2. Create `shop_vendors` linked to that user (`pending` or `approved`) — **no app role attach**.  
3. Vendor completes store + payout fields in app; admin verifies payout details before Phase 3 payouts.

Self-serve apply = later phase.

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

#### Admin (`admin/shop/`)

| Method | Path | Permission |
|--------|------|------------|
| apiResource brands, categories | | `shop.catalog.manage` |
| apiResource vendors + approve/suspend | | `shop.vendors.manage` |
| products oversee / featured | | `shop.products.oversee` |
| orders / vendor-orders support | | `shop.orders.oversee` |
| POST `orders/{id}/payment` | mark unpaid/pending_verification/underpaid/paid | `shop.payments.verify` |
| payouts CRUD + mark paid | | `shop.payouts.manage` |
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
| `OrderPaymentService` | Payment status transitions + `amount_received` |
| `PayoutService` | Build batch from unpaid delivered earnings; mark paid |
| `VendorDashboardService` / `AdminEcommerceDashboardService` | Metrics; shared status lists from enums |

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
| `OrderPaymentUpdated` | Vendor read-only signal (ship/no-ship) |

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

Suspended vendor → hidden from catalog; open vendor-orders remain completable; new cart adds rejected.

**Brand ≠ Vendor.** Brand = equipment brand (GM, etc.). Vendor = seller. Ad `brand_partners` remain separate ([SPONSORED_BRAND_POSTS.md](./SPONSORED_BRAND_POSTS.md)).

**Brand authorization (phase 4+):** shared taxonomy has no “authorized to sell brand X” today — call out counterfeit risk for cricket gear; future `shop_vendor_brands` allowlist.

---

## 8. Order, payment, payouts

### 8.1 Buyer

- Cart may mix vendors; UI groups by vendor (§11).  
- One checkout, one platform bank transfer (current NayaPay flow) for **parent total**.  
- Order detail: parent payment CTA from `payment_status`; per-line delivery from **vendor-order** status.  
- **Pay Now** shows when `payment_status ∈ {unpaid, underpaid, pending_verification}` — **not** when `order.status === 'pending'` (fixes today’s conflation in `OrderDetail.jsx`).

### 8.2 Vendor

- Notified per vendor-order.  
- Sees own items, shared shipping address, earnings, parent `payment_status` (read-only).  
- Soft warning if unpaid; hard block to dispatch optional config `shop.require_payment_before_dispatch` (default **false** in v1).

### 8.3 Admin

- Verify payments (`amount_received` vs `total` → `paid` or `underpaid`).  
- Support status overrides via status service.  
- Phase 3: run payout batches.

### 8.4 Cancel + stock

Any transition to `cancelled` on a vendor-order **must** restore stock through `InventoryService` (feature-tested). Parent totals display cancelled slices; GMV metrics exclude cancelled.

### 8.5 Commission & payouts (specified)

**Earnings formula (locked):**

```
commission_amount = round(subtotal * commission_rate_snapshot / 100, 2)
vendor_earnings   = subtotal + shipping_amount - discount_amount - commission_amount
```

(Tax later. Shipping to vendor in v1 is 0.)

**Eligible for payout:** vendor-orders where:

- `status = delivered`  
- parent `payment_status = paid`  
- not already linked in `shop_vendor_payout_items`  

**`PayoutService::createBatch(vendor, period, actor)`:**

1. Select eligible vendor-orders in period (`lockForUpdate`).  
2. Sum `vendor_earnings` → payout amount.  
3. Insert payout + items.  
4. Admin marks paid with `reference` after bank transfer.

**Manual settlement runbook (Phase 3):**

1. Admin → Payouts → “Generate batch” for vendor + date range.  
2. Export CSV (vendor IBAN, title, amount, order numbers).  
3. Finance sends bank transfer outside Tapeya.  
4. Admin → Mark paid + paste bank reference.  
5. Vendor sees payout history in app (read-only).

No automated bank API in v1.

---

## 9. Dashboards

### 9.1 Vendor dashboard

`total_products`, `active_products`, `total_orders`, `pending_orders`, `gross_revenue`, `net_earnings`, `low_stock_count`, `recent_orders`, optional `revenue_series`.  
Params: `from`, `to`.

Indexes: `(vendor_id, created_at)` on vendor-orders; products `(vendor_id, status)`.

### 9.2 Admin dashboard

Extend existing KPIs; add vendors-by-status, GMV by vendor, commission accrued, payment verification queue, payouts pending.

**Consistency rules:**

- Status breakdowns iterate `OrderStatusEnum::cases()` — **never** hardcode string lists (today’s `EcommerceDashboardController` inline list is a drift hazard).  
- Single query module / service shared by admin endpoint.  
- Cache: `Cache::remember("shop.vendor.dash.{id}.{from}.{to}", 60, …)` owned by `VendorDashboardService`; invalidate on `VendorOrderStatusUpdated` / checkout (optional v1; enable when p95 requires it). Trigger threshold: when vendor-order count > 10k or dashboard p95 > 500ms.

---

## 10. Backoffice (Angular)

| Module | Notes |
|--------|-------|
| Vendors | New; approve/suspend; commission; payout field verify |
| Products | Vendor column; featured toggles; no dead multipart images-on-create — keep **two-step media upload** |
| Orders | Parent + vendor-orders; payment action dialog |
| Payouts | Phase 3 |
| Dashboard | Enum-driven widgets |
| Brands / Categories | Unchanged ownership |

Nav visibility: administrators only for shop money modules (broadcast operators excluded).

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
| Pay Now | `payment_status` ∈ unpaid \| underpaid \| pending_verification |
| Line “Delivered on …” | that line’s `vendor_order.status` (fallback parent only if single vendor-order) |
| Section headers | Group items by `vendor_order` |

### 11.3 Vendor app UX

| Decision | Choice |
|----------|--------|
| Nav | **Profile entry** (“Seller hub”) — do **not** add a 6th bottom-nav tab (`BOTTOM_NAV_ITEMS` is a fixed 5-item grid) |
| Gate | `capabilities.vendor_status` from `/me` ([APP_CAPABILITIES.md](./APP_CAPABILITIES.md) §3.4) — status string, **not** a boolean; show read-only hub when `suspended` / `pending` |
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

1. Replace shop migrations: vendors, vendor_orders, payout tables, inventory_logs, product.vendor_id, payment fields.  
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
3. Payment fields + admin verify + OrderDetail Pay Now split.  
4. **Unauthenticated catalog GETs.**  
5. Per-vendor notifications.

### Phase 3 — Dashboards + payouts

1. Vendor + admin dashboard extensions.  
2. `PayoutService` + admin UI + CSV export + mark paid.  
3. Vendor payout history read API.  
4. Tracking number fields on vendor-order (optional UI).

### Phase 4 — Hardening

Moderation queue, self-serve apply, shipping rules, gateway, returns/RMA, brand allowlist, public SEO, etc. (§14).

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

Commission snapshots, payment_status (incl. underpaid), inventory logs + cancel restore, vendor suspension cascade, exact admin shop permissions, payouts + item link + runbook, IDOR tests.

### Should-have soon

Product moderation, self-serve vendor apply, shipping rules, buyer cancel (all vendor-orders pending), saved addresses, public catalog (Phase 2), refund workflow tied to payment_status, tracking numbers.

### Later / missing from first draft — now tracked

| Feature | Note |
|---------|------|
| Returns / RMA | Refund enum ≠ reverse logistics |
| Courier integration | Labels + webhooks |
| Brand authorization | Anti-counterfeit for cricket gear |
| Wash-trading / self-purchase exclusion | Rankings & future ratings |
| Gateway (JazzCash / card) | Replace manual transfer |
| Reviews, variants, coupons, wishlist, tax | Prioritize after payouts stable |

### Non-goals v1

In-app buyer↔vendor inbox (WhatsApp remains), multi-warehouse, auctions, FX.

---

## 15. Testing

| Layer | Must cover |
|-------|------------|
| Unit | Aggregator matrix §4.2; commission math; transition matrix |
| Feature | IDOR vendor product/order; checkout split; suspend hides products; cancel restores stock **and** inventory log; broadcast user **403** on `shop.vendors.manage`; payment underpaid path |
| Feature | House-vendor single-seller checkout still works after Phase 0 |

Factories: `VendorFactory`, `ProductFactory`, `OrderFactory`, `VendorOrderFactory`.

Success criteria in §18 are API/test-checkable (no “looks right in UI” only).

---

## 16. File / module touch list

```
api/
  app/Enums/Shop/*                          # new + PaymentStatus, VendorStatus, …
  app/Models/Shop/Vendor.php                # new (auth source of truth)
  app/Models/Shop/VendorOrder.php           # new
  app/Models/Shop/VendorPayout.php          # new
  app/Models/Shop/VendorPayoutItem.php      # new
  app/Models/Shop/InventoryLog.php          # new
  app/Models/Shop/Product.php               # vendor_id, status, uniques
  app/Models/Shop/Order.php                 # payment_*, aggregator hook
  app/Models/Shop/OrderItem.php             # vendor_order_id invariant
  app/Models/Shop/Cart.php / CartItem.php
  app/Services/Shop/*                       # all services §6.2
  app/Http/Controllers/User/Shop/*          # ProductController, CartController, OrderController (change)
  app/Http/Controllers/Vendor/Shop/*        # new
  app/Http/Controllers/Admin/Shop/*         # OrderController, ProductController, EcommerceDashboardController (change)
  app/Http/Controllers/Admin/Shop/VendorController.php
  app/Http/Controllers/Admin/Shop/PayoutController.php
  app/Http/Middleware/EnsureVendor.php
  app/Http/Requests|Resources/…/Shop/*
  app/Support/MediaRegistry.php             # vendor/app access rules for product
  database/migrations/*shop*
  database/seeders/{Permission,Shop}Seeder.php  # admin shop perms only; no app vendor role
  tests/Unit/Shop/OrderStatusAggregatorTest.php
  tests/Feature/Shop/*

backoffice/
  pages/shop-management/vendors/**
  pages/shop-management/orders/**           # payment + vendor-orders
  pages/shop-management/payouts/**          # Phase 3
  services/shop/*

app/
  pages/shop/*                              # Sold by, cart groups, payment_status
  pages/vendor/*                            # Seller hub (profile entry)
  store/api/shopApi.js                      # buyer tags
  store/api/vendorShopApi.js                # separate tags
  auth /me                                  # capabilities.vendor_status (see APP_CAPABILITIES)
```

Also update: `docs/SHOP_ECOMMERCE_DESIGN.md`, `docs/actors_and_roles.md`, `docs/API.md`, `BROADCASTER_ROLE.md` §8 permission mirror, `docs/APP_CAPABILITIES.md`.

---

## 17. Locked decisions (was “open”)

| # | Decision | Locked choice |
|---|----------|---------------|
| 1 | Product URLs | Brand browse kept; add vendor store pages; detail shows vendor |
| 2 | Slug uniqueness | `UNIQUE(vendor_id, slug)` |
| 3 | Admin products | On-behalf-of house or any vendor with required `vendor_id` |
| 4 | Moderation | Immediate publish for admin-created vendors; queue when self-serve |
| 5 | Vendor desktop | App Seller hub first; Angular vendor portal later if demanded |
| 6 | Default commission | `config('shop.default_commission_rate')` = **10**; per-vendor override |
| 7 | Pay before ship | Soft warning v1; config flag for hard block later |
| 8 | Public catalog | **Phase 2** unauthenticated GETs |
| 9 | `is_active` vs status | **`status` only** (`draft`/`published`/`archived`) |
| 10 | Cart API shape | Flat `items` + additive `vendor_groups` |
| 11 | Vendor nav | Profile “Seller hub”, not bottom nav |
| 12 | `/me` gate | `capabilities.vendor_status` (status, not boolean); no app VENDOR role |
| 13 | RTK cache | Separate `VendorShop` tag namespace |
| 14 | Payouts phase | Schema Phase 0; service/UI Phase 3 |
| 15 | Authz style | Exact **admin** permission middleware + scopes; Policies optional; app vendor = `shop_vendors` status ([APP_CAPABILITIES](./APP_CAPABILITIES.md)) |
| 16 | App capabilities | Assignment model already shipped ([APP_CAPABILITIES](./APP_CAPABILITIES.md)); marketplace must not reintroduce app roles |

---

## 18. Success criteria (testable)

1. Broadcast Operator receives **403** on vendor approve, payment verify, and payout routes.  
2. Admin can create/approve/suspend vendors; categories/brands remain admin-owned.  
3. Vendor can CRUD own products only (IDOR test fails cross-vendor).  
4. Multi-vendor checkout creates 1 parent + N vendor-orders; commission snapshots present.  
5. Cancelled vendor-order restores stock and writes `shop_inventory_logs` reason `cancel_restore`.  
6. Aggregator unit tests pass the full matrix in §4.2.  
7. `payment_status` drives Pay Now; underpaid is representable with `amount_received`.  
8. Suspended vendor products are not sellable inside checkout txn.  
9. Phase 0 single house-vendor path: buyer shop regression green.  
10. Phase 3: payout batch links vendor-orders uniquely; second payout attempt excludes them.

---

## 19. Next step

1. Ship [APP_CAPABILITIES.md](./APP_CAPABILITIES.md) PR1–PR2 (team auth + stop app-role gates).  
2. Implement marketplace **Phase 0** exactly as §12 (house vendor + InventoryService + status service + **admin** shop permissions).  
3. Then Phase 1 vendors/app Seller hub (`shop_vendors` assignment only).  
4. Keep [SHOP_ECOMMERCE_DESIGN.md](./SHOP_ECOMMERCE_DESIGN.md) in sync when migrations land.

This document is the coding contract for marketplace work until superseded by a dated revision.
