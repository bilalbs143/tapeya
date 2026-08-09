# Production deploy — `main` → `develop`

Ship **origin/develop** onto production after merge.

| | SHA | Message |
|---|---|---|
| **main** (prod today) | `2de444c` | Keep reel originals for 48 hours after HLS is ready. |
| **develop** (ship this) | `e061270` | Simplify shop products to Active/Inactive and server-managed slugs. |

**3 commits** on develop, not on main:

1. `959fea5` — Replace app-guard roles with assignment-based capabilities.
2. `f1a9ad2` — Ship multi-vendor marketplace MVP for sellers and COD checkout.
3. `e061270` — Shop products Active/Inactive + server-managed slugs.

No CDN/Wrangler, no native Capacitor rebuild, no `composer.lock` change.

---

## What this release does

- App auth uses tournament/team **capabilities** (`/me`), not app-guard roles (`player` / `organizer` / `sponsor`).
- Multi-vendor shop: sellers apply + list products + fulfill; buyers COD checkout; admin vendors / payments.
- Existing products attach to the **house vendor** `tapeya-house` (Tapeya).
- Product sellability = `is_active` + approved vendor. Slugs generated on the server.

---

## ⚠ Migration destroys live shop carts & orders

`2026_08_05_100000_marketplace_phase0_shop_vendors` **deletes** all rows in:

- `shop_cart_items` / `shop_carts`
- `shop_order_items` / `shop_orders`

Then creates the house vendor and sets every `shop_products.vendor_id` to it.

**Before migrate:** warn ops / dump those tables if you need a record. There is no in-place conversion of old orders.

---

## Pre-deploy

1. [ ] Merge `develop` → `main` (or deploy `e061270`) and push.
2. [ ] DB dump (at least `shop_*` + `roles` / `role_user` / `permissions`).
3. [ ] Confirm prod still on `2de444c` (or note current SHA) so rollback is possible.
4. [ ] Optional `.env`: `SHOP_DEFAULT_COMMISSION_RATE=10` (default is already 10).

---

## Deploy order

### 1. API

```bash
cd /var/www/tapeya/api   # adjust path
git fetch
git checkout <release-ref>   # main after merge, or e061270
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan db:seed --class=PermissionSeeder --force
php artisan db:seed --class=PushNotificationTemplateSeeder --force
php artisan settings:clear-cache
php artisan config:clear
php artisan config:cache
# optional: php artisan route:cache
```

`PermissionSeeder` adds admin slugs (idempotent `firstOrCreate` + attach to `super_admin`):

- `shop.catalog.manage`
- `shop.vendors.manage`
- `shop.products.oversee`
- `shop.orders.oversee`
- `shop.payments.verify`

Broadcaster does **not** get shop money/trust slugs.

`PushNotificationTemplateSeeder` updates `order_*` variables and deletes retired keys  
`vendor_order_placed` / `vendor_order_status_updated` / `order_payment_updated`.

### 2. Drop legacy app-guard roles (once, existing DBs only)

After migrate + seeders. Irreversible. Does **not** touch admin-guard (`super_admin`, `broadcaster`).

```bash
cd /var/www/tapeya/api
psql "$DATABASE_URL" -f database/scripts/drop_legacy_app_guard_roles.sql
```

Fresh installs never seed app-guard roles (`RoleSeeder` is admin-only). Skip if `roles.guard = 'app'` is already empty.

### 3. Queue workers

No new supervisor programs. Vendor/admin shop pushes use the existing `push-notifications` queue.

```bash
sudo supervisorctl status
# must be UP: default, push-notifications, reels-poster, reels-transcode, reels
```

Restart PHP-FPM / queue only if workers still run old code:

```bash
sudo supervisorctl restart all
sudo systemctl reload php8.2-fpm   # adjust
```

### 4. Consumer app (`tapeya.com`)

```bash
cd /var/www/tapeya/app
npm ci
npm run build:production
# deploy app/dist/
```

Seller hub: `/seller`, `/seller/apply`, products, orders, store. Buyer: vendor store, COD checkout, cart count.

### 5. Backoffice (`admin.tapeya.com`)

```bash
cd /var/www/tapeya/backoffice
npm ci
npm run build:production
# deploy dist/backoffice/browser
```

New **Shop → Vendors**. Orders: vendor splits, COD payment verify / refund. Products: Active/Inactive + vendor.

---

## Post-deploy smoke

### Capabilities (959fea5)

- [ ] Logged-in `/me` has `capabilities` (no app `player`/`organizer`/`sponsor` roles required).
- [ ] Team / squad / mention pickers still search users.
- [ ] Backoffice user search still works.
- [ ] `SELECT count(*) FROM roles WHERE guard = 'app';` → `0` after SQL script.

### Marketplace (f1a9ad2 + e061270)

- [ ] House vendor exists: `slug = tapeya-house`, `is_platform = true`, `status = approved`.
- [ ] All existing products have `vendor_id` = that house vendor.
- [ ] Public catalog + product detail still load.
- [ ] Add to cart → checkout (address prefill from last order if any) → thank-you. **COD only.**
- [ ] Cart header shows item count.
- [ ] User applies as seller → pending; admin **Vendors** approve/reject/suspend.
- [ ] Approved seller: `/seller` → create product (slug auto) → appears when Active.
- [ ] Seller updates order status + optional tracking; buyer order detail shows vendor groups.
- [ ] Admin can verify COD payment / mark refunded.
- [ ] Push: buyer `order_placed` / `order_status_updated`; seller new-order + status (same `order_*` templates).
- [ ] Inactive product is not sellable; approved vendor + Active is.

---

## Rollback

1. Redeploy previous API/app/backoffice (`2de444c`).
2. Restore DB dump taken before migrate (required — migrate wipes orders/carts and is not a clean down on prod data).
3. `php artisan config:clear && php artisan config:cache && php artisan settings:clear-cache`

Do **not** rely on `migrate:rollback` for this shop migration in production.

---

## Out of scope this release

- B2 / `cdn.tapeya.com` cutover (already live; no Worker change).
- Native iOS/Android store build (no `app/ios` / `app/android` diff).
- JazzCash / card gateway, RMA, seller payouts.

---

## Related

- [MULTI_VENDOR_MARKETPLACE_PLAN.md](./MULTI_VENDOR_MARKETPLACE_PLAN.md)
- [APP_CAPABILITIES.md](./APP_CAPABILITIES.md)
- [actors_and_roles.md](./actors_and_roles.md) §9 cleanup SQL
- [DEPLOYMENT.md](./DEPLOYMENT.md) — build commands
