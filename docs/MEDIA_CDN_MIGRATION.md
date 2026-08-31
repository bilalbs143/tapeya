# Media CDN migration — S3 → B2 + Cloudflare

**Status: production-ready read + write path (local/staging cut over).**

- **Writes:** `App\Support\Media\MediaDisk` → private B2 (`MEDIA_DISK=s3`, no object ACLs)
- **Reads:** Cloudflare Worker `infra/cdn-tapeya` on `cdn.tapeya.com` → signed B2 GETs + Workers Cache
- **Public URL base:** Admin `cdn_public_base_url` (empty → `https://cdn.tapeya.com`)

For **video/image delivery speed, ABR HLS, prefetch, immutable Cache-Control, and multi-layer caching**, see **[MEDIA_DELIVERY_AND_CACHE_PLAN.md](./MEDIA_DELIVERY_AND_CACHE_PLAN.md)** (planning doc).

One Backblaze B2 bucket (same object keys) + one Cloudflare public hostname.

**Production cutover** still needs Phase 4 (env + admin setting on prod, rclone delta if any objects remain on S3, soak). Do not decommission CloudFront/S3 until Phase 4 smoke passes on production.

---

## Object ownership & writes (required)

Buckets must use **Object Ownership = BucketOwnerEnforced** (ACLs disabled).

| Do | Don't |
|----|--------|
| `MediaDisk::storeUploaded()` / `MediaDisk::put()` | `storePublicly()`, `put(..., 'public')`, `visibility => public` |
| Public read via CDN / bucket policy | Per-object canned ACLs |
| `throw => true` on s3 disk (default) | Silent `false` returns (historically saved path `"0"`) |

Failed uploads raise `MediaWriteException` → API `UPLOAD_FAILED` (never persist a falsey path).

Config: `api/config/filesystems.php` (`s3`), boot: `MediaDisk::configureFilesystem()` + `MediaCdn::applyToFilesystemConfig()`.

---

## Phase 0 — Inventory

1. List current AWS S3 prefixes (expect `app/`, `reels/`, `users/`, `teams/`, shop, highlights, etc.):

```bash
aws s3 ls s3://OLD_BUCKET/ --recursive | awk '{print $4}' | awk -F/ '{print $1}' | sort | uniq -c | sort -rn
```

1. Confirm the CDN (`cdn.tapeya.com` or current) fronts that same bucket for `/app` + uploads.
2. Create B2 bucket + application key (read/write on that bucket).
3. Note B2 S3 endpoint + region (B2 → bucket → S3 Compatible API).

---

## Phase 1 — Key-preserving sync (rclone)

Configure two remotes (`s3src`, `b2dest`) then:

```bash
# Dry-run
rclone sync s3src:OLD_BUCKET b2dest:NEW_BUCKET --checksum --dry-run -v

# Full sync
rclone sync s3src:OLD_BUCKET b2dest:NEW_BUCKET --checksum --transfers 16 -v

# Spot-check
rclone ls b2dest:NEW_BUCKET/app/images/logos | head
rclone ls b2dest:NEW_BUCKET/reels | head
```

Rules: **same keys**, no rewrite. DB paths stay relative.

Before cutover, run a final delta sync.

---

## Phase 2 — Cloudflare Worker origin (private B2)

Private B2 buckets need a signing Worker (not a naked CNAME to B2). Repo path: `infra/cdn-tapeya` (Backblaze `cloudflare-b2` template).

1. Create a **read-only** B2 application key for the Worker (`cdn-tapeya-worker`).
2. Configure `infra/cdn-tapeya/wrangler.toml`: `BUCKET_NAME=tapeya`, `B2_ENDPOINT=s3.us-east-005.backblazeb2.com`, route `cdn.tapeya.com/*`.
3. `echo "<key>" | npx wrangler secret put B2_APPLICATION_KEY` then `npx wrangler deploy`.
4. Workers Cache is enabled in `wrangler.toml` (`[cache] enabled = true`, `cross_version_cache = false` so deploys that change headers take effect). TTL comes from response `Cache-Control` (B2 Bucket Info / `MediaDisk` object metadata). Zone Cache Rules do **not** apply to Workers Cache; after header-changing deploys, purge `cdn.tapeya.com` in Cloudflare if edges still serve stale responses.
5. Set B2 **Bucket Info** to `{"Cache-Control":"public, max-age=86400"}` (or longer / `immutable` for UUID keys) so Cloudflare can cache. The Worker also sets a 1-day fallback when upstream omits `Cache-Control`.
6. Clients must receive **Cloudflare** URLs only (`https://cdn.tapeya.com/...`) — never raw `*.backblazeb2.com` — so egress stays free via Bandwidth Alliance.

---

## Phase 3 — App env + setting (code already supports)

```env
MEDIA_DISK=s3
AWS_ACCESS_KEY_ID=...          # B2 key id
AWS_SECRET_ACCESS_KEY=...      # B2 application key
AWS_DEFAULT_REGION=...         # e.g. us-west-004
AWS_BUCKET=...
AWS_ENDPOINT=https://s3.<region>.backblazeb2.com
AWS_USE_PATH_STYLE_ENDPOINT=true
# Public CDN base is Admin cdn_public_base_url (empty → https://cdn.tapeya.com)
# Optional overrides (defaults are true):
# FILESYSTEM_S3_THROW=true
# FILESYSTEM_S3_REPORT=true
```

Admin → System Settings → **Media & CDN** → `cdn_public_base_url` = `https://cdn.tapeya.com` (no trailing slash).

Empty setting → `https://cdn.tapeya.com`.

After changing settings: `php artisan settings:clear-cache` and `php artisan config:clear`.

---

## Phase 4 — Cutover checklist

1. Final rclone delta sync S3 → B2.
2. Deploy API with B2 env; set `cdn_public_base_url`.
3. Smoke:
  - [ ] Upload avatar — URL host is CDN
  - [ ] Compose image post — image URL host is CDN; object exists; no path `"0"`
  - [ ] Upload reel — process + playback on CDN
  - [ ] Admin shop product image — CDN host
  - [ ] App icons/logos load from `{cdn}/app/images/...`
  - [ ] Failed upload (bad creds) returns `UPLOAD_FAILED`, no DB row with bad path
  - [ ] Old relative path still resolves on new CDN (same key)
4. Soak ~7 days with old S3 read-only; verify checksums.
5. Decommission AWS bucket / CloudFront.

### Rollback

Point `cdn_public_base_url` back to the prior CDN hostname and restore AWS credentials on `MEDIA_DISK=s3` (objects still on S3 until deleted).

---

## Code map

| Concern | Location |
|---------|----------|
| ACL-safe writes / deletes / URLs | `api/app/Support/Media/MediaDisk.php` |
| CDN base URL | `api/app/Support/Media/MediaCdn.php` |
| Compose images | `FeedController` → `MediaDisk::storeUploaded` |
| Admin / user media | `Admin\MediaController`, `User\UserMediaController` |
| Video put | `PostMultipartUploadService`, `PostPosterService`, `PostTranscodeService` |
| All public media URLs / deletes | Resources, shop, graphics, cleanup → `MediaDisk::url` / `delete` |
| Tests | `tests/Unit/Support/Media/MediaDiskTest.php` |
