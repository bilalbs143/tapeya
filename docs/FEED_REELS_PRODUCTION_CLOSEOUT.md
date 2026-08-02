# Feed & Reels — Production Closeout Checklist

**Created:** 2026-07-31
**Purpose:** Single checklist to decide if feed + reels can ship to production.
**Related:** [FEED_PRODUCTION_READINESS.md](./FEED_PRODUCTION_READINESS.md), [SOCIAL_FEED_ARCHITECTURE.md](./SOCIAL_FEED_ARCHITECTURE.md), [MEDIA_CDN_MIGRATION.md](./MEDIA_CDN_MIGRATION.md), [MEDIA_DELIVERY_AND_CACHE_PLAN.md](./MEDIA_DELIVERY_AND_CACHE_PLAN.md), [DEEP_LINKS.md](./DEEP_LINKS.md), [OFFICIAL_ACCOUNT_BADGE.md](./OFFICIAL_ACCOUNT_BADGE.md), [REELS_ARCHITECTURE.md](./REELS_ARCHITECTURE.md)

---

## Verdict (as of 2026-07-31)


| Level                          | Status                                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| **Product code (Modules A–G)** | Done — soft-launch capable                                                                         |
| **Production close**           | **Almost** — blocked by ops cutover, admin mixed-post moderation, deep-link OS association, and CI |


Use the sections below as a gate. Mark each item `[x]` when verified on **staging / production**.

---



## 0. How to use this doc

1. Work top-down: **Blockers first**, then smoke tests, then post-launch backlog.
2. Prefer evidence (staging URL, screenshot, log line, `supervisorctl status`) over “looks fine”.
3. When a blocker is closed, note date + who verified in the Working log at the bottom.
4. Soft launch is allowed when **§1–§5** are all checked. §6 can wait.

---



## 1. Blocker — Media CDN cutover (Phase 4)

**Source:** [MEDIA_CDN_MIGRATION.md](./MEDIA_CDN_MIGRATION.md) Phase 4
**Owner:** Ops + backend
**Why it blocks:** Without B2 + Cloudflare public URLs, playback/egress won’t match the locked design.

### Config

- [ ] Production `MEDIA_DISK=s3` (B2-compatible)
- [ ] `AWS_*` credentials / endpoint / bucket point at B2 (not leftover AWS-only)
- [ ] Admin → System Settings → **Media & CDN** → `cdn_public_base_url` = public CDN host (no trailing slash)
- [ ] `php artisan settings:clear-cache` + `php artisan config:clear` after change
- [ ] Clients never see raw `*.backblazeb2.com` download URLs



### Cutover smoke

- [ ] Final rclone delta sync (origin → B2) completed
- [ ] Upload avatar — URL host is CDN
- [ ] Compose image post — image URL host is CDN; object exists; path is not `"0"`
- [ ] Upload reel — process + playback URL on CDN
- [ ] Admin shop product image — CDN host
- [ ] App icons/logos load from `{cdn}/app/images/...`
- [ ] Failed upload (bad creds) returns `UPLOAD_FAILED`, no DB row with bad path
- [ ] Old relative path still resolves on new CDN (same key)



### Rollback known

- [ ] Documented: point `cdn_public_base_url` / `AWS_URL` back to previous CDN and restore prior credentials

---



## 2. Blocker — Cloudflare cache / edge

**Source:** [MEDIA_DELIVERY_AND_CACHE_PLAN.md](./MEDIA_DELIVERY_AND_CACHE_PLAN.md) Phase A
**Owner:** Ops
**Why it blocks:** Code sets object `Cache-Control`; without edge rules, viral reels stampede origin.

- [ ] Long-TTL / immutable rules for UUID-keyed processed media and `/app/images/*`
- [ ] Rules cover `video/*` and HLS segments (`.m3u8` / `.ts` or equivalent)
- [ ] Tiered Cache enabled (or equivalent)
- [ ] Confirm South Asia PoP coverage for primary users
- [ ] Spot-check `cf-cache-status: HIT` on a processed reel segment after first miss

---



## 3. Blocker — Queue workers + FFmpeg on production

**Source:** `supervisor/tapeya.conf`, `api/config/posts.php`, jobs under `api/app/Jobs/`
**Owner:** Ops + backend
**Why it blocks:** Without workers, video posts stay `processing` forever.

### Deploy supervisor

