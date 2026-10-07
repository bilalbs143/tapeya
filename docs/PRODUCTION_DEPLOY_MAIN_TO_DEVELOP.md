# Production deploy — `main` → `develop` tip

Ship **production `main`** (`eed3f85`) up through **local `develop` tip** (`2f36bb6`), **without** `migrate:fresh` / `migrate:refresh` / DB wipe.

**Critical:** production currently has **uncommitted auto-engagement patches** on the API box. **Revert those files to git `main` before `git pull`.** The release SHA then installs the canonical auto-likes/views **plus** hourly auto-comments from git.

This file is the runbook. Follow steps **in order**.

---

## 0. Snapshot (update SHAs at commit / deploy time)

| Ref | SHA (as of writing) | Notes |
|-----|---------------------|--------|
| **`origin/main` / prod baseline** | `eed3f85` | Prior release (vanity viewers + last active + players list perf) |
| **Local `develop` tip** | `2f36bb6` | Ahead of `origin/develop` / `origin/main` by **1 commit** — **push before merge** |
| **`main..develop`** | `2f36bb6` | Drama serials + auto comments + Explore Dramas; ignore local app-react |
| **Working tree (laptop)** | clean at `2f36bb6` | `tapeya-ui/` and `.github/workflows/app-react-checks.yml` stay untracked |

**Before you start deploy day:** re-run and paste into this section:

```bash
git fetch origin
git rev-parse --short origin/main
git rev-parse --short develop
git rev-list --left-right --count origin/main...develop
git log --oneline origin/main..develop
git status -sb
```

Release tip = whatever SHA lands on `main` after merging `develop` (expect `2f36bb6` or its merge/FF tip).

---

## 1. Hard rules (read once)

1. **Never** run `php artisan migrate:fresh`, `migrate:refresh`, `migrate:reset`, or drop/recreate the production database for this release.
2. **On the API host, revert local auto-engagement before pulling code** (section 5.1). Do not `git pull` onto a dirty tree.
3. **Additive migrations only** (drama serials/episodes/engagement tables). Run **`migrate --force` only**. `last_active_at` is already on prod from `eed3f85`.
4. **Do not** run `SystemSettingsSeeder` or wholesale `EnsureSpatieSettingsDatabaseProperties::ensure()`. Tinker **only missing** reels auto-engagement properties (section 5.5).
5. Deploy **revert local patches** → **code** → **`migrate --force`** → **tinker if needed** → caches/workers/frontends.
6. Do **not** commit secrets (`.env`, credentials).

---

## 2. What this release contains (product)

Commits on `develop` not on `main`:

| SHA | Summary |
|-----|---------|
| `2f36bb6` | **Drama serials** (admin CMS + consumer hub/player/comments). **Hourly auto-comments** from dormant accounts; auto likes/views stay 15 min; both **notify** (in-app + push). Explore **Streaming** (URL-stream manager) replaced by **Dramas**; `live/my-streams` API removed. Live hub / go-live **unchanged**. Local `app-react` + Cursor skill gitignored. |

Already on production (`eed3f85`) — do not re-run those tinker/migrate steps:

- Vanity live viewer settings
- `users.last_active_at` + Players last-active UI
- Players list `roles` eager-load + fake-player cache

### API

- Drama models/migrations/admin+user routes, resources, tests (`DramaSerialApiTest`)
- `posts:process-auto-comments` hourly; `posts:process-auto-engagement` every 15 minutes
- Auto comments: dormant users only (`last_active_at` null or >30d), sparse caps, unique body per post
- Auto like **and** auto comment fire `PostLiked` / `PostCommented` (push + in-app)
- Removed `UserOwnedLiveStreamController` + `GET/POST /live/my-streams*`
- `CricketMatch` alias removed internally (Quick Match still `TournamentMatch` — **JSON contract unchanged**)

### Backoffice

- Content → Drama serials / Drama episodes

### Consumer app

- Explore **Dramas** (`/serials`); `/live/streaming` redirects to `/serials`
- Episode player (highlight-style reactions + inline comments)
- Live hub / go-live unchanged

### Out of scope

- `app-react` rewrite (gitignored — not on the server)
- Native store bumps (optional; see 6.3)
- `migrate:fresh` / one-shot DB scripts (none required)

---

## 3. Schema map — migrate vs scripts

### A. `php artisan migrate --force`

| Migration | Effect |
|-----------|--------|
| `2026_09_23_100000_create_drama_serials_table` | Serials CMS |
| `2026_09_23_100001_create_drama_episodes_table` | Episodes + video source |
| `2026_09_23_100002_create_drama_episode_likes_table` | Episode likes |
| `2026_09_23_100003_create_drama_episode_comments_table` | Episode comments |
| `2026_09_23_100004_create_drama_episode_comment_likes_table` | Comment likes |
| `2026_09_24_100000_add_drama_episode_reactions_and_shares` | Dislike/share counters + user reactions |

Confirm with `migrate:status` before/after. Expect **these six** pending on prod until run. **Do not** expect `last_active_at` to be pending.

### B. Tinker — reels auto-engagement keys only if missing

