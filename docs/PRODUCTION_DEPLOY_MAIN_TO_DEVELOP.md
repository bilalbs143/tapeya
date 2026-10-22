# Production deploy — `main` → uncommitted `develop`

Ship **production `main`** (`fc64564`) up through the **current local `develop` working tree** (committed tip `874a5f8` **plus** uncommitted App Store 1.2 / Entertainment / ops work). **No** `migrate:fresh` / `migrate:refresh` / DB wipe.

**Critical:** the release is **not** on `origin` yet. Commit (or stash-and-commit) the dirty tree on `develop`, push, then merge to `main` before touching production.

This file is the runbook. Follow steps **in order**.

---

## 0. Snapshot (update SHAs at commit / deploy time)

| Ref | SHA / state (as of writing) | Notes |
|-----|-----------------------------|--------|
| **`origin/main` / prod baseline** | `fc64564` | Raise API nginx/PHP upload limits to 10G; drama bulk import + size-cap work already on `main` |
| **Local `develop` tip (committed)** | `874a5f8` | Ahead of `main` by **3 commits**; also ahead of `origin/develop` by those 3 |
| **Working tree (laptop)** | **dirty** | ~98 modified + ~30 untracked — **must be committed** before merge/deploy |
| **`main..develop` (committed only)** | `740ce65` → `d1bb4f7` → `874a5f8` | Live watch comments letterbox + client docs (docs-only commits do not need prod code) |
| **Uncommitted (this release)** | working tree | UGC safety 1.2, Entertainment rename, drama provider, YouTube embed/proxy, user-reports admin, native bumps |

**Before you start deploy day:** re-run and paste into this section:

```bash
git fetch origin
git rev-parse --short origin/main
git rev-parse --short develop
git rev-list --left-right --count origin/main...develop
git log --oneline origin/main..develop
git status -sb
```

Release tip = SHA on `main` **after** committing the dirty tree on `develop` and merging into `main`.

---

## 1. Hard rules (read once)

1. **Never** run `php artisan migrate:fresh`, `migrate:refresh`, `migrate:reset`, or drop/recreate the production database for this release.
2. **Do not** `git pull` / deploy a dirty tree. Commit (or intentionally exclude) all release files first.
3. **Additive migrations only.** Run **`migrate --force` only**.
4. After migrate, run **`StaticPageSeeder`** so production Terms / Privacy have zero-tolerance + 24h copy (App Store 1.2). Prefer seeder over hand-editing backoffice HTML.
5. Deploy order: **commit + push** → **merge to `main`** → **API code** → **`migrate --force`** → **`StaticPageSeeder`** → caches/workers → backoffice + app builds → (optional) native stores.
6. Do **not** commit secrets (`.env`, credentials).
7. Do **not** ship `client` as part of this consumer release (local rewrite; not required for App Store 1.2).

---

## 2. What this release contains (product)

### A. Already committed on `develop` (not yet on `main`)

| SHA | Summary |
|-----|---------|
| `740ce65` | Document client best practices, layout, forms, and copy |
| `d1bb4f7` | Close client audit tracker and clarify density rules |
| `874a5f8` | Keep live watch comments in the letterbox under the player |

### B. Uncommitted working tree (must commit) — main product

**App Store Guideline 1.2 — UGC safety**

- Required Terms checkbox on register; blocking `TermsAcceptanceGate` for users without `terms_accepted_at` (gate hides on `/pages/*` so Terms/Privacy are readable)
- Shared `ReportDialog` (post / reel / user) + `BlockUserDialog` on posts, reels, creator profiles
- API: `POST /me/accept-terms`, block/unblock/report user, feed hides blocked authors, keyword filter on posts/comments/reels
- Admin + backoffice **User Reports**
- Zero-tolerance Terms copy + 24h review commitment (`StaticPageSeeder`)
- Native bumps for resubmission (iOS **1.1.8 / build 50**, Android **1.1.12 / versionCode 24** — confirm in tree before ship)

**Entertainment (ex–Drama Serials consumer UX)**

- App routes/pages/API client renamed toward **Entertainment**; feed widget + Explore entry
- Drama CMS still in backoffice; optional `provider` column on serials
- Episode video optimize command/job/service (if included in the commit)

**Other ops / fixes in the dirty tree (include only if you commit them)**

- Live stream sync / chat / admin stream controllers + tests
- YouTube embed proxy + blade + tests
- Push notification templates / events
- nginx `app.conf` tweaks
- Docs (`APP_REWRITE_ARCHITECTURE`, `LIVE_STREAM_ORIENTATION`)

### C. Out of scope / optional

- Full `client` rewrite (not this production consumer cut)
- Deleting unused jamia/Jumia DNS (ops, not this git deploy)
- `migrate:fresh` / one-shot wipe scripts (**forbidden**)

---

## 3. Schema map — migrate vs seeders