- [ ] Copy latest `supervisor/tapeya.conf` to `/etc/supervisor/conf.d/`
- [ ] `sudo supervisorctl reread && sudo supervisorctl update`
- [ ] Programs present and RUNNING:
  - [ ] `artisan-queue-reels-poster` (2 procs)
  - [ ] `artisan-queue-reels-transcode` (1 proc, timeout **1800**)
  - [ ] `artisan-queue-reels` (cleanup queue — **required**, was missing before)
  - [ ] `artisan-queue` (default)
  - [ ] `artisan-queue-push`
  - [ ] `artisan-scheduler`
  - [ ] `artisan-reverb` (if realtime required for this launch)



### Host tooling

- [ ] `ffmpeg` on PATH for worker user
- [ ] `ffprobe` on PATH for worker user
- [ ] Worker can write temp under `storage/app/tmp/`
- [ ] Worker can write to media disk (B2)



### Pipeline smoke (one reel)

- [ ] Upload → status becomes `processing`
- [ ] Poster appears (`ExtractPostPosterJob` / thumbnail URL)
- [ ] ABR completes (`ProcessPostVideoJob`) → status `ready` / `abr_complete`
- [ ] Playback URL plays from CDN (HLS or progressive)
- [ ] Cleanup job can delete original when eligible (`reels` queue)



### Known config notes (already in repo)


| Queue             | Workers | Timeout | Notes                                                           |
| ----------------- | ------- | ------- | --------------------------------------------------------------- |
| `reels-poster`    | 2       | 90s     | Fast thumbs                                                     |
| `reels-transcode` | 1       | 1800s   | Aligned with `posts.transcode_timeout_seconds`                  |
| `reels`           | 1       | 300s    | Cleanup originals / media snapshots                             |
| Jobs              | —       | —       | Poster/transcode/cleanup-original use `ShouldBeUnique` per post |


---



## 4. Blocker — Admin moderation for mixed posts

**Source:** Architecture admin notes; `api/app/Http/Resources/Admin/PostResource.php`
**Owner:** Backend + backoffice
**Why it blocks:** T&S cannot cleanly moderate text/image posts if UI/API only show video playback fields.

### Current gap (verify)

- [x] Routes renamed: `/admin/posts*`, `/admin/post-reports*` (backoffice `/content-management/posts*`)
- [x] `Admin\PostResource` includes `type`, `body`/`caption`, `media[]`, `cover_url`, `background_id`; video `playback` only for video
- [x] Backoffice list/dialog/reports labelled and structured as Posts



### Minimum for launch

- [x] Admin list/detail includes `type` (`text` / `image` / `video` / `repost`)
- [x] Image posts show image URL(s) / thumbnail in admin
- [x] Text posts show body (and background id if present)
- [x] Moderator can **hide / remove / reject** any type
- [x] Reports triage works for text + image + video (not video-only blind)
- [ ] Smoke: report a text post → resolve in admin → post gone from consumer feed



### Nice (not required for soft launch)

- [x] Rename admin routes/UI from `reels` → `posts`
- [ ] Spatie settings group rename `reels` → `posts`

---



## 5. Blocker — Deep links / Universal + App Links

**Source:** [DEEP_LINKS.md](./DEEP_LINKS.md), `app/src/lib/deepLinks/deepLinkRegistry.js`
**Owner:** Mobile + ops
**Why it blocks:** Shared HTTPS post links won’t auto-open the app until OS association is real.

### Already done in app code

- [x] Registry includes `/feed/{id}` and `/reels/{id}`
- [x] Share helpers build HTTPS + `tapeya://` paths
- [x] Soft `OpenInAppBanner` exists on reels player



### Still open



#### iOS

- [x] Replace `TEAMID` in `app/public/.well-known/apple-app-site-association` → `M7P9P5UTTZ`
- [x] nginx + Vite public: AASA served as JSON at `https://tapeya.com/.well-known/apple-app-site-association` *(deploy mobile web + reload nginx)*
- [x] Associated Domains include `applinks:tapeya.com`
- [x] Paths cover `/reels/*` **and** `/feed/`*
- [ ] Rebuild + ship native iOS build (entitlements + build 42 ready; Archive/TestFlight still manual)



#### Android

- [x] Put real Play App Signing SHA-256 in `app/public/.well-known/assetlinks.json`
- [x] nginx + Vite public: host at `https://tapeya.com/.well-known/assetlinks.json` *(deploy mobile web + reload nginx)*
- [x] HTTPS `pathPrefix` for `/feed` (+ `/reels`, `/live/go-live`) on `tapeya.com`; dropped `www`/`app` hosts that cannot serve assetlinks
- [x] Custom scheme `tapeya://feed` intent-filter
- [ ] Verify: `adb shell pm get-app-links com.tapbytapeya.app` *(needs device + live assetlinks + Play-signed install)*
- [ ] Rebuild + ship native Android build (versionCode 17 ready; Play upload still manual)