Production may already have these from the **hand-patched** auto-engagement work. Create **only if absent**; do **not** overwrite live values; do **not** run `SystemSettingsSeeder`.

```bash
cd /var/www/tapeya/api
php artisan tinker --execute="
\$repository = (new \Spatie\LaravelSettings\SettingsConfig(\App\Settings\PostsSettings::class))->getRepository();
\$group = 'reels';
foreach ([
    'autoEngagementEnabled' => 0,
    'reelsEngagementPerDay' => 5,
] as \$name => \$value) {
    if (! \$repository->checkIfPropertyExists(\$group, \$name)) {
        \$repository->createProperty(\$group, \$name, \$value);
        echo \"created {\$name}\".PHP_EOL;
    } else {
        echo \"exists {\$name}\".PHP_EOL;
    }
}
"
```

Safe to re-run. After deploy, confirm Admin → System Settings → Reels: **Auto Engagement Enabled** (`1` = likes/views 15 min + comments hourly) and **Daily Max**. Comments have **no** extra integer — they are 4% of the like daily max.

### C. One-off scripts

| Script | Needed? |
|--------|---------|
| Anything under `api/database/scripts/` | **N/A** |

---

## 4. Pre-flight (local)

### 4.1 Push develop tip

```bash
cd /path/to/tapeya
git checkout develop
git status -sb   # expect clean at 2f36bb6 (or newer intentional tip)
git push -u origin develop
```

### 4.2 Fast checks (recommended)

```bash
cd api && php artisan test --filter='DramaSerialApi|AutoComment|AutoEngagement'
```

Optional smokes locally:

- Admin can create a serial + episode; `/serials` lists it
- Episode like/comment works; no `@` on auto comments
- `posts:process-auto-comments` runs; `posts:process-auto-engagement` still 15 min
- Explore Streaming gone; Live hub still lists broadcasts

### 4.3 Merge to main

```bash
git checkout main
git pull origin main
git merge develop   # should FF: eed3f85 → 2f36bb6 (or resolve if main moved)
git push origin main
git rev-parse --short HEAD   # record release SHA
```

### 4.4 Backup before touching production

On the API host (or managed DB snapshot):

- Full DB dump **or** at least: `users`, `settings`, `migrations`, `posts`, `post_comments`, `post_likes`
- Note current prod git SHA: `git -C /var/www/tapeya rev-parse --short HEAD`
- **Save `git status` / `git diff --stat` output** before restoring auto-engagement files (section 5.1)

---

## 5. Production deploy — API

Paths assume `/var/www/tapeya/...` — adjust to your server. Prior box used **php8.3-fpm** (`Host tapeya-dev`); confirm socket/version.

### 5.1 Revert server auto-engagement (do this first)

The API host has **local, uncommitted** auto-likes/views files (copied onto the box, not from `main`). Pulling `2f36bb6` on top of them will fail or produce a mixed tree.

```bash
cd /var/www/tapeya
git fetch origin
git checkout main
git rev-parse --short HEAD   # expect eed3f85 (or recorded pre-deploy SHA)
git status -sb
git diff --stat
```

Discard **only** the dirty auto-engagement-related paths (add any extras `git status` shows):

```bash
cd /var/www/tapeya
git restore -- \
  api/app/Services/Post/AutoEngagementService.php \
  api/app/Console/Commands/ProcessAutoEngagementCommand.php \
  api/app/Settings/PostsSettings.php \
  api/app/Settings/SystemSettingRegistry.php \
  api/routes/console.php \
  api/tests/Feature/Post/AutoEngagementTest.php
```

If other files are dirty and you are sure they are throwaway server edits:

```bash
cd /var/www/tapeya
git restore .
git status -sb   # must be clean vs HEAD before pull
```

If you need to keep a copy of the server patch:

```bash
git stash push -m 'pre-deploy local auto-engagement' -- \
  api/app/Services/Post/AutoEngagementService.php \
  api/app/Console/Commands/ProcessAutoEngagementCommand.php \
  api/app/Settings/PostsSettings.php \
  api/app/Settings/SystemSettingRegistry.php \
  api/routes/console.php
```

Do **not** `git stash pop` after pull unless you are resolving a conflict on purpose. Git `2f36bb6` is the source of truth for auto engagement + comments.

If a **crontab** line was added for `posts:process-auto-engagement` outside Laravel’s scheduler, **remove the duplicate** after deploy — `routes/console.php` already schedules it (`everyFifteenMinutes`) and comments (`hourly`). Keep the normal `* * * * * php artisan schedule:run`.

### 5.2 Put code on the box

```bash
cd /var/www/tapeya
git pull origin main
git rev-parse --short HEAD   # must match release tip (2f36bb6)
git status -sb               # still clean
```

### 5.3 PHP deps

```bash
cd /var/www/tapeya/api
composer install --no-dev --optimize-autoloader
```

### 5.4 Migrations only (no refresh)

```bash
cd /var/www/tapeya/api
php artisan migrate:status | tail -40
php artisan migrate --force
```

**Expect:** the six `2026_09_23` / `2026_09_24` drama migrations. If anything unexpected is pending, **stop** and investigate.

