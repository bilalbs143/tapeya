# Production deploy — `main` → `develop`

Ship **origin/develop** (after commit + merge) onto production.

| | SHA | Message |
|---|---|---|
| **main** (prod today) | `5159b51` | Refactor production deployment documentation for `main` to `develop` transition |
| **develop** (committed tip) | `058002a` | Ship Quick Match as a first-class scoring path and drop leftover `/me` capability flags |
| **Working tree** (commit before merge) | — | Support messages admin, auto engagement settings refactor, minor backoffice polish |

**Committed on develop, not on prod:** `058002a` → `5159b51` (Quick Match, iOS **1.1.4** build **45**, `/me` vendor, complete-profile once, GA4, scorecard App Links, auto engagement v1).

**Also on the develop working tree (commit before merge):** Support messages admin workflow (status + inbox notification + backoffice list), auto engagement v2 (reels vs simple-post targets, derived chunk size), vendors list phone column.

No `composer.lock` / `package-lock.json` change. No CDN/Wrangler.

---

## What this release does

### Committed (`058002a`)

- **Quick Match:** any logged-in app user can create a standalone match (no tournament). Owner scores it. Walk-up players are normal `type=user` (`added_via_quick_match` + `created_by`). Admin: Tournaments → Quick Matches (list / show / cancel).
- **Stats:** quick matches write a casual career bucket (`tournament_type='quick'`). League / open / emerging rankings stay tournament-only.
- **`/me`:** no `capabilities` bag. Optional `vendor` `{ id, store_name, status }` when the user has a store. Seller Hub vs Become a Seller follows that object.
- **Complete profile** popup: once after register, not every login / 24h.
- **Auto engagement (v1):** optional drip of likes/views on public Ready posts (Admin → System Settings → Reels). **Default off.**
- **GA4** web page views (`G-MR83CQDG6Z`); skipped on native and `/overlay/*`.
- **Deep links:** `/scorecard` and `/scorecard/*` on AASA + Android App Links.
- **iOS native:** deployment target **15.0**, marketing **1.1.4**, build **45**.

### Working tree (commit before merge)

- **Support messages admin:** app users already submit via `POST /api/v1/support-messages`. Admins get list / show / status update (`open` → `in_progress` → `resolved`), a shared inbox notification, and a realtime broadcast. Backoffice: **Support → Support Messages**. No new permission slugs — same `admin.only` gate as other admin routes.
- **Auto engagement (v2):** replaces per-post like/view/chunk knobs with type-specific daily targets. Reels (video) get likes **and** views; text/image/repost get likes only. Chunk size is derived from the ready-post catalog (~one full sweep per day at the 15-minute schedule). **Default off.**
- **Backoffice polish:** vendors table shows seller phone; minor Quick Matches list/detail copy tweaks.

---

## ⚠ Migrations

### Quick Match — schema, not a data wipe

`2026_08_10_100000_add_quick_match_columns_to_matches_and_users`:

- `matches.kind` (default `tournament`)
- `matches.created_by` (nullable FK)
- `matches.cricket_format` (nullable)
- `matches.tournament_id` **nullable**
- `matches.venue_name` **nullable**
- `users.added_via_quick_match` (boolean, default false)

Existing tournament matches stay as they are (`kind` default + non-null `tournament_id`).

`2026_08_10_220000_drop_quick_match_scorers_table` is `dropIfExists` — no-op if that table was never created (prod).

**Do not `migrate:rollback` the Quick Match migration after any live quick match exists** — `down()` deletes rows with null `tournament_id` / `venue_name`. Restore a dump instead.

### Support message status — additive

`2026_08_18_100000_add_status_to_support_messages_table`:

- `support_messages.status` (string, default `open`)

The `support_messages` table already exists from an earlier migration. Existing rows pick up `open`. Safe to run on prod; rollback only drops the column.

---

## Pre-deploy

1. [ ] Commit the develop working tree, merge `develop` → `main`, and push.
2. [ ] DB dump (at least `matches`, `users`, `player_*_stats`, `settings`, `shop_vendors`, `support_messages`).
3. [ ] Confirm prod still on `5159b51` (or note current SHA) so rollback is possible.
4. [ ] Confirm Laravel scheduler cron (`schedule:run`) is already running — auto engagement uses it; no new supervisor program.
5. [ ] Leave auto engagement **off** until you explicitly enable it in Admin → Reels.
6. [ ] If prod had auto engagement v1 tuned, note the old values — v2 uses different setting keys (see below).

---

## Deploy order

### 1. API

```bash
cd /var/www/tapeya/api   # adjust path
git fetch
git checkout <release-ref>   # main after merge
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan db:seed --class=SystemSettingsSeeder --force
php artisan settings:clear-cache
php artisan config:clear
php artisan config:cache
# optional: php artisan route:cache
```

`SystemSettingsSeeder` + `EnsureSpatieSettingsDatabaseProperties` add Reels auto-engagement keys (idempotent). Defaults:

| Key | Default | Notes |
|-----|---------|-------|
| Enabled | **off** (`0`) | unchanged |
| Reels likes + views target | 10 | 0–200; each like also counts as a view |
| Simple post likes target | 8 | 0–50; views not boosted |
| Chunk size | *(derived)* | ~`ceil(ready_posts / 96)` per tick, max 200 — no admin knob |

Replaces v1 keys (`autoLikeCount`, `autoViewCount`, `autoEngagementPostsPerRun`, `autoEngagementActionsPerPost`). Stale v1 properties may remain in the settings payload but are ignored.

No new `PermissionSeeder` slugs this release. Admin Quick Matches and Support Messages use the existing tournaments / admin gate.

New admin routes:

- `GET /api/v1/admin/support-messages` (filter by `status`, `user_id`)
- `GET /api/v1/admin/support-messages/{id}`
- `PATCH /api/v1/admin/support-messages/{id}` (`status` only)

### 2. Queue / scheduler

No new supervisor programs. Auto engagement is `posts:process-auto-engagement` every **15 minutes** via the Laravel scheduler. Support message admin notifications are queued (`ShouldQueue`).

```bash
sudo supervisorctl status
# must be UP: default, push-notifications, reels-poster, reels-transcode, reels
```

Restart PHP-FPM / queue so workers load new code:

```bash
sudo supervisorctl restart all
sudo systemctl reload php8.2-fpm   # adjust
```

Manual / ops:

```bash
php artisan posts:process-auto-engagement
php artisan posts:process-auto-engagement --reset-cursor
```

Cursor is cache key `posts.auto_engagement.cursor_id` (`Cache::forever`). A full cache flush restarts the walk from the beginning (safe).

### 3. Consumer app (`tapeya.com`)

```bash
cd /var/www/tapeya/app
npm ci
npm run build:production
# deploy app/dist/
```

Ships Quick Match (`/quick-match`, `/matches`), Home CTA, profile tabs always visible, seller nav from `/me` `vendor`, complete-profile once, GA4, AASA `/scorecard` paths. Support form (`/support`) unchanged — no app rebuild required for the admin workflow alone, but ship with the rest of this release.

Graphics overlay host: API `GraphicContextBuilder` now tolerates null tournament. Rebuild graphics only if you ship overlay assets from this tree (`npm run build:graphics:production`).

### 4. Backoffice (`admin.tapeya.com`)

```bash
cd /var/www/tapeya/backoffice
npm ci
npm run build:production
# deploy dist/backoffice/browser
```

New / updated:

- **Tournaments → Quick Matches**
- **Support → Support Messages** (list, filter by status, manage dialog)
- Reels settings: auto engagement v2 targets
- Notifications: support-message-submitted type (headset icon, link to message)
- Vendors list: phone column

### 5. Native (store) — only if you ship the app binaries

| Platform | Why |
|----------|-----|
| **iOS** | Target 15.0, version **1.1.4** (45). Required for a store/TestFlight build of this tree. |
| **Android** | App Link `pathPrefix="/scorecard"`. Web AASA already covers iOS Universal Links without a store build. |

Web-only production (tapeya.com) works without a store submit. Scorecard App Links on existing Android installs wait for a Play update.

---

## Post-deploy smoke

### Quick Match

- [ ] Logged-in Home shows **Start Quick Match**; sidebar **Quick Match** / **My Matches**.
- [ ] Create scheduled match (inline walk-up name+phone) → `/quick-matches` 201, `kind=quick`, `tournament_id` null, `venue_name` null.
- [ ] Toss → score a ball as owner; a second account cannot score.
- [ ] Walk-up activates via normal login OTP (not register).
- [ ] Profile stats: casual/quick bucket is separate from tournament rankings.
- [ ] Admin Quick Matches list / filter / cancel scheduled.
- [ ] Existing tournament scorecard / scoring still works (`kind=tournament`).

### Support messages

- [ ] App user submits support message → 201, row in `support_messages` with `status=open`.
- [ ] Admin inbox notification appears (type `support_message_submitted`); bell realtime event fires.
- [ ] Backoffice **Support → Support Messages**: list, filter by status, open manage dialog.
- [ ] PATCH status `open` → `in_progress` → `resolved`; invalid status returns 422.
- [ ] Non-admin cannot hit `/api/v1/admin/support-messages*`.

### `/me` + seller

- [ ] `GET /api/v1/me` has **no** `data.capabilities` and **no** `data.roles`.
- [ ] No store → no `vendor` key; sidebar **Become a Seller**.
- [ ] After apply → `vendor.status=pending`; sidebar **Seller Hub**.
- [ ] Team / squad payloads do **not** include `sponsor.vendor`.

### Complete profile / GA

- [ ] New register → OTP → complete-profile popup once; later logins do not show it.
- [ ] Web page views fire in GA4 (`G-MR83CQDG6Z`); `/overlay/*` and native do not.

### Auto engagement (leave off unless intended)

- [ ] Admin Reels: setting exists, **disabled**; v2 target fields visible (reels + simple post).
- [ ] `php artisan posts:process-auto-engagement` with disabled setting touches 0 posts.
- [ ] If you enable it: reels get likes **and** views up to target; simple posts get likes only; chunk size scales with catalog size.

### Deep links

- [ ] `https://tapeya.com/.well-known/apple-app-site-association` includes `/scorecard` and `/scorecard/*`.

---

## Rollback

1. Redeploy previous API/app/backoffice (`5159b51`).
2. If migrate already ran: restore the DB dump (do **not** `migrate:rollback` the Quick Match migration on a DB that has quick matches).
3. `php artisan config:clear && php artisan config:cache && php artisan settings:clear-cache`

---

## Out of scope this release

- B2 / `cdn.tapeya.com` cutover (already live; no Worker change).
- New Composer / npm lockfile.
- JazzCash / card gateway, RMA, seller payouts.
- Enabling auto engagement (ship **off**; turn on later in Admin).
- User-facing support form changes (submit flow already live).

---

## Related

- [APP_CAPABILITIES.md](./APP_CAPABILITIES.md) — `/me` vendor, no capability bag
- [actors_and_roles.md](./actors_and_roles.md)
- [player_stats_schema.md](./player_stats_schema.md) — quick bucket
- [event_flow.md](./event_flow.md) — tournament flow unchanged
- [DEEP_LINKS.md](./DEEP_LINKS.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md) — build commands