#### Soft fallback

- [x] Custom scheme `tapeya://feed/{id}` works when banner used (registry + `Info.plist` `tapeya`)

---



## 6. Blocker — Tests in CI + stale leftovers

**Source:** [FEED_PRODUCTION_READINESS.md](./FEED_PRODUCTION_READINESS.md) Module G gate
**Owner:** Backend / DevOps
**Why it blocks:** Regressions can ship without a Feature/Post CI job.

### CI

- [x] Workflow `[.github/workflows/post-checks.yml](../.github/workflows/post-checks.yml)` runs:

```bash
cd api
composer test:posts
# php artisan test tests/Feature/Post tests/Unit/Enums/Post tests/Unit/Jobs/ExtractPostPosterJobTest.php
```

- [x] Triggers on `pull_request` / `push` to `main`/`develop` when `api/**` changes *(first green run lands after this lands on the branch)*



### Stale / broken tests & mocks

- [x] Deleted `api/tests/Unit/Jobs/ExtractReelPosterJobTest.php` (imported deleted Reel classes)
- [x] Removed unused `app/src/pages/reels/reelsData.js` (no production imports)



### Local green before each release

```bash
cd api && php artisan test tests/Feature/Post
cd app && npm test -- --run src/store/api/__tests__/feedApi.test.js src/lib/utils/__tests__/postShareUtils.test.js
```



## Verified locally 2026-07-31: Post suite + unit Post/enum/poster green; feedApi + postShareUtils (12) green.



## 7. Soft-launch smoke (product)

Run on staging with real auth + CDN. All must pass before soft launch.

### Feed / Home

- [ ] `/home` shows hub + embedded feed
- [ ] Explore / Following / Saved tabs work
- [ ] Sticky feed chrome behaves while scrolling
- [ ] Load more / cursor pagination doesn’t duplicate posts
- [ ] Feed widgets appear (reels strip / shop / highlights / suggestions) without breaking scroll



### Compose

- [ ] Text post (+ short background) publishes and appears in feed
- [ ] Long text drops background correctly
- [ ] Image post (1+) publishes; WebP on CDN
- [ ] Video from compose → upload handoff → processing → ready
- [ ] Repost creates nested embed; visibility rules respected



### Engagement

- [ ] Like / unlike (card + detail + reels player stay in sync)
- [ ] Save / unsave
- [ ] Share bumps count when logged in
- [ ] Comment composer usable on `/feed/:id` (sticky above bottom nav after scroll)
- [ ] New top-level comment appears **newest-first** (after pinned)
- [ ] Reply nests under parent
- [ ] Report works for a post



### Reels player

- [ ] `/reels` vertical feed
- [ ] Open video from Home feed → reels player
- [ ] HLS / progressive playback
- [ ] Comments sheet
- [ ] Follow / unfollow creator



### Official badge

- [ ] Official user shows badge on post card, comments, profile surfaces
- [ ] Admin can toggle `is_official`



### Auth / visibility

- [ ] Followers-only post visible in Following for followers
- [ ] Same post hidden from strangers on show / explore
- [ ] Private posts owner-only

---



## 8. Already done (do not re-open unless regression)

Track these as **closed** unless something breaks in smoke.


| Area                               | Evidence / notes                                               |
| ---------------------------------- | -------------------------------------------------------------- |
| Modules A–G                        | [FEED_PRODUCTION_READINESS.md](./FEED_PRODUCTION_READINESS.md) |
| Unified `posts` spine              | Migrations + `Post*` models/services                           |
| Following visibility fix           | `Post::scopeFollowingFeed` / Feature test                      |
| `/posts/{id}/…` engagement aliases | `user.php` surface map + dual RTK cache                        |
| Image sync WebP encode             | `PostImageStorage` (no queue)                                  |
| Video jobs + unique locks          | `ExtractPostPosterJob`, `ProcessPostVideoJob`                  |
| Caption + comment mentions         | `PostMention*`, comment mention tables                         |
| Deep-link registry                 | `/feed/{id}`, `/reels/{id}`                                    |
| Permanent playback URLs            | `PostPlaybackUrlService` → `MediaDisk::url`                    |
| Dedicated `/feed` page removed     | `/feed` redirects Home; compose + detail kept                  |


