# Production deploy — B2 + Cloudflare CDN cutover

**Not just `git pull`.** The CDN Worker is already live on Cloudflare (`cdn.tapeya.com`). Production still needs env + admin settings + API/app deploy.

Worker redeploy is only needed when `infra/cdn-tapeya` changes — from a laptop with Wrangler auth:

```bash
cd infra/cdn-tapeya
npx wrangler deploy
```

---

## Already done (no prod server step)

- [x] Worker `cdn-tapeya` on route `cdn.tapeya.com/*`
- [x] B2 read-only Worker secret (`B2_APPLICATION_KEY`) set in Cloudflare
- [x] Workers Cache enabled; CORS + range support on CDN

---

## Pre-deploy

1. [ ] Commit & push this work (incl. `infra/cdn-tapeya`, HLS master cache fix, API/app changes).
2. [ ] **rclone sync AWS S3 → B2** (same keys) — see [S3 → B2 sync](#s3--b2-sync-rclone) below. Do this **before** flipping prod CDN URL.
3. [ ] Confirm FFmpeg on API host (`libwebp` for posters).
4. [ ] Confirm reel queues in Supervisor (`reels-poster`, `reels-transcode`, `reels`).

---

## S3 → B2 sync (rclone)

**Direction:** AWS S3 `tapeya` (`ap-south-1`, CloudFront origin) → Backblaze B2 `tapeya` (`us-east-005`).  
**Rule:** same object keys (no rewrite).  
**Size (approx):** ~1.1 GiB / ~1.6k objects → full sync usually **5–15 minutes** (`--transfers 16`); slow link up to ~30 minutes.

### Install rclone (Linux server)

```bash
# Official install script (gets latest stable)
curl -fsSL https://rclone.org/install.sh | sudo bash

# Or via package manager (version may be older):
# sudo apt-get update && sudo apt-get install -y rclone   # Debian/Ubuntu
# sudo dnf install -y rclone                             # Fedora/RHEL

rclone version
```

### IAM on AWS user (required)

Must include **`s3:ListBucket`** on the bucket ARN (object-only policy is not enough for rclone):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::tapeya"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::tapeya/*"
    }
  ]
}
```

For sync-from-S3 only, `GetObject` + `ListBucket` is enough on the AWS side. B2 write key needs list/read/write on bucket `tapeya`.

### rclone config

Create a local config file (do **not** commit secrets), e.g. `/tmp/tapeya-rclone.conf`:

```ini
[s3src]
type = s3
provider = AWS
access_key_id = <AWS_ACCESS_KEY_ID>
secret_access_key = <AWS_SECRET_ACCESS_KEY>
region = ap-south-1

[b2dest]
type = s3
provider = Other
access_key_id = <B2_KEY_ID>
secret_access_key = <B2_APPLICATION_KEY>
endpoint = s3.us-east-005.backblazeb2.com
region = us-east-005
force_path_style = true
```

Put real values only in `/tmp/tapeya-rclone.conf` on the server (never commit that file).

```bash
export RCLONE_CONFIG=/tmp/tapeya-rclone.conf
chmod 600 "$RCLONE_CONFIG"
```

### Steps

```bash
# 1) Sanity — list source
rclone lsd s3src:tapeya
rclone size s3src:tapeya

# 2) Dry-run full sync
rclone sync s3src:tapeya b2dest:tapeya --checksum --dry-run -v

# 3) Optional — copy 2–3 files for real, then check CDN
rclone copyto s3src:tapeya/path/to/file.jpg b2dest:tapeya/path/to/file.jpg --no-traverse
curl -I "https://cdn.tapeya.com/path/to/file.jpg"   # expect 200

# 4) Full sync
rclone sync s3src:tapeya b2dest:tapeya --checksum --transfers 16 -v

# 5) Spot-check
rclone size b2dest:tapeya
curl -I "https://cdn.tapeya.com/<known-key>"
```

`sync` makes B2 match S3 (same keys). Re-run later for a **delta** before final cutover.

---

## Deploy order

### 1. API

```bash
cd /var/www/tapeya/api   # adjust path
git fetch && git checkout <release-ref>   # or: git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force               # if any pending
php artisan settings:clear-cache
php artisan config:clear
php artisan config:cache
# optional:
# php artisan route:cache
```

### 2. Env (API `.env`) — B2 write key + CDN host

Use the **read/write** B2 application key for Laravel (not the Worker read-only key).

```env
MEDIA_DISK=s3
AWS_ACCESS_KEY_ID=...          # B2 write key id
AWS_SECRET_ACCESS_KEY=...      # B2 write application key
AWS_DEFAULT_REGION=us-east-005
AWS_BUCKET=tapeya
AWS_ENDPOINT=https://s3.us-east-005.backblazeb2.com
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_URL=https://cdn.tapeya.com
```

Then:

```bash
php artisan config:clear
php artisan settings:clear-cache
php artisan config:cache
```

### 3. Admin setting

Admin → **System Settings** → **Media & CDN** → `cdn_public_base_url` = `https://cdn.tapeya.com` (no trailing slash).

```bash
php artisan settings:clear-cache
php artisan config:clear
```

Empty setting falls back to `AWS_URL`. Admin setting overrides `AWS_URL` at boot.

### 4. Queue workers (if supervisor config changed)

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
```

Must be up: `default`, `push-notifications`, `reels-poster`, `reels-transcode`, `reels`.

### 5. App / backoffice (if shipping frontend changes)

```bash
cd /var/www/tapeya/app
npm ci && npm run build
# deploy dist/

cd /var/www/tapeya/backoffice
npm ci && npm run build
# deploy dist/
```

---

## Post-deploy smoke

- [ ] Media URL host is `cdn.tapeya.com` (not raw B2, not CloudFront)
- [ ] `curl -I https://cdn.tapeya.com/<known-object-key>` → **200**
- [ ] Upload avatar / image post → CDN host on URL; object loads
- [ ] Upload reel → poster → processing finishes → HLS plays from CDN
- [ ] `supervisorctl status` — reel queues UP
- [ ] Failed upload (bad creds) → `UPLOAD_FAILED`, no bad DB path

---

## Rollback

1. Point `cdn_public_base_url` / `AWS_URL` back to CloudFront.
2. Restore previous AWS/S3 credentials on `MEDIA_DISK=s3` (objects still on S3 until deleted).
3. `php artisan settings:clear-cache && php artisan config:clear && php artisan config:cache`

---

## Related docs

- [MEDIA_CDN_MIGRATION.md](./MEDIA_CDN_MIGRATION.md) — B2 + Worker phases, rclone, cutover
- [MEDIA_DELIVERY_AND_CACHE_PLAN.md](./MEDIA_DELIVERY_AND_CACHE_PLAN.md) — delivery / cache planning
- [FEED_REELS_PRODUCTION_CLOSEOUT.md](./FEED_REELS_PRODUCTION_CLOSEOUT.md) — full feed/reels gate checklist
