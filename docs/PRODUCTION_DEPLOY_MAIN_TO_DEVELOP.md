# Production deploy — `tapeya-dev` (`d33ddaaa`) → `origin/main` (`b3a88f5`)

Ship **current `origin/main`** onto **`tapeya-dev`** (`/var/www/tapeya`). Local `main` / `develop` / `origin/main` / `origin/develop` are already aligned at **`b3a88f5`** — no commit or merge step is needed for this cut.

**Host:** `ssh tapeya-dev` → `/var/www/tapeya`  
**No** `migrate:fresh` / `migrate:refresh` / DB wipe.

This file is the runbook. Follow steps **in order**.

---

## 0. Snapshot (as of 2026-11-12)

| Ref | SHA / state | Notes |
|-----|-------------|--------|
| **Deployed on `tapeya-dev`** | `d33ddaaa` | *Fix backoffice dialog scroll for long forms.* (2026-10-19). Branch `main`. |
| **Target (`origin/main`)** | `b3a88f5` | *Bump Android version to 1.1.13 (25).* Same tip as local `main` / `develop`. |
| **Delta** | **65 commits** | `d33ddaaa..b3a88f5` (fast-forward pull). |
| **Server git status** | **dirty** | 8 modified AutoComment / AutoEngagement files + untracked `.env.bak`, `opcache-preload.php`, `warmup.sh`, `exports/`. **Must stash or export before pull.** |
| **Server tree extras** | present | Still has `angular-theme/` + `laravel/` (removed upstream in `4e8a6fe`). No `client/` yet — pull will add it. |

**Before deploy day, re-verify:**

```bash
# laptop
git fetch origin
git rev-parse --short origin/main   # expect b3a88f5 (or newer)
git log --oneline d33ddaaa..origin/main | head

# tapeya-dev
ssh tapeya-dev 'cd /var/www/tapeya && git fetch origin && git rev-parse --short HEAD && git status -sb && git rev-list --left-right --count HEAD...origin/main'
```

Release tip = `origin/main` SHA at pull time (record as `RELEASE_SHA`).

---

## 1. Hard rules (read once)

1. **Never** run `php artisan migrate:fresh`, `migrate:refresh`, `migrate:reset`, or drop/recreate the production database.
2. **Do not** `git pull` on a dirty tree. Stash / export server-only edits first.
3. **Additive / intentional schema only.** Run **`migrate --force` only**. Expect **one** new migration after pull (see §3).
4. Deploy order: **backup + preserve dirty** → **pull `main`** → **API deps** → **`migrate --force`** → caches/workers → **backoffice + `client/` build** → point `tapeya.com` at `client/dist`. **Keep** `graphics.tapeya.com` on `app/dist-graphics` (do not rebuild/replace graphics unless intentional).
5. Do **not** commit secrets (`.env`, credentials, `exports/*.sql*`).
6. Do **not** wholesale-run `SystemSettingsSeeder` (overwrites live settings).

---

## 2. What this release contains (product delta)

High-signal themes in `d33ddaaa..b3a88f5` (omitting merge noise):

### API / platform

- Drop `cricket_format` end-to-end (`67b5de8` + migration `2026_10_31_100000_drop_cricket_format_everywhere`)
- CDN URL from system settings (`ab3d6f4`)
- Terms gate removal on client path; API stamps terms by default (`28ae7d9`) — UGC tables already **Ran** on this host
- Remove unused `angular-theme/` + legacy `laravel/` trees (`4e8a6fe`)

### Consumer (`app/` + new `client/`)

- Full **`client/`** Capacitor rewrite added (`e8dba42`) and iterated: feed/reels polish, keyboard inset fixes, dual-audio reel gate, splash light/dark, GA4 + Firebase Analytics, Meta Pixel / Facebook App Events, Reverb live chat, Android nav hide, iOS CocoaPods for Firebase dSYMs
- Native tips at `b3a88f5`: **client iOS 1.1.9 (53)**, **client Android 1.1.13 (25)**; legacy `app/` Android still **1.1.12 (24)**

### Backoffice

- Custom confirm for delete-all notifications (`fc3b18b`)
- Image upload / aspect-ratio hint alignment with client

### Ops / CI

- Graphics CDN bootstrap CI fixes (`b3f3a95`)
- Root `package-lock.json` removed (`3714698`)

### Out of scope for this host pull

- Publishing a new App Store / Play binary (do separately after API is live if needed)
- Rebuilding / replacing **`app/dist-graphics`** — graphics stays on the legacy `app/` pipeline

---

## 3. Schema map — migrate vs seeders

### A. `php artisan migrate --force`

| Migration | Effect |
|-----------|--------|
| `2026_10_31_100000_drop_cricket_format_everywhere` | Drops `matches.cricket_format`; merges duplicate career-stat rows that differed only by format; drops format columns/indexes on batting/bowling/fielding stats |

**Already Ran on this host (do not expect pending):**

- `2026_10_12_100000_add_provider_to_drama_serials_table`
- `2026_10_19_100000_add_ugc_safety_tables`

Confirm with `migrate:status` before/after. If anything unexpected is pending after pull, **stop**.

