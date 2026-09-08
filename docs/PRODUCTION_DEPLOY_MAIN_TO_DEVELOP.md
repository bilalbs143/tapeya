# Production deploy — `main` → release tip (develop + WIP)

Ship **production `main`** up through **local `develop` tip** plus **all current uncommitted work**, **without** `migrate:fresh` / `migrate:refresh` / DB wipe.

This file is the runbook. Follow steps **in order**. Do not skip schema scripts.

---

## 0. Snapshot (update SHAs at commit time)

| Ref | SHA (as of writing) | Notes |
|-----|---------------------|--------|
| **`origin/main` / prod baseline** | `68fa80d` | Dialog/radio spacing polish |
| **Local `develop` tip** | `e4e020f` | Ahead of `origin/develop` by **2** commits |
| **`main..develop`** | `a571e39`, `e4e020f` | Tournament simplify + team attach |
| **Working tree** | uncommitted | See §2 (YouTube keys, live feed widgets, visibility drop, OTP UX, reel poster sync, silent auto-engagement, live-created push copy, …) |

**Before you start deploy day:** re-run and paste into this section:

```bash
git fetch origin
git rev-parse --short origin/main
git rev-parse --short develop
git rev-list --left-right --count origin/main...develop
git status -sb
```

Release tip = whatever SHA you put on `main` after committing WIP + merging develop.

---

## 1. Hard rules (read once)

1. **Never** run `php artisan migrate:fresh`, `migrate:refresh`, `migrate:reset`, or drop/recreate the production database for this release.
2. **Edited historical migrations do nothing on prod.** Laravel will not re-run:
   - `2026_05_18_100000_create_live_streams_table` (adds `youtube_stream_key_id` in git only)
   - `2026_07_25_100100_create_posts_table` (drops `visibility` in git only)
   - `2026_02_22_100001_create_users_table` (drops `referred_by` / nickname unique in git only)
   - tournament/teams create migrations simplified in git only

   Those changes land on **existing** DBs **only** via `api/database/scripts/*`.
3. **New migration files** still run via `php artisan migrate --force` (e.g. `2026_05_18_099000_create_youtube_stream_keys_table`).
4. Scripts are **idempotent** (safe to re-run). Prefer re-running over skipping.
5. Deploy **code first**, then **`migrate`**, then **scripts**, then caches/workers/frontends. Code that expects a new column without the script will 500.
6. Do **not** commit secrets (`.env`, credentials). Do commit `api/database/scripts/*` and the new YouTube keys migration.
7. **No new additive migrations** for OTP / auto-engagement / push copy — those are code + seeders / public settings only.

---

## 2. What this release contains (product)

### Already on develop (not on main yet)

- Tournament requests removed → instant create / simplified tournaments
- Teams: free-text sponsor + icon players; `team_icon_players` dropped
- Backoffice tournament team attach improvements

### Uncommitted (must be committed before merge)

- **YouTube stream key pool** (admin CRUD + assign on create/manage stream)
- **Feed “is live now”** widget + Live hub / Home slider host row + shared `LiveStreamChip`
- **Posts visibility removed** (all posts public)
- **Reel multipart upload hardening** (larger parts, retries, CORS `max_age`, nginx timeouts)
- **Reel cover sync** — provisional client poster upload before original lands; eager `ReelCoverImage`; app-wide `reel.processing.updated` cache patch
- **OTP UX** — test phones (from public `test_otp_phones` setting) keep banner + manual entry; other phones auto-fill/verify when API returns OTP
- **Live stream created push** — title `{{stream_title}} is live on Tapeya`; body encourages opening the app
- **Auto-engagement** — synthetic likes are silent (no push/in-app); drip 1 per tick
- Live chat / streaming polish, compose reel icon + nickname + frame padding
- Backoffice YouTube Stream Keys screens + live stream dialog stream-key select

Out of scope / already parked outside the tree: `../temp/tapeya-next`, `../temp/app-next`, design-benchmark docs, App Store process.

---

## 3. Schema map — migrate vs scripts

### A. `php artisan migrate --force` (pending files only)

| Migration | Effect on existing prod |
|-----------|-------------------------|
| `2026_05_18_099000_create_youtube_stream_keys_table` | **Creates** `youtube_stream_keys` (new). Will appear as pending even though the timestamp is “before” `live_streams` — that is OK; Laravel runs **unrecorded** migrations by filename order. |
| Any other **new** migration files you add before ship | Run normally |

