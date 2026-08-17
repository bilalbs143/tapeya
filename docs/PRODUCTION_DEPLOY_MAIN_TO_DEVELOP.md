# Production deploy — `main` → `develop`

Ship **origin/develop** onto production after merge.

| | SHA | Message |
|---|---|---|
| **main** (prod today) | `5159b51` | Refactor production deployment documentation for `main` to `develop` transition |
| **develop** (committed tip) | `2bdf5b3` | Update iOS deployment target to 15.0 and increment project version to 1.1.4 |

**Committed on develop, not on main:** `2bdf5b3` (iOS 15 / app **1.1.4** build **45**).

**Also on the develop working tree (commit before merge):** Quick Match, casual stats bucket, auto engagement, `/me` vendor (no capabilities bag), complete-profile once after register, GA4, scorecard App Links.

No `composer.lock` / `package-lock.json` change. No CDN/Wrangler.

---

## What this release does

- **Quick Match:** any logged-in app user can create a standalone match (no tournament). Owner scores it. Walk-up players are normal `type=user` (`added_via_quick_match` + `created_by`). Admin: Tournaments → Quick Matches (list / show / cancel).
- **Stats:** quick matches write a casual career bucket (`tournament_type='quick'`). League / open / emerging rankings stay tournament-only.
- **`/me`:** no `capabilities` bag. Optional `vendor` `{ id, store_name, status }` when the user has a store. Seller Hub vs Become a Seller follows that object.
- **Complete profile** popup: once after register, not every login / 24h.
- **Auto engagement:** optional drip of likes/views on public Ready posts (Admin → System Settings → Reels). **Default off.**
- **GA4** web page views (`G-MR83CQDG6Z`); skipped on native and `/overlay/*`.
- **Deep links:** `/scorecard` and `/scorecard/*` on AASA + Android App Links.
- **iOS native:** deployment target **15.0**, marketing **1.1.4**, build **45**.

---

## ⚠ Quick Match migration is schema, not a data wipe

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

---

## Pre-deploy

1. [ ] Commit the develop working tree, merge `develop` → `main`, and push.
2. [ ] DB dump (at least `matches`, `users`, `player_*_stats`, `settings`, `shop_vendors`).
3. [ ] Confirm prod still on `5159b51` (or note current SHA) so rollback is possible.
4. [ ] Confirm Laravel scheduler cron (`schedule:run`) is already running — auto engagement uses it; no new supervisor program.
5. [ ] Leave auto engagement **off** until you explicitly enable it in Admin → Reels.

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

`SystemSettingsSeeder` adds Reels auto-engagement keys (idempotent). Defaults:

| Key | Default |
|-----|---------|
| Enabled | **off** (`0`) |
| Auto like target | 8 |
| Auto view target | 40 |
| Chunk size | 100 |
| Actions per post per tick | 1 |

No new `PermissionSeeder` slugs this release. Admin Quick Matches use the existing tournaments admin gate.

### 2. Queue / scheduler

No new supervisor programs. Auto engagement is `posts:process-auto-engagement` every **15 minutes** via the Laravel scheduler.

```bash
sudo supervisorctl status
# must be UP: default, push-notifications, reels-poster, reels-transcode, reels
```

Restart PHP-FPM / queue so workers load the new match/stats code:

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

Ships Quick Match (`/quick-match`, `/matches`), Home CTA, profile tabs always visible, seller nav from `/me` `vendor`, complete-profile once, GA4, AASA `/scorecard` paths.

Graphics overlay host: API `GraphicContextBuilder` now tolerates null tournament. Rebuild graphics only if you ship overlay assets from this tree (`npm run build:graphics:production`).

### 4. Backoffice (`admin.tapeya.com`)

```bash
cd /var/www/tapeya/backoffice
npm ci
npm run build:production
# deploy dist/backoffice/browser
```

New **Tournaments → Quick Matches**. Reels settings include auto engagement.

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

### `/me` + seller

- [ ] `GET /api/v1/me` has **no** `data.capabilities` and **no** `data.roles`.
- [ ] No store → no `vendor` key; sidebar **Become a Seller**.
- [ ] After apply → `vendor.status=pending`; sidebar **Seller Hub**.
- [ ] Team / squad payloads do **not** include `sponsor.vendor`.

### Complete profile / GA

- [ ] New register → OTP → complete-profile popup once; later logins do not show it.
- [ ] Web page views fire in GA4 (`G-MR83CQDG6Z`); `/overlay/*` and native do not.

### Auto engagement (leave off unless intended)

- [ ] Admin Reels: setting exists, **disabled**.
- [ ] `php artisan posts:process-auto-engagement` with disabled setting touches 0 posts.
- [ ] If you enable it: likes/views drip on public Ready posts from random **active** users, never the owner.

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

---

## Related

- [APP_CAPABILITIES.md](./APP_CAPABILITIES.md) — `/me` vendor, no capability bag
- [AUTO_ENGAGEMENT.md](./AUTO_ENGAGEMENT.md)
- [actors_and_roles.md](./actors_and_roles.md)
- [player_stats_schema.md](./player_stats_schema.md) — quick bucket
- [event_flow.md](./event_flow.md) — tournament flow unchanged
- [DEEP_LINKS.md](./DEEP_LINKS.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md) — build commands
