# Production deploy — `main` → `develop` tip

Ship **production `main`** up through **local `develop` tip** (`80f73df`), **without** `migrate:fresh` / `migrate:refresh` / DB wipe.

This file is the runbook. Follow steps **in order**.

---

## 0. Snapshot (update SHAs at commit / deploy time)

| Ref | SHA (as of writing) | Notes |
|-----|---------------------|--------|
| **`origin/main` / prod baseline** | `7ee3332` | YouTube key FK migration order; one-shot DB scripts dropped |
| **Local `develop` tip** | `80f73df` | Ahead of `origin/develop` (push before merge) |
| **`main..develop`** | `dd0a8ef`, `0b08a05`, `80f73df` | Users/Players split → architecture doc → fake players demo |
| **Working tree** | clean | Nothing else to commit for this release |

**Before you start deploy day:** re-run and paste into this section:

```bash
git fetch origin
git rev-parse --short origin/main
git rev-parse --short develop
git rev-list --left-right --count origin/main...develop
git log --oneline origin/main..develop
git status -sb
```

Release tip = whatever SHA lands on `main` after merging `develop` (expect `80f73df` or its merge/FF tip).

---

## 1. Hard rules (read once)

1. **Never** run `php artisan migrate:fresh`, `migrate:refresh`, `migrate:reset`, or drop/recreate the production database for this release.
2. **No new migrations** and **no `api/database/scripts/*`** in this range — schema on prod should already match `7ee3332`. Still run `migrate --force` so any accidental pending file surfaces; expect **nothing pending**.
3. Deploy **code**, then **`migrate --force`** (confirm clean), then caches/workers/frontends.
4. Do **not** commit secrets (`.env`, credentials).

---

## 2. What this release contains (product)

Commits on `develop` not on `main`:

| SHA | Summary |
|-----|---------|
| `dd0a8ef` | **Users vs Players split** — Users = administrators + operators (admin-guard roles); Players = app users without those roles. Modal/validation updates. |
| `0b08a05` | **Docs** — `docs/APP_REWRITE_ARCHITECTURE.md` (app rewrite blueprint; no runtime change). |
| `80f73df` | **Fake players demo** — default `/players-management/players` merges Pakistan-filtered reals + client-generated fakes; `?q=tapeya-players` unlocks real API-only list. |

### API

- `UserBuilder`: `backoffice()` vs `player()` scopes
- Admin `UserController` / `PlayerController` + store/update validation (staff need admin roles)
- Feature test: `AdminUsersPlayersSplitTest`

### Backoffice

- Users list/dialogs: Administrator vs Operator (cricket/location/platform trimmed from users)
- Players list: demo mode + real mode gate; fake-row actions no-op
- `players.service` supports `all=true` for demo load

### Out of scope

- Consumer app / native store bumps (not required for this release)
- Graphics pipeline
- New DB columns/tables

---

## 3. Schema map — migrate vs scripts

### A. `php artisan migrate --force`

| Expectation |
|-------------|
| **No pending migrations** for `main..develop`. Confirm with `migrate:status`. |

### B. One-off scripts

| Script | Needed? |
|--------|---------|
| Anything under `api/database/scripts/` | **N/A** — folder not in tree for this release |

If someone reintroduces scripts later, do **not** invent them for this deploy.

---

## 4. Pre-flight (local)

### 4.1 Push develop tip

```bash
cd /path/to/tapeya
git checkout develop
git status -sb   # expect clean at 80f73df (or newer intentional tip)
git push -u origin develop
```

### 4.2 Fast checks (recommended)

```bash
cd api && php artisan test --filter='AdminUsersPlayersSplit|BroadcastBan'
```

Optional: open backoffice locally — Users vs Players lists differ; `?q=tapeya-players` shows real-only players.

### 4.3 Merge to main

```bash
git checkout main
git pull origin main
git merge develop   # should FF: 7ee3332 → 80f73df (or resolve if main moved)
git push origin main
git rev-parse --short HEAD   # record release SHA
```

### 4.4 Backup before touching production

On the API host (or managed DB snapshot):

- Full DB dump **or** at least: `users`, `roles`, `model_has_roles`, `migrations`, `settings`
- Note current prod git SHA: `git -C /var/www/tapeya rev-parse --short HEAD` (adjust path)