### A. `php artisan migrate --force`

| Migration | Effect |
|-----------|--------|
| `2026_10_12_100000_add_provider_to_drama_serials_table` | Optional provider on drama serials |
| `2026_10_19_100000_add_ugc_safety_tables` | `users.terms_accepted_at`, `user_blocks`, `user_reports` |

Confirm with `migrate:status` before/after. Expect **these two** pending on prod until run (plus any older pending you already planned — **stop** if unexpected).

### B. Seeders (required for 1.2 copy)

```bash
cd /var/www/tapeya/api
php artisan db:seed --class=StaticPageSeeder --force
```

Updates **Terms of Use** + **Privacy Policy** HTML (zero tolerance, report/block, 24h review). Safe to re-run (`updateOrCreate` by slug).

### C. Do **not** run

| Action | Why |
|--------|-----|
| `SystemSettingsSeeder` wholesale | Can overwrite live settings |
| `migrate:fresh` / `migrate:refresh` | Destroys production data |
| Random one-off scripts under `api/database/scripts/` | None required for this cut |

---

## 4. Pre-flight (local)

### 4.1 Commit the dirty develop tree

```bash
cd /path/to/tapeya
git checkout develop
git status -sb
git fetch origin
```

Commit **all** files intended for this release (API safety + Entertainment + backoffice user-reports + app UI + migrations + `StaticPageSeeder` + native version bumps). Exclude secrets and accidental local-only junk.

Suggested commit message focus: App Store 1.2 UGC safety + Entertainment rename + related ops.

```bash
git add -A   # or path-scoped adds — review carefully
git status
git commit -m "$(cat <<'EOF'
Ship App Store 1.2 UGC safety and Entertainment rename.

Required terms, report/block, feed hide, admin user reports, and updated Terms copy; consumer serials → entertainment.
EOF
)"
# Add a second commit for live-letterbox / docs already on develop if you prefer history clean — optional
```

Record:

```bash
git rev-parse --short HEAD   # NEW develop tip = release candidate
git log --oneline origin/main..HEAD
```

### 4.2 Push develop

```bash
git push -u origin develop
```

### 4.3 Fast checks (recommended)

```bash
cd api && php artisan test --filter='UserSafetyTest|PostInteractionTest|DramaSerialApi|YouTubeEmbed'
```

Optional smokes locally:

- Register requires Terms; existing user without `terms_accepted_at` sees gate; `/pages/terms-of-use` readable with gate dismissed
- Report + block on post / reel / profile; blocked author disappears from feed
- Admin User Reports list/update
- Entertainment hub / detail / episode play
- Live watch comments still letterboxed under player

### 4.4 Merge to main

```bash
git checkout main
git pull origin main   # expect fc64564 (or newer if prod moved)
git merge develop      # FF preferred
git push origin main
git rev-parse --short HEAD   # record RELEASE_SHA
```

### 4.5 Backup before touching production

On the API host (or managed DB snapshot):

- Full DB dump **or** at least: `users`, `settings`, `migrations`, `posts`, `static_pages`, `user_blocks`, `user_reports` (latter two may not exist yet)
- Note current prod git SHA: `git -C /var/www/tapeya rev-parse --short HEAD`
- `git status -sb` on the box — tree must be clean before pull (or restore junk first)

---

## 5. Production deploy — API

Paths assume `/var/www/tapeya/...` — adjust to your server. Confirm PHP-FPM version/socket.

### 5.1 Clean tree, then pull

```bash
cd /var/www/tapeya
git fetch origin
git checkout main
git status -sb
# if dirty throwaway edits:
#   git restore .
#   git status -sb   # must be clean
git pull origin main
git rev-parse --short HEAD   # must equal RELEASE_SHA
git status -sb               # still clean
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

**Expect:** `2026_10_12_…provider…` and `2026_10_19_…ugc_safety…`. If anything unexpected is pending, **stop** and investigate.

### 5.4 Static pages (Terms / Privacy) — required for 1.2

```bash
cd /var/www/tapeya/api
php artisan db:seed --class=StaticPageSeeder --force
```

Verify:

```bash
curl -sS https://api.tapeya.com/api/v1/static-pages/terms-of-use | head -c 400
# should mention zero tolerance / 24 hours (not April 2026-only fluff)
```

### 5.5 Caches / workers

```bash
cd /var/www/tapeya/api
php artisan config:clear
php artisan config:cache
php artisan route:cache   # if you normally route-cache in prod
php artisan settings:clear-cache

sudo supervisorctl restart all
sudo systemctl reload php8.3-fpm   # adjust PHP version/socket
```

If `nginx/app.conf` changed in this release, reload nginx after publishing the conf:

```bash
sudo nginx -t && sudo systemctl reload nginx
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

Ships: User Reports, drama serial provider/CMS updates (if committed).