### B. One-off scripts (existing DB — **required**)

Run from `api/` after migrate. Order below is mandatory.

| # | Script | Why |
|---|--------|-----|
| 1 | `database/scripts/teams_free_text_sponsor_icons.php` | Teams sponsor / icon_players columns; drop `team_icon_players` |
| 2 | `database/scripts/simplify_tournaments.php` | Drop `tournament_requests`; drop tournament columns removed in simplified model |
| 3 | `database/scripts/drop_users_referred_by.php` | Drop `users.referred_by`; drop `users.nickname` unique; remove obsolete push template |
| 4 | `database/scripts/add_live_streams_youtube_stream_key_id.php` | Add `live_streams.youtube_stream_key_id` + FK (**needs** `youtube_stream_keys` from migrate) |
| 5 | `database/scripts/drop_posts_visibility.php` | Drop `posts.visibility` (+ index if present) |

### C. Intentionally not re-applied by migrate

| Change in git | Prod action |
|---------------|-------------|
| Deleted `create_tournament_requests_table` migration file | Leave orphaned row in `migrations` if present — harmless without refresh |
| Edited `create_live_streams` / `create_posts` / `create_users` / teams / tournaments | Scripts above |
| Deleted unused `api/config/otp.php` | None — live list is Spatie `test_otp_phones` |

---

## 4. Pre-flight (local)

### 4.1 Finish the release branch

```bash
cd /path/to/tapeya
git checkout develop
git status -sb
# Commit ALL intended WIP (api + app + backoffice + nginx + scripts). Exclude secrets.
# tapeya-next / app-next already live under ../temp — do not re-add.
git add -A   # carefully review; unstage secrets if present
git commit -m "$(cat <<'EOF'
Ship YouTube stream key pool, feed live widgets, posts visibility removal, OTP UX, reel poster sync, and related deploy scripts.

EOF
)"
# If you prefer multiple commits, still land everything on develop before merge.
git push -u origin develop
```

### 4.2 Fast checks (recommended)

```bash
cd api && php artisan test --filter='LiveStream|AutoEngagement|LiveStreamNotification'
cd ../app && npm test -- --run \
  src/components/feed/__tests__/buildFeedTimelineRows.test.js \
  src/lib/utils/__tests__/liveStreamUtils.test.js \
  src/lib/__tests__/isClientTestOtpPhone.test.js \
  src/store/api/__tests__/publishReelPoster.test.js
```

### 4.3 Merge to main

```bash
git checkout main
git pull origin main
git merge develop   # resolve conflicts if any
git push origin main
# Record release SHA:
git rev-parse --short HEAD
```

### 4.4 Backup before touching production

On the API host (or via managed DB snapshot):

- Full DB dump **or** at least: `users`, `posts`, `live_streams`, `tournaments`, `teams`, `tournament_requests` (if still exists), `migrations`, `settings`, `push_notification_templates`
- Note current prod git SHA: `git -C /var/www/tapeya rev-parse --short HEAD` (adjust path)

---

## 5. Production deploy — API (bulletproof order)

Paths below assume `/var/www/tapeya/...` — adjust to your server.

### 5.1 Put code on the box

```bash
cd /var/www/tapeya
git fetch origin
git checkout main
git pull origin main
# Confirm SHA matches the release tip you pushed
git rev-parse --short HEAD
```

### 5.2 PHP deps

```bash
cd /var/www/tapeya/api
composer install --no-dev --optimize-autoloader
```

### 5.3 Migrations only (no refresh)

```bash
cd /var/www/tapeya/api
php artisan migrate:status | tail -40
php artisan migrate --force
```

**Expect:** `2026_05_18_099000_create_youtube_stream_keys_table` runs once (creates empty pool table).

**Do not** use `--pretend` as a substitute for actually running migrate.

**Verify keys table exists:**

```bash
php artisan tinker --execute="echo Schema::hasTable('youtube_stream_keys') ? 'ok' : 'MISSING';"
```

If `MISSING`, **stop** — fix migrate before scripts/frontends.

### 5.4 Schema scripts (existing DB — do not skip)

