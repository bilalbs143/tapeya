# Production deploy — `main` → `develop` tip

Ship **production `main`** up through **local `develop` tip** (`1501608`), **without** `migrate:fresh` / `migrate:refresh` / DB wipe.

This file is the runbook. Follow steps **in order**.

---

## 0. Snapshot (update SHAs at commit / deploy time)

| Ref | SHA (as of writing) | Notes |
|-----|---------------------|--------|
| **`origin/main` / prod baseline** | `5b51bad` | Prior release (Users/Players + fake demo + runbook) |
| **Local `develop` tip** | `1501608` | Ahead of `origin/develop` / `origin/main` by 3 commits — push before merge |
| **`main..develop`** | `7419c12`, `6387393`, `1501608` | Vanity viewers → last active → players list perf |
| **Working tree** | clean | Tip already includes roles eager-load + fake-cache work |

**Before you start deploy day:** re-run and paste into this section:

```bash
git fetch origin
git rev-parse --short origin/main
git rev-parse --short develop
git rev-list --left-right --count origin/main...develop
git log --oneline origin/main..develop
git status -sb
```

Release tip = whatever SHA lands on `main` after merging `develop` (expect `1501608` or its merge/FF tip).

---

## 1. Hard rules (read once)

1. **Never** run `php artisan migrate:fresh`, `migrate:refresh`, `migrate:reset`, or drop/recreate the production database for this release.
2. **One additive migration** in this range: `users.last_active_at` (+ index + one-time backfill from `active_platform_updated_at`). Run **`migrate --force` only**.
3. **Add vanity streaming settings via tinker only** — insert the three new properties if missing; do **not** run `SystemSettingsSeeder` or wholesale `EnsureSpatieSettingsDatabaseProperties::ensure()`.
4. Deploy **code**, then **`migrate --force`**, then **tinker vanity props**, then caches/workers/frontends.
5. Do **not** commit secrets (`.env`, credentials).

---

## 2. What this release contains (product)

Commits on `develop` not on `main`:

| SHA | Summary |
|-----|---------|
| `7419c12` | **Vanity live viewer counts** — Live Streaming settings `stream_vanity_viewer_min/max` + `stream_vanity_viewer_self_serve` (0/1); app shows synced oscillating count (badge waits until settings load). |
| `6387393` | **Player last activity** — `users.last_active_at`, throttled `TouchLastActive` on consumer `auth:api`, bump on OTP verify + platform sync; Players **Last Active** column + inactive 7/14/30 filter. |
| `1501608` | **Players list perf** — eager-load `roles` on admin players query (fixes N+1 on `?all=true`); chunked/module-cached fake players so demo load overlaps the API. |

### API

- Streaming settings keys + registry + seeder defaults (`2000` / `2500` / self-serve `0`)
- Migration: `2026_09_14_211115_add_last_active_at_to_users_table`
- Middleware `TouchLastActive` (`touch.last_active`) on consumer auth group
- `PlayerController` eager-loads `creator` + `roles`
- Feature tests: `TouchLastActiveTest`, `AdminPlayersLastActiveFilterTest`

### Backoffice

- Players: Last Active column, inactive-days filter, faster demo fake generation/cache

### Consumer app

- `useVanityViewerCount` wired in `LiveBroadcast` / `DuringBroadcast`; self-serve respects vanity flag

### Out of scope

- Graphics pipeline
- Native store bumps (web app redeploy is enough for vanity UI)
- `migrate:fresh` / one-shot DB scripts (none in this range)

---

## 3. Schema map — migrate vs scripts

### A. `php artisan migrate --force`

| Migration | Effect |
|-----------|--------|
| `2026_09_14_211115_add_last_active_at_to_users_table` | Adds nullable `users.last_active_at` + index; backfills from `active_platform_updated_at` where present |

Confirm with `migrate:status` before/after. Expect **this one** pending on prod until run.

### B. Tinker — vanity keys only (required)

Do **not** run `SystemSettingsSeeder`. Create only the three new streaming properties if absent; leave every existing setting untouched:

```bash
cd /var/www/tapeya/api
php artisan tinker --execute="
\$repository = (new \Spatie\LaravelSettings\SettingsConfig(\App\Settings\StreamingSettings::class))->getRepository();
\$group = 'streaming';
foreach ([
    'vanityViewerMin' => 2000,
    'vanityViewerMax' => 2500,
    'vanityViewerSelfServe' => 0,
] as \$name => \$value) {
    if (! \$repository->checkIfPropertyExists(\$group, \$name)) {
        \$repository->createProperty(\$group, \$name, \$value);
    }
}
echo 'vanity settings ok'.PHP_EOL;
"
```

Safe to re-run: skips properties that already exist (no overwrite).

### C. One-off scripts

| Script | Needed? |
|--------|---------|
| Anything under `api/database/scripts/` | **N/A** — not used for this release |

---

## 4. Pre-flight (local)

### 4.1 Push develop tip

```bash
cd /path/to/tapeya
git checkout develop
git status -sb   # expect clean at 1501608 (or newer intentional tip)
git push -u origin develop
```

### 4.2 Fast checks (recommended)

```bash
cd api && php artisan test --filter='TouchLastActive|AdminPlayersLastActive|AdminUsersPlayersSplit|BroadcastBan'
```

Optional smokes locally:

- Players demo loads without multi-second hang; `?q=tapeya-players` still real-only
- Live watch shows vanity badge after settings load (match/admin); self-serve only if setting is `1`
- Inactive filter returns never-active + stale rows

### 4.3 Merge to main

```bash
git checkout main
git pull origin main
git merge develop   # should FF: 5b51bad → 1501608 (or resolve if main moved)
git push origin main
git rev-parse --short HEAD   # record release SHA
```

### 4.4 Backup before touching production

On the API host (or managed DB snapshot):

- Full DB dump **or** at least: `users`, `settings`, `migrations`, `roles`, `model_has_roles`
- Note current prod git SHA: `git -C /var/www/tapeya rev-parse --short HEAD` (adjust path)

---

## 5. Production deploy — API

Paths assume `/var/www/tapeya/...` — adjust to your server. Prior box used **php8.3-fpm** (`Host tapeya-dev`); confirm socket/version.

### 5.1 Put code on the box

```bash
cd /var/www/tapeya
git fetch origin
git checkout main
git pull origin main
git rev-parse --short HEAD   # must match release tip
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

**Expect:** `add_last_active_at_to_users_table` runs once. If anything unexpected is pending, **stop** and investigate.

### 5.4 Add vanity streaming settings (tinker only)

```bash
cd /var/www/tapeya/api
php artisan tinker --execute="
\$repository = (new \Spatie\LaravelSettings\SettingsConfig(\App\Settings\StreamingSettings::class))->getRepository();
\$group = 'streaming';
foreach ([
    'vanityViewerMin' => 2000,
    'vanityViewerMax' => 2500,
    'vanityViewerSelfServe' => 0,
] as \$name => \$value) {
    if (! \$repository->checkIfPropertyExists(\$group, \$name)) {
        \$repository->createProperty(\$group, \$name, \$value);
    }
}
echo 'vanity settings ok'.PHP_EOL;
"
```

### 5.5 Caches / workers

```bash
cd /var/www/tapeya/api
php artisan config:clear
php artisan config:cache
php artisan settings:clear-cache

