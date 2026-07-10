# Mobile Native Broadcast — Go Live From Any Phone

**Status:** Planned — architecture locked, ready to implement
**Date:** July 2026
**Prerequisites:** [LIVE_STREAM_INDEPENDENT_STREAMS.md](./LIVE_STREAM_INDEPENDENT_STREAMS.md) (standalone `MatchStream` rows, stream-scoped Reverb/chat), [LIVE_STREAM_YOUTUBE_FINAL.md](./LIVE_STREAM_YOUTUBE_FINAL.md) (`YouTubeStreamProvider`, iframe playback, provider-agnostic `StreamProviderContract`)
**Goal:** Let **any authenticated Tapeya user** broadcast live video straight from their phone's camera and microphone — no OBS, no vMix, no desktop, no third-party broadcasting SDK. Capture, encode, and publish is done by a **fully in-house Capacitor plugin** built on native platform APIs. Ingest and playback reuse the **existing YouTube provider** unchanged.

> **Prerequisite status (verified against the codebase as of this writing):** the Independent Streams doc is **fully built** — `LiveStreamController@index`/`@show` query `MatchStream::visibleInApp()` (no more `TournamentMatch` join), `LiveStreamResource` exists, `LiveStreamStatusUpdated` broadcasts on `live-stream.{streamId}` unconditionally (not gated behind `match_id`), stream-scoped chat/hearts/presence (`LiveStreamCommentController`, `LiveStreamHeartController`, `useLiveStreamChannel`, `useStreamComments`, `useStreamPresenceChannel`) all exist and work, `LiveBroadcast.jsx` already routes on `/live/broadcast/:streamId` via `useGetLiveStreamQuery(streamId)`, and `LiveBroadcastItem` already takes a `broadcast` prop keyed by `streamId` throughout. **`LiveStreamService` also already has `createStandaloneYoutube()`** — an admin-facing standalone-YouTube-stream creator this doc's `createSelfServe()` wraps rather than duplicates (see Backend changes).
>
> **What is genuinely new in this doc, and only this:** `owner_user_id` + `can_broadcast` columns, `createSelfServe()` (a thin wrapper), `LiveBroadcastController` (user-facing create/reconnect/end), the native `TapeyaBroadcastPlugin`, the auto-end/VOD-purge jobs, the backoffice allowlist/ban UI, and the `GoLive.jsx` app screens. Phase 4 (App UI) is **not** blocked on rebuilding the viewer stack — only on this doc's own backend + plugin landing.

---

## Decision: Option 2 — in-house Capacitor plugin, not a vendor SDK

Two ways to get a phone's camera onto an RTMP ingest were on the table:

1. **Embed a third-party mobile streaming SDK** (Mux, Agora, AWS IVS Broadcast SDK, Wowza GoCoder, Larix). Fast to integrate, but recurring per-minute/per-user vendor cost, black-box behavior, and a hard dependency on someone else's release cycle and pricing.
2. **Build the plugin ourselves** — a first-party Capacitor plugin, following the exact pattern already used for `YoutubeStreamOverlay`, `FacebookAnalytics`, and `FcmToken` in this repo (native Swift/Kotlin inlined into the `app/ios` and `app/android` projects, bridged to JS via `registerPlugin`).

**Chosen: Option 2.** "In-house" does not mean writing an RTMP stack or an H.264 encoder from raw sockets and bit-shifting — that would be reinventing a solved, standards-heavy problem for no product benefit. It means we own the plugin, its UI, its lifecycle, and its integration with our backend, while resting the codec/muxing plumbing on permissively-licensed, actively-maintained open-source libraries we vendor directly (same posture as already using the Google API client for YouTube):

| Platform | Camera/mic capture | Encoding | RTMP publish |
|---|---|---|---|
| iOS | `AVCaptureSession` | VideoToolbox (H.264) — via **HaishinKit** | HaishinKit `RTMPStream` |
| Android | Camera2 API | MediaCodec (H.264) — via **rootencoder** (`com.github.pedroSG94.RootEncoder`) | rootencoder's built-in RTMP client |

No recurring vendor fees, no black-box SDK, no per-minute billing beyond our own YouTube API usage. We control every UX detail (preview, retry behavior, error messages) because the code lives in our repo.

**Version pinning:** `HaishinKit ~> 2.0` and `RootEncoder:library:2.x.x` below are intentionally loose in this doc — do not treat them as tested versions. Phase 2/3's exit criteria include recording the exact version verified against a real device in `Podfile.lock` / `build.gradle`, and that exact version belongs in the File checklist once known. Do not pin a version here that hasn't actually been run on hardware.

---

## Ingest & playback provider: YouTube (reusing `createStandaloneYoutube()` as-is)

**Decision:** self-serve mobile broadcasts publish to and play back from the **same YouTube provider stack already built**, via the **same `createStandaloneYoutube()` method** `Admin\LiveStreamController::store()` already calls for admin-created standalone YouTube streams. No new provider, no new player, no new webhook infrastructure, and — per the section below — barely any new service code either.

**What this buys us for free (all confirmed live in the codebase, not aspirational):**

| Piece | Status |
|---|---|
| Ingest (RTMP URL + stream key) | `LiveStreamService::createStandaloneYoutube()` → `YouTubeStreamProvider::createStream()` — unchanged |
| Status transitions (idle → starting → live → ended) | `streams:sync` polling command — behavior unchanged, already skips nothing based on `owner_user_id`; internals since batched per-provider for quota efficiency, see Phase 5 |
| Playback | `IframeStreamPlayer.jsx` (web/Android) + `IosNativeStreamOverlay.jsx` (iOS), driven by `MatchStream::playbackForApp()` — unchanged |
| Realtime status | `LiveStreamStatusUpdated` on `live-stream.{streamId}` (Reverb) — **broadcasts unconditionally now**, not gated behind `match_id` — `useLiveStreamChannel(streamId)` already consumes it |
| Chat / hearts / presence | `live-stream.{streamId}.chat` / `.presence` — `useStreamComments`, `useStreamPresenceChannel` already consume these |
| Ending / deleting a stream | `LiveStreamService::end()` / `delete()` — unchanged, already purges stream-scoped Redis keys (`LiveChatRedisKeys::purgeStream()`) |

**What this costs us, eyes open — real trade-offs of the YouTube choice for this specific use case:**

| Trade-off | Detail | Mitigation |
|---|---|---|
| **Single shared channel** | Every self-serve broadcast is a real video on Tapeya's one YouTube channel (the same channel + OAuth refresh token used for official match streams), not an isolated per-user resource. | Default `privacy: 'unlisted'` for every self-serve broadcast — not searchable, not listed on the channel's public page, only reachable via the direct in-app link/embed. |
| **Channel-level moderation/ToS risk** | Inappropriate content streamed by any user still lands on the *official* Tapeya channel. Repeated ToS strikes could jeopardize the channel used for real match broadcasts. | Strict allowlist gate + fast admin ban path while this is new (see Trust & Safety). **Config hook added now, unused until needed:** `StreamingSettings` gets a nullable `selfServeYoutubeChannelId`/credential slot (null in v1, falls back to the primary channel) so migrating self-serve traffic to a dedicated channel later is a settings change, not a schema migration. |
| **Channel-level concurrency/quota ceilings** | YouTube channels have practical limits on simultaneous live broadcasts and the Data API has daily quota units; every `createStream()` call spends quota (broadcast + stream insert + bind). | Monitor concurrent self-serve broadcast count and daily `createStream()` call volume in backoffice; alert past a threshold (see Trust & Safety monitoring row); the allowlist gate keeps volume low during rollout. |
| **Latency & status freshness** | ~15–30s glass-to-glass (a YouTube property, unrelated to our polling). Our own status-transition detection is bounded by `streams:sync`'s cadence — `everyMinute()` in `routes/console.php`, so up to ~60s. | Same latency every other YouTube-backed stream on Tapeya already has — no regression. |
| **Unlisted ≠ moderated** | Setting `privacy: 'unlisted'` stops the video from being *discoverable*; it does nothing to stop a ToS violation from happening on camera. | The real control is the allowlist gate + fast ban path (see Trust & Safety) — treat `unlisted` as a discoverability control, not a content control. |

**Hub visibility caveat, spelled out explicitly:** `MatchStream::scopeVisibleInApp()` only returns rows with `status` in `['live', 'starting']`. A self-serve row sits in `idle` from the moment `POST /live/broadcasts` returns until `streams:sync`'s next poll detects the RTMP encoder actually connected — during that window (typically seconds, up to ~60s worst case) **the broadcaster can see their own stream on `/live/go-live/:streamId`, but it does not yet appear on the public `/live` hub for other viewers.** This is existing, correct behavior (identical to how an admin standalone YouTube stream behaves before its first sync tick) — not a bug to fix, just something worth the broadcaster's pre-broadcast screen setting expectations for ("your stream will appear publicly within about a minute of going live").

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Tapeya app (React + Capacitor, native platforms only —       │
│  see "Native-only gating" below)                               │
│                                                                 │
│  Sidebar "Go Live" ──▶ /live/go-live — form only, no camera    │
│                        yet: Title, Description, Stream          │
│                        Thumbnail (optional)                       │
│                              │                                     │
│                              ▼                                     │
│              POST /api/v1/live/broadcasts                          │
│                 (title, description — JSON)                         │
│              → if thumbnail selected, follow-up                      │
│                POST /live/broadcasts/{stream}/thumbnail                │
│                (multipart, owner-only — see Backend changes)            │
└──────────────────────────────┬─────────────────────────────────────────┘
                                ▼
                 ┌───────────────────────────────┐
                 │ Laravel API                     │
                 │ LiveBroadcastController          │
                 │  → LiveStreamService              │
                 │      ::createSelfServe()           │
                 │      (thin wrapper — see below)      │
                 │  → ::createStandaloneYoutube()         │
                 │      (existing, unchanged) →              │
                 │      YouTubeStreamProvider::createStream()  │
                 │  → match_streams row                          │
                 │     (id = stream_id ◀── the ONLY id            │
                 │      this feature ever uses;                    │
                 │      match_id = NULL, always;                    │
                 │      owner_user_id, provider=youtube,             │
                 │      status=idle — privacy=unlisted is passed      │
                 │      to YouTube at create time only, not stored      │
                 │      as a column, see Data model changes)             │
                 └──────────────┬──────────────────────────────────────────┘
                                │  { stream_id, rtmp_url, stream_key }
                                ▼  (ingest creds — owner only, never public)