### B. Seeders

**None required** for this cut. Do **not** run `SystemSettingsSeeder` wholesale. Demo/review seeders (`ClientReviewSeeder`, `ScoringDemoSeeder`) are not for production.

### C. Do **not** run

| Action | Why |
|--------|-----|
| `migrate:fresh` / `migrate:refresh` | Destroys production data |
| `SystemSettingsSeeder` | Overwrites live settings |
| Random one-offs under `api/database/scripts/` | None required |

---

## 4. Pre-flight

### 4.1 Laptop — confirm tip

```bash
cd /path/to/tapeya
git fetch origin
git checkout main
git pull origin main
git rev-parse --short HEAD   # RELEASE_SHA — expect b3a88f5 or newer
git status -sb               # should be clean
```

### 4.2 Backup + preserve server-only dirty work

On `tapeya-dev` the tree has **local** AutoComment / AutoEngagement edits that are **not** on `origin/main`. Preserve them before pull:

```bash
ssh tapeya-dev
cd /var/www/tapeya

# record pre-deploy SHA
git rev-parse HEAD | tee /tmp/pre-deploy-sha.txt
git status -sb | tee /tmp/pre-deploy-status.txt

# DB backup (or managed snapshot)
# mysqldump / existing exports/ pattern — keep off the git tree if huge

# export dirty tracked files (keep a copy outside the pull)
STAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p exports/pre-deploy-$STAMP/files
git diff > exports/pre-deploy-$STAMP/tracked.diff
git diff --stat > exports/pre-deploy-$STAMP/diff-stat.txt
cp /tmp/pre-deploy-sha.txt exports/pre-deploy-$STAMP/pre-sha.txt
for f in \
  api/app/Services/Post/AutoCommentService.php \
  api/app/Services/Post/AutoEngagementService.php \
  api/app/Settings/PostsSettings.php \
  api/app/Settings/SystemSettingRegistry.php \
  api/app/Support/Post/AutoCommentPhrases.php \
  api/routes/console.php \
  api/tests/Feature/Post/AutoCommentTest.php \
  api/tests/Feature/Post/AutoEngagementTest.php
do
  mkdir -p "exports/pre-deploy-$STAMP/files/$(dirname "$f")"
  cp "$f" "exports/pre-deploy-$STAMP/files/$f"
done

# clear tracked dirt so pull can FF
git restore \
  api/app/Services/Post/AutoCommentService.php \
  api/app/Services/Post/AutoEngagementService.php \
  api/app/Settings/PostsSettings.php \
  api/app/Settings/SystemSettingRegistry.php \
  api/app/Support/Post/AutoCommentPhrases.php \
  api/routes/console.php \
  api/tests/Feature/Post/AutoCommentTest.php \
  api/tests/Feature/Post/AutoEngagementTest.php

git status -sb   # modified list empty; untracked exports/ + bak files OK
```

Untracked `api/.env.bak-*`, `api/opcache-preload.php`, `api/warmup.sh`, and `exports/` can stay (gitignored or untracked).

---

## 5. Production deploy — API (`tapeya-dev`)

Paths: `/var/www/tapeya/...`. PHP **8.3.6**, Node **v22**, npm **10.9**.

### 5.1 Pull `main`

```bash
cd /var/www/tapeya
git fetch origin
git checkout main
git status -sb                 # tracked tree must be clean
git pull origin main           # FF d33ddaaa → RELEASE_SHA
git rev-parse --short HEAD     # must equal RELEASE_SHA
git status -sb
```

Expect: `angular-theme/` + `laravel/` gone; `client/` present.

### 5.2 PHP deps

```bash
cd /var/www/tapeya/api
composer install --no-dev --optimize-autoloader
```

### 5.3 Migrations only

```bash
cd /var/www/tapeya/api
php artisan migrate:status | tail -20
php artisan migrate --force
```

**Expect:** `2026_10_31_100000_drop_cricket_format_everywhere`. Stop if unexpected pendings appear.

### 5.4 Re-apply server-only Auto* patches? (decide explicitly)

If production still needs the host-only AutoComment / AutoEngagement behavior:

```bash
# review diff first, then copy back from exports/pre-deploy-$STAMP/files/…
# prefer committing those changes on develop later instead of leaving the box dirty
```

If upstream `main` already superseded that work, **leave restored** and delete the export after smoke.

### 5.5 Caches / workers

```bash
cd /var/www/tapeya/api
php artisan config:clear
php artisan config:cache
php artisan route:cache    # if you normally route-cache here
php artisan settings:clear-cache

sudo supervisorctl restart all
sudo systemctl reload php8.3-fpm
```

Nginx confs on this host (`api.conf`, `app.conf`, `backoffice.conf`, `graphics.conf`) — reload only if this release changed published nginx files:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. Production deploy — frontends

### 6.1 Backoffice (`admin` / backoffice vhost) — **required**

```bash
cd /var/www/tapeya/backoffice
npm ci
npm run build:production
# dist/backoffice/browser is what the vhost serves
```

### 6.2 Consumer web (`client/` → tapeya.com) — **required**