sudo supervisorctl restart all
sudo systemctl reload php8.3-fpm   # adjust PHP version/socket
```

---

## 6. Production deploy — frontends

### 6.1 Backoffice (`admin.tapeya.com`) — **required**

```bash
cd /var/www/tapeya/backoffice
npm ci
npm run build:production
# publish dist/backoffice/browser
```

Ships: Last Active + inactive filter, faster fake demo list (roles eager-load is API-side).

### 6.2 Consumer app (`tapeya.com`) — **required**

```bash
cd /var/www/tapeya/app
npm ci
npm run build:production
```

Ships: vanity viewer badge behavior + self-serve flag respect.

### 6.3 Native stores

Not required for this release (web app covers vanity; last-active tracking is API middleware).

---

## 7. Post-deploy smoke (must pass)

### Vanity viewers

- [ ] Live Streaming settings show **Vanity Viewer Min/Max** and **Vanity On Self-Serve** (defaults ~2000–2500 / `0` if freshly seeded)
- [ ] Match/admin live watch: badge shows oscillating count in range (hidden until settings ready — no real→vanity flash)
- [ ] Self-serve Go Live: real presence when self-serve flag is `0`; vanity range when `1`
- [ ] `settings:clear-cache` done if values look stale

### Last activity

- [ ] `users` table has `last_active_at`; prior platform reporters backfilled
- [ ] Authenticated consumer API use bumps activity (throttled ~15 min)
- [ ] Players list shows **Last Active** (“… ago” / Never)
- [ ] Inactive 7/14/30 filter includes null + stale; excludes recent
- [ ] Real list `?q=tapeya-players` still server-paginated

### Players demo perf

- [ ] `/players-management/players` (no `q`) loads without the old ~10s hang (API roles eager-load + client fake cache)
- [ ] Fake row actions still no-op; wrong `?q=` still redirects to demo

### Health

- [ ] API boots; admin players/users 200 for authorized admin
- [ ] `migrate:status` healthy after deploy

---

## 8. Rollback (no refresh)

1. Redeploy previous known-good git SHA on API / backoffice / app (`5b51bad` or your recorded pre-deploy SHA).
2. Restart workers + reload PHP-FPM; rebuild frontends from that SHA.
3. **Schema:** `last_active_at` is additive and safe to leave in place if you roll code back. Only drop it if you explicitly need a clean reverse (`migrate:rollback` one step) — prefer leave column.
4. Vanity settings rows can remain; old code ignores unknown keys.
5. Clear caches:

```bash
php artisan config:clear && php artisan config:cache && php artisan settings:clear-cache
```

---

## 9. Common failure modes

| Symptom | Cause | Fix |
|---------|--------|-----|
| Players demo still ~10s | Old API without `roles` eager-load | Pull release SHA; reload PHP-FPM |
| Vanity badge missing / stuck hidden | Vanity props missing or cache stale | Re-run section 5.4 tinker + `settings:clear-cache`; redeploy app |
| Self-serve still real-only | `stream_vanity_viewer_self_serve` is `0` | Set to `1` in Live Streaming settings |
| Last Active always Never / empty | Migration not run or middleware not on consumer routes | Confirm migrate ran; hit authenticated consumer API; check `touch.last_active` |
| Inactive filter wrong set | Old backoffice / API | Redeploy both from release tip |
| `migrate` tries to recreate old tables | Someone ran refresh | **Stop** — restore dump; this runbook forbids refresh |

---

## 10. Checklist summary (copy/paste)

```text
[ ] Record origin/main SHA (expect 5b51bad) + release SHA (expect 1501608)
[ ] Working tree clean; push develop
[ ] Merge develop → main; push main
[ ] DB backup (users / settings / migrations)
[ ] Prod: git pull main @ release SHA
[ ] composer install --no-dev --optimize-autoloader
[ ] php artisan migrate --force  (expect last_active_at migration)
[ ] tinker: add vanityViewerMin/Max/SelfServe only if missing (no SystemSettingsSeeder)
[ ] config:cache + settings:clear-cache
[ ] restart workers / reload php8.3-fpm
[ ] Build/deploy backoffice
[ ] Build/deploy consumer app
[ ] Smoke section 7 (vanity + last active + demo perf)
```

---

## Related

- [DEPLOYMENT.md](./DEPLOYMENT.md) — build commands / nginx sketches
- [APP_REWRITE_ARCHITECTURE.md](./APP_REWRITE_ARCHITECTURE.md) — already on `main` as of prior release
- Prior Users/Players + fake demo work is already on `main` as of `5b51bad`