```bash
cd /var/www/tapeya/api

php artisan tinker --execute="require 'database/scripts/teams_free_text_sponsor_icons.php';"
php artisan tinker --execute="require 'database/scripts/simplify_tournaments.php';"
php artisan tinker --execute="require 'database/scripts/drop_users_referred_by.php';"
php artisan tinker --execute="require 'database/scripts/add_live_streams_youtube_stream_key_id.php';"
php artisan tinker --execute="require 'database/scripts/drop_posts_visibility.php';"
```

**Verify (all should print true / expected):**

```bash
php artisan tinker --execute="
echo 'youtube_stream_keys: '.(Schema::hasTable('youtube_stream_keys')?'Y':'N').PHP_EOL;
echo 'live_streams.youtube_stream_key_id: '.(Schema::hasColumn('live_streams','youtube_stream_key_id')?'Y':'N').PHP_EOL;
echo 'posts.visibility: '.(Schema::hasColumn('posts','visibility')?'Y (BAD)':'N (good)').PHP_EOL;
echo 'users.referred_by: '.(Schema::hasColumn('users','referred_by')?'Y (BAD)':'N (good)').PHP_EOL;
echo 'tournament_requests: '.(Schema::hasTable('tournament_requests')?'Y (BAD)':'N (good)').PHP_EOL;
"
```

If any **BAD** remains, re-run the matching script and inspect the error output before continuing.

### 5.5 Settings / seeders / caches / workers

```bash
cd /var/www/tapeya/api
php artisan config:clear
php artisan config:cache
php artisan settings:clear-cache

# Recommended for this release (idempotent updateOrCreate):
php artisan db:seed --class=PushNotificationTemplateSeeder --force
# Optional defaults only if prod settings row is missing keys:
# php artisan db:seed --class=SystemSettingsSeeder --force

sudo supervisorctl restart all
sudo systemctl reload php8.2-fpm   # adjust PHP version/socket
```

**Why push seeder:** updates `live_stream_created` title/body templates on existing DBs. Without it, code ships but old push copy remains until templates are edited in backoffice.

**Public settings:** `test_otp_phones` is now in `SystemSettingKeyEnum::publicKeys()` — consumer OTP page reads it from `GET /system-settings`. No extra migrate; just deploy API code + `settings:clear-cache`.

### 5.6 Nginx API upload / timeout (reel multipart)

If this release includes `nginx/api.conf` changes (body size / timeouts), sync that conf to the API vhost and reload nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Confirm CORS `max_age` is live via API code deploy (Laravel `config/cors.php`) — no separate nginx CORS step unless you terminate CORS at the edge.

### 5.7 Queue workers (reels posters)

Confirm a worker consumes the **`reels-poster`** queue (and `push-notifications`). Provisional client posters land at upload; server refine still needs this worker or covers may stay provisional / fail to refine.

---

## 6. Production deploy — frontends

### 6.1 Consumer app (`tapeya.com`)

```bash
cd /var/www/tapeya/app
npm ci
npm run build:production
# publish app/dist/ (rsync / your usual path)
```

Ships: feed live widgets, Live hub / Home slider host UI, reel upload + poster sync, OTP auto-verify UX, compose polish, share/live polish.

Graphics overlay (only if OBS uses this tree):

```bash
npm run build:graphics:production
# publish dist-graphics / graphics.tapeya.com
```

### 6.2 Backoffice (`admin.tapeya.com`)

```bash
cd /var/www/tapeya/backoffice
npm ci
npm run build:production
# publish dist/backoffice/browser
```

Ships: YouTube Stream Keys management, live stream create/manage stream-key select, tournament/team UI from develop commits.

### 6.3 Native stores

| Platform | Current tree | Required for this release? |
|----------|--------------|----------------------------|
| Android | versionName **1.1.8** / versionCode **20** | Optional for web-only; ship if you need WebView bundle + upload fixes on device |
| iOS | marketing **1.1.5** / build **46** | Optional for web-only |

Web production works without a store submit.

---

## 7. Post-deploy smoke (must pass)

### Schema / admin streaming

- [ ] Backoffice → YouTube Stream Keys: create a key, list/filter, edit active toggle
- [ ] Create / manage live stream: Stream Key select required; placeholder visible
- [ ] Go Live / match stream still works with assigned key
- [ ] Creating an admin stream fans out push: title `{stream title} is live on Tapeya`

### Feed / Live UX

- [ ] Explore feed (logged in): after ~4 posts, “**Name** is live now” card; Tapeya fallback for admin streams
- [ ] `/live`: cards show host row + shared Live chip
- [ ] Home Live Now slider: Live chip top-left; host name + title (no avatar)

