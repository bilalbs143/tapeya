# Production deploy — `main` → `develop` (incl. staged work)

**Baseline (last production on `main`):** `bbc4ebd` — *Enhance layout and spacing in theme1 graphics components* (2026-07-15)

**Target:** current `develop` + all staged/uncommitted work (as of this doc).

**Scope of change (vs `main`):** ~650+ files across `api/`, `app/`, `backoffice/`, `docs/`, `nginx/`, `supervisor/`.

> Commit/push the staged work on `develop` before deploy. This doc assumes that tree is what you ship.

---

## What is shipping

| Area | Summary |
|------|---------|
| **Feed + posts + reels** | Compose (text/image/video), feed, reels player, likes/comments/saves/shares/reposts, mentions, hashtags, views, reports, follow suggestions, official badge |
| **Media** | `MediaDisk` / `MediaCdn` write path; permanent CDN URLs; poster + ABR transcode queues |
| **Push / realtime** | `post_*` notification events; `user.post.engagement` broadcast |
| **Admin** | Posts + post-reports moderation (preview/play); official user flag; CDN + reels system settings |
| **Live** | Stream orientation (portrait/landscape) + related app/native |
| **Graphics** | Theme2 overlay pack |
| **Infra** | New supervisor queues; nginx `/.well-known` for app links; scheduled post jobs |

**Not required for this release:** Sponsored brand posts (doc only / future).

---

## Pre-deploy checklist

1. [ ] All intended changes committed on `develop` and merged/tagged for production.
2. [ ] Staging smoke: compose text/image/reel → like/comment → admin can open/play post → CDN host on media URLs.
3. [ ] FFmpeg on API host with **libwebp** (`ffmpeg -hide_banner -encoders | grep libwebp`).
4. [ ] Object storage ready (`MEDIA_DISK=s3`, B2/S3 creds, CDN host). See [MEDIA_CDN_MIGRATION.md](./MEDIA_CDN_MIGRATION.md).
5. [ ] PHP upload limits high enough for reels (nginx `client_max_body_size` + FPM/`PHP_VALUE` — **not** only `public/.user.ini`).

---

## Deploy order

### 1. API

```bash
cd /var/www/tapeya/api   # adjust path
git fetch && git checkout <release-ref>
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan db:seed --class=SystemSettingsSeeder --force
php artisan db:seed --class=PushNotificationTemplateSeeder --force
php artisan db:seed --class=GraphicThemeSeeder --force   # if theme2 needs DB seed
php artisan settings:clear-cache
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

**Env / Admin settings to verify**

| Key | Notes |
|-----|--------|
| `MEDIA_DISK=s3` | Production media disk |
| `AWS_*` + `AWS_ENDPOINT` | B2/S3-compatible |
| `AWS_URL` | CDN fallback hostname |
| Admin → **Media & CDN** → `cdn_public_base_url` | Overrides `AWS_URL` at boot |
| Admin → **Reels** | Upload MB, duration, multipart, view counters |
| `FFMPEG_PATH` / `FFPROBE_PATH` | If not on PATH / need ffmpeg-full |

### 2. Queue workers (Supervisor)

Copy/update `supervisor/tapeya.conf` and reload:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
```

**Must be running**

| Program | Queue |
|---------|--------|
| `artisan-queue` | `default` |
| `artisan-queue-push` | `push-notifications` |
| `artisan-queue-reels-poster` | `reels-poster` (×2) |
| `artisan-queue-reels-transcode` | `reels-transcode` (×1, heavy) |
| `artisan-queue-reels` | `reels` (cleanup) |

Scheduler (already via cron `schedule:run`) picks up:

- `posts:flush-view-counters` — every minute  
- `posts:purge-expired-originals` — daily 04:30  

### 3. Nginx

- Deploy `nginx/app.conf` (adds `/.well-known/apple-app-site-association` + `assetlinks.json`).
- Confirm API upload body size matches reel limits (raise if still 64M).
- `sudo nginx -t && sudo systemctl reload nginx`

### 4. Mobile web app (`app/`)