### 6.2 Consumer app (`tapeya.com`) — **required**

```bash
cd /var/www/tapeya/app
npm ci
npm run build:production
```

Ships: Terms gate, report/block, Entertainment pages, StaticPage layout, live comment letterbox.

### 6.3 Native stores — **required for App Store 1.2 review**

Web-only deploy is **not** enough for Apple 1.2 if reviewers use the binary.

```bash
cd /var/www/tapeya/app
# confirm versions in android/app/build.gradle + ios MARKETING_VERSION / CURRENT_PROJECT_VERSION
npm run cap:ios          # production API
# and/or
npm run cap:android
```

Upload the new iOS build (expect **1.1.8 (50)** unless you bumped again) and Android as needed. **API + StaticPageSeeder must already be live** before reviewers open the binary (Terms accept + legal pages hit production).

---

## 7. Post-deploy smoke (must pass)

### UGC safety (1.2)

- [ ] `users.terms_accepted_at` column exists; `user_blocks` / `user_reports` tables exist
- [ ] Register without Terms → 422; with Terms → OK and timestamp set
- [ ] Existing user with `terms_accepted_at` null → blocking gate; accept → continues
- [ ] `/pages/terms-of-use` and `/pages/privacy-policy` show **new** copy (zero tolerance, 24h) and app subpage chrome
- [ ] Report post / reel / user works; block removes author from feed; User Reports visible in admin
- [ ] Suggestions / hashtag reels do not show blocked creators

### Entertainment / live

- [ ] Entertainment hub / detail / episode playback
- [ ] Live watch comments sit in the letterbox under the player
- [ ] YouTube embed proxy still loads where used

### Health

- [ ] API boots; `migrate:status` healthy
- [ ] Existing feed / reels / shop / quick match unchanged for happy paths
- [ ] Workers up; no 500s on `/me/accept-terms` or `/users/{id}/block`

---

## 8. Rollback (no refresh)

1. Redeploy previous known-good git SHA on API / backoffice / app (`fc64564` or your recorded pre-deploy SHA).
2. Restart workers + reload PHP-FPM; rebuild frontends from that SHA.
3. **Schema:** `terms_accepted_at` / `user_blocks` / `user_reports` / `provider` are additive — safe to leave if you roll code back. Prefer **not** `migrate:rollback` unless you have a tested down path.
4. Static pages: re-seed from the older SHA’s seeder **or** restore `static_pages` from backup if legal copy must match the rolled-back binary.
5. Clear caches:

```bash
php artisan config:clear && php artisan config:cache && php artisan settings:clear-cache
```

---

## 9. Common failure modes

| Symptom | Cause | Fix |
|---------|--------|-----|
| Terms / Privacy still look “old” | Prod DB not reseeded; binary points at `api.tapeya.com` | Run `StaticPageSeeder` on prod; hard-refresh / new native build |
| Terms gate stuck forever | Accept-terms 404 / column missing | Deploy API + migrate before app; check `/api/v1/me/accept-terms` |
| Feed 500 after deploy | Migrated code without `user_blocks` migration | Run `migrate --force` |
| Gate covers Terms page | Old app build without legal-page exception | Ship build that hides gate on `/pages/*` |
| `git pull` refuses | Dirty files on API host | `git status`; `git restore .` only for throwaway edits |
| Reviewer rejects 1.2 | Web-only deploy; binary missing report/block/terms | Ship store build **after** API + seeder |
| Entertainment 404 | Old web/native bundle | Redeploy `app/` `build:production`; sync Capacitor |

---

## 10. Checklist summary (copy/paste)

```text
[ ] Record origin/main SHA (expect fc64564)
[ ] Commit dirty develop tree; record RELEASE_CANDIDATE SHA
[ ] Push origin develop
[ ] Merge develop → main; push main; record RELEASE_SHA
[ ] DB backup (users / settings / migrations / posts / static_pages)
[ ] Prod: clean git status; git pull main @ RELEASE_SHA
[ ] composer install --no-dev --optimize-autoloader
[ ] php artisan migrate --force  (expect 2026_10_12 provider + 2026_10_19 ugc_safety)
[ ] php artisan db:seed --class=StaticPageSeeder --force
[ ] curl Terms page — zero tolerance / 24 hours present
[ ] config:cache + settings:clear-cache; restart workers / reload php-fpm
[ ] Build/deploy backoffice
[ ] Build/deploy consumer app (web)
[ ] Capacitor iOS/Android store builds (1.2 review)
[ ] Smoke section 7
```

---

## Related

- [DEPLOYMENT.md](./DEPLOYMENT.md) — build commands / nginx sketches
- [APP_REWRITE_ARCHITECTURE.md](./APP_REWRITE_ARCHITECTURE.md) — rewrite is local / not this consumer cut
- Prior drama bulk-import + 10G upload limits already on `main` as of `fc64564`