---

## 5. Production deploy — API

Paths assume `/var/www/tapeya/...` — adjust to your server.

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

**Expect:** nothing new to run. If a pending migration appears that you did not intend, **stop** and investigate before continuing.

### 5.4 Caches / workers

```bash
cd /var/www/tapeya/api
php artisan config:clear
php artisan config:cache
php artisan settings:clear-cache

sudo supervisorctl restart all
sudo systemctl reload php8.2-fpm   # adjust PHP version/socket
```

No push/settings seeders required for this release.

---

## 6. Production deploy — frontends

### 6.1 Backoffice (`admin.tapeya.com`) — **required**

```bash
cd /var/www/tapeya/backoffice
npm ci
npm run build:production
# publish dist/backoffice/browser
```

Ships: Users/Players split UI, fake players demo list + `?q=tapeya-players` gate.

### 6.2 Consumer app (`tapeya.com`)

**Optional** for this release (no app changes in `main..develop`). Redeploy only if you want the tree SHA matched everywhere:

```bash
cd /var/www/tapeya/app
npm ci
npm run build:production
```

### 6.3 Native stores

Not required for this release (backoffice + API only).

---

## 7. Post-deploy smoke (must pass)

### Users vs Players

- [ ] **Users** list shows staff only (administrators / operators with admin roles) — not the full app-player population
- [ ] Create/edit **Operator** requires at least one admin role; cricket fields not required for staff
- [ ] **Players** list (with `?q=tapeya-players`) shows app players only — no admin-role staff mixed in
- [ ] Broadcast ban / player edit still works on **real** player rows

### Fake players demo

- [ ] `/players-management/players` (no `q`): large list, real Pakistan rows on top, fakes below; client pagination works
- [ ] Fake row Edit / Stats / Ban clicks do nothing (no API calls / no navigation)
- [ ] `/players-management/players?q=tapeya-players`: normal server-paginated real list
- [ ] Wrong `?q=...` redirects to demo URL

### Docs / API health

- [ ] API boots; admin players & users endpoints return 200 for authorized admin
- [ ] `migrate:status` still healthy after deploy

---

## 8. Rollback (no refresh)

1. Redeploy previous known-good git SHA on API / backoffice (`7ee3332` or your recorded pre-deploy SHA).
2. Restart workers + reload PHP-FPM; rebuild/redeploy backoffice from that SHA.
3. **Schema:** nothing to undo for this release (no scripts / no new migrations).
4. Clear caches:

```bash
php artisan config:clear && php artisan config:cache && php artisan settings:clear-cache
```

---

## 9. Common failure modes

| Symptom | Cause | Fix |
|---------|--------|-----|
| Users and Players show the same people | Old API/backoffice still deployed | Pull release SHA; rebuild backoffice; restart PHP-FPM |
| Demo list empty / only a handful of rows | API `all=true` ignored or old players service | Confirm `PlayersService.getList` + API supports `all`; redeploy API + backoffice |
| Fake actions hit API / 404 on negative IDs | Old backoffice without `isFakePlayer` guards | Redeploy backoffice from release tip |
| Operator create fails validation | Expected — admin role required | Assign an admin-guard role |
| `migrate` tries to recreate old tables | Someone ran refresh | **Stop** — restore dump; this runbook forbids refresh |

---

## 10. Checklist summary (copy/paste)

```text
[ ] Record origin/main SHA (expect 7ee3332) + release SHA (expect 80f73df)
[ ] Working tree clean; push develop
[ ] Merge develop → main; push main
[ ] DB backup (users / roles / migrations)
[ ] Prod: git pull main @ release SHA
[ ] composer install --no-dev --optimize-autoloader
[ ] php artisan migrate --force  (expect no pending)
[ ] config:cache + settings:clear-cache
[ ] restart workers/FPM
[ ] Build/deploy backoffice
[ ] Smoke section 7 (Users/Players split + demo gate)
```

---

## Related

- [DEPLOYMENT.md](./DEPLOYMENT.md) — build commands / nginx sketches
- [APP_REWRITE_ARCHITECTURE.md](./APP_REWRITE_ARCHITECTURE.md) — ships in this release (docs only)
- Prior YouTube / visibility / tournament schema work is already on `main` as of `7ee3332`