```bash
cd /var/www/tapeya/app   # or CI artifact
npm ci
npm run build
# deploy dist/ to app web root
```

CDN for in-app assets comes from public `cdn_public_base_url` at boot (`bootstrapCdn`). Favicon/`preconnect` in `index.html` may still use the legacy CloudFront fallback until cutover.

### 5. Backoffice

```bash
cd /var/www/tapeya/backoffice
npm ci
npm run build
# deploy dist to backoffice host
```

Confirm nav: **Content → Posts**, **Post reports**.

### 6. Native / deep links (store builds)

Do this **after** mobile web + nginx are live (so `/.well-known/*` is reachable). Soft “Open in Tapeya” (`tapeya://`) still works without verification; auto-open from HTTPS needs this.

**Android App Links**

1. Confirm Play App Signing SHA-256 is in `app/public/.well-known/assetlinks.json` ([PLAY_APP_SIGNING_SHA256.md](./PLAY_APP_SIGNING_SHA256.md)).
2. Confirm live:
   ```bash
   curl -sI https://tapeya.com/.well-known/assetlinks.json | head
   curl -s https://tapeya.com/.well-known/assetlinks.json
   ```
3. Install a **Play-signed** release (internal/testing/production track — not a random local debug keystore).
4. Verify association:
   ```bash
   adb shell pm get-app-links com.tapbytapeya.app
   ```
   Expect `tapeya.com` verified / approved for App Links. If not, fix SHA + redeploy JSON, then reinstall or wait for Android to re-check.

**iOS Universal Links**

1. Confirm AASA live (no redirect):  
   `curl -sI https://tapeya.com/.well-known/apple-app-site-association | head`
2. Ship a build with Associated Domains for `applinks:tapeya.com`.

Details: [DEEP_LINKS.md](./DEEP_LINKS.md).

---

## Post-deploy smoke (10 minutes)

- [ ] `GET /api/v1/...` health / login works  
- [ ] Compose **text** + **image** post → appear in feed  
- [ ] Upload **reel** → poster appears → processing finishes → HLS/original plays  
- [ ] Like / comment / mention → in-app notification + (if enabled) push  
- [ ] Follow user → notification  
- [ ] Admin: open post → **video plays**; open post-report → post media loads  
- [ ] Media URL host = CDN (`cdn_public_base_url`), not raw B2  
- [ ] `supervisorctl status` — all reel queues UP  
- [ ] Live go-live orientation still works  
- [ ] Graphics theme2 selectable if expected in prod  
- [ ] `https://tapeya.com/.well-known/assetlinks.json` + AASA return JSON (not SPA HTML)  
- [ ] Play-signed install: `adb shell pm get-app-links com.tapbytapeya.app` shows domain verified  

---

## Rollback (short)

1. Redeploy previous API/app/backoffice git ref.  
2. Do **not** reverse migrations unless data loss is acceptable (posts tables are new). Prefer feature-off via settings / app store hold.  
3. CDN: point `cdn_public_base_url` / `AWS_URL` back if media host is wrong.  
4. Restore previous `supervisor/tapeya.conf` + `supervisorctl update`.

---

## Related deeper docs

- [FEED_REELS_PRODUCTION_CLOSEOUT.md](./FEED_REELS_PRODUCTION_CLOSEOUT.md) — full gate checklist  
- [MEDIA_CDN_MIGRATION.md](./MEDIA_CDN_MIGRATION.md) — B2 + Cloudflare cutover  
- [MEDIA_DELIVERY_AND_CACHE_PLAN.md](./MEDIA_DELIVERY_AND_CACHE_PLAN.md) — edge cache  
- [REELS_ARCHITECTURE.md](./REELS_ARCHITECTURE.md) — queues / ABR  

---

## Committed on `develop` since `main` (already on branch)

1. `2d3ac12` — Stream orientation enum + live broadcast  
2. `a7c280b` — Build scripts / iOS deps  
3. `63d6513` — Live broadcast orientation handling  
4. `7012349` — Graphics theme2  

**Plus** the full staged feed/reels/media/admin tree (must be committed before release).