┌─────────────────────────────────────────────────────────────┐
│  App (JS) holds stream_id for the rest of the session,         │
│  navigates to /live/go-live/{streamId} — camera preview           │
│  starts HERE, not on the form screen. Once the broadcaster          │
│  taps "Start Broadcasting", passes rtmp_url + stream_key              │
│  (not stream_id — plugin doesn't need it) to:                          │
│                                                                            │
│  TapeyaBroadcastPlugin (native, per platform)                              │
│  iOS: AVCaptureSession → VideoToolbox → HaishinKit RTMPStream                │
│  Android: Camera2 → MediaCodec → rootencoder RTMP client                      │
└──────────────────────────────┬────────────────────────────────────────────────┘
                                │  RTMP
                                ▼
                 ┌───────────────────────────────┐
                 │ YouTube Live (Tapeya channel)    │
                 │  → polled every 60s by             │
                 │    streams:sync (unchanged)          │
                 │  → iframe embed for playback           │
                 └──────────┬──────────────────────────────┘
                             │
              ┌──────────────┴───────────────┐
              ▼                               ▼
  streams:sync → LiveStreamService     Any viewer, keyed by stream_id only:
  ::syncStatus() → status persisted        /live/broadcast/{streamId} → LiveBroadcast.jsx
  on match_streams row; broadcasts            + IframeStreamPlayer / IosNativeStreamOverlay
  LiveStreamStatusUpdated on                    + useLiveStreamChannel(streamId) +
  live-stream.{streamId} (Reverb —                useStreamPresenceChannel(streamId) +
  already live, unconditional)                      useStreamComments(streamId)
```

**The viewer side needs zero new code — this is not a caveat, it's already true today.** A self-serve mobile broadcast is a `MatchStream` row identified purely by its `stream_id` — it appears in the same `/live` hub (once live/starting), plays in the same `LiveBroadcast.jsx` viewer, uses the same stream-scoped chat/hearts/presence, all already shipped. `match_id` never enters the picture anywhere in this flow. The only net-new engineering is: (1) who may create a self-serve broadcast and from where, (2) the native capture/publish plugin, and (3) auto-end + VOD-purge jobs.

---

## Design Principles

1. **Reuse `createStandaloneYoutube()`, don't parallel it.** `createSelfServe()` is a thin wrapper (one new method, ~6 lines) that enforces self-serve-only rules — one active broadcast per user, forced `privacy: 'unlisted'` — then delegates entirely to the existing method for the actual row creation and YouTube provisioning.
2. **`match_streams.id` (stream id) is the only identifier this feature ever uses — never `match_id`.** Every route (`/live/broadcasts/{stream}`), every Reverb channel (`live-stream.{streamId}`), every chat/hearts/presence call, and the app's own routing (`/live/go-live/{streamId}`, `/live/broadcast/{streamId}`) key on the stream's own `id`. `match_id` is `NULL` on every self-serve row and is never read, written, or routed on anywhere in this feature — see the full glossary below.
3. **Ingest credentials are broadcaster-only, one-time (plus a guarded reconnect path).** The RTMP URL + stream key are returned from `POST /live/broadcasts` (alongside `stream_id`) and from the owner-only `GET /live/broadcasts/{stream}` reconnect endpoint — nowhere else. They are handed directly to the native plugin call and must never enter Redux-persisted state, application logs, or analytics events (see Backend changes for the concrete hardening list).
4. **Own the plugin, borrow the codec plumbing.** See "Decision" above — HaishinKit (iOS) and rootencoder (Android), both open-source, both vendored like any other native dependency already in this repo.
5. **Trust & Safety ships with v1, not after.** Opening live video publishing to "any user" onto Tapeya's real YouTube channel is a real abuse and brand-risk surface. Rate limits, an admin kill-switch, a soft-launch allowlist, and `privacy: 'unlisted'` are part of this plan, not a follow-up.
6. **Same chat/hearts/presence UX as every other stream — already true.** `LiveBroadcastItem` already treats every stream generically by `streamId`; this doc adds nothing on top of the existing viewer stack.
7. **Native platforms only.** `TapeyaBroadcastPlugin` has no web implementation and none is planned — the "Go Live" entry point is gated behind `Capacitor.isNativePlatform()` (see App UI/UX flow).

---

## Naming & Route Glossary

One page that fixes vocabulary across three layers (persistence, product entity, actions/roles) so routes, hooks, and UI copy never drift back into match-id-keyed naming or conflate staff broadcasters with self-serve users. Applies to this doc and the Independent Streams doc equally.

### Layer A — Persistence (internal, stable)

| Name | Use for |
|---|---|
| `match_streams` (table) | All broadcast rows — match-linked, admin standalone, and self-serve |
| `MatchStream` (model) | Eloquent, jobs, providers |
| `match_id` | Optional FK to a fixture only — never a routing/realtime identifier |

Do not rename the table or model unless storage is split entirely into separate tables — the name is legacy but stable and touches too much code to rename for cosmetic reasons alone.

### Layer B — Product entity (public API & app)

| Name | Use for |
|---|---|
| Live stream | The thing users watch on `/live` |
| `streamId` / `stream_id` | `match_streams.id` — routes, Reverb channels, RTK query keys, chat/hearts/presence |
| `LiveStreamService` | Business logic (PHP) |
| `LiveStreamResource` | User-facing API JSON |
| `live-stream.{streamId}` | Reverb channels (status, `.chat`, `.presence` suffixes) |

**Rule: never use `matchId` in broadcast URLs, hooks, or Reverb channel names.** `match_id` only ever appears as a nullable field *inside* a stream's JSON payload (for scorecard deep-links), never as the thing a route or channel is keyed by.

### Layer C — Actions & roles (avoid collisions)

| Term | Meaning |
|---|---|
| Live broadcast (verb/noun) | A user going live from their phone — the self-serve flow |
| `LiveBroadcastController` | User API for creating/ending a self-serve broadcast |
| `GoLive.jsx` / `/live/go-live/:streamId` | Broadcaster's own UI |
| `LiveBroadcast.jsx` / `/live/broadcast/:streamId` | Viewer UI — works for every stream kind |
| `TapeyaBroadcastPlugin` | Native camera → RTMP publish (Capacitor plugin) |
| `can_broadcast` | Consumer allowlist flag on `users` — self-serve gate |
| `owner_user_id` | The self-serve broadcaster on a `match_streams` row |
| `AdminRoleEnum::BROADCASTER` | **Staff** backoffice operator role only — see [BROADCASTER_ROLE.md](./BROADCASTER_ROLE.md) — **unrelated to `can_broadcast`.** Do not conflate a tournament's broadcast staff with a consumer who can go live from their phone. |

### API route convention

| Audience | Pattern | Purpose |
|---|---|---|
| Viewer / hub | `GET /live/matches`¹ | List (hub) |
| Viewer | `GET /live/streams/{stream}` | Watch payload |
| Viewer | `POST /live/streams/{stream}/live-comments`, `.../live-hearts` | Chat/hearts |
| Broadcaster (self-serve) | `POST /live/broadcasts` | Create + return RTMP credentials |
| Broadcaster | `GET /live/broadcasts/{stream}` | Reconnect credentials (owner only) |
| Broadcaster | `POST /live/broadcasts/{stream}/end` | End (owner only) |
| Admin | `/admin/live-streams/*` | Staff CRUD (any stream kind) |
| Admin, match-linked | `/admin/matches/{match}/stream` | Match Controller's YouTube RTMP setup |

¹ `GET /live/matches` is the hub list route's current name — a naming leftover from before streams were decoupled from matches (it already returns `MatchStream::visibleInApp()` rows, standalone included). Renaming it to `GET /live/streams` (keeping `/live/matches` as a deprecated alias for one release) is recommended cleanup — see the note under Implementation phases — not a blocker for anything in this doc.

**The `broadcasts` vs `streams` split is deliberate:** `broadcasts` = self-serve lifecycle + secrets (RTMP URL/key, owner-only). `streams` = the public viewer surface — no RTMP keys ever appear on a `streams` response.

### Stream kinds (adjectives, not separate tables)

| Kind | `match_id` | `owner_user_id` | Typical `provider` |
|---|---|---|---|
| Match-linked | set | null | `youtube` |
| Admin standalone | null | null | `external` or `youtube` |
| Self-serve (mobile) | null | set | `youtube` |

Code helpers on `MatchStream`: `isStandalone()` → `match_id === null`; `isSelfServe()` → `owner_user_id !== null` (added by this doc).

### Backoffice (Angular) naming

| Current | Target |
|---|---|
| `MatchStreamService` (TS) | `LiveStreamService` |
| UI section "Live Streams" | Keep |
| Types `LiveStreamRow`, etc. | Keep |

### A few more terms worth knowing

| Term | Note |
|---|---|
| `createStandaloneYoutube()` | Shared YouTube provisioner for both admin-created and self-serve standalone streams — only `createSelfServe()` layers ownership/moderation rules (allowlist check, forced `privacy: 'unlisted'`, one-active-broadcast rule) on top of it. |
| `LiveStreamService::SELF_SERVE_MAX_DURATION_SECONDS` | The one place the 2-hour cap is defined — `EndExpiredBroadcasts` and the app's `startBroadcast({ maxDurationSeconds })` call both derive from it, not from independent magic numbers. |
| `getLiveStreams` (RTK query in `liveApi.js`) | Still calls the legacy `/live/matches` URL under the hood — the query/hook names and consumer code are already fully stream-centric, only the URL string is a leftover. Resolved by the rename below, not before. |
| `normaliseLiveStreams` | Already correct — the retired `normaliseLiveStreamMatches` (display-string `matchId`) is gone; nothing to do here. |

### What to avoid

- "Match stream" in user-facing copy — use "live stream" or, only when a fixture is actually attached, "match broadcast."
- `normaliseLiveStreamMatches` / `matchId` for broadcast routes — both retired; the app already uses `normaliseLiveStreams` / `streamId`, keep it that way.
- Putting RTMP keys on `LiveStreamResource` or any list/viewer endpoint — they only ever appear in a `broadcasts` response, to the owner, once.
- Conflating staff `AdminRoleEnum::BROADCASTER` with consumer `can_broadcast` — different guards, different products, different risk profiles.

---

## Data model changes

### `match_streams` — one new column

**Migration:** `api/database/migrations/2026_xx_xx_xxxxxx_add_owner_to_match_streams.php`

```php
$table->foreignId('owner_user_id')->nullable()->after('created_by')->constrained('users')->nullOnDelete();
```

| Column | Purpose |
|---|---|
| `owner_user_id` | The broadcaster — the only non-admin user allowed to `GET`/`end` this stream via `LiveBroadcastController`. Distinct from `created_by` (which the Independent Streams doc uses for "who created this row" generally); for self-serve rows both are set to the same user, but kept as separate columns so `created_by`'s existing meaning elsewhere in the codebase is never re-interpreted. |

`MatchStream::isSelfServe(): bool { return $this->owner_user_id !== null; }`

**No `auto_end_at` column** (an earlier draft of this doc proposed one, set at creation time — that had a real bug: the 2-hour budget would start counting from row creation, not from when the broadcast actually went live, silently eating into the broadcaster's window during setup/connection). v1's max duration is a fixed constant, not a per-row configurable value, so there's nothing to store — see `EndExpiredBroadcasts` below, which computes the deadline from `started_at` at check time instead.

**Single source of truth for the 2-hour cap:** define it once as `LiveStreamService::SELF_SERVE_MAX_DURATION_SECONDS = 7200`, and reference that constant everywhere it currently shows up as a bare number — `EndExpiredBroadcasts`'s `subHours(2)` (compute from the constant, not a hardcoded `2`), the plugin's `startBroadcast({ maxDurationSeconds: 7200 })` call built from a shared app-side constant, and the "2 hours" mentioned in UI copy. Avoid three independent magic numbers that can drift out of sync.

**`privacy` is not stored on `match_streams`** — it's passed to `YouTubeStreamProvider::createStream()` at creation time only (via `CreateStreamData::privacy`) and never persisted on the row itself, matching how the existing admin standalone-YouTube flow already works. Acceptable for v1, but it means the DB alone cannot answer "was this self-serve stream actually unlisted?" for an audit — if that guarantee ever needs to be provable from data at rest (e.g. a compliance question), store it in `provider_metadata['privacy']` (already a jsonb column) rather than adding a new one.

### Users — moderation gate (v1: allowlist) + ToS acceptance

**Migration:** add `users.can_broadcast` (boolean, default `false`) and `users.broadcast_terms_accepted_at` (nullable timestamp) — **or** reuse an existing roles/permissions mechanism if one already fits; check `AppRoleEnum` before adding bespoke columns. Do not use `AdminRoleEnum::BROADCASTER` for this — see the Naming & Route Glossary above, it's a different, staff-only concept.

- `can_broadcast` starts `false` for everyone; flipped per-user from backoffice during the allowlist phase (see Trust & Safety and File checklist for the backoffice toggle).
- `broadcast_terms_accepted_at` is set the first time a user confirms the community-guidelines sheet on `/live/go-live`, via a real write endpoint — **not** a client-only flag (see "ToS acceptance endpoint" under Backend changes for the route and the server-side enforcement this makes possible).

### User profile API — expose the two new fields

**File:** whatever resource already backs `GET /me` (`UserResource` or equivalent) — add `can_broadcast` and `broadcast_terms_accepted_at` to its `toArray()`. Without this, the app has no way to gate the "Go Live" entry point or know whether to show the ToS sheet — Phase 4 is blocked on this exact field being present in the `auth/me` response, so it belongs in Phase 1 alongside the migration, not deferred to when the UI is built.

### `StreamingSettings` — second-channel config hook (unused in v1)

**File:** `api/app/Settings/StreamingSettings.php` — add one nullable property, e.g. `?string $selfServeYoutubeChannelId` (or a small credential set mirroring the primary YouTube settings if a fully separate OAuth grant is anticipated). Null in v1 — `createStandaloneYoutube()`/`createSelfServe()` keep resolving the primary channel exactly as today. This exists purely so migrating self-serve traffic to a dedicated channel later (see Trust & Safety) is a settings change and a small conditional in the resolver, not a new migration and a data backfill.

### Thumbnail — v1 feature, reusing the existing `stream_thumbnail` column and media pipeline

**Revised from an earlier draft of this doc, which deferred thumbnail upload to "optional future" — the pre-broadcast form includes it in v1.** `MatchStream::thumbnailUrl()` and the `stream_thumbnail` column already exist (added by a recent migration, `AsFile`-cast, stored under the `match-stream-thumbnails` disk directory) — the exact same column an admin already uploads to for standalone streams via the backoffice's `live-stream-manage-dialog` (`MediaService.applyField('live-stream', streamId, 'thumbnail', ...)` → `POST /admin/media/live-stream/{id}/thumbnail`, resolved through the shared `MediaRegistry`'s existing `'live-stream'` entry: `{ model: MatchStream::class, fields: { thumbnail: { dir: 'match-stream-thumbnails', column: 'stream_thumbnail' } } }`).

**Not reusing `UserMediaController`'s generic `media/{type}/{id}/{field}` route for this — a real gap, worth calling out precisely.** `UserMediaController::resolveRecord()` does not check record ownership by its own design (its class doc comment says as much: callers are expected to have already authorized the parent resource). Simply adding a `'live-stream'` entry to its `TYPES` map would let *any* authenticated user upload or delete the thumbnail on *any* `match_streams` row — including someone else's self-serve broadcast, or an admin's match-linked stream. Instead, thumbnail upload/delete for self-serve broadcasts is a new **owner-checked action on `LiveBroadcastController` itself** (see Backend changes), which already enforces `$stream->owner_user_id === $request->user()->id` for its other actions — consistent with that controller's existing security model rather than special-casing an exception into a shared, reused one.

**Sizing:** the backoffice already has `stream-thumbnail.constants.ts` (`STREAM_THUMBNAIL_WIDTH_PX = 360`, `HEIGHT_PX = 185`, aspect `360:185`) as a **frontend hint only** — there's no backend dimension enforcement today (`MediaRegistry`'s `live-stream`/`thumbnail` entry has no `file_rules`, so `Admin\MediaController` falls back to its default `['required', 'image', 'max:5120']`, no dimension check). The app should define its own equivalent constant (e.g. `app/src/lib/constants/streamThumbnail.constants.js`, same 360×185/aspect values — can't literally share the file across the Angular/React codebases, but the numbers must match) so the picker crops/previews to the same aspect ratio admin-uploaded thumbnails use, keeping Live hub cards visually consistent regardless of who uploaded the image. Optional in the form — skipping it falls back to the existing branded-placeholder behavior for a null `thumbnail_url`, exactly as before.

---

## Backend changes

### New service method — `LiveStreamService::createSelfServe()` (thin wrapper)

**File:** `api/app/Streaming/LiveStreamService.php`

```php
public const SELF_SERVE_MAX_DURATION_SECONDS = 7200; // single source of truth — see Data model changes

public function createSelfServe(int $ownerUserId, string $title, ?string $description): MatchStream
{
    $this->assertNoActiveSelfServeStream($ownerUserId);

    // Hard-require YouTube for self-serve — createStandaloneYoutube() actually resolves
    // provider from StreamingSettings::$defaultProvider, which is admin-configurable. If that
    // setting is ever changed away from 'youtube', self-serve must fail loudly, not silently
    // provision the wrong provider (self-serve's whole design assumes YouTube's iframe playback
    // and RTMP shape — see "Ingest & playback provider" above).
    abort_unless(
        app(StreamingSettings::class)->defaultProvider === 'youtube',
        503,
        'Self-serve broadcasting is temporarily unavailable.',
    );

    return $this->createStandaloneYoutube([
        'title' => $title,
        'description' => $description,
        'privacy' => 'unlisted', // self-serve is never public — see "Ingest & playback provider" above
        'owner_user_id' => $ownerUserId,
    ], $ownerUserId);
}

private function assertNoActiveSelfServeStream(int $ownerUserId): void
{
    $exists = MatchStream::query()
        ->where('owner_user_id', $ownerUserId)
        ->whereIn('status', ['idle', 'starting', 'live'])
        ->exists();

    abort_if($exists, 422, 'You already have an active broadcast.');
}
```

**One additive line inside the existing `createStandaloneYoutube()`** — its `MatchStream::create([...])` call gains `'owner_user_id' => $data['owner_user_id'] ?? null`. Every other line of that method, and every existing caller (`Admin\LiveStreamController::store()`), is unaffected — admin-created standalone YouTube streams simply never pass `owner_user_id`, so it stays `null` for them, exactly as today.

`StreamProviderResolver::forStream()` — unchanged, already resolves `provider = 'youtube'` correctly regardless of `owner_user_id`.

### New user-facing controller

**File:** `api/app/Http/Controllers/User/LiveBroadcastController.php`

| Route | Behavior |
|---|---|
| `POST /live/broadcasts` | Validates `title` (required, max 100), `description` (optional, max 500). 403 unless `$request->user()->can_broadcast`. **403 unless `broadcast_terms_accepted_at` is set** — see the ToS endpoint below; this is the server-side enforcement that makes the pre-broadcast confirmation sheet auditable rather than a client-only, bypassable flag. Calls `createSelfServe()`. Returns `{ stream_id, rtmp_url, stream_key }` (same shape `StreamIngestConfig` already produces for admin streams, via the exact same `$manager->driver($stream->provider)->ingestConfig($stream)` call `Admin\LiveStreamController::payload()` already makes) — **the only two places (this and the row below) ingest credentials are ever returned to a non-admin user.** Stays JSON-only — no thumbnail here (see `thumbnail` action below; a stream needs to exist before an image can be attached to it). |
| `POST /live/broadcasts/{stream}/thumbnail` | Owner-only, multipart, field `file`. Validates `['sometimes', 'image', 'max:5120']` (mirrors `MediaRegistry`'s default for the admin `live-stream`/`thumbnail` entry — no dimension enforcement server-side, same as admin uploads today). Sets `$stream->update(['stream_thumbnail' => $request->file('file')])`, reusing the exact same `AsFile` cast and `match-stream-thumbnails` disk directory the admin backoffice flow already writes to — a self-serve thumbnail and an admin-uploaded one are indistinguishable in storage. Optional call — the pre-broadcast form only fires it if the broadcaster picked an image. |
| `DELETE /live/broadcasts/{stream}/thumbnail` | Owner-only. Clears `stream_thumbnail`, falling back to the existing branded-placeholder behavior. |
| `GET /live/broadcasts/{stream}` | Owner-only (403 otherwise). Re-fetches ingest credentials for app-restart/reconnect. **Returns credentials only when `status` is `idle`, `starting`, or `live`** — a stream that has already `ended` returns 404/410 instead of stale, no-longer-valid credentials. |
| `POST /live/broadcasts/{stream}/end` | Owner-only. Delegates to `LiveStreamService::end($stream)` (unchanged — already purges stream-scoped Redis keys and broadcasts the real-time status change). |

**Why a dedicated action instead of the generic `media/{type}/{id}/{field}` route** (which already exists for admin uploads via `MediaRegistry`'s `live-stream` entry): `UserMediaController::resolveRecord()` deliberately does not check record ownership — by its own design, it trusts the caller to have already authorized the parent resource. Adding a `live-stream` type there would let any authenticated user upload/delete the thumbnail on *any* `match_streams` row. `LiveBroadcastController` already enforces `$stream->owner_user_id === $request->user()->id` for every other action, so the thumbnail action lives here instead, on the same ownership-checked footing.

```php
// routes/api/v1/user.php — inside auth:api group
Route::post('live/broadcasts/accept-terms', [LiveBroadcastController::class, 'acceptTerms']);
Route::post('live/broadcasts', [LiveBroadcastController::class, 'store']);
Route::post('live/broadcasts/{stream}/thumbnail', [LiveBroadcastController::class, 'uploadThumbnail']);
Route::delete('live/broadcasts/{stream}/thumbnail', [LiveBroadcastController::class, 'deleteThumbnail']);
Route::get('live/broadcasts/{stream}', [LiveBroadcastController::class, 'show']);
Route::post('live/broadcasts/{stream}/end', [LiveBroadcastController::class, 'end']);
```

### ToS acceptance endpoint

`POST /live/broadcasts/accept-terms` — no body, just sets `$request->user()->update(['broadcast_terms_accepted_at' => now()])` idempotently (calling it again just overwrites the timestamp, harmless). The app calls this once, when the user taps "Agree" on the pre-broadcast confirmation sheet, *before* the sheet unlocks the rest of `/live/go-live`. `POST /live/broadcasts` independently re-checks the column server-side (see the route table above) — the two together mean the client-side sheet is a UX nicety, not the actual enforcement mechanism, and can't be bypassed by skipping the sheet in a modified client.

Route model binding resolves `{stream}` to `MatchStream`; every action asserts `$stream->owner_user_id === $request->user()->id` (or aborts 403) — a regular user can never touch someone else's broadcast through these routes.

**Credential-handling hardening (applies to both the app and any future admin tooling that might touch these responses):**
- Never write `rtmp_url`/`stream_key` into Redux-persisted storage, `console.log`, Sentry/analytics breadcrumbs, or crash reports — pass them directly from the fetch response into the native plugin call and let them fall out of scope.
- `LiveBroadcastController` responses are the only two places these values are ever serialized. The **user-facing** `LiveStreamResource` already omits them today (verified). The **admin-only** `Admin\Http\Resources\LiveStreamListResource` and every admin list/show response must likewise never include them for a self-serve row — worth a regression test either way, see Testing plan.

### Status sync — no changes needed

`SyncStreamStatuses`/`LiveStreamService::syncStatus()` already iterate every non-ended `MatchStream` with a `provider_stream_id`, skip `provider = 'external'`, and broadcast `LiveStreamStatusUpdated` unconditionally on any status change — regardless of `owner_user_id`. Self-serve YouTube rows are picked up automatically the moment `createStandaloneYoutube()` sets `provider_stream_id`. Nothing to build here.

### YouTube VOD cleanup — new, self-serve only

**File:** `api/app/Console/Commands/PurgeExpiredBroadcastRecordings.php` (new, daily schedule)

Admin-created streams (match-linked or standalone) keep their YouTube VOD indefinitely — it's the official record. Self-serve broadcasts get a 7-day retention window instead:

```php
MatchStream::query()
    ->whereNotNull('owner_user_id')
    ->where('provider', 'youtube')
    ->where('status', 'ended')
    ->where('ended_at', '<=', now()->subDays(7))
    ->whereNotNull('provider_stream_id') // YouTube's broadcast id doubles as the resulting VOD's video id — no separate video-id column exists on match_streams
    ->lazy()
    ->each(function (MatchStream $stream) {
        app(YouTubeStreamProvider::class)->deleteVideo($stream); // new small method — Data API videos.delete
    });
```

Resolved directly via `app(YouTubeStreamProvider::class)`, not through `StreamProviderManager`/`StreamProviderResolver` — self-serve rows are always `provider = 'youtube'` by construction, so there's no need for generic driver resolution, and this avoids forcing a YouTube-only `deleteVideo()` method onto the shared `StreamProviderContract` interface.

`YouTubeStreamProvider` gains one small new method, `deleteVideo(MatchStream $stream): void`, calling `$this->yt->videos->delete($stream->provider_stream_id)`. **Test note:** verify this assumption (broadcast id doubles as VOD video id) against a real YouTube API response in a staging run before relying on it in production — the broadcast→live→complete→video-id lifecycle is documented by Google but worth confirming empirically once, since a wrong id here silently fails to delete anything rather than erroring loudly.

### Auto-end enforcement — two cases, not one

**File:** `api/app/Console/Commands/EndExpiredBroadcasts.php` (new, scheduled every minute alongside `streams:sync`)

```php
// Case 1: actually went live, past the fixed cap (LiveStreamService::SELF_SERVE_MAX_DURATION_SECONDS).
MatchStream::query()
    ->whereNotNull('owner_user_id')
    ->whereNotNull('started_at')
    ->where('started_at', '<=', now()->subSeconds(LiveStreamService::SELF_SERVE_MAX_DURATION_SECONDS))
    ->whereIn('status', ['starting', 'live'])
    ->lazy()
    ->each(fn (MatchStream $stream) => app(LiveStreamService::class)->end($stream));

// Case 2: created but never actually went live. Uses delete(), not end() — a broadcast that
// never connected has no VOD, no viewer/chat history, and nothing worth keeping; end() would
// call YouTubeStreamProvider::endStream()'s transition('complete', ...) on a broadcast that was
// never live, which can error and — more importantly — still leaves an empty draft video
// artifact sitting on the channel. delete() removes the YouTube broadcast/stream resources
// entirely via deleteStream() and drops the DB row, leaving nothing orphaned.
MatchStream::query()
    ->whereNotNull('owner_user_id')
    ->whereNull('started_at')
    ->where('created_at', '<=', now()->subMinutes(30))
    ->whereIn('status', ['idle', 'starting'])
    ->lazy()
    ->each(fn (MatchStream $stream) => app(LiveStreamService::class)->delete($stream));
```

Case 1 is the belt-and-suspenders for the plugin's own client-side timer (crashed/killed app) — both read from the same `SELF_SERVE_MAX_DURATION_SECONDS` constant so the client and server can never disagree on the cap. Case 2 is a distinct, previously-undocumented gap: without it, a user who requests a broadcast but never actually connects (denied permissions, closed the app, etc.) would be locked out of ever creating another one, since `assertNoActiveSelfServeStream()` blocks on any `idle`/`starting`/`live` row regardless of whether it ever went live — and unlike Case 1, deleting rather than ending also prevents orphaned never-used YouTube broadcast resources from piling up and quietly consuming quota. 30 minutes is a v1 default — generous enough for permission prompts and flaky connections, short enough not to frustrate a genuinely abandoned attempt.

---

## Trust & Safety / moderation — ships with v1

Opening live publishing to every user, onto Tapeya's real YouTube channel, is a materially different risk profile from admin-only broadcasts. **`can_broadcast` (this doc, consumer allowlist) is not the same thing as `AdminRoleEnum::BROADCASTER` (staff tournament-ops role, see [BROADCASTER_ROLE.md](./BROADCASTER_ROLE.md)) — do not reuse that role or its permission checks for this feature.** None of the rest of this table is optional polish:

| Control | v1 behavior |
|---|---|
| **Soft launch gate** | `users.can_broadcast` defaults `false`. Flip per-user manually from a new backoffice toggle (see File checklist) until the feature has been observed in the wild. |
| **Always unlisted** | Every self-serve `createSelfServe()` call forces `privacy: 'unlisted'` — never configurable by the end user in v1. Remember: unlisted stops discovery, not misconduct — see the note in the trade-offs table above. |
| **Rate limiting** | 1 active broadcast per user at a time (`assertNoActiveSelfServeStream`, with the case-2 auto-end job preventing permanent lockout). Route-level throttles intentionally omitted for now — re-add if abuse appears. |
| **Max duration** | `LiveStreamService::SELF_SERVE_MAX_DURATION_SECONDS` (7200 = 2 hours), enforced client-side (plugin timer) and server-side (`EndExpiredBroadcasts` case 1), both reading the same constant. |
| **Admin kill-switch + ban** | `POST /admin/users/{user}/broadcast-ban` — precisely: (1) sets `can_broadcast = false`; (2) ends **every** currently-active self-serve stream owned by that user via `LiveStreamService::end()` (v1 only ever allows one, per `assertNoActiveSelfServeStream()`, but the ban action itself should not assume that invariant holds — query for all, not just one); (3) attempts `YouTubeStreamProvider::deleteVideo()` immediately for each just-ended stream (don't wait 7 days) since a ban implies content-related cause. The existing `POST /admin/live-streams/{stream}/end` still works unchanged for a one-off force-end without a full ban. |
| **Backoffice visibility** | New "Allow broadcast" toggle on the user edit screen; new filter on the Live Streams list for `owner_user_id IS NOT NULL` — requires adding `AllowedFilter::exact('owner_user_id')` (or a boolean `self_serve` callback filter using `whereNotNull('owner_user_id')`) to `MatchStream::getFilters()`, since the admin index already runs through Spatie's `QueryBuilder` against that method (see File checklist). |
| **ToS acceptance** | `users.broadcast_terms_accepted_at` (see Data model changes) — a persisted timestamp, set via the real `POST /live/broadcasts/accept-terms` endpoint and enforced server-side on `POST /live/broadcasts`, not just a one-time in-app sheet with no server record. |
| **Monitoring** | Alert when concurrent self-serve `live`/`starting` count exceeds roughly 50, or daily `createStream()` call volume exceeds roughly 200 — both a cost signal (YouTube API quota) and an abuse signal (unexpected spike). These two numbers are v1 starting points, not measured facts — tune them against real usage once the feature has run for a few weeks. |
| **Channel isolation (recommended before wide rollout, not required for v1)** | The `StreamingSettings` config hook above exists so this is a settings change later, not a migration. Revisit once volume or a real incident justifies the operational overhead of a second channel. |

---

## The Capacitor plugin — `TapeyaBroadcastPlugin`

Registered exactly like the existing `YoutubeStreamOverlay`/`FacebookAnalytics`/`FcmToken` plugins — inlined into the native projects, not a separate npm package. **Provider-agnostic:** the plugin only ever sees an RTMP URL + stream key; whether those came from YouTube or anywhere else makes no difference to its implementation.

### JS bridge — `app/src/native/tapeyaBroadcast.js`

```js
import { registerPlugin } from '@capacitor/core';

const TapeyaBroadcast = registerPlugin('TapeyaBroadcast');

export async function requestBroadcastPermissions() {
  return TapeyaBroadcast.requestPermissions(); // { camera: 'granted'|'denied', microphone: 'granted'|'denied' }
}

export async function startBroadcastPreview({ position = 'front', x, y, width, height } = {}) {
  return TapeyaBroadcast.startPreview({ position, x, y, width, height });
}

export async function stopBroadcastPreview() {
  return TapeyaBroadcast.stopPreview();
}

export async function switchBroadcastCamera() {
  return TapeyaBroadcast.switchCamera();
}

export async function setBroadcastMuted(muted) {
  return TapeyaBroadcast.toggleMute({ muted });
}

/** @param {{ rtmpUrl: string, streamKey: string, resolution?: '720p'|'1080p', maxDurationSeconds?: number }} options */
export async function startBroadcast(options) {
  return TapeyaBroadcast.startBroadcast(options);
}

export async function stopBroadcast() {
  return TapeyaBroadcast.stopBroadcast();
}

export function onBroadcastStateChanged(callback) {
  return TapeyaBroadcast.addListener('broadcastStateChanged', callback);
  // callback receives: { state: 'connecting'|'live'|'reconnecting'|'ended'|'error', reason?: string, message?: string }
}

export function onBroadcastStats(callback) {
  return TapeyaBroadcast.addListener('broadcastStats', callback);
  // callback receives: { bitrateKbps, fps, droppedFrames, networkQuality: 'good'|'fair'|'poor' }
}
```

Same defensive pattern as `youtubeStreamOverlay.js` (existing code): guard every call behind a platform check (`Capacitor.getPlatform() !== 'web'`) so calling this from a browser dev session no-ops instead of throwing.

### Plugin lifecycle (state machine — both platforms)

```
idle
  → requesting_permissions (camera/mic prompt)
  → previewing (camera live, not yet publishing)
  → connecting (startBroadcast called, RTMP handshake in flight)
  → live (publishing, receiving encoder stats)
  → reconnecting (network drop mid-broadcast, exponential backoff retry)
     → live (recovered) | error (retries exhausted)
  → ending (stopBroadcast called, flushing/closing RTMP session)
  → ended
error (terminal-ish; UI offers "try again" → back to previewing)
```

**Reconnect contract (v1 defaults — tune after real-world testing, but define something rather than leaving it open):** initial retry delay 2s, exponential backoff ×2, capped at 30s between attempts, maximum 5 attempts before transitioning to `error`. Every transition fires `broadcastStateChanged`; the pre/during-broadcast screens are pure functions of this state plus the Reverb-driven server status.

**Bitrate fallback:** on sustained poor network (tracked via `broadcastStats.networkQuality === 'poor'` for some window, e.g. 10s), the plugin should step down encoding resolution (e.g. 1080p → 720p → 480p) rather than only reconnect-or-fail. This is a Phase 2/3 exit-criterion, not just an edge case — see Implementation phases.

### iOS — Swift, HaishinKit-based

**New files** (mirroring `YoutubeStreamOverlayPlugin.swift`/`.m` exactly):
- `app/ios/App/App/TapeyaBroadcastPlugin.swift`
- `app/ios/App/App/TapeyaBroadcastPlugin.m`

```swift
// TapeyaBroadcastPlugin.swift (shape, not full implementation)
import Capacitor
import HaishinKit
import AVFoundation

@objc(TapeyaBroadcastPlugin)
public class TapeyaBroadcastPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TapeyaBroadcastPlugin"
    public let jsName = "TapeyaBroadcast"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startPreview", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopPreview", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "switchCamera", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "toggleMute", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startBroadcast", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopBroadcast", returnType: CAPPluginReturnPromise),
    ]

    private var rtmpConnection: RTMPConnection?
    private var rtmpStream: RTMPStream?
    private var mixer: MediaMixer?
    private var previewView: MTHKView? // HaishinKit's Metal preview view, composited like YoutubeStreamOverlayPlugin's WKWebView

    // requestPermissions(): AVCaptureDevice.requestAccess(for: .video / .audio)
    // startPreview(): configure MediaMixer camera+mic inputs, attach MTHKView above the Capacitor webview
    //                 (same attachOverlay()/applyLayout() geometry-sync pattern as YoutubeStreamOverlayPlugin)
    // startBroadcast(rtmpUrl, streamKey, resolution, maxDurationSeconds):
    //     rtmpConnection.connect(rtmpUrl); rtmpStream.publish(streamKey)
    //     schedule a local timer for maxDurationSeconds → auto stopBroadcast + notifyListeners
    // RTMPConnection delegate → map connection events to broadcastStateChanged, implementing the
    //     reconnect contract above (2s → 4s → 8s → 16s → 30s, 5 attempts)
    // Stats: rtmpStream's stats stream → periodic broadcastStats
}
```

```objc
// TapeyaBroadcastPlugin.m
CAP_PLUGIN(TapeyaBroadcastPlugin, "TapeyaBroadcast",
    CAP_PLUGIN_METHOD(requestPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(startPreview, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopPreview, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(switchCamera, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(toggleMute, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(startBroadcast, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopBroadcast, CAPPluginReturnPromise);
)
```

**Registration** — `app/ios/App/App/AppBridgeViewController.swift`:
```swift
bridge?.registerPluginInstance(TapeyaBroadcastPlugin())
```

**Podfile** (`app/ios/App/Podfile`) — add inside `target 'App'`:
```ruby
pod 'HaishinKit', '~> 2.0' # loose constraint — pin exact tested version once verified, see "Version pinning" above
```

**Info.plist additions** (`app/ios/App/App/Info.plist`):
```xml
<key>NSCameraUsageDescription</key>
<string>Tapeya needs camera access so you can go live.</string>
<key>NSMicrophoneUsageDescription</key>
<string>Tapeya needs microphone access so viewers can hear your broadcast.</string>
```

**Backgrounding:** iOS suspends camera capture when the app backgrounds (no special broadcast entitlement pursued in v1). On `UIApplication.didEnterBackgroundNotification`, gracefully `stopBroadcast()` and fire `broadcastStateChanged` with `{ state: 'ended', reason: 'backgrounded' }`. **UX requirement, not just a state value:** the app must show a blocking modal on return — "Broadcast ended — you left the app. Tap to start a new broadcast." — rather than silently landing back on a stale during-broadcast screen.

### Android — Kotlin, rootencoder-based

**New file:** `app/android/app/src/main/java/com/tapbytapeya/app/TapeyaBroadcastPlugin.kt`

```kotlin
// Shape, not full implementation
package com.tapbytapeya.app

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.pedro.encoder.input.sources.audio.MicrophoneSource
import com.pedro.encoder.input.sources.video.Camera2Source
import com.pedro.library.rtmp.RtmpStream
import com.pedro.library.util.ConnectChecker

@CapacitorPlugin(name = "TapeyaBroadcast")
class TapeyaBroadcastPlugin : Plugin(), ConnectChecker {
    private var rtmpStream: RtmpStream? = null
    private var foregroundServiceStarted = false

    @PluginMethod fun requestPermissions(call: PluginCall) { /* CAMERA + RECORD_AUDIO runtime request */ }
    @PluginMethod fun startPreview(call: PluginCall) { /* Camera2Source + MicrophoneSource into an AutoFitTextureView composited above the WebView, mirroring the iOS overlay pattern */ }
    @PluginMethod fun stopPreview(call: PluginCall) { /* … */ }
    @PluginMethod fun switchCamera(call: PluginCall) { /* … */ }
    @PluginMethod fun toggleMute(call: PluginCall) { /* … */ }

    @PluginMethod
    fun startBroadcast(call: PluginCall) {
        val rtmpUrl = call.getString("rtmpUrl")?.trimEnd('/') ?: return call.reject("rtmpUrl required")
        val streamKey = call.getString("streamKey") ?: return call.reject("streamKey required")
        startForegroundBroadcastNotification() // required — see Backgrounding below
        // trimEnd above guards against a double slash — YouTube's ingestConfig() returns
        // rtmp_url and stream_key as separate fields (e.g. rtmp://a.rtmp.youtube.com/live2 + key),
        // and rtmp_url has occasionally included a trailing slash depending on the provider path.
        rtmpStream?.startStream("$rtmpUrl/$streamKey")
        call.resolve()
    }

    @PluginMethod
    fun stopBroadcast(call: PluginCall) {
        rtmpStream?.stopStream()
        stopForegroundBroadcastNotification()
        call.resolve()
    }

    // ConnectChecker overrides → notifyListeners("broadcastStateChanged", ...) / ("broadcastStats", ...),
    // implementing the same reconnect contract as iOS (2s → 4s → 8s → 16s → 30s, 5 attempts)
}
```

**Registration** — `app/android/app/src/main/java/com/tapbytapeya/app/MainActivity.java`:
```java
registerPlugin(TapeyaBroadcastPlugin.class); // before super.onCreate(), same line as FacebookAnalyticsPlugin
```

**`app/android/app/build.gradle`** dependency:
```gradle
implementation 'com.github.pedroSG94.RootEncoder:library:2.x.x' // loose constraint — pin exact tested version once verified
```
(RootEncoder is published via JitPack — confirm `maven { url 'https://jitpack.io' }` is present in the project's repositories block; add it if not.)

**`AndroidManifest.xml`** additions:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_CAMERA" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
```

**Backgrounding:** unlike iOS, Android can keep encoding while backgrounded **if** run from a foreground service with a visible notification. **Notification copy and tap target, specified:** title "You're live on Tapeya", body "Tap to return to your broadcast", tapping it deep-links to `/live/go-live/:streamId` (the same during-broadcast screen, not the app's default launch route). This is both a platform requirement (Android 14+ mandates a foreground service type for camera/mic access) and honest UX — it's visible to the OS and the user that the app is actively broadcasting. If the user swipes the app away entirely (task killed), the service dies too and the stream ends naturally (YouTube's ingest goes idle → `streams:sync` picks up the transition to `ended` on its next poll).

---

## App UI/UX flow

`TapeyaBroadcastPlugin` has no web implementation, so the entire "Go Live" surface (sidebar entry, both routes below) is gated behind `Capacitor.isNativePlatform()` — see the Entry point section for exactly where that check lives.

### Entry point — sidebar, not the Live hub

**File:** `app/src/components/Sidebar.jsx` — nav items are a flat `MENU_ITEMS` array of `{ label, icon, path }` objects. There is already a **commented-out placeholder** sitting in that array today: `/* { label: 'Go live', comingSoon: true }, */` — this doc's entry point replaces that placeholder with a real entry (`path: '/live/go-live'`), rather than adding a new array position from scratch.

Visible only when `Capacitor.isNativePlatform()` **and** `user.can_broadcast` are both true — filter `MENU_ITEMS` (or conditionally include the object) using the same helper (`app/src/platform/platform.js`'s `isNative()`) the sidebar already imports indirectly via `useNativeStoreVersionInfo` for its app-version text, rather than a fresh ad hoc check; **no such native-only gate exists on any nav item today**, so this is the first one, not a pattern already wired up. **For v1, hidden entirely when `can_broadcast` is false** — no "Request early access" flow exists or is planned (there's no form, ticket queue, or admin request-review UI to send it to); don't imply one in the UI.

### Routes — `/live/go-live` (form) before creation, `/live/go-live/:streamId` (camera + live) after

- **`/live/go-live`** — no stream exists yet. Renders the form-only pre-broadcast screen below — **no camera preview on this route**, deliberately: permissions and preview only start once a stream row actually exists, so the pre-broadcast screen is a simple form, and there's nothing camera-related to clean up if the user backs out before submitting. On successful `POST /live/broadcasts` (+ optional thumbnail upload), the app navigates to `/live/go-live/:streamId` using the returned `stream_id`.
- **`/live/go-live/:streamId`** — camera preview, permission requests, the "Start Broadcasting" action, and the live/during-broadcast UI all live here. Also the route the app deep-links back into if it was killed and relaunched mid-broadcast (or the Android "You're live" notification is tapped): `useParams()` reads `streamId`, calls `GET /live/broadcasts/{stream}` to re-fetch ingest credentials and resume at the right step (see its state machine below).

### Pre-broadcast / during-broadcast screen — a single file, not two

**One file, `app/src/pages/live/GoLive.jsx`, rendered at both routes, mode driven by whether `:streamId` is present** — not a separate `GoLiveDuringBroadcast.jsx`. The route already encodes the mode, so a second component would just duplicate the routing logic as a prop instead of reading it from `useParams()`:

```jsx
export default function GoLive() {
  const { streamId } = useParams();
  return streamId ? <DuringBroadcast streamId={streamId} /> : <PreBroadcast />;
}
```

(`DuringBroadcast`/`PreBroadcast` can be local sub-components in the same file, or split into their own files under `src/pages/live/` if the file grows unwieldy — either way, `GoLive.jsx` is the one thing registered on both routes.)

### Pre-broadcast (route `/live/go-live`) — form only

1. First-ever use → community guidelines confirmation sheet (blocking) → `POST /live/broadcasts/accept-terms` on confirm.
2. Form fields: **Title** (required), **Description** (optional), **Stream Thumbnail** (optional image picker — cropped/previewed to the 360×185 aspect ratio, matching the backoffice's `stream-thumbnail.constants.ts` values so Live hub cards look consistent regardless of who uploaded the image; see Data model changes). No camera, no permission prompts yet.
3. "Go Live" button:
   a. `POST /live/broadcasts` (JSON: title, description) → receive `{ stream_id, rtmp_url, stream_key }`.
   b. If a thumbnail was picked, follow up with `POST /live/broadcasts/{stream_id}/thumbnail` (multipart) — a failure here is non-fatal to the flow (log it, the stream still goes live with a branded placeholder), not something that should roll back stream creation.
   c. Navigate to `/live/go-live/{stream_id}`.
4. Set expectations before navigating: "Your stream will appear on the Live hub within about a minute" (see Hub visibility caveat above).

### During-broadcast (route `/live/go-live/:streamId`) — permissions, preview, publish, then the live UI

This screen now owns the full sequence from "row exists" to "actually publishing," not just the live view:

1. On mount: `requestBroadcastPermissions()` → if denied, native OS "open settings" prompt.
2. `startBroadcastPreview()` renders the live camera feed as a native overlay (identical compositing technique to `IosNativeStreamOverlay.jsx`, generalized for the broadcaster's own camera instead of an incoming YouTube embed) — the broadcaster can see themselves before committing to go live.
3. **"Start Broadcasting" button** — a deliberate, explicit action distinct from merely previewing (going live is consequential; don't auto-publish the instant the camera preview is ready). Tapping it calls `startBroadcast({ rtmpUrl, streamKey, maxDurationSeconds: LiveStreamService.SELF_SERVE_MAX_DURATION_SECONDS })` using the credentials already fetched from `POST /live/broadcasts` (or re-fetched via `GET /live/broadcasts/{stream}` if this is a resume-after-relaunch).
4. Once publishing (plugin state `live`), the existing real-time UI takes over — every one of these is already-shipped infrastructure, keyed by `streamId`:
   - `useLiveStreamChannel(streamId)` — server-confirmed status.
   - `useStreamPresenceChannel(streamId)` — live viewer count.
   - `useStreamComments(streamId)` / hearts — **intentional, not an oversight**: the broadcaster sees the exact same live chat feed viewers do (per Design Principle #6), so they can read and respond to comments and hearts while live — engagement is the whole point. Given the camera preview is the primary use of screen space here (unlike the viewer's dedicated player real estate), render it as a **compact/collapsible overlay** (e.g. a bottom sheet the broadcaster can expand/minimize), not a full-height panel — same data and hooks as the viewer, different chrome.
   - New: a small signal-strength indicator driven by `onBroadcastStats` (`networkQuality`), and an elapsed-time counter capped visually at 2:00:00.
5. "End Broadcast" button (confirm dialog) → `stopBroadcast()` (native) + `POST /live/broadcasts/{streamId}/end` (server) — call both; either one alone leaves the other side momentarily out of sync until `streams:sync`'s next poll catches up.

A resumed session (app relaunched mid-broadcast) skips straight to step 4 if the re-fetched stream is already `live`, or resumes at step 1/2 if it's still `idle`/`starting` and the plugin never actually connected.

### Post-broadcast screen
Duration, peak viewer count (from the presence hook's high-water mark), a note that the recording auto-deletes in 7 days.

### Viewer side
**No new code — this is already-shipped infrastructure, not a plan.** `LiveBroadcast.jsx`, `IframeStreamPlayer.jsx` (web/Android), and `IosNativeStreamOverlay.jsx` (iOS) already render YouTube iframe playback for any `MatchStream` by `streamId`, standalone or self-serve alike, once it's `live`/`starting` and passes `visibleInApp()`. The only cosmetic addition worth considering: show "Hosted by @nickname" on the card/viewer using `owner_user_id` — a small addition to `LiveStreamResource` (`'broadcaster' => $stream->owner ? ['id' => ..., 'name' => ...] : null`), not a new UI paradigm.

---

## File checklist

### API (Laravel)

| Action | File |
|---|---|
| Add | `database/migrations/…_add_owner_to_match_streams.php` |
| Add | `database/migrations/…_add_can_broadcast_and_tos_to_users.php` |
| Update | `app/Settings/StreamingSettings.php` — nullable second-channel config hook (`selfServeYoutubeChannelId`) |
| Update | `app/Models/MatchStream.php` — `owner_user_id` fillable, `isSelfServe()`, `owner()` relation, `AllowedFilter::exact('owner_user_id')` (or a `self_serve` callback filter) added to `getFilters()` |
| Update | `app/Models/User.php` — `can_broadcast`, `broadcast_terms_accepted_at` fillable/casts |
| Update | Whatever resource backs `GET /me` (`UserResource` or equivalent) — expose `can_broadcast`, `broadcast_terms_accepted_at` |
| Update | `app/Streaming/LiveStreamService.php` — `SELF_SERVE_MAX_DURATION_SECONDS` constant, `createSelfServe()` (with the hard-require-YouTube guard); one additive line in `createStandaloneYoutube()` |
| Update | `app/Streaming/Providers/YouTubeStreamProvider.php` — add `deleteVideo(MatchStream $stream): void` |
| Add | `app/Http/Controllers/User/LiveBroadcastController.php` — `store`, `show`, `end`, `acceptTerms`, `uploadThumbnail`, `deleteThumbnail` |
| Add | `app/Console/Commands/EndExpiredBroadcasts.php` |
| Add | `app/Console/Commands/PurgeExpiredBroadcastRecordings.php` |
| Update | `routes/api/v1/user.php` — `live/broadcasts*` routes (incl. `accept-terms`, `thumbnail`) |
| Update | `app/Http/Resources/User/LiveStreamResource.php` — `broadcaster` field (`id`/`name`/`nickname`/`avatar_url`), present only when `isSelfServe()` |
| Add | `app/Http/Controllers/Admin/UserBroadcastBanController.php` (or a method on an existing admin `UserController`) |
| Add tests | `tests/Feature/LiveStream/SelfServeBroadcastTest.php` |
| Add tests | `tests/Feature/Console/EndExpiredBroadcastsTest.php` (both cases — confirm Case 2 uses `delete()`, no orphan `provider_stream_id` rows survive) |
| Add tests | `tests/Feature/Console/PurgeExpiredBroadcastRecordingsTest.php` |
| Add tests | Regression: `LiveStreamResource` (user) and `Admin\Http\Resources\LiveStreamListResource` (admin) never include `rtmp_url`/`stream_key` for any stream |

### App (React + Capacitor)

| Action | File |
|---|---|
| Add | `src/native/tapeyaBroadcast.js` |
| Add | `src/pages/live/GoLive.jsx` — single file, both `/live/go-live` and `/live/go-live/:streamId` render through it, mode driven by `useParams()` |
| Add | `src/lib/constants/streamThumbnail.constants.js` — mirrors the backoffice's `stream-thumbnail.constants.ts` values (360×185, aspect 360:185) for the thumbnail picker's crop/preview |
| Update | `src/store/api/liveApi.js` — `createBroadcast`, `getBroadcast`, `endBroadcast`, `acceptBroadcastTerms`, `uploadBroadcastThumbnail`, `deleteBroadcastThumbnail` mutations |
| Update | `src/App.jsx` — `/live/go-live` and `/live/go-live/:streamId` routes |
| Update | `src/components/Sidebar.jsx` — replace the commented-out `{ label: 'Go live', comingSoon: true }` placeholder in `MENU_ITEMS` with a real entry (`path: '/live/go-live'`), filtered by `Capacitor.isNativePlatform() && can_broadcast` |
| Update | Auth/`me` consumer (wherever the app reads the current user profile) — surface `can_broadcast`/`broadcast_terms_accepted_at` from the updated `GET /me` response |

### iOS native

| Action | File |
|---|---|
| Add | `ios/App/App/TapeyaBroadcastPlugin.swift` |
| Add | `ios/App/App/TapeyaBroadcastPlugin.m` |
| Update | `ios/App/App/AppBridgeViewController.swift` — register instance |
| Update | `ios/App/Podfile` — `pod 'HaishinKit'`, pin exact version once verified |
| Update | `ios/App/App/Info.plist` — camera/mic usage strings |

### Android native

| Action | File |
|---|---|
| Add | `android/app/src/main/java/com/tapbytapeya/app/TapeyaBroadcastPlugin.kt` |
| Update | `android/app/src/main/java/com/tapbytapeya/app/MainActivity.java` — `registerPlugin(...)` |
| Update | `android/app/build.gradle` — rootencoder dependency, pin exact version once verified (+ JitPack repo if missing) |
| Update | `android/app/src/main/AndroidManifest.xml` — camera/mic/foreground-service permissions |

### Backoffice (Angular)

| Action | File |
|---|---|
| Update | User edit screen — "Allow broadcast" toggle (`can_broadcast`) |
| Update | Live Streams list — filter for `owner_user_id IS NOT NULL` |
| Add | Ban action wired to `POST /admin/users/{user}/broadcast-ban` |

---

## Testing plan

### Backend
- [ ] `POST /live/broadcasts` rejected (403) for `can_broadcast = false` users
- [ ] `POST /live/broadcasts` rejected (403) when `broadcast_terms_accepted_at` is `null`; `POST /live/broadcasts/accept-terms` sets it and unblocks the next call
- [ ] `POST /live/broadcasts` creates a `match_id = NULL, owner_user_id = {user}, provider = youtube` row with `privacy: 'unlisted'`, via `createStandaloneYoutube()`
- [ ] `GET /me` (or equivalent) response includes `can_broadcast` and `broadcast_terms_accepted_at`
- [ ] `createSelfServe()` aborts with 503 (fails closed, does not silently provision the wrong provider) if `StreamingSettings::$defaultProvider !== 'youtube'`
- [ ] Second concurrent `POST /live/broadcasts` from the same user → 422 (`assertNoActiveSelfServeStream`)
- [ ] `GET /live/broadcasts/{stream}` rejected (403) for a non-owner user; returns 404/410 once `status = ended`
- [ ] `POST /live/broadcasts/{stream}/end` rejected (403) for a non-owner user
- [ ] `EndExpiredBroadcasts` case 1: ends a `started_at`-set stream past `SELF_SERVE_MAX_DURATION_SECONDS`; case 2: **deletes** (not just ends) an `idle`/`starting` stream with no `started_at` past 30 minutes, confirmed via `assertDatabaseMissing` that no row (and no orphaned `provider_stream_id` on YouTube) survives; both cases leave admin/match-linked streams alone
- [ ] `streams:sync` updates a self-serve stream's status identically to an admin YouTube stream, and `LiveStreamStatusUpdated` fires on `live-stream.{streamId}` regardless of `owner_user_id`
- [ ] `PurgeExpiredBroadcastRecordings` deletes the YouTube video for a self-serve stream ended 7+ days ago, leaves admin streams and self-serve streams ended <7 days ago untouched
- [ ] Admin ban action sets `can_broadcast = false`, ends **every** active self-serve stream for that user (not just one), and attempts immediate YouTube video deletion for each
- [ ] Admin Live Streams list: `?filter[owner_user_id]=…` (or the `self_serve` equivalent) returns only self-serve rows
- [ ] Regression: no list/show response for any stream (self-serve or otherwise) ever includes `rtmp_url`/`stream_key` — check both the user-facing `LiveStreamResource` and the admin `LiveStreamListResource`
- [ ] `POST /live/broadcasts/{stream}/thumbnail` rejected (403) for a non-owner user; accepted for the owner, writes to the same `stream_thumbnail` column/disk path an admin upload would
- [ ] `DELETE /live/broadcasts/{stream}/thumbnail` clears the column; `thumbnailUrl()` falls back to the existing branded-placeholder null behavior
- [ ] A non-owner (or unauthenticated) request to the generic `media/live-stream/{id}/thumbnail` route — confirm this route is never exposed on the user side for `MatchStream` (only admin), i.e. `UserMediaController::TYPES` still has no `live-stream` entry

### Plugin / native (manual device matrix — cannot be meaningfully automated)
- [ ] iOS: permission denial → clear "open Settings" prompt; permission grant → live preview within 1s
- [ ] Android: same, plus foreground-service notification appears the instant `startBroadcast` is called, with the specified copy and tap target
- [ ] Backgrounding mid-broadcast: iOS ends gracefully and shows the "you left the app" modal on return; Android continues via foreground service until task-killed
- [ ] Network drop → `reconnecting` state, retries per the defined backoff contract → recovers within the window, or transitions to `error` after 5 attempts
- [ ] Camera flip and mute toggle mid-broadcast do not interrupt the RTMP session
- [ ] 2-hour cap auto-stops both client-side (plugin timer) and server-side (`EndExpiredBroadcasts` case 1) if one path fails
- [ ] Sustained poor network triggers the bitrate step-down rather than only reconnect/fail
- [ ] Older/low-end Android devices (limited hardware encoder profiles) fall back gracefully without crashing
- [ ] Record the exact HaishinKit/rootencoder version tested, once verified, in the File checklist above

### End-to-end
- [ ] Tap "Go Live" from the sidebar (hidden/absent when `can_broadcast` is false) → fill the form (title, description, thumbnail) → submit → land on `/live/go-live/:streamId` with camera preview showing, RTMP not yet publishing → tap "Start Broadcasting" → confirm the tap, not merely the preview appearing, is what triggers `startBroadcast()`
- [ ] The uploaded thumbnail appears on the Live hub card and viewer once the stream is visible; skipping the thumbnail falls back to the branded placeholder exactly like an admin-created standalone stream with no custom image
- [ ] Start a broadcast on a real device → visible to the broadcaster immediately on `/live/go-live/:streamId`; appears in the public `/live` hub within one `streams:sync` poll (up to ~60s) → a second device opens the viewer and sees video via the existing YouTube iframe/native-overlay player
- [ ] Confirm the broadcast is `unlisted` — not visible on Tapeya's public YouTube channel page or in YouTube search, only reachable via the in-app embed
- [ ] Chat + hearts + viewer count work identically to an admin-created standalone stream
- [ ] End broadcast → viewer sees "ended" state within one poll cycle; YouTube video exists but stays unlisted; `PurgeExpiredBroadcastRecordings` removes it after 7 days (verify via a shortened TTL in a staging run, not by waiting 7 real days)
- [ ] A broadcaster who never connects has their abandoned row auto-ended within 30 minutes and can start a new broadcast afterward

---

## Implementation phases

### Phase 1 — Backend foundation

Everything here is backend-only, but includes the two pieces easy to mistakenly defer until "the UI needs them" — the user-profile fields and the ToS endpoint — both of which Phase 4 is actually blocked on:

1. `owner_user_id` migration; `users.can_broadcast` + `broadcast_terms_accepted_at` migration.
2. **`GET /me` (or equivalent) updated to expose `can_broadcast` + `broadcast_terms_accepted_at`** — without this Phase 4 has no way to gate the entry point or the ToS sheet.
3. `LiveStreamService::SELF_SERVE_MAX_DURATION_SECONDS` constant; `createSelfServe()` (wrapping `createStandaloneYoutube()`, with the hard-require-YouTube guard) + `assertNoActiveSelfServeStream()`.
4. `LiveBroadcastController` (`store`/`show`/`end`/`acceptTerms`) + routes + credential-exposure hardening + server-side ToS enforcement on `store`.
5. `EndExpiredBroadcasts` (case 1 ends, case 2 deletes) + `PurgeExpiredBroadcastRecordings` commands, scheduled alongside `streams:sync`.
6. `YouTubeStreamProvider::deleteVideo()`.
7. Admin ban action (ends *every* active self-serve stream for the user, not just one) + `AllowedFilter::exact('owner_user_id')` on `MatchStream::getFilters()` + backoffice "Allow broadcast" toggle + Live Streams list filter.
8. `StreamingSettings` second-channel config hook (unused).
9. Tests per the Backend section above.

**Exit criteria:** Postman flow — create broadcast as an allowlisted test user (with `broadcast_terms_accepted_at` set via the accept-terms call first), receive RTMP credentials, publish from any RTMP tool (e.g. `ffmpeg` or OBS pointed at the returned URL) to confirm the YouTube pipe + `streams:sync` status transitions + `/live` hub listing + Reverb status updates all work **before** the native plugin exists.

### Phase 2 — iOS plugin (HaishinKit)
1. Pod install (record exact tested version), Info.plist strings, plugin scaffold + registration.
2. Preview (camera/mic capture, native overlay compositing).
3. Publish (`startBroadcast`/`stopBroadcast`, state machine, stats).
4. Reconnection per the defined backoff contract + backgrounding handling (including the "you left the app" modal).
5. Bitrate fallback on sustained poor network.

**Exit criteria:** a real iPhone can go live end-to-end against the Phase 1 backend; a second device can view it via the existing native YouTube overlay player; poor-network step-down and the 5-attempt reconnect contract both verified on a real device.

### Phase 3 — Android plugin (rootencoder)
Same shape as Phase 2 (record exact tested version), plus the foreground-service requirement with the specified notification copy and tap target.

**Exit criteria:** feature parity with iOS on a real Android device.

### Phase 4 — App UI
Sidebar "Go Live" entry (replacing the commented-out placeholder in `MENU_ITEMS`), gated by `Capacitor.isNativePlatform() && can_broadcast`; `GoLive.jsx` form (title, description, thumbnail) on `/live/go-live`; permissions/preview/"Start Broadcasting"/live UI on `/live/go-live/:streamId`; ToS confirmation sheet wired to `broadcast_terms_accepted_at`; post-broadcast screen.

**Exit criteria:** a non-technical allowlisted tester can tap "Go Live" from the sidebar, fill in the form (with or without a thumbnail), preview themselves on camera, explicitly start broadcasting, and end the broadcast — without engineering assistance, on both platforms.

### Phase 5 — Operational monitoring

There is no viewer-facing reporting/flagging feature in this product — moderation is admin-initiated only, via the ban action already shipped in Phase 1 (`POST /admin/users/{user}/broadcast-ban`, with its backoffice toggle and Live Streams list filter). What remains here is purely operational: monitoring/alerting on YouTube channel concurrency and API quota usage, so staff notice a problem (or abuse) before users do. Delivered:

- `App\Streaming\Support\YouTubeQuotaTracker` — a cache-backed daily counter, incremented at every `YouTubeStreamProvider` Google API call site (`liveStreams.insert`, `liveBroadcasts.insert`/`.bind`/`.transition`/`.delete`, `liveBroadcasts.list`, `liveStreams.list`, `videos.delete`) using Google's documented per-call unit costs. `list` calls are approximated at 1 unit regardless of `part`.
- `StreamingSettings` gained three new fields: `concurrentBroadcastAlertThreshold` (default 3 — a starting point, not a verified channel ceiling), `dailyYoutubeQuotaBudget` (default 10,000, Google's default project quota), `quotaAlertThresholdPercent` (default 80).
- `App\Console\Commands\MonitorBroadcastOperations` (`broadcasts:monitor-operations`, scheduled every 15 minutes) — checks concurrent `starting`/`live` YouTube streams against the threshold, and today's tracked quota usage against the budget/percent threshold. Each check alerts at most once per "breach episode" (a cache flag suppresses repeats while the condition persists, and clears once the metric recovers so a later re-breach alerts again).
- Two new admin notifications following the exact existing `*AdminNotification` pattern (database to the System user's admin inbox + mail to `AdminNotificationSettings::$adminEmails`): `BroadcastConcurrencyAlertAdminNotification`, `YouTubeQuotaAlertAdminNotification`. Wired into `AdminNotificationTypeEnum`, `BroadcastEventNames`, and `ResolveAdminInboxBroadcast` like every other admin notification.
- **Root-cause quota fix, not just visibility:** `streams:sync`'s per-stream polling (2 API calls × N active streams, every minute) was the dominant quota cost and the thing that actually scales badly with growth. `StreamProviderContract` gained a `syncStatuses(Collection $streams): void` batch method; `YouTubeStreamProvider` implements it as one `liveBroadcasts.list` + one `liveStreams.list` call per 50 streams (YouTube's per-request `id` limit), replacing 2 calls per stream. `LiveStreamService::syncStatuses()` and `SyncStreamStatuses` (now `chunk(50, …)` instead of `lazy()->each(…)`) drive the batching; `syncStatus()` (single-stream, used by the admin manual "sync" button) is unchanged and now just delegates to the batch method with one stream.
- Tests: `tests/Feature/Console/MonitorBroadcastOperationsTest.php`; `SyncStreamStatusesTest.php` continues to cover the batched command path.

**Exit criteria:** a staff member can find, force-end, and ban an abusive broadcaster — including immediate YouTube video deletion — in under a minute, and gets an alert if YouTube channel concurrency or API quota approaches its limit.

### Phase 6 — Rollout
Flip `can_broadcast` for a widening allowlist, watch YouTube channel concurrent-broadcast count and API quota usage, then open broadly. Revisit the dedicated second-channel option once volume or an incident justifies it.

### Parallel-track, not a blocker: `GET /live/matches` → `GET /live/streams` rename

Recommended cleanup, tracked in the Naming & Route Glossary above and the Independent Streams doc — the hub route's name predates streams being decoupled from matches, even though it already returns `MatchStream::visibleInApp()` rows correctly today. Renaming it is good naming hygiene but nothing in this doc's phases functionally depends on it — self-serve broadcasts show up under the current name exactly as well as under a renamed one. Concrete steps, whenever this gets picked up:

1. **API:** add `GET /live/streams` returning the same `LiveStreamController@index` response; keep `GET /live/matches` as a deprecated alias pointing at the same controller method for one release, then remove it.
2. **App:** `liveApi.js`'s `getLiveStreams` query switches its `url` from `/live/matches` to `/live/streams` — no change to the query/hook name, tags, or any consumer, since those are already stream-centric (see the glossary note above).
3. **Tests:** add `tests/Feature/LiveStream/LiveStreamListingTest.php` covering both the new route and the deprecated alias during the overlap release.

---

## Edge cases & notes

| Scenario | Behavior |
|---|---|
| App force-quit mid-broadcast | YouTube ingest goes idle → `streams:sync`'s next poll (≤60s) transitions status to `ended` (independent of `EndExpiredBroadcasts`, a second safety net) |
| User revokes camera/mic permission mid-broadcast (OS settings) | Plugin detects capture session interruption → `state: 'error'` → forces `stopBroadcast` |
| Two broadcasts attempted back-to-back quickly | Second blocked by `assertNoActiveSelfServeStream` until the first is fully `ended` |
| Broadcaster never actually connects after creating a broadcast | `EndExpiredBroadcasts` case 2 **deletes** the row and its YouTube resources after 30 minutes (not just marks it ended) so the user isn't permanently locked out and no orphan draft broadcast lingers on the channel |
| Phone call / other camera app interrupts (iOS) | `AVCaptureSession` interruption notifications → pause preview, attempt resume on interruption-ended; if RTMP was live, treat as a network-equivalent drop → `reconnecting` |
| Sustained poor network throughout | Automatic bitrate step-down (1080p → 720p → 480p) rather than only reconnect/fail |
| Admin bans mid-broadcast | `broadcast-ban` calls `LiveStreamService::end()` (transitions the YouTube broadcast to `complete` via the existing path) and attempts immediate `deleteVideo()` rather than waiting for the 7-day job — the phone's next RTMP packets are rejected once the broadcast is no longer live, and the plugin surfaces `state: 'error'` |
| Self-serve stream on someone's profile after it ends | Stays in the DB (status `ended`) — hidden from the `/live` hub; YouTube video purged after 7 days by `PurgeExpiredBroadcastRecordings`, or immediately if the end was a content ban |
| A self-serve stream sits in `idle`/`starting` briefly after creation | Broadcaster sees it on `/live/go-live/:streamId`; it does **not** yet appear on the public `/live` hub until `streams:sync` flips status to `live`/`starting` visible-in-app — see the Hub visibility caveat above |

---

## Related docs

- [LIVE_STREAM_INDEPENDENT_STREAMS.md](./LIVE_STREAM_INDEPENDENT_STREAMS.md) — standalone `MatchStream`, stream-scoped Reverb/chat/hearts/presence — **fully built**, this doc reuses it as-is
- [LIVE_STREAM_YOUTUBE_FINAL.md](./LIVE_STREAM_YOUTUBE_FINAL.md) — `YouTubeStreamProvider`, iframe/native-overlay playback, provider abstraction (`StreamProviderContract`) this whole family builds on — reused verbatim for ingest and playback here
- [BROADCASTER_ROLE.md](./BROADCASTER_ROLE.md) — the *staff* broadcaster role (tournament ops); unrelated to this doc's consumer-facing "any user can go live" feature — do not conflate `AdminRoleEnum::BROADCASTER` (staff) with `can_broadcast` (self-serve broadcasting user)
- [LIVE_STREAM_CLOUDFLARE_STEPS.md](./LIVE_STREAM_CLOUDFLARE_STEPS.md) — evaluated as the ingest/playback provider for this feature and **not used**; YouTube was chosen instead to reuse the existing provider/player stack. Kept as a future option if YouTube's channel-concurrency/moderation trade-offs above become limiting.