```bash
cd /var/www/tapeya/client
npm ci
npm run build:production
# output: /var/www/tapeya/client/dist
```

Then publish nginx root change (repo `nginx/app.conf` → `/var/www/tapeya/client/dist`):

```bash
sudo cp /etc/nginx/sites-available/app.conf /etc/nginx/sites-available/app.conf.bak-$(date +%Y%m%d-%H%M%S)
sudo cp /var/www/tapeya/nginx/app.conf /etc/nginx/sites-available/app.conf
sudo nginx -t && sudo systemctl reload nginx
```

**Do not** change `graphics.conf`. **Do not** run `app` `build:graphics*` unless you intend to refresh overlays.

### 6.3 Legacy `app/` — graphics only

Leave `app/dist-graphics` and `graphics.tapeya.com` alone. Rebuild only when shipping graphics changes:

```bash
cd /var/www/tapeya/app
npm ci
npm run build:graphics:production
# output must stay: /var/www/tapeya/app/dist-graphics
```

### 6.4 Native store binaries — **optional / separate**

Build from a machine with signing keys (not required to finish the web/API pull):

```bash
cd client   # rewrite Capacitor app
# iOS 1.1.9 (53) — Xcode archive after cap sync
# Android 1.1.13 (25)
npm run build:production
npx cap sync
```

Legacy `app/` Capacitor remains at Android **1.1.12 (24)** if you still ship that binary.

---

## 7. Post-deploy smoke (must pass)

### Platform

- [ ] `git -C /var/www/tapeya rev-parse --short HEAD` equals `RELEASE_SHA`
- [ ] `migrate:status` shows `2026_10_31_…cricket_format…` **Ran**
- [ ] `matches.cricket_format` column gone; player stats unique on `(player_id, tournament_type)` only
- [ ] API boots; workers up; no spike of 500s

### Product

- [ ] Feed / reels (no dual-audio on Android if testing Cap build)
- [ ] Live watch chat / Reverb still connects
- [ ] Backoffice login + notifications delete-all uses custom prompt
- [ ] Shop product images / upload hints still sane
- [ ] Graphics / CDN bootstrap if you rely on system-settings CDN URL

### Hygiene

- [ ] Working tree on the box is clean **or** only intentional re-applied Auto* files
- [ ] `exports/` backups retained; secrets not committed

---

## 8. Rollback (no refresh)

1. Record current SHA, then:

```bash
cd /var/www/tapeya
git fetch origin
git checkout main
git reset --hard d33ddaaa   # or your recorded pre-deploy SHA
# rebuild frontends from that SHA; composer install; config:cache
sudo supervisorctl restart all
sudo systemctl reload php8.3-fpm
```

2. **Schema:** `drop_cricket_format` is a **data-merging** migration. Prefer **leaving schema forward** if you roll code back. Only `migrate:rollback` if you have a tested down path and accept format columns returning empty/default.
3. Restore Auto* files from `exports/pre-deploy-*` if the rolled-back code depended on them.
4. Clear caches:

```bash
php artisan config:clear && php artisan config:cache && php artisan settings:clear-cache
```

---

## 9. Common failure modes

| Symptom | Cause | Fix |
|---------|--------|-----|
| `git pull` refuses / conflicts | Dirty Auto* files on host | Export → `git restore` → pull (§4.2) |
| Unexpected pending migrations | Older host drift | Stop; compare `migrate:status` to `RELEASE_SHA` tree |
| Career stats look wrong after migrate | Format-row merge | Inspect `player_*_stats` before/after; restore from DB backup if needed |
| Consumer site still old | Forgot `app/` `build:production` | Rebuild and publish `app/dist` |
| `client/` 404 / wrong app | Nginx still points at `app/` | Expected until you cut the vhost over |
| Reverb fails in Cap WebView | Missing `localhost` origin allowlist | See [DEPLOYMENT.md](./DEPLOYMENT.md) Reverb note; restart Reverb |
| Firebase / dSYM / analytics only | Native binary not rebuilt | Optional store cut; web pull does not ship Cap binaries |

---

## 10. Checklist summary (copy/paste)

```text
[ ] Laptop: origin/main SHA recorded (expect b3a88f5+) → RELEASE_SHA
[ ] tapeya-dev: record HEAD d33ddaaa; git status; DB backup
[ ] Export + git restore dirty AutoComment/AutoEngagement files
[ ] git fetch && git pull origin main → HEAD == RELEASE_SHA
[ ] composer install --no-dev --optimize-autoloader
[ ] php artisan migrate --force  (expect 2026_10_31 drop cricket_format only)
[ ] Decide: re-apply Auto* host patches or leave clean / commit later
[ ] config:cache + settings:clear-cache; restart workers; reload php8.3-fpm
[ ] Build/deploy backoffice (npm ci && build:production)
[ ] Build/deploy app/ consumer web
[ ] Optional: client/ build + nginx cutover; store binaries
[ ] Smoke section 7
```

---

## Related

- [DEPLOYMENT.md](./DEPLOYMENT.md) — build commands / nginx sketches / Reverb origins
- Prior UGC safety + drama provider migrations are **already applied** on this host as of `d33ddaaa`