---



## 9. Post-launch / non-blockers (backlog)

Do **not** block soft launch on these.

### Product

- [ ] Unified social profile `/u/:id` (today `/reels/u/:userId`)
- [ ] Notification event rename `reel_*` → `post_*` + template backfill
- [ ] Notification copy: “liked your reel” → post-type-aware wording
- [ ] Text background CMS (today FE constants + API enum)
- [ ] Richer quote-repost composer UI



### Ops / reliability

- [ ] Schedule `posts:resume-incomplete-abr` in `api/routes/console.php` (command exists; not scheduled)
- [ ] Implement `posts:reconcile-counters` if denormalized counters drift (documented historically; **not built**)
- [ ] RUM / TTFF instrumentation for reels
- [ ] Soak ~7 days then decommission old S3/CloudFront ([MEDIA_CDN_MIGRATION.md](./MEDIA_CDN_MIGRATION.md))



### Docs hygiene

- [ ] Mark [REELS_ARCHITECTURE.md](./REELS_ARCHITECTURE.md) clearly historical (already has warning; many sections still read greenfield)
- [ ] Update [SOCIAL_FEED_ARCHITECTURE.md](./SOCIAL_FEED_ARCHITECTURE.md): following-visibility bug = fixed; caption mentions = done; Modules F–G = Done
- [ ] Update Module H in readiness: caption mentions + `/feed` registry done; OS association still open

---



## 10. Soft-launch gate (summary)

Call feed + reels **production-ready for soft launch** when:

1. [ ] §1 CDN Phase 4 smoke green
2. [ ] §2 Cloudflare cache verified
3. [ ] §3 Workers + FFmpeg + one full reel pipeline green
4. [x] §4 Admin can moderate text + image + video *(API + backoffice shipped 2026-07-31; staging smoke still open)*
5. [ ] §5 Deep-link OS association — iOS config done (AASA + entitlements); deploy AASA + ship iOS build; Android still open
6. [x] §6 Feature/Post in CI + stale Reel job test / reelsData mock removed
7. [ ] §7 Product smoke checklist green on staging

**Not required for soft launch:** §9 backlog.

---



## 11. Suggested closeout order


| Step | Work                                                   | Section |
| ---- | ------------------------------------------------------ | ------- |
| 1    | Deploy supervisor + FFmpeg; smoke reel pipeline        | §3      |
| 2    | CDN Phase 4 + Cloudflare cache                         | §1–§2   |
| 3    | Admin mixed-post type + media in API/UI                | §4      |
| 4    | TEAMID / SHA-256 / `/feed` pathPrefix                  | §5      |
| 5    | CI Feature/Post + delete stale test                    | §6      |
| 6    | Full §7 smoke on staging                               | §7      |
| 7    | Soft launch                                            | —       |
| 8    | Schedule ABR resume; profile `/u`; notification rename | §9      |


---



## 12. Working log


| Date       | Item                       | Result                                                                                     | Who |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------ | --- |
| 2026-07-31 | Audit vs docs + codebase   | Closeout doc created; verdict = Almost                                                     | —   |
| 2026-07-31 | Supervisor queues hardened | poster/transcode timeouts aligned; `reels` cleanup worker added; unique jobs               | —   |
| 2026-07-31 | §4 Admin mixed posts       | Admin PostResource + backoffice Posts UI; Feature test added                               | —   |
| 2026-07-31 | Admin routes rename        | `/admin/posts*`, `/admin/post-reports*`; Angular folders/services renamed                  | —   |
| 2026-07-31 | §5 iOS Universal Links     | AASA Team ID `M7P9P5UTTZ`; `/feed/*`; entitlements; nginx JSON; banner on feed             | —   |
| 2026-07-31 | §5 Android App Links       | Manifest `/feed` + apex-only hosts; versionCode 17; waiting on Play signing SHA            | —   |
| 2026-07-31 | §6 Post CI + stale cleanup | `post-checks.yml` + `composer test:posts`; deleted ExtractReelPosterJobTest + reelsData.js | —   |


---



## 13. Quick command cheat sheet

```bash
# Workers
sudo supervisorctl status
sudo tail -f /var/www/tapeya/api/storage/logs/queue-reels-transcode.log

# API feed/reels tests
cd api && php artisan test tests/Feature/Post

# Resume stuck ABR (manual until scheduled)
cd api && php artisan posts:resume-incomplete-abr

# Settings after CDN change
cd api && php artisan settings:clear-cache && php artisan config:clear
```

