# Production deploy — `main` → `develop`

Ship **local `develop` tip** (after push + merge to `main`) onto production.

| | SHA | Message |
|---|---|---|
| **main** (prod today) | `ae2c4fd` | Rename `match_streams` table to `live_streams` and update related model and tests |
| **develop** (release tip) | `f1734b2` | Unify list empty/error states and tighten button and shell UI consistency |

**On develop, not on prod:** `ae2c4fd` → `f1734b2` (**7** commits).

| SHA | Summary |
|---|---|
| `ae57868` | Rename `MatchStream` model → `LiveStream` (table already `live_streams` on main) |
| `495e253` | Drop unused import in shop carts migration file |
| `252fd9c` | Hero slider CTAs (none / URL / dialog) + static assets base → `cdn.tapeya.com` |
| `54ebdac` | Shared loaders in app + backoffice; seller empty states aligned |
| `34b2f34` | Organizer broadcast graphics (OBS overlay) + user watch-URL live streams (YouTube/Facebook) |
| `57c89ed` | Highlight YouTube playback on iOS Capacitor (Error 153) |
| `f1734b2` | Shared `ListEmpty`/`ListError`, Button size cleanup, safe-area hero offsets, profile/sidebar polish |

**Branch note:** `origin/develop` may still lag this tip. Push `develop`, then merge `develop` → `main` before production checkout.

No `composer.lock` / `package-lock.json` change. No CDN/Wrangler. Android unchanged (**1.1.6** / **17**). iOS bumped to marketing **1.1.5**, build **46**.

---

## What this release does

### Live streaming & graphics

- **Watch-URL streams:** logged-in users can add a YouTube or Facebook watch URL (`/live/streaming`) so viewers watch on the Live hub — same pattern as admin external streams. Not subject to the mobile Go Live 2h camera cap.
- **Broadcast graphics:** scorers open **Broadcast graphics** on a match, save theme/config, copy a signed OBS overlay URL (1920×1080). Lifecycle: THIS_MATCH → TOSS_LT → LT_DEFAULT + existing scoring flashes. Destination RTMP stays outside Tapeya (manual encoder setup).

### Hero sliders

- Admin CTA types: **none** (banner only), **url** (internal/external), **dialog** (in-app dialog key + optional param).
- Existing slides with a non-empty `cta_url` are backfilled to `cta_type=url`.
- Hardcoded CloudFront app asset bases switched to **`cdn.tapeya.com`**.

### Consumer / backoffice UI

- Shared **`ListEmpty` / `ListError`** across lists; Button variants/sizes tightened (`md` = 45px; unused `lg` removed).
- Safe-area-aware offsets under fixed navbar (tournament/highlight heroes, sticky tabs, profile header).
- Shared loaders (`Loader` / `PageLoader`) in app + backoffice; seller catalog empties match My Matches / orders patterns.
- Profile shell cleanup (dead role tabs removed); `/stats` page; sidebar My Tournaments icon from CDN; match notes delete icon; revise-target dialog in-body side-by-side actions.

### Highlights (native)

- iOS Capacitor highlight YouTube playback uses the live embed proxy / native overlay path to avoid Error 153; interactive controls for VOD.

---

## ⚠ Migrations

### Hero slider CTAs — additive

`2026_08_19_100000_add_cta_fields_to_hero_sliders_table`:

- `hero_sliders.cta_type` (string, default `none`)
- `hero_sliders.cta_label` (nullable)
- `hero_sliders.cta_url` (nullable)
- `hero_sliders.cta_target_blank` (boolean, default true)
- `hero_sliders.cta_dialog_key` (nullable)
- `hero_sliders.cta_dialog_param` (nullable)

Backfill: rows with a non-empty `cta_url` → `cta_type=url`. Safe on prod; `down()` drops the new columns.

### Shop carts migration file — no schema change expected

`2026_02_22_100019_create_shop_carts_table` only drops an unused import on develop. If prod already ran this migration under `ae2c4fd` / `27ef48d`, migrate will skip it. No data change.

### Live streams table — already on main

Table rename `match_streams` → `live_streams` is already on **main** (`ae2c4fd`). This release only finishes the Eloquent model rename (`LiveStream`). No new table migration for that.

---

## Pre-deploy

1. [ ] Push local `develop` (`f1734b2`), merge `develop` → `main`, push `main`.
2. [ ] DB dump (at least `hero_sliders`, `live_streams`, `matches`, `settings`).
3. [ ] Confirm prod still on `ae2c4fd` (or note current SHA) so rollback is possible.
4. [ ] Confirm graphics overlay host + signing secret in System Settings (graphics group) are correct for OBS.
5. [ ] Confirm Laravel scheduler cron is running (existing live/broadcast commands unchanged in role).

---

## Deploy order

### 1. API