### Posts / OTP

- [ ] Compose / feed load with no `visibility` validation errors
- [ ] Existing posts still appear in Explore
- [ ] Test OTP phone: banner + manual entry
- [ ] Non-test phone with OTP in JSON (debug / SMS log): auto-fills and verifies (~2s Verifying)

### Reels

- [ ] Publish a multi-part reel; completes without mid-upload abort (timeouts/CORS)
- [ ] New reel shows a cover on My Videos / profile soon after upload (provisional poster)
- [ ] Auto-engagement does **not** spam like push notifications (counts may still rise)

### Tournaments / teams (develop commits)

- [ ] Instant tournament create path works; no tournament-request dependency
- [ ] Team attach / sponsor fields behave as designed

### CDN / settings

- [ ] `php artisan settings:clear-cache` already run; media CDN still resolves
- [ ] `GET /system-settings` includes `test_otp_phones`

---

## 8. Rollback (no refresh)

1. Redeploy previous **known-good** git SHA on API / app / backoffice (`68fa80d` or your recorded pre-deploy SHA).
2. Restart workers + reload PHP-FPM; rebuild/redeploy frontends from that SHA.
3. **Schema:** do **not** auto-rollback scripts. Prefer restore from the pre-deploy DB dump if you must undo column drops (`posts.visibility`, `users.referred_by`, tournament columns) or the new FK.
4. Leaving `youtube_stream_keys` empty after a code rollback is harmless.
5. Clear caches again:

```bash
php artisan config:clear && php artisan config:cache && php artisan settings:clear-cache
```

---

## 9. Common failure modes

| Symptom | Cause | Fix |
|---------|--------|-----|
| `youtube_stream_key_id` column missing / SQL error on stream create | Script #4 not run | Run `add_live_streams_youtube_stream_key_id.php` after migrate |
| `youtube_stream_keys` table missing | Migrate not run / failed | `php artisan migrate --force` |
| Post create/feed 500 on `visibility` | Script #5 not run | Run `drop_posts_visibility.php` |
| Tournament request endpoints 404 / table errors | Script #2 not run or old clients | Run `simplify_tournaments.php`; ship matching frontends |
| Reel upload aborts | Old nginx timeouts / old app bundle | Reload nginx with updated conf; redeploy app `dist` |
| Blank reel covers forever | No provisional upload (old app) and/or `reels-poster` worker down | Ship app with poster upload; ensure `reels-poster` worker |
| Live push still says “Live on Tapeya” only | Push template seeder not run | `db:seed --class=PushNotificationTemplateSeeder` or edit template in backoffice |
| OTP auto-verify treats test phone as normal | API without public `test_otp_phones` | Deploy API with `publicKeys()` change; clear settings cache |
| `migrate` tries to recreate old tables | Someone ran refresh | **Stop** — restore dump; this runbook forbids refresh |

---

## 10. Checklist summary (copy/paste)

```text
[ ] Record origin/main SHA + release SHA
[ ] Commit WIP on develop (exclude secrets; next apps stay in ../temp)
[ ] Push develop; merge develop → main; push main
[ ] DB backup
[ ] Prod: git pull main @ release SHA
[ ] composer install --no-dev --optimize-autoloader
[ ] php artisan migrate --force
[ ] Verify youtube_stream_keys table exists
[ ] Script 1 teams_free_text_sponsor_icons.php
[ ] Script 2 simplify_tournaments.php
[ ] Script 3 drop_users_referred_by.php
[ ] Script 4 add_live_streams_youtube_stream_key_id.php
[ ] Script 5 drop_posts_visibility.php
[ ] Verify columns/tables (section 5.4)
[ ] config:cache + settings:clear-cache
[ ] db:seed PushNotificationTemplateSeeder --force
[ ] restart workers/FPM (confirm reels-poster + push-notifications)
[ ] nginx -t && reload (if api.conf changed)
[ ] Build/deploy app + backoffice (+ graphics if needed)
[ ] Smoke section 7
```

---

## Related

- [DEPLOYMENT.md](./DEPLOYMENT.md) — build commands / nginx sketches
- [LIVE_STREAM_YOUTUBE_FINAL.md](./LIVE_STREAM_YOUTUBE_FINAL.md)
- Scripts live under [`api/database/scripts/`](../api/database/scripts/)