### 5.5 Reels auto-engagement settings (tinker only if missing)

See section 3.B. Skip if `exists autoEngagementEnabled` / `exists reelsEngagementPerDay`.

### 5.6 Caches / workers

```bash
cd /var/www/tapeya/api
php artisan config:clear
php artisan config:cache
php artisan settings:clear-cache
php artisan schedule:list   # confirm posts:process-auto-engagement + posts:process-auto-comments

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

Ships: Drama serials / episodes CMS.

### 6.2 Consumer app (`tapeya.com`) — **required**

```bash
cd /var/www/tapeya/app
npm ci
npm run build:production
```

Ships: Dramas hub/player; Streaming tile gone (redirect `/live/streaming` → `/serials`).

### 6.3 Native stores

**Not required** for API/web. Installed iOS/Android binaries keep old Explore **Streaming** until a Capacitor release; that screen will **404** `live/my-streams`. Live hub / go-live keep working. Ship a store build when you want Dramas in the app.

---

## 7. Post-deploy smoke (must pass)

### Auto engagement / comments (after server revert + git pull)

- [ ] `git status` on API host clean at release SHA
- [ ] `schedule:list` shows `posts:process-auto-engagement` (15 min) and `posts:process-auto-comments` (hourly)
- [ ] No extra crontab for those two commands
- [ ] Reels settings: enabled flag + daily max still what you intend (tinker did not overwrite)
- [ ] Auto like **and** auto comment notify the post owner (in-app + push)
- [ ] Auto comments are sparse, generic (no batting/bowling), unique per post, dormant accounts only

### Dramas

- [ ] Admin: create serial + episode; episode plays on `/serials/...`
- [ ] Like / dislike / share / comments on episode
- [ ] Explore **Dramas** (not Streaming); `/live/streaming` redirects
- [ ] Live hub / Go Live still work

### Health

- [ ] API boots; `migrate:status` healthy
- [ ] Existing feed / quick match / shop unchanged
- [ ] Old app Streaming manager fails only on `my-streams` (expected until store update)

---

## 8. Rollback (no refresh)

1. Redeploy previous known-good git SHA on API / backoffice / app (`eed3f85` or your recorded pre-deploy SHA).
2. Restart workers + reload PHP-FPM; rebuild frontends from that SHA.
3. **Do not** re-apply the old **uncommitted** auto-engagement server patch unless you explicitly choose to; `eed3f85` git tree is the rollback target.
4. **Schema:** drama tables are additive and safe to leave if you roll code back. Prefer **not** `migrate:rollback`.
5. Clear caches:

```bash
php artisan config:clear && php artisan config:cache && php artisan settings:clear-cache
```

---

## 9. Common failure modes

| Symptom | Cause | Fix |
|---------|--------|-----|
| `git pull` refuses / conflict in `AutoEngagementService` | Local server patches not reverted | Complete section 5.1; never merge server copy with `2f36bb6` by hand |
| Double likes/comments every tick | Crontab **and** `schedule:run` both fire the command | Drop the extra crontab; keep Laravel schedule only |
| Auto comments never appear | Scheduler not running or engagement disabled | Confirm crontab `schedule:run`; Reels enabled = `1` |
| Owners get no push | Worker / `push-notifications` queue down | `supervisorctl` status; retry a real like vs auto like |
| Explore still says Streaming | Old consumer build or old store binary | Redeploy `app/` web; store apps need a new Capacitor build |
| `/live/my-streams` 404 | Expected — route removed | Use Live hub / go-live; Dramas for VOD |
| `migrate` tries to recreate old tables | Someone ran refresh | **Stop** — restore dump; this runbook forbids refresh |

---

## 10. Checklist summary (copy/paste)

```text
[ ] Record origin/main SHA (expect eed3f85) + release SHA (expect 2f36bb6)
[ ] Working tree clean on laptop; push develop
[ ] Merge develop → main; push main
[ ] DB backup (users / settings / migrations / posts)
[ ] Prod: git status + diff --stat  (save output)
[ ] Prod: git restore auto-engagement files (section 5.1) — tree CLEAN vs eed3f85
[ ] Prod: git pull main @ release SHA; status still clean
[ ] composer install --no-dev --optimize-autoloader
[ ] php artisan migrate --force  (expect six drama migrations)
[ ] tinker: autoEngagementEnabled / reelsEngagementPerDay only if missing
[ ] schedule:list (engagement 15m + comments hourly); no duplicate crontab
[ ] config:cache + settings:clear-cache
[ ] restart workers / reload php8.3-fpm
[ ] Build/deploy backoffice
[ ] Build/deploy consumer app
[ ] Smoke section 7 (revert+schedule, dramas, live hub)
```

---

## Related

- [DEPLOYMENT.md](./DEPLOYMENT.md) — build commands / nginx sketches
- [APP_REWRITE_ARCHITECTURE.md](./APP_REWRITE_ARCHITECTURE.md) — rewrite is local/`app-react` gitignored; not this release
- Prior vanity + last-active + players perf is already on `main` as of `eed3f85`