```bash
cd /var/www/tapeya/api   # adjust path
git fetch
git checkout <release-ref>   # main after merge
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:clear
php artisan config:cache
php artisan settings:clear-cache
# optional: php artisan route:cache
```

No new `SystemSettingsSeeder` / `PermissionSeeder` requirement for this slice beyond existing graphics settings.

Restart PHP-FPM / queues so workers load new code:

```bash
sudo supervisorctl restart all
sudo systemctl reload php8.2-fpm   # adjust
```

### 2. Consumer app (`tapeya.com`)

```bash
cd /var/www/tapeya/app
npm ci
npm run build:production
# deploy app/dist/
```

Ships: Live Streaming UI, Broadcast graphics dialog, hero CTA taps, ListState/Button polish, CDN asset base, highlight iOS fix (web bundle; store build still needed for Capacitor installs).

Graphics overlay host: rebuild/deploy graphics if OBS loads from this tree:

```bash
npm run build:graphics:production
# deploy graphics dist to graphics.tapeya.com (or your overlay host)
```

### 3. Backoffice (`admin.tapeya.com`)

```bash
cd /var/www/tapeya/backoffice
npm ci
npm run build:production
# deploy dist/backoffice/browser
```

New / updated:

- Hero slider create/edit: CTA type, label, URL, target blank, dialog key/param
- Shared loader components / seller empty-state alignment
- Live stream admin surfaces tied to `LiveStream` naming (if present in this tree)

### 4. Native (store) — only if you ship binaries

| Platform | Why |
|----------|-----|
| **iOS** | Highlight YouTube Error 153 fix needs a Capacitor build. Ship marketing **1.1.5**, build **46**. |
| **Android** | Same webview/bundle benefits if you ship; no version bump in this range (**1.1.6** / **17**). |

Web-only production works without a store submit. Existing native installs keep old highlight embed behavior until updated.

---

## Post-deploy smoke

### Hero CTAs

- [ ] Admin can create a slide with CTA **none**, **url**, and **dialog**.
- [ ] App home: URL slide opens internal path or external link; dialog slide opens the mapped dialog.
- [ ] Legacy slides with only `cta_url` still behave as URL after migrate backfill.

### Live streaming (watch URL)

- [ ] Logged-in user: `/live/streaming` → Add Live Stream with YouTube/Facebook URL → appears on Live hub when live/listed as designed.
- [ ] Manage stream (edit / status) works; viewer can open `/live/broadcast/:id`.
- [ ] Mobile Go Live camera flow still works independently.

### Broadcast graphics

- [ ] Scorer: match → Broadcast graphics → save theme → signed URL copies.
- [ ] OBS Browser Source loads overlay; toss / first ball advances lifecycle when a session exists.
- [ ] Fan APIs do not expose overlay signing secrets.

### Highlights (native, if shipping)

- [ ] iOS: open a YouTube highlight — plays without Error 153; controls usable for VOD.

### UI sanity

- [ ] Empty lists show shared empty copy (e.g. My Matches / Tournaments / Live Streaming).
- [ ] List errors show red message + brand text **Retry**.
- [ ] Tournament detail back button clears the navbar logo on notched devices.
- [ ] Fixture card actions use compact outline buttons; revise-target dialog has side-by-side actions and no huge empty footer.

### CDN

- [ ] App icons/logos load from `cdn.tapeya.com` (no stale CloudFront-only base for static app assets).

---

## Rollback

1. Redeploy previous API/app/backoffice (`ae2c4fd`).
2. If migrate already ran: restore the DB dump **or** roll back only the hero CTA migration if safe (`php artisan migrate:rollback --step=1` only when that migration is the latest batch — prefer dump restore if unsure).
3. `php artisan config:clear && php artisan config:cache && php artisan settings:clear-cache`

---

## Out of scope this release

- B2 / `cdn.tapeya.com` Worker cutover (already live; no Wrangler change).
- New Composer / npm lockfile.
- Android version bump / store metadata (iOS already bumped to **1.1.5** / **46**).
- JazzCash / card gateway, RMA, seller payouts.
- Enabling auto engagement (unchanged; leave as currently configured on prod).

---

## Related

- [LIVE_STREAM_USER_OWNED_BROADCAST.md](./LIVE_STREAM_USER_OWNED_BROADCAST.md) — organizer OBS overlay slice
- [LIVE_STREAM_TABLE_RENAME.md](./LIVE_STREAM_TABLE_RENAME.md) — `live_streams` naming
- [LIVE_STREAM_YOUTUBE_FINAL.md](./LIVE_STREAM_YOUTUBE_FINAL.md)
- [MEDIA_CDN_MIGRATION.md](./MEDIA_CDN_MIGRATION.md) — `cdn.tapeya.com`
- [DEEP_LINKS.md](./DEEP_LINKS.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md) — build commands
