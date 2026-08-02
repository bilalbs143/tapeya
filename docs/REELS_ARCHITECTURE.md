# Reels Module — Architecture & Technical Design

> **⚠️ Status update (2026-07-27):** The Reels **backend and app are implemented** in this repo (not greenfield).
> This document began as pre-build R&D and parts are **stale** (phases, “backend not built,” some queue notes).
> For the **unified social feed / posts spine** decision and migration plan, see
> **[SOCIAL_FEED_ARCHITECTURE.md](./SOCIAL_FEED_ARCHITECTURE.md)** (source of truth for content-model direction).
> Use this file for historical codec/pipeline R&D context; reconcile or rewrite after the posts cutover.
>
> Aligns with: `docs/API.md`, `docs/APP_CODING_STYLE.md`, `docs/Coding guidelines.md`,
> Highlights module, Sanctum auth, existing `user_follows`.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State & Gaps](#2-current-state--gaps)
3. [Design Principles](#3-design-principles)
4. [System Architecture](#4-system-architecture)
5. [End-to-End Workflows](#5-end-to-end-workflows)
6. [Video Processing Pipeline (R&D)](#6-video-processing-pipeline-rd)
7. [Compression & Codec Strategy](#7-compression--codec-strategy)
8. [Database Design](#8-database-design)
9. [API Design](#9-api-design)
10. [Queue & Worker Architecture](#10-queue--worker-architecture)
11. [View Tracking](#11-view-tracking)
12. [Feed, Ranking & Caching](#12-feed-ranking--caching)
13. [Frontend Architecture](#13-frontend-architecture)
14. [UI/UX Workflow](#14-uiux-workflow)
15. [Security, Moderation & Rate Limits](#15-security-moderation--rate-limits)
16. [Performance & Scalability](#16-performance--scalability)
17. [Error Handling & Edge Cases](#17-error-handling--edge-cases)
18. [Testing Strategy](#18-testing-strategy)
19. [Implementation Phases](#19-implementation-phases)
20. [Future Enhancements](#20-future-enhancements)
21. [Open Questions & Risks](#21-open-questions--risks)
22. [Appendix](#22-appendix)

---

## 1. Executive Summary

Tapeya Reels is a **user-generated short-video** product: vertical full-screen feed, upload, social interactions (like, comment, follow, share, save, report), accurate view counting, and a **non-blocking video processing pipeline**.

### Product vs Highlights

| Concern | Highlights (existing) | Reels (new) |
|---------|----------------------|-------------|
| Ownership | CMS / admin | Authenticated end users |
| Source | YouTube URL or admin upload | Always user upload |
| Social | Like / dislike / share | Like, comment threads, follow, save, report |
| Feed | Catalog list | Infinite vertical snap feed + following feed |
| Processing | Store-as-is | Background transcode → adaptive / progressive MP4 |

Reels **reuses** Tapeya patterns: Sanctum `auth:api`, response envelope (`success` + `type`), Spatie Query Builder, `MediaRegistry` deferred uploads, denormalized counters, `user_follows`, RTK Query, Laravel queues + Supervisor.

**Storage / CDN (decided):** **Backblaze B2** + **Cloudflare** for all Reels media playback (§16.1).

### Non-negotiable UX rule

> Users must never wait for compression. Upload → immediate `processing` reel → optional original progressive playback → swap to optimized assets when `ready`.

---

## 2. Current State & Gaps

### What exists today (frontend only)

| Path | Role |
|------|------|
| `app/src/pages/reels/Reels.jsx` | Explore / My Videos tabs, vertical snap scroll |
| `app/src/pages/reels/ReelItem.jsx` | `<video>`, play/pause, scrub, like (local), share stub |
| `app/src/pages/reels/UploadReels.jsx` | File pick → caption → publish to Redux only |
| `app/src/pages/reels/reelsData.js` | ~~Hardcoded Pexels URLs~~ **Removed** (2026-07-31) |
| `app/src/store/slices/reelsSlice.js` | Local `publishedReels`; marked API-ready |
| Routes | `/reels`, `/reels/upload` (lazy, authenticated layout) |

**Problems in current prototype (must fix during implementation):**

- Publish stores **data URLs** in Redux + `redux-persist` → localStorage bloat / crash risk.
- Likes are a local `Set`; no server persistence.
- Share / comment / follow / views / report unwired.
- Explore nav entry for Reels is **commented out** in `navigation.js`.
- No backend models, routes, migrations, or jobs.

### Closest backend templates to mirror

1. **Highlights** — video metadata + denormalized counters + `highlight_user_reactions`.
2. **MediaRegistry** — create record → `POST /api/v1/media/{type}/{id}/{field}`.
3. **User follows** — `user_follows` + `users.followers_count` (already “user-only”; ready for reels creators).
4. **Jobs** — `ShouldQueue`, `$tries`, backoff, dedicated queues (e.g. `push-notifications`).
5. **Activity Feed UI stub** — threaded comment UX reference (not a backend).

---

## 3. Design Principles

| Principle | Decision | Reason |
|-----------|----------|--------|
| **Fast publish** | Original stored immediately; status `processing` | Matches TikTok / Reels / Shorts UX |
| **Progressive then adaptive** | Serve original MP4 first; swap to HLS/ABR when ready | Zero wait; quality upgrades silently |
| **Ownership-first** | Every reel has `user_id`; media uploads ownership-checked | Unlike Highlights CMS |
| **Denormalized counters** | `likes_count`, `comments_count`, `views_count`, etc. on `reels` | Feed reads stay cheap |
| **Idempotent interactions** | Unique `(reel_id, user_id)` for likes/saves/views | Prevents inflation & race bugs |
| **Service-layer logic** | Controllers thin; `ReelService`, `ReelViewService`, `ReelTranscodeService` | Matches LiveChat / graphics patterns |
| **Extend, don’t fork upload** | Add `reel` to `MediaRegistry` | One upload path for B2 via S3-compatible disk |
| **Queue isolation** | Dedicated `reels` / `reels-poster` / `reels-transcode` queues | Poster stays fast; heavy FFmpeg must not starve push/default |
| **Soft visibility, hard delete later** | `status` + `deleted_at` optional | Moderation without losing forensics |
| **Config over magic** | `config/reels.php` for duration, size, view thresholds | Ops-tunable without redeploy |

---

## 4. System Architecture

### 4.1 High-level diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         Tapeya App (React + Capacitor)                   │
│  Reels feed │ Upload │ Comments sheet │ Profile reels │ RTK Query        │
└─────────────┬──────────────────────────────┬─────────────────────────────┘
              │ HTTPS / Sanctum              │ CDN video (Cloudflare → B2)
              ▼                              ▼
┌─────────────────────────────┐    ┌──────────────────────────────────────┐
│ Laravel API (api/)          │    │ Backblaze B2 (media_disk / S3 API)   │
│  ReelController             │    │  reels/original/{id}/...             │
│  ReelInteractionController  │    │  reels/processed/{id}/hls/…          │
│  MediaController + Registry │    │  reels/thumbs/{id}/…                 │
│  ReelService / ViewService  │    └──────────────────────────────────────┘
│  Jobs → queue:reels-*       │                    ▲
└──────────────┬──────────────┘                    │ write outputs
               │                                   │
               ▼                                   │
┌─────────────────────────────┐    ┌───────────────┴──────────────────────┐
│ Queue workers (Supervisor)  │───▶│ Transcode workers (FFmpeg / cloud)   │
│  ProcessReelJob             │    │  H.264/H.265 ladder + thumbs + poster│
│  GenerateReelThumbnailsJob  │    └──────────────────────────────────────┘
│  CleanupReelOriginalJob     │
└─────────────────────────────┘
               │
               ▼
┌─────────────────────────────┐
│ PostgreSQL                  │
│  reels + social tables      │
│  jobs / failed_jobs         │
└─────────────────────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Redis (recommended)         │
│  feed cursors, view dedup,  │
│  rate limits, hot counters  │
└─────────────────────────────┘
```

### 4.2 Code layout (aligned with Tapeya)

**Backend**

```
api/app/
  Enums/Reel/
    ReelStatusEnum.php
    ReelVisibilityEnum.php
    ReelReportReasonEnum.php
    ReelShareChannelEnum.php
  Models/
    Reel.php
    ReelLike.php
    ReelComment.php
    ReelView.php
    ReelSave.php
    ReelShare.php
    ReelReport.php
    ReelHashtag.php
    ReelMention.php
    ReelProcessingJob.php   # optional audit row
    Hashtag.php
  Services/Reel/
    ReelService.php
    ReelFeedService.php
    ReelViewService.php
    ReelPosterService.php
    ReelTranscodeService.php
    ReelModerationService.php
    ReelHashtagParser.php
  Jobs/
    ExtractReelPosterJob.php
    ProcessReelVideoJob.php
    CleanupReelOriginalJob.php
    CleanupReelMediaJob.php
  Http/Controllers/User/
    ReelController.php
    ReelCommentController.php
    ReelInteractionController.php
    ReelFeedController.php
    ReelReportController.php
  Http/Requests/User/Reel/...
  Http/Resources/User/Reel/...
config/reels.php
```

**Frontend**

```
app/src/
  pages/reels/          # keep UI; wire to API
  store/api/reelsApi.js # RTK Query injectEndpoints
  features/reels/       # hooks: useReelPlayer, useViewTracker, usePrefetch
  components/reels/     # CommentSheet, ShareSheet, ReportSheet
```

**Do not** persist video blobs in `reelsSlice` / redux-persist. Slice becomes UI-only (active tab, draft caption) or is removed once RTK Query owns server state.

---

## 5. End-to-End Workflows

### 5.1 Upload & publish (happy path)

```
1. Client validates locally
   - mime: video/mp4 | video/webm | video/quicktime
   - size ≤ max (default 100 MB, same order as highlights)
   - duration ≤ max (default 90s; probe via HTMLVideoElement or MediaInfo)
2. POST /api/v1/reels  { caption, visibility?, client_duration? }
   → creates reel status=uploading, returns { id }
3. POST /api/v1/media/reel/{id}/original  (multipart)
   → stores on media_disk under reels/original/{id}/...
   → reel.status = processing
   → dispatch ExtractReelPosterJob (reels-poster) + ProcessReelVideoJob (reels-transcode)
4. API returns CREATED + playback_url pointing at original
5. Client navigates to My Videos / feed; shows “Processing…” badge
6. Poster worker: 1-frame JPG → thumbnail_path → Echo refresh (grids show poster early)
7. Transcode worker: probe → 720p MP4 (+ optional HLS); skip poster if already set
8. Worker: status=ready, clear processing_error; Echo again
9. Client invalidates Reel tags / polls until ready; swaps src if needed
```

**Why this matches industry practice:** TikTok / IG / Shorts accept the upload, show the post immediately (often with local preview), and finish CDN packaging asynchronously. Waiting on encode is a product failure mode.

### 5.2 Feed playback

```
1. GET /api/v1/reels/feed?cursor=...&per_page=10
2. Mount vertical snap list; only active index autoplays (muted policy: unmuted after gesture)
3. Prefetch next reel’s video (link rel / HLS levels / Range requests)
4. On ≥ view threshold → POST /api/v1/reels/{id}/views (idempotent)
5. Interactions optimistic on UI; confirm via API; rollback on failure
```

### 5.3 Delete

```
1. DELETE /api/v1/reels/{id} (owner or admin)
2. Soft-hide immediately (status=removed or soft delete)
3. Queue CleanupReelMediaJob → delete B2 keys (original + processed)
4. Cascade: likes/comments/saves via FK cascade or deferred cleanup
```

---

## 6. Video Processing Pipeline (R&D)

### 6.1 Industry approaches

| Platform pattern | Approach | Takeaway for Tapeya |
|------------------|----------|---------------------|
| **TikTok** | Upload → ingest → multi-bitrate HLS/DASH + CDN; heavy ML for feed | Async ingest; never block client |
| **Instagram Reels** | Similar async packaging; progressive fallback | Keep progressive MP4 for simple clients |
| **YouTube Shorts** | Full YouTube transcode farm; ABR | Overkill at day one; adopt cloud encoder later |
| **Mux / Cloudflare Stream / AWS MediaConvert** | Managed encode + HLS + signed URLs | Best ROI when volume grows |
| **Self-hosted FFmpeg** | Full control, ops cost | Best for MVP on current Laravel+Supervisor stack |

### 6.2 Recommended architecture (phased)

#### Phase A — MVP (self-hosted FFmpeg on queue workers)

1. Store **original** immutably.
2. Produce:
   - One **primary progressive MP4** (H.264 + AAC, ~720p, faststart).
   - Poster frame + 1–3 thumbnails.
3. Optionally produce a second ladder rung (480p) as progressive files.
4. Serve via **Cloudflare CDN** in front of **Backblaze B2** (`media_disk` + public CDN URL). See [§16.1](#161-object-storage--cdn--backblaze-b2--cloudflare).
5. Keep original until retention policy (e.g. 7–30 days) then delete if `ready`.

**Pros:** Fits current stack (`QUEUE_CONNECTION=database`, Supervisor); B2 is S3-compatible with Laravel’s `s3` disk.  
**Cons:** CPU-bound; scale workers carefully; no true ABR until Phase B.

#### Phase B — Adaptive streaming (HLS)

When traffic / mobile bitrate diversity matters:

1. FFmpeg (or MediaConvert) outputs HLS:
   - `master.m3u8` + variant playlists
   - Segments (fMP4 or TS), 2–6s
2. Ladder example: 360p / 540p / 720p (1080p only if source warrants).
3. Frontend already has **`hls.js`** (`HlsStreamPlayer`) — reuse adapter pattern for VOD reels.
4. Fallback: progressive MP4 for environments where HLS is awkward.

#### Phase C — Managed encoding

Offload to **AWS MediaConvert**, **Cloudflare Stream**, or **Mux**:

- Job submits object-storage input (or sync to encoder bucket) → webhook / poll → store playback URLs on B2.
- Workers become thin orchestrators (no FFmpeg on app boxes).
- Better for millions of videos / multi-region.

**Recommendation:** Ship Phase A with schema fields ready for HLS (`hls_master_path`, `playback_variants` JSON). Migrate to B/C without rewriting product APIs.

### 6.3 Better than “wait for compression”?

Yes — the recommended flow **is** the industry standard. Improvements beyond the user’s sketch:

| Improvement | Detail |
|-------------|--------|
| **Client-side preview** | Keep `URL.createObjectURL` for instant preview; upload in background |
| **Chunked / multipart upload** | For large files / flaky mobile (B2 S3-compatible multipart or tus) — Phase B+ |
| **Instant publish from local blob** | Optimistic UI while network upload finishes |
| **Playable original** | `status=processing` still has `original_path` playable |
| **Silent quality swap** | When `ready`, update `src` at next loop boundary if buffer allows |
| **Separate thumbnail job** | Failures don’t block primary encode |
| **Dead-letter + retry** | `failed_jobs` + admin redrive |

### 6.4 FFmpeg toolchain

- Install `ffmpeg` + `ffprobe` on worker hosts (not on web-only containers if split).
- Wrap in `ReelTranscodeService` (never shell from controllers).
- Prefer `symfony/process` with timeouts and argument arrays (no string interpolation → injection).
- Hardware acceleration (optional later):
  - macOS/dev: VideoToolbox
  - AWS GPU/CPU: NVENC / QSV when available
  - Default software `libx264` for portability

### 6.5 Processing job state machine

```
uploading → processing → ready
                │
                ├→ failed (retryable)
                └→ failed_permanent (after max tries) → notify user
```

Optional table `reel_processing_jobs` for progress UI:

| Field | Purpose |
|-------|---------|
| `reel_id` | Owner |
| `stage` | `queued`, `probing`, `transcoding`, `thumbnails`, `uploading_outputs`, `finalizing` |
| `progress_pct` | 0–100 (best-effort from FFmpeg `-progress`) |
| `attempts` | Mirrors queue tries |
| `error_message` | Safe user/ops message |
| `started_at` / `finished_at` | SLA metrics |

---

## 7. Compression & Codec Strategy

### 7.1 Codecs

| Codec | Role | Recommendation |
|-------|------|----------------|
| **H.264 (AVC)** | Universal playback (iOS/Android/web) | **Primary** for MVP progressive + HLS |
| **AAC-LC** | Audio | Stereo, 128–160 kbps |
| **H.265 (HEVC)** | ~30–50% smaller | Optional secondary; check device support |
| **AV1** | Best compression | Future; encode cost high for MVP |
| **VP9** | WebM | Only if accepting WebM delivery; stick to MP4 container for simplicity |

**MVP deliverable:** `mp4` + `yuv420p` + `aac` + `-movflags +faststart` (moov atom at front for streaming).

### 7.2 Suggested encode presets (starting point)

Tune via `config/reels.php`; validate on real cricket content (motion, jerseys, text overlays).

**720p primary (progressive / HLS mid rung)**

```
-c:v libx264 -preset medium -profile:v main -level 4.0
-crf 23 -maxrate 2500k -bufsize 5000k
-vf "scale=-2:720:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2"
-c:a aac -b:a 128k -ac 2 -ar 48000
-movflags +faststart
```

**480p ladder**

```
-crf 24 -maxrate 1200k -bufsize 2400k -vf scale=-2:480...
```

**Thumbnails / poster**

```
ffprobe → duration
ffmpeg -ss <10% or 1s> -frames:v 1 -q:v 2 poster.jpg
optional: sprite sheet for scrubbing later
```

### 7.3 Quality vs size guidelines

- Prefer **CRF + capped bitrate** (VBV) over fixed CBR for UGC.
- Cap resolution to **1080×1920** (portrait); downscale larger phone videos.
- Strip exotic metadata; keep rotation via `-metadata:s:v:0 rotate=0` after transpose filter if needed.
- Target: **~1–3 MB per 15s** at 720p for typical UGC (measure; don’t guess in prod SLOs).

### 7.4 Constraints (product)

| Constraint | Default | Notes |
|------------|---------|-------|
| Max duration | **90 seconds** | Align with Shorts/Reels norms; config |
| Min duration | **1–3 seconds** | Avoid empty spam |
| Max upload size | **100 MB** | Matches Highlights `max:102400` |
| Aspect | Prefer 9:16; accept others with letterbox/pillarbox | Document UX |
| Formats in | MP4, MOV, WebM | Same as Highlights mimetypes |
| Formats out | MP4 (progressive); HLS later | |

### 7.5 Metadata extraction (`ffprobe`)

Store on reel:

- `duration_ms`, `width`, `height`, `fps`, `original_codec`, `original_bitrate`, `file_size_bytes`, `orientation`

Used for validation, analytics, and feed ranking features later.

---

## 8. Database Design

### 8.1 Conventions (Tapeya)

- Auto-increment `id()` PKs (not UUIDs for domain tables).
- Denormalized counters on parent rows.
- Unique composites for interaction pivots.
- FKs `cascadeOnDelete` for child interaction rows.
- Soft deletes: optional on `reels` (users already soft-delete).
- Enums as string columns + PHP enums under `App\Enums\Reel\`.

### 8.2 ER overview

```
users 1──* reels
reels 1──* reel_likes
reels 1──* reel_comments 1──* reel_comments (parent_id self)
reels 1──* reel_views
reels 1──* reel_saves
reels 1──* reel_shares
reels 1──* reel_reports
reels *──* hashtags (via reel_hashtag)
reels 1──* reel_mentions
reels 1──* reel_processing_jobs (optional)
users *──* users (user_follows — existing)
```

### 8.3 Tables

#### `reels`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint PK | |
| `user_id` | FK → users | Owner / creator |
| `caption` | text nullable | Parsed for # and @ |
| `status` | string | `uploading`, `processing`, `ready`, `failed`, `rejected`, `removed` |
| `visibility` | string | `public`, `followers`, `private` |
| `original_path` | string nullable | Raw upload |
| `processed_path` | string nullable | Primary progressive MP4 |
| `hls_master_path` | string nullable | Phase B |
| `playback_variants` | json nullable | `[{quality, path, width, height, bitrate}]` |
| `thumbnail_path` | string nullable | Poster |
| `preview_path` | string nullable | Optional low-res / animated webp later |
| `duration_ms` | unsigned int nullable | |
| `width` / `height` | unsigned int nullable | |
| `file_size_bytes` | unsigned bigint nullable | Original or processed |
| `likes_count` | unsigned bigint default 0 | |
| `comments_count` | unsigned bigint default 0 | |
| `views_count` | unsigned bigint default 0 | |
| `saves_count` | unsigned bigint default 0 | |
| `shares_count` | unsigned bigint default 0 | |
| `reports_count` | unsigned int default 0 | Moderation signal |
| `processing_error` | text nullable | |
| `ready_at` | timestamp nullable | |
| `published_at` | timestamp nullable | When first became visible |
| `deleted_at` | timestamp nullable | SoftDeletes |
| `timestamps` | | |

**Indexes**

```
(user_id, status, published_at)
(status, published_at)          -- explore feed
(visibility, status, published_at)
(likes_count)                   -- trending helper
(views_count)
```

#### `reel_likes`

| Column | Type |
|--------|------|
| `id` | PK |
| `reel_id` | FK cascade |
| `user_id` | FK cascade |
| `timestamps` | |

Unique `(reel_id, user_id)`. Index `user_id`.

> Prefer dedicated likes table over Highlights’ reaction enum unless dislike is required. Reels UX is like-only.

#### `reel_comments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | PK | |
| `reel_id` | FK cascade | |
| `user_id` | FK cascade | |
| `parent_id` | FK → reel_comments nullable | Null = top-level; set = reply |
| `body` | text | Max length validated (e.g. 500) |
| `likes_count` | unsigned int default 0 | Optional Phase 2 |
| `is_pinned` | boolean default false | Creator pin |
| `deleted_at` | nullable | Soft delete for threads |
| `timestamps` | | |

Indexes: `(reel_id, parent_id, created_at)`, `(user_id)`.

**Thread depth:** enforce **one level of replies** in API (parent must be top-level). Simpler UX; avoids deep trees.

#### `reel_views`

Accurate, de-duplicated view log (see §11).

| Column | Type | Notes |
|--------|------|-------|
| `id` | PK | |
| `reel_id` | FK cascade | |
| `user_id` | FK nullable | Null for anonymous (if allowed) |
| `viewer_key` | string(64) | Hash of user_id **or** anonymized device/session |
| `watched_ms` | unsigned int | |
| `completion_rate` | decimal(5,2) nullable | |
| `counted` | boolean | Whether it incremented `views_count` |
| `ip_hash` | string(64) nullable | Privacy-preserving |
| `user_agent_hash` | string(64) nullable | Bot heuristics |
| `created_at` | timestamp | No updated_at needed |

**Unique for counting window:**  
`unique (reel_id, viewer_key)` for “one counted view per viewer lifetime” **or**  
`unique (reel_id, viewer_key, view_day)` if daily re-counts allowed.

**Recommendation (MVP):** one counted view per `(reel_id, viewer_key)` lifetime; still insert/update watch metrics.

Partition / archive strategy later when row volume explodes (monthly partitions or rollups).

#### `reel_saves` (bookmarks)

Same shape as likes: `(reel_id, user_id)` unique + counters on `reels` and optionally `users.saved_reels_count` (skip user counter initially).

#### `reel_shares`

| Column | Type |
|--------|------|
| `id` | PK |
| `reel_id` | FK |
| `user_id` | FK nullable |
| `channel` | string | `copy_link`, `whatsapp`, `system_share`, … |
| `created_at` | |

Not unique — multiple shares OK; throttle at API. Increment `shares_count` per event (with rate limit).

#### `reel_reports`

| Column | Type |
|--------|------|
| `id` | PK |
| `reel_id` | FK |
| `reporter_id` | FK users |
| `reason` | string enum |
| `details` | text nullable |
| `status` | `open`, `reviewed`, `actioned`, `dismissed` |
| `timestamps` | |

Unique `(reel_id, reporter_id)` to prevent spam reports.

#### `hashtags` + `reel_hashtag`

```
hashtags: id, name (unique, lowercase), reels_count, timestamps
reel_hashtag: id, reel_id, hashtag_id, unique(reel_id, hashtag_id)
```

#### `reel_mentions`

```
id, reel_id, mentioned_user_id, positions json nullable, timestamps
unique(reel_id, mentioned_user_id)
```

#### `reel_processing_jobs` (optional but recommended)

See §6.5. Useful for support and progress UI; can be replaced by job payload + Redis progress keys.

### 8.4 Existing tables — no duplicate follows

Use **`user_follows`** as-is (`follower_id`, `followed_user_id`).  
Optionally add `users.reels_count` denormalized, updated on publish/delete.

### 8.5 Counter update strategy

Inside DB transactions:

```php
DB::transaction(function () {
    ReelLike::firstOrCreate(...);
    $reel->increment('likes_count');
});
```

For high write volume later: Redis `INCR` + periodic flush to PostgreSQL (Phase C). MVP: direct SQL increments are fine.

---

## 9. API Design

Base: `/api/v1`  
Auth: Sanctum `auth:api` unless noted  
Envelope: `docs/API.md` (`SUCCESS`, `CREATED`, `VALIDATION_ERROR`, …)

### 9.1 Reel CRUD & media

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/reels` | yes | Create metadata shell (`status=uploading`) |
| `POST` | `/media/reel/{reel}/original` | yes (owner) | Upload original video |
| `POST` | `/media/reel/{reel}/thumbnail` | yes (owner) | Optional custom cover |
| `PATCH` | `/reels/{reel}` | yes (owner) | Caption, visibility |
| `DELETE` | `/reels/{reel}` | yes (owner) | Soft remove + cleanup job |
| `GET` | `/reels/{reel}` | optional | Detail (respect visibility) |

**Create body**

```json
{
  "caption": "What a cover drive #cricket @nickname",
  "visibility": "public",
  "client_duration_ms": 15200
}
```

**Create response `data`**

```json
{
  "id": 42,
  "status": "uploading",
  "upload": {
    "type": "reel",
    "field": "original"
  }
}
```

### 9.2 Feeds

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/reels/feed` | optional | Explore / For You (public ready reels) |
| `GET` | `/reels/feed/following` | yes | Creators the user follows |
| `GET` | `/users/{user}/reels` | optional | Profile grid / list |
| `GET` | `/reels/trending` | optional | Ranked by recent engagement |
| `GET` | `/reels/saved` | yes | Bookmarks |

**Pagination:** cursor-based (preferred for infinite scroll):

```
GET /reels/feed?cursor=eyJpZCI6MTAwfQ&per_page=10
```

Response includes `next_cursor`, `data: ReelResource[]`.

Avoid offset pagination for feeds (expensive + inconsistent under inserts).

### 9.3 Interactions

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/reels/{reel}/like` | Like (idempotent) |
| `DELETE` | `/reels/{reel}/like` | Unlike |
| `POST` | `/reels/{reel}/save` | Bookmark |
| `DELETE` | `/reels/{reel}/save` | Unsave |
| `POST` | `/reels/{reel}/share` | Record share `{ channel }` |
| `POST` | `/reels/{reel}/views` | Record view (see §11) |
| `POST` | `/reels/{reel}/report` | `{ reason, details? }` |

### 9.4 Comments

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/reels/{reel}/comments` | Top-level paginated |
| `GET` | `/reels/{reel}/comments/{comment}/replies` | Replies |
| `POST` | `/reels/{reel}/comments` | `{ body, parent_id? }` |
| `DELETE` | `/reels/{reel}/comments/{comment}` | Author or reel owner |

### 9.5 Social / profile (reuse + extend)

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/users/{user}/follow` | **Existing** |
| `DELETE` | `/users/{user}/follow` | **Existing** |
| `GET` | `/users/{user}/profile` | Extend with `reels_count`, `followers_count`, `following_count`, `is_following` |

### 9.6 Search

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/reels/search?q=` | Caption / hashtag text search |
| `GET` | `/hashtags/search?q=` | Hashtag autocomplete |
| `GET` | `/hashtags/{name}/reels` | Reels for tag |

### 9.7 Admin (backoffice)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/posts` | Spatie filters/sorts |
| `PATCH` | `/admin/posts/{post}` | Force status, visibility, body |
| `POST` | `/admin/posts/{post}/reprocess` | Redrive video transcode |
| `GET` | `/admin/post-reports` | Moderation queue |

### 9.8 `ReelResource` (user) — illustrative

```json
{
  "id": 42,
  "caption": "...",
  "status": "ready",
  "visibility": "public",
  "duration_ms": 15200,
  "playback": {
    "type": " progressive_mp4",
    "url": "https://cdn.../processed.mp4",
    "poster_url": "https://cdn.../poster.jpg",
    "hls_url": null
  },
  "counts": {
    "likes": 120,
    "comments": 14,
    "views": 8900,
    "saves": 40,
    "shares": 12
  },
  "viewer": {
    "liked": true,
    "saved": false,
    "following_creator": true
  },
  "creator": {
    "id": 7,
    "name": "...",
    "nickname": "...",
    "avatar_url": "..."
  },
  "hashtags": ["cricket"],
  "published_at": "..."
}
```

While `processing`, `playback.url` may point at `original` if safe to expose; otherwise poster-only + badge.

### 9.9 MediaRegistry extension

Add to `MediaRegistry::types()`:

```php
'reel' => [
    'model' => Reel::class,
    'fields' => [
        'original' => [
            'dir' => 'reels/original',
            'column' => 'original_path',
            'file_rules' => [
                'required', 'file',
                'mimetypes:video/mp4,video/webm,video/quicktime',
                'max:102400',
            ],
        ],
        'thumbnail' => [
            'dir' => 'reels/thumbs',
            'column' => 'thumbnail_path',
        ],
    ],
],
```

**Critical:** User media controller must enforce **ownership** (`$reel->user_id === auth()->id()`) for type `reel`. Admin registry path may bypass for support.

---

## 10. Queue & Worker Architecture

### 10.1 Queues

| Queue | Purpose | Concurrency |
|-------|---------|-------------|
| `default` | Existing app jobs | Keep as-is |
| `push-notifications` | Existing | Keep as-is |
| `reels` | Light reel jobs (finalize, notify, cleanup) | Moderate |
| `reels-poster` | Fast 1-frame JPG poster from original | Moderate (2+) |
| `reels-transcode` | FFmpeg-heavy compress / HLS | **Low** (1–2 per host) |

Supervisor example (see `supervisor/tapeya.conf`):

```
[program:tapeya-reels-poster]
command=php artisan queue:work --queue=reels-poster --sleep=1 --tries=3 --timeout=90
numprocs=2

[program:tapeya-reels-transcode]
command=php artisan queue:work --queue=reels-transcode --sleep=1 --tries=3 --timeout=900
numprocs=1
```

`timeout` on transcode must exceed worst-case encode (e.g. 90s 1080p source). Poster workers stay short so profile grids light up without waiting on compress.

### 10.2 Jobs

| Job | Queue | Responsibility |
|-----|-------|----------------|
| `ExtractReelPosterJob` | `reels-poster` | ffprobe + 1-frame JPG → `thumbnail_path` + broadcast |
| `ProcessReelVideoJob` | `reels-transcode` | Probe + transcode + HLS; poster only if still missing |
| `CleanupReelOriginalJob` | `reels` | Delayed delete of original |
| `CleanupReelMediaJob` | `reels` | On delete |

Patterns to copy from existing jobs:

- `ShouldQueue`, `Queueable`
- `$tries = 3`, exponential `$backoff`
- `afterCommit = true` when dispatching after DB writes
- Early return if reel missing / already `ready`
- Never swallow errors silently — set `status=failed` + `processing_error`

### 10.3 Retry & failure recovery

1. Transient FFmpeg / B2 errors → retry with backoff.
2. After max tries → `failed_jobs` + reel `failed`.
3. Admin `reprocess` resets status to `processing` and re-dispatches.
4. Poison files (invalid codec) → `failed_permanent` / `rejected` without infinite retry (detect via exit codes / probe).
5. Alerting: Horizon/ops on failed job rate (Phase B if migrating queue driver to Redis).

### 10.4 Progress tracking

- Optional: FFmpeg `-progress pipe:1` parsed into Redis key `reel:{id}:progress` TTL 1h.
- Client: `GET /reels/{id}` or private Echo event.
- Do not spam DB writes every percent tick.

---

## 11. View Tracking

### 11.1 Goals

- Count a view only after meaningful watch time.
- Prevent duplicate inflation.
- Support authenticated users; optionally anonymous.
- Resist trivial bots.
- Stay cheap at scale.

### 11.2 Counting rules (configurable)

`config/reels.php`:

```php
'views' => [
    'min_watched_ms' => 3000,
    'min_completion_rate' => 0.0, // or e.g. 0.25 as alternative/complement
    'dedupe' => 'lifetime', // lifetime | daily
    'allow_anonymous' => false, // MVP: auth-only views recommended
],
```

**MVP recommendation:** authenticated only; count when `watched_ms >= 3000` **or** `completion_rate >= 0.25` (whichever first); one count per `(reel_id, viewer_key)`.

### 11.3 Client flow

1. `useViewTracker` starts when reel becomes active and playing.
2. On threshold, `POST /reels/{id}/views` with `{ watched_ms, completion_rate, client_ts }`.
3. Server validates duration against known `duration_ms` (± tolerance).
4. Idempotent upsert on `viewer_key`; increment `views_count` only when transitioning to `counted=true`.

### 11.4 `viewer_key`

- Auth: `hash_hmac('sha256', 'u:'.$userId, app.key)`
- Anon (if enabled): `hash_hmac(..., 'd:'.$deviceId)` from app-install id — **never** raw IP as sole key.

### 11.5 Anti-abuse

- Throttle view endpoint (`throttle:60,1` per user).
- Reject impossible `watched_ms` (> duration + skew).
- Hash IP/UA for analytics; do not store raw IP long-term if privacy policy requires.
- Ignore known bot UAs (best-effort).
- Cap views_count increments from same ASN later if needed.

### 11.6 Scalability

- Hot reels: buffer increments in Redis (`HINCRBY reel:views:pending`) flush every N seconds.
- Archive old `reel_views` rows; keep counters on `reels`.
- Do **not** join `reel_views` for feed queries.

---

## 12. Feed, Ranking & Caching

### 12.1 MVP feed strategies

**Explore / For You (v1 — chronological + light ranking)**

```
ready + public + not deleted
ORDER BY published_at DESC
cursor on (published_at, id)
```

**Following**

```
reels.user_id IN (followed ids)
same status filters
```

**Trending (v1)**

```
score = likes_count*3 + comments_count*4 + shares_count*5 + views_count*0.1
window: published_at >= now() - 48h
ORDER BY score DESC, id DESC
```

Recompute score in query for MVP; materialize `trending_score` column later.

### 12.2 Recommendation basics (later)

- Candidate generation: recent + followed + hashtag affinity + cricket taxonomy.
- Ranking features: watch time, completion, likes, creator quality, freshness.
- Diversity: avoid N consecutive from same creator.
- Explore vs exploit: keep some chronological / new-creator slots.

Do **not** build a full ML ranker in v1.

### 12.3 Caching

| Key | Value | TTL |
|-----|-------|-----|
| `reel:resource:{id}` | Serialized ReelResource | 30–60s |
| `feed:explore:{cursor}` | Avoid caching cursors aggressively | — |
| `user:{id}:following_ids` | For following feed | 60–300s |
| `hashtag:{name}:top` | Trending tags | 5–15m |

Invalidate on like/comment sparingly (or accept short TTL staleness for counts).

### 12.4 Redis usage summary

- Rate limits / view progress / following id sets / optional counter buffers.
- Queue driver migration `database` → `redis` recommended before heavy transcode volume.

---

## 13. Frontend Architecture

### 13.1 Replace prototype wiring

| Today | Target |
|-------|--------|
| `reelsData.js` mocks | ~~mocks~~ **Removed** — use `reelsApi` infinite query |
| `reelsSlice` + persist blobs | Remove blob persistence; RTK Query cache |
| Local like `Set` | Optimistic mutation + `viewer.liked` |
| Share stub | Web Share API + `POST .../share` |
| No comments | Bottom sheet + comment endpoints |
| Data URL publish | Create → `uploadMediaFile` → invalidate |

Follow `mediaApi.js` deferred upload helpers (`stripDeferredMediaFields`, `uploadMediaFile`).

### 13.2 Player module

`features/reels/useReelPlayer.js`:

- Autoplay active index only.
- Pause on tap / scroll away / app background.
- Prefetch `activeIndex + 1` (and optionally +2 on Wi‑Fi).
- Bandwidth heuristic: start at 480p variant when HLS exists; use `navigator.connection`.
- Reuse patterns from `HlsStreamPlayer` for HLS VOD.

### 13.3 View + interaction hooks

- `useViewTracker(reelId, { isActive, isPlaying })`
- `useReelLike(reelId)` optimistic
- Comment sheet isolated local state (like live chat philosophy) but **persisted via API** (unlike live comments).

### 13.4 Routes & nav

- Keep `/reels`, `/reels/upload`.
- Add `/reels/:reelId` deep link (open feed centered on reel).
- Add `/users/:id/reels` or profile tab.
- Re-enable Explore category entry when backend is live.

---

## 14. UI/UX Workflow

### 14.1 Feed

1. Full-bleed vertical snap (existing UI).
2. Tabs: **Explore** | **Following** (add) | **My Videos**.
3. Overlay: creator, caption (expand), actions (like, comment, share, save, follow).
4. Processing badge on own videos.
5. Failed state: “Processing failed — Retry” (owner).

### 14.2 Upload

1. Pick video → local object URL preview (keep).
2. Caption with # / @ highlighting (parse client-side; server re-parses).
3. Publish → progress for **upload** only (not transcode).
4. Success → My Videos with processing indicator.

### 14.3 Comments

1. Comment icon opens sheet.
2. Top-level list + inline “View replies”.
3. Reply affordance sets `parent_id`.

### 14.4 Profile

1. Avatar, nickname, bio (existing user fields).
2. Counts: reels / followers / following.
3. Follow button (existing API).
4. Grid of ready reels → opens player.

---

## 15. Security, Moderation & Rate Limits

### 15.1 Security

- Auth on mutating endpoints; visibility checks on read.
- Ownership checks on media upload / patch / delete.
- Validate mime **and** probe real media type server-side (`ffprobe`); don’t trust client.
- Virus/malware: optional ClamAV later; at minimum reject non-AV streams.
- Signed Cloudflare URLs optional for private reels.
- Strip geolocation / sensitive metadata where required by policy.
- Caption XSS: store raw, escape on render (React default), sanitize length.

### 15.2 Rate limits (starting points)

| Action | Throttle |
|--------|----------|
| Create reel | `10/hour` / user |
| Upload media | `20/hour` |
| Like/save | `60/min` |
| Comment | `30/min` |
| View | `60/min` |
| Report | `10/hour` |
| Share | `30/min` |

Align style with live comments (`throttle:120,1` etc.).

### 15.3 Moderation options

| Layer | MVP | Later |
|-------|-----|-------|
| User reports | ✅ | SLA dashboard |
| Admin hide/remove | ✅ | — |
| Block words in captions | Optional | — |
| Pre-publish manual review | No | High-risk markets |
| AWS Rekognition / Hive / Sightengine | — | NSFW / violence frames |
| Audio copyright | — | Vendor integration |
| Shadowban / reduce distribution | — | Trust & safety |

Auto-hide when `reports_count` crosses threshold pending review.

---

## 16. Performance & Scalability

| Area | Recommendation |
|------|----------------|
| **CDN / object storage** | **Backblaze B2** for storage + **Cloudflare** CDN for playback — see [§16.1](#161-object-storage--cdn--backblaze-b2--cloudflare). Wire via Laravel `s3` disk (`AWS_ENDPOINT` → B2, `AWS_URL` / public CDN hostname → Cloudflare). |
| **Lazy loading** | Mount `<video>` src only for active ±1 |
| **Prefetch** | Next reel metadata always; media on Wi‑Fi / good network |
| **DB indexes** | As in §8; no feed query without status+visibility filters |
| **Horizontal scale** | Stateless API; sticky not required; scale transcode workers independently |
| **Storage lifecycle** | Delete originals after N days; prefer one progressive MP4 before full HLS ladder |
| **Payload size** | Feed `per_page` 5–10 (not default 50) for video cards |
| **N+1** | Eager load `creator`, `viewer` pivots; use `withExists` for liked/saved |
| **Low bandwidth** | Prefer 480p; poster first; avoid autoplay HD |

### 16.1 Object storage & CDN — Backblaze B2 + Cloudflare

> **Decision (2026-07-25):** Reels media uses **Backblaze B2** for object storage and **Cloudflare** as the CDN in front of B2.
> Playback must go through Cloudflare (Bandwidth Alliance) so egress stays effectively **$0**; do **not** serve videos via direct B2 download URLs in production.

#### Why this stack

| Factor | B2 + Cloudflare |
|--------|-----------------|
| Storage | ~$0.006 / GB-month (cheap for growing UGC libraries) |
| Playback egress | **$0** via Cloudflare |
| App integration | S3-compatible API → existing Laravel `filesystems.php` `s3` disk + `MediaRegistry` |
| Ops | Separate bucket/prefix for reels; Cloudflare cache rules for `video/*` + thumbnails |

Other object stores were considered during R&D and **rejected** for Reels in favor of this cost profile. Do not re-open that comparison unless B2/Cloudflare pricing or ToS changes materially.

#### Wiring (implementation notes)

```
Upload / transcode workers
        │  S3-compatible PUT/GET
        ▼
  Backblaze B2 bucket (private or restricted origin)
        │  origin for CDN
        ▼
  Cloudflare (custom domain or CF proxy)
        │  public playback URLs
        ▼
  Tapeya app <video> / HLS
```

Env shape (conceptual — exact keys follow `filesystems.php`):

| Concern | Approach |
|---------|----------|
| API credentials | B2 application key → `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` |
| Endpoint | B2 S3 endpoint → `AWS_ENDPOINT` (+ path-style if required) |
| Bucket | Dedicated or shared with `reels/` prefix → `AWS_BUCKET` |
| Public URLs | Cloudflare hostname → `AWS_URL` / Admin `cdn_public_base_url` (overrides at boot) / `MEDIA_DISK=s3` |
| `MEDIA_DISK` | `s3` in production for Reels (and ideally all media once migrated) |

See also [MEDIA_CDN_MIGRATION.md](./MEDIA_CDN_MIGRATION.md) for S3→B2 cutover steps.

Highlights and other existing media may remain on the current disk until a deliberate migration; **new Reels objects must land on B2**.

#### Ballpark cost (planning only)

Approximate public list rates; re-check Backblaze/Cloudflare pricing before budgeting.

| Scale | Stored | Egress (via CF) | Ballpark / month |
|-------|--------|-----------------|------------------|
| Launch | 50 GB | 200 GB | ~**$0.30** storage + $0 egress |
| Growth | 500 GB | 5 TB | ~**$3** storage + $0 egress |

Ops/request fees are usually small vs storage at these sizes; monitor B2 Class A/B-style transaction usage under burst uploads.

#### Cost controls (still required)

1. Delete **originals** after processing retention (e.g. 7–14 days) — `original_retention_days`.
2. Ship **one solid progressive MP4** first; add multi-rung HLS only when needed.
3. Never stream Reels from the API app server; always B2 origin → Cloudflare.
4. Enforce max duration / upload size (90s / 100 MB defaults).
5. Ensure Cloudflare cache/TTL rules cover processed MP4, HLS segments, and thumbnails.

| Decided vendor | **Backblaze B2 + Cloudflare CDN** |
|---------------|-----------------------------------|
| Decided on | 2026-07-25 |
| Notes | Free egress only when traffic is served through Cloudflare — never expose raw B2 download URLs to clients |

### Scaling path to millions of videos

1. Redis queues + many API nodes.
2. Dedicated transcode fleet or managed encoder.
3. HLS multi-bitrate served from B2 via Cloudflare.
4. Feed service separation (read replicas / materialized candidates).
5. View log warehouse (ClickHouse / BigQuery) vs OLTP.
6. Moderation async pipeline.

---

## 17. Error Handling & Edge Cases

| Case | Handling |
|------|----------|
| Upload dies mid-file | Reel stays `uploading`; cron GC deletes stale shells > 24h |
| Transcode fails | `failed` + user retry; admin reprocess |
| User deletes while processing | Cancel job if possible; cleanup all keys |
| Double-tap like | Idempotent unique constraint |
| Comment on removed reel | 404 / FORBIDDEN |
| Private reel shared link | FORBIDDEN unless authorized |
| Follow self | Reject (existing follow rules) |
| Oversized / too long video | VALIDATION_ERROR before/at probe |
| Vertical scroll jank | Keep snap + decode budget; don’t play >1 video |
| App backgrounded | Pause + stop view timer |
| Token expiry mid-upload | 401 → re-auth; resume upload if multipart supported later |
| LocalStorage full from old prototype | Migration: stop persisting `reels` slice |

---

## 18. Testing Strategy

### Backend

- **Unit:** hashtag parser, view threshold logic, caption mention extraction, transcode command builder (mocked Process).
- **Feature:** create → upload authz → like idempotency → comment reply depth → feed cursors → follow feed.
- **Job:** ProcessReelVideoJob with fake disk + stubbed FFmpeg.
- **Security:** cannot upload to another user’s reel id.

### Frontend

- Player: active/inactive play/pause.
- View tracker: fires once after threshold.
- Optimistic like rollback.
- Upload flow integration with mocked `reelsApi`.

### Load / soak

- Feed read QPS.
- Concurrent likes on one reel (counter correctness).
- Transcode queue depth under burst uploads.

### Manual QA checklist

- [ ] Publish appears in My Videos while processing  
- [ ] Playback works on original then switches to processed  
- [ ] Explore infinite scroll  
- [ ] Following feed empty state  
- [ ] Like / unlike persists across refresh  
- [ ] Comments + one-level replies  
- [ ] Share increments  
- [ ] Save / unsave  
- [ ] Report  
- [ ] View count stable under scrubbing / replay  
- [ ] Delete removes from feeds  

---

## 19. Implementation Phases

### Phase 0 — Foundations (1–2 days)

- `config/reels.php`
- Migrations + enums + `Reel` model
- MediaRegistry `reel` type + ownership gate
- Point Reels `media_disk` / S3 disk env at **B2** + Cloudflare public URL (§16.1)
- Remove redux-persist of reel blobs

### Phase 1 — Upload + My Videos + basic feed (core)

- Create / upload / list own / explore chronological
- Progressive playback of original + processed
- `ProcessReelVideoJob` (single 720p + poster)
- Wire UploadReels + Reels Explore/My Videos to API

### Phase 2 — Social graph interactions

- Likes, comments/replies, share, save, report
- Profile reels + counts
- Following feed (reuse `user_follows`)

### Phase 3 — Views + polish

- View tracking + throttling
- Trending endpoint
- Hashtag parse/search
- Processing progress / Echo optional
- Re-enable Explore nav entry

### Phase 4 — Scale & quality

- HLS ladder + `hls.js` player path
- Redis queues / counter buffering
- Lifecycle cleanup of originals
- Harden B2 + Cloudflare (cache rules, signed private reels, multipart upload)
- Admin moderation UI
- Multipart upload

---

## 20. Future Enhancements

- Duets / stitch / remix
- In-app camera + filters / music bed
- Shopping tags (link to `shop_` products)
- Cricket-specific overlays (match/tournament deep links)
- Creator analytics dashboard
- Paid promotion / boost
- Notifications: new follower reel, comment, mention (push queue)
- Offline download of saved reels
- Multi-language captions / ASR

---

## 21. Open Questions & Risks

| Item | Risk | Proposal |
|------|------|----------|
| Self-hosted FFmpeg on same hosts as API | CPU starvation | Dedicated queue + `numprocs=1`; move to managed encoder when sore |
| B2 served without Cloudflare | Paid B2 egress / lost cost advantage | Always publish Cloudflare URLs; block or avoid raw B2 client URLs |
| 100 MB × burst uploads | Storage + B2 transaction cost | Quotas; lifecycle delete of originals; size/duration caps |
| Anonymous views | Fraud | Auth-only counts in MVP |
| Recommendation quality | Weak chronological feeds | Ship trending v1; iterate |
| Legal / copyright music | Takedowns | Defer music library; report flow first |
| Capacitor background upload | OS kills | Foreground upload + retry UX |
| Existing Highlights confusion | Product overlap | Keep Highlights as CMS; Reels as UGC |

---

## 22. Appendix

### 22.1 Config skeleton (`config/reels.php`)

```php
return [
    'max_duration_seconds' => 90,
    'min_duration_seconds' => 1,
    'max_upload_kb' => 102400,
    'allowed_mimetypes' => ['video/mp4', 'video/webm', 'video/quicktime'],
    'output' => [
        'video_codec' => 'libx264',
        'audio_codec' => 'aac',
        'heights' => [720, 480],
        'crf' => 23,
    ],
    'views' => [
        'min_watched_ms' => 3000,
        'min_completion_rate' => 0.25,
        'dedupe' => 'lifetime',
        'allow_anonymous' => false,
    ],
    'original_retention_days' => 14,
    'queues' => [
        'default' => 'reels',
        'poster' => 'reels-poster',
        'transcode' => 'reels-transcode',
    ],
];
```

### 22.2 Relationship to existing docs

| Doc | Relevance |
|-----|-----------|
| `docs/API.md` | Response envelope, BaseModel filters |
| `docs/APP_CODING_STYLE.md` / `Coding guidelines.md` | FE structure, selectors |
| `docs/LIVE_COMMENTS_ARCHITECTURE.md` | Rate limit / service patterns (persistence differs) |
| `docs/SHOP_ECOMMERCE_DESIGN.md` | Domain prefix / layout style reference |
| `docs/DEPLOYMENT.md` | Supervisor / env for new workers |

### 22.3 Explicit non-goals (MVP)

- Full TikTok-style For You ML ranker
- In-app camera editor
- Live reels / co-watching
- Dislikes
- Deep comment nesting (>1 reply level)
- Guaranteed copyright fingerprinting

---

## Document history

| Date | Author | Notes |
|------|--------|-------|
| 2026-07-24 | Architecture R&D | Initial production design from Reels UI prototype + codebase patterns |
| 2026-07-24 | Architecture R&D | Added §16.1 object storage/CDN cost comparison (decision deferred) |
| 2026-07-25 | Architecture R&D | Locked Reels storage/CDN to **Backblaze B2 + Cloudflare**; removed alternate-vendor comparison |

---

**Next step after approval:** implement Phase 0–1 (schema, MediaRegistry, upload pipeline, wire Explore / My Videos / Upload to API) before social interactions.
