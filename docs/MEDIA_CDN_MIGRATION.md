# Media CDN migration — S3 → B2 + Cloudflare

**Status: production-ready write path** — all media uploads go through `App\Support\Media\MediaDisk` (no object ACLs). Public URLs use CDN via `MediaCdn` + `MEDIA_DISK=s3`.

For **video/image delivery speed, ABR HLS, prefetch, immutable Cache-Control, and multi-layer caching**, see **[MEDIA_DELIVERY_AND_CACHE_PLAN.md](./MEDIA_DELIVERY_AND_CACHE_PLAN.md)** (planning doc).

One Backblaze B2 bucket (same object keys) + one Cloudflare public hostname.
Admin setting `cdn_public_base_url` drives public URLs for uploaded media and static `/app` assets.

Do **not** flip production origin (B2 cutover) until Phase 4. Local/staging may already use `MEDIA_DISK=s3` against AWS + CloudFront.

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

1. Confirm CloudFront (`d1nmw2vhka3zp0.cloudfront.net` or current) fronts that same bucket for `/app` + uploads.
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

## Phase 2 — Cloudflare origin

1. Add a custom hostname (e.g. `cdn.tapeya.com`) whose origin is the B2 bucket (friendly URL / Cloudflare proxy as per your CF↔B2 setup).
2. Cache rules:
  - Long TTL / immutable for UUID-keyed processed media and `/app/images/*`
  - Respect `video/*` and HLS segments
3. Clients must receive **Cloudflare** URLs only (never raw `*.backblazeb2.com` download URLs) so egress stays free via Bandwidth Alliance.

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
AWS_URL=https://cdn.tapeya.com  # fallback when setting empty
# Optional overrides (defaults are true):
# FILESYSTEM_S3_THROW=true
# FILESYSTEM_S3_REPORT=true
```

Admin → System Settings → **Media & CDN** → `cdn_public_base_url` = `https://cdn.tapeya.com` (no trailing slash).

Empty setting → falls back to `AWS_URL`.

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

Point `cdn_public_base_url` / `AWS_URL` back to CloudFront and restore AWS credentials on `MEDIA_DISK=s3` (objects still on S3 until deleted).

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
