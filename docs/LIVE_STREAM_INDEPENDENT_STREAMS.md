# Independent Live Streams — End-to-End Implementation Guide

**Status:** Planned — **reviewed against codebase, ready to implement with locked decisions below**  
**Date:** June 2026  
**Prerequisite:** [LIVE_STREAM_YOUTUBE_FINAL.md](./LIVE_STREAM_YOUTUBE_FINAL.md) (current YouTube provider stack)  
**Goal:** Decouple live video from `matches` so Tapeya can run standalone broadcasts without creating a tournament or fixture, while keeping match-attached streams working unchanged.

---

## Summary

Today every row in `match_streams` requires a `match_id`. The app lists streams by joining `matches` and only shows open-tournament fixtures. Backoffice stream setup lives inside **Match Controller**.

**Target state:**

| Area | Change |
|------|--------|
| Database | `match_id` nullable; add `title`, `description`, **`streaming_url`** (nullable) |
| Standalone streams | Created from **Live Streams** menu with **`streaming_url` required** — that URL is the app playback source (no YouTube API required) |
| Match-attached streams | Unchanged YouTube RTMP workflow in Match Controller; `streaming_url` optional (public watch link / override) |
| App listing | Card **title** = stream title (fallback: `Home vs Away`); **subtitle** = description (fallback: tournament name) |
| App viewer | Same player UX; route keyed by **stream id** |
| YouTube / RTMP | Same provider flow as today |

---

## Code Review — Required Corrections (vs current codebase)

These gaps were found by comparing this doc to the actual code. **Address all of them in Phase 1–3 before shipping standalone streams** — several will cause runtime failures on day one if skipped.

| # | Area | Risk | Required fix |
|---|------|------|--------------|
| 1 | `SyncStreamStatuses` | **Crash (NPE)** on first standalone row | Command calls `$resolver->forMatch($stream->match)` and `$service->syncStatus($stream->match)` — both require a non-null `TournamentMatch`. **Phase 1 blocker:** refactor service methods to accept `MatchStream` directly; command must use `$resolver->forStream($stream)` and `$service->syncStatus($stream)`. |
| 2 | `LiveStreamController@index` | Standalone rows **never appear** | Current code uses `TournamentMatch::query()->join('match_streams', …)` — an INNER JOIN on `match_id` excludes all `match_id IS NULL` rows. **Full rewrite** to `MatchStream::query()->visibleInApp()`, not a light refactor. |
| 2b | `LiveStreamMatchResource` | Wrong/missing fields for standalone | Resource is built around `$this->resource` as `TournamentMatch` and calls `$match->streamThumbnailUrl()`. **Replace with a stream-centric resource** (`LiveStreamResource`) that serializes `MatchStream` + optional `match` relation — do not extend the existing class. |
| 3 | `normaliseLiveStreamMatches` | **Semantic collision** on `matchId` | Today `matchId` is a **display string** (`"Team A vs Team B"`), not a numeric id — yet `liveBroadcastPath(match.id)` passes the **match primary key**. Renaming must split these: `streamId` (numeric, for routes) vs `title` (display). Audit every call site. |
| 4 | `LiveBroadcast.jsx` | Viewer breaks if changed piecemeal | Route param (`matchId`), `useParams()`, `useGetMatchQuery(matchId)`, and `useMatchStreamChannel(matchId)` are coupled. **All four must change together** in one PR: `:streamId` → `useGetLiveStreamQuery(streamId)` → `useLiveStreamChannel(streamId)`. |
| 5 | `useMatchStreamChannel` | Reverb updates **wrong cache** | Replace with `useLiveStreamChannel(streamId)` — **`live-stream.{streamId}` only**; patch `getLiveStream` + `getLiveStreams` RTK caches |
| 6 | Backoffice `MatchStreamService` TS | Type errors / wrong assumptions | `MatchStreamRow.match_id: number` is non-nullable; all methods are match-scoped. Standalone CRUD needs new interfaces and endpoints — see [Backoffice TypeScript interfaces](#backoffice-typescript-interfaces). |
| 7 | `LiveBroadcast.jsx` presence | **Stream-scoped in v1** | After route → `:streamId`, use `useStreamPresenceChannel(streamId)` (not match id). Works for standalone and match-linked. |
| 8 | `LiveBroadcastItem` props | Component expects full `match` | Refactor to **broadcast view-model**; chat/hearts keyed by **`streamId`**, not `match.id` |
| 9 | RTK list cache | Hub stale after Reverb | Hook must also patch `liveApi.getLiveStreams` (list) when status changes, not only `getLiveStream` + `getMatch`. |
| 10 | Reverb architecture | **Clean cut** — no dual-fire, no legacy `match.{id}.stream|chat|presence`; delete old events and hooks in same release |
| 11 | Match stream create | `title`/`description` not persisted today | Phase 1 must save `title`/`description` on `match_streams` for match-linked creates too (currently only sent to YouTube via `CreateStreamData`). |
| 12 | Old app URLs | Bookmark redirect only | Optional HTTP redirect `/live/broadcast/match/:matchId` → stream id (routing). **Not** legacy Reverb — remove all `match.*.stream|chat|presence` subscriptions. |

---

## Production Readiness — Verdict & Locked Decisions

### Verdict

The doc is **sound and implementable**. The single-table nullable-`match_id` approach is the right call for v1: minimal migration risk, preserves match stream history, and reuses the full YouTube stack.

Ship it in the phased order below, but treat the **Code Review** table (items 1–12) as a hard gate — not nice-to-haves.

### Locked decisions (resolve open questions — implement as stated)

| # | Question | **Decision for v1** |
|---|----------|---------------------|
| 1 | Chat on standalone | **Enabled in v1** — migrate chat/hearts to **stream-scoped** API + Reverb (`live-stream.{streamId}.chat`); same UI as match-linked streams |
| 2 | Standalone thumbnail | **YouTube `hqdefault` only** — no `match_streams.thumbnail` column in v1 |
| 3 | Broadcast staff menu | **Yes** — add Live Streams to `broadcastStaffNavItems` |
| 4 | URL migration | **Stream id primary** — `/live/broadcast/:streamId` only; optional HTTP redirect from old match-id bookmarks (routing only, not Reverb) |
| 5 | API id field | **`id` = stream id** in list/show responses; omit redundant `stream_id` in v1 (app uses `row.id` as `streamId`) |
| 6 | Reverb event | **`LiveStreamStatusUpdated` only** on `live-stream.{streamId}` — **delete** `MatchStreamStatusUpdated`; no dual-fire on match channels |
| 7 | Service naming | **`LiveStreamService`** replaces `MatchStreamService`; delete old class when migration ships |
| 8 | Standalone playback | **`streaming_url` required** on independent create; `provider = external`; manual Go Live / End |
| 9 | Standalone visibility | All standalone streams with status `live`/`starting` appear in app hub — no tournament filter |
| 10 | No legacy Reverb | **Clean cut** — delete `MatchStreamStatusUpdated`, `MatchChatMessageReceived`, `MatchHeartReceived`; no dual-fire on `match.{id}.*` channels |

### Recommended deploy order (production)

Deploy in this order to avoid broken production between releases:

```
1. API Phase 1  → migration + service + cron fix + admin CRUD
2. API Phase 2  → user list/show + stream-scoped Reverb/chat + **remove** old match-scoped stream/chat events
3. Backoffice Phase 4 → ops can create standalone streams
4. App Phase 3    → stream-id routes + normalizer + stream-scoped Echo (single release, no old listeners)
```

Ship API Phase 2 and App Phase 3 together (or API first immediately before app). **No dual-broadcast period.**

### What the approach gets right (keep as-is)

- Single table, nullable FK, partial unique index
- **`streaming_url` for independent streams** — no YouTube account required for generic events
- `playbackForApp()` centralizes playback shape for list + viewer + scorecard
- **`match_streams.id` (`streamId`) is the single source of truth** for live broadcast realtime (status, chat, hearts, presence)
- Stream-scoped Reverb only — **no** `match.{matchId}.stream|chat|presence`

---

## Current vs Target Architecture

### Current (match-only)

```
Backoffice Match Controller
        │
        ▼
POST /admin/matches/{match}/stream
        │
        ▼
match_streams (match_id NOT NULL, UNIQUE)
        │
        ├── streams:sync (YouTube rows only)
        ├── Reverb: match.{matchId}.stream   ← REMOVED in new architecture
        └── GET /live/matches  → JOIN matches + open tournament filter
```

### Target (match optional)

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│ Backoffice: Live Streams    │     │ Backoffice: Match Controller │
│ (new side menu)             │     │ (existing)                   │
└──────────────┬──────────────┘     └──────────────┬───────────────┘
               │                                    │
               ▼                                    ▼
        POST /admin/live-streams          POST /admin/matches/{match}/stream
               │  (title + streaming_url)         │  (YouTube RTMP)
               └────────────────┬───────────────────┘
                                ▼
                    match_streams (match_id NULLABLE, streaming_url)
                                │
                    LiveStreamService (refactored)
                                │
               ┌────────────────┼────────────────┐
               ▼                ▼                ▼
    URL playback (standalone)  YouTube provider   streams:sync (YouTube rows only)
               │                                │
               └──────────────► App /live hub + /live/broadcast/:streamId
```

---

## Design Principles

1. **One table, two modes** — Keep `match_streams` (avoid a disruptive rename in v1). A stream is either **standalone** (`match_id IS NULL`) or **match-linked** (`match_id` set).
2. **Stream id is the single source of truth for live broadcast** — Reverb, chat API, Redis keys, and app subscriptions use `match_streams.id` only. **`match_id` links a stream to a fixture for scorecard/deep links — not for realtime channels.**
3. **Display fallbacks preserve backward compatibility** — Existing match streams without `title`/`description` still show team names and tournament name.
4. **Two playback sources** — **Match-linked:** YouTube RTMP pipeline (unchanged). **Standalone:** admin-supplied **`streaming_url`** drives app playback — no YouTube OAuth call required.
5. **Scoring/graphics stay match-scoped** — Standalone streams do not get scorecard, ball-by-ball, or OBS graphic overlays unless explicitly linked to a match later.
6. **Live chat is stream-scoped in v1** — Comments, hearts, and viewer presence use **`streamId`**, not `matchId`, so independent streams have the same chat UX as match-linked streams.

### Column roles (do not conflate)

| Column | Set by | Used for |
|--------|--------|----------|
| **`streaming_url`** | Admin (required for standalone create) | **Primary playback input** for independent streams; optional on match-linked rows |
| `embed_url` | YouTube provider after API create | Normalized YouTube iframe embed (match-linked YouTube) |
| `playback_url` | Future HLS provider (Cloudflare) | Provider-generated HLS manifest URL |
| `ingest_rtmp_url` + `stream_key_encrypted` | YouTube provider | OBS/vMix ingest (match-linked / optional YouTube standalone) |

Standalone streams with only `streaming_url` use **`provider = 'external'`**, skip `streams:sync`, and use **manual status** (admin marks live / ended).

---

## Database Changes

### Migration: `make_match_streams_independent`

**File:** `api/database/migrations/2026_xx_xx_xxxxxx_make_match_streams_independent.php`

#### 1. Drop existing unique constraint on `match_id`

Current migration enforces `match_id` unique + NOT NULL FK. Replace with:

```php
// Drop unique on match_id
$table->dropUnique(['match_id']);

// Make nullable
$table->foreignId('match_id')->nullable()->change();
```

#### 2. Partial unique index (one stream per match when linked)

PostgreSQL:

```sql
CREATE UNIQUE INDEX match_streams_match_id_unique
ON match_streams (match_id)
WHERE match_id IS NOT NULL;
```

Laravel migration (raw statement or `whereNotNull` partial index if supported).

> **Requires `doctrine/dbal`** (or `change()` via Laravel 11+ native column modify) for nullable FK alter on PostgreSQL.

#### 3. New display + playback columns

```php
$table->string('title')->nullable()->after('match_id');
$table->text('description')->nullable()->after('title');
$table->text('streaming_url')->nullable()->after('description');
```

**`streaming_url`** — HTTPS URL entered in backoffice. For **standalone** streams this is the canonical watch URL the app plays. Validate on write: `required|url|starts_with:https://` (standalone create), max length 2048.

#### 4. Optional (recommended): standalone thumbnail

Match-linked streams use `matches.stream_thumbnail`. Standalone streams have no match row.

**Option A (v1 minimal):** YouTube `hqdefault` thumbnail only — no schema change.  
**Option B (recommended):** Add `thumbnail` nullable string on `match_streams` + media registry entry (mirrors match thumbnail upload in backoffice).

Document assumes **Option A for v1**; Option B can follow in the same release if product wants custom cards.

#### Resulting `match_streams` shape

| Column | Standalone | Match-linked |
|--------|------------|--------------|
| `id` | PK | PK |
| `match_id` | `NULL` | FK → `matches` |
| `title` | Required on create | Optional override; fallback to team names |
| `description` | Optional | Optional override; fallback to tournament name |
| **`streaming_url`** | **Required** — app playback source | Optional (e.g. public YouTube watch link); playback still from YouTube fields when null |
| `provider` | `'external'` when URL-only | `'youtube'` (default via resolver) |
| `status` | **Manual** — admin sets `live` / `ended` | YouTube lifecycle + `streams:sync` |
| Ingest / embed fields | Usually null | Populated by YouTube provider |
| `created_by` | Admin user | Admin user |

---

## Model Layer

### `MatchStream` model updates

**File:** `api/app/Models/MatchStream.php`

```php
// fillable: add title, description, streaming_url

public function isStandalone(): bool
{
    return $this->match_id === null;
}

/** Standalone URL-based stream (no YouTube provider row). */
public function isExternalPlayback(): bool
{
    return $this->isStandalone() && filled($this->streaming_url);
}
```

Add **`playbackForApp(): array`** — single source for API resources (move logic out of `TournamentMatchResource` duplicate):

```php
public function playbackForApp(): ?array
{
    if (! in_array($this->status, ['live', 'ended'], true)) {
        return null;
    }

    // Standalone: streaming_url is the playback source
    if ($this->isStandalone() && filled($this->streaming_url)) {
        return StreamUrlPlayback::resolve($this->streaming_url);
    }

    // Match-linked YouTube (existing)
    if ($this->embed_url || $this->provider_playback_id) {
        return [
            'mode' => 'iframe',
            'embed_id' => $this->provider_playback_id,
            'embed_url' => YouTubeEmbedUrl::normalize($this->embed_url, $this->provider_playback_id),
        ];
    }

    if (filled($this->playback_url)) {
        return ['mode' => 'hls', 'url' => $this->playback_url];
    }

    return null;
}
```

**New helper:** `app/Streaming/Support/StreamUrlPlayback.php` — parses `streaming_url`:

| URL pattern | `playback.mode` | Notes |
|-------------|-----------------|-------|
| YouTube watch / embed / youtu.be | `iframe` | Extract video id → same embed params as `YouTubeEmbedUrl` |
| Ends with `.m3u8` or known HLS host | `hls` | `playback.url` = streaming_url |
| Other HTTPS | `iframe` | Embed URL directly (Facebook Live embed, etc.) — v1 |

```php
// fillable continued — display helpers
public function displayTitle(): string
{
    if (filled($this->title)) {
        return $this->title;
    }

    $match = $this->relationLoaded('match') ? $this->match : $this->match()->with(['homeTeam', 'awayTeam'])->first();

    if ($match?->homeTeam && $match?->awayTeam) {
        return "{$match->homeTeam->name} vs {$match->awayTeam->name}";
    }

    return 'Live Stream';
}

public function displayDescription(): ?string
{
    if (filled($this->description)) {
        return $this->description;
    }

    $match = $this->relationLoaded('match') ? $this->match : $this->match()->with('tournament')->first();

    return $match?->tournament?->tournament_name;
}

public function thumbnailUrl(): ?string
{
    if ($this->match_id && $this->relationLoaded('match') && $this->match) {
        return $this->match->streamThumbnailUrl();
    }

    if ($this->match_id) {
        $this->loadMissing('match.stream');
        return $this->match?->streamThumbnailUrl();
    }

    // Standalone: YouTube id from streaming_url or provider_playback_id
    $embedId = StreamUrlPlayback::youtubeVideoId($this->streaming_url)
        ?? $this->provider_playback_id;

    if (! $embedId) {
        return null;
    }

    return 'https://i.ytimg.com/vi/'.rawurlencode($embedId).'/hqdefault.jpg';
}
```

Add `scopeVisibleInApp()`:

```php
public function scopeVisibleInApp(Builder $query): void
{
    $query->whereIn('status', ['live', 'starting'])
        ->where(function (Builder $q) {
            $q->whereNull('match_id')
                ->orWhereHas('match.tournament', fn ($t) => $t->where('tournament_type', TournamentTypeEnum::OPEN_TOURNAMENT));
        });
}
```

---

## Service Layer Refactor

### Rename / generalize `MatchStreamService` → `LiveStreamService`

**File:** `api/app/Streaming/LiveStreamService.php` (keep `MatchStreamService` as deprecated alias or delete after migration).

| Method | Before (actual code) | After (required) |
|--------|----------------------|------------------|
| `create(TournamentMatch $match, …)` | Creates linked stream | Renamed `createForMatch()` — delegates to internal create with `match_id` |
| `createStandalone(…)` | — | `match_id = null`, persists `title`/`description`/`streaming_url`; **`provider = external`**; no YouTube API |
| `createForMatch(…)` | YouTube create | Unchanged YouTube path; optionally persist `streaming_url` if supplied |
| `end(TournamentMatch $match)` | Loads `$match->stream` | **`end(MatchStream $stream)`** — all callers pass stream row |
| `syncStatus(TournamentMatch $match)` | Loads `$match->stream` | **`syncStatus(MatchStream $stream)`** — used by cron, admin sync, provider poll |
| `delete(TournamentMatch $match)` | Loads `$match->stream` | **`delete(MatchStream $stream)`** |

> **Phase 1 blocker:** Every caller of `syncStatus`, `end`, and `delete` must be updated in the same PR as the service refactor — including `SyncStreamStatuses`, `StreamController`, and `MatchStreamService` event broadcasts.

**Standalone create (URL-based — primary independent flow):**

```php
$stream = MatchStream::create([
    'match_id' => null,
    'title' => $data->title,
    'description' => $data->description,
    'streaming_url' => $data->streamingUrl,
    'provider' => 'external',
    'status' => 'idle',  // admin marks live via PATCH or dedicated action
    'created_by' => $createdBy,
]);

// No $provider->createStream() call — playback comes from streaming_url
broadcast(new LiveStreamStatusUpdated(...)); // only when status changes manually
```

**Match-linked create (YouTube — unchanged):**

```php
$stream = MatchStream::create([
    'match_id' => $match->id,
    'title' => $data->title,
    'description' => $data->description,
    'streaming_url' => $data->streamingUrl, // optional public link
    'provider' => $provider->slug(),
    'status' => 'idle',
    'created_by' => $createdBy,
]);

$provider->createStream($stream, $data);
```

For match-linked creates, continue defaulting YouTube title/description from teams when not overridden:

```php
title: $request->input('title', "{$home} vs {$away}"),
description: $request->input('description', "Live cricket match streamed via Tapeya…"),
```

For standalone creates, validate:

```php
'title' => ['required', 'string', 'max:100'],
'description' => ['nullable', 'string', 'max:500'],
'streaming_url' => ['required', 'url', 'starts_with:https', 'max:2048'],
'status' => ['sometimes', 'in:idle,live,starting,ended'],  // optional initial status
```

Add admin actions for URL-based streams (no YouTube sync):

```php
POST /admin/live-streams/{stream}/start   // status → live, started_at = now, broadcast Reverb
POST /admin/live-streams/{stream}/end     // status → ended (skip YouTube API when provider = external)
PATCH /admin/live-streams/{stream}        // title, description, streaming_url, status
```

When `provider === 'external'`, `end()` must **not** call YouTube API — only update row + Reverb + optional Redis purge if match_id set.

### `StreamProviderResolver`

**File:** `api/app/Streaming/StreamProviderResolver.php`

Add:

```php
public function forStream(MatchStream $stream): StreamProviderContract
{
    if ($stream->provider === 'external') {
        throw new \LogicException('External streams have no provider driver.');
    }

    if ($stream->provider) {
        return $this->manager->driver($stream->provider);
    }
```

    if ($stream->match_id) {
        return $this->forMatch($stream->match);
    }

    return $this->manager->driver(app(StreamingSettings::class)->defaultProvider);
}
```

Replace internal `forMatch()` calls in sync/end/delete with `forStream()`.

> **Lazy-load note:** `forStream()` may call `$this->forMatch($stream->match)` when `match_id` is set — ensure `$stream->match` is loaded or lazy-loads cleanly. Never call `forMatch()` when `match_id` is null.

### Event dispatch — **replace match-scoped events entirely**

Delete `MatchStreamStatusUpdated`, `MatchChatMessageReceived`, and `MatchHeartReceived` (match-channel variants). Use stream-scoped events only:

```php
private function broadcastStatusChange(MatchStream $stream, string $status, ?StreamPlayback $playback): void
{
    broadcast(new LiveStreamStatusUpdated($stream->id, $status, $playback));
}
```

Same for chat/hearts: **`LiveStreamChatMessageReceived`**, **`LiveStreamHeartReceived`** → channel `live-stream.{streamId}.chat` only.

Remove dead channel authorizations from `routes/channels.php`:

- ~~`match.{matchId}.chat`~~
- ~~`match.{matchId}.presence`~~ (for live broadcast viewer count)

> **Still match-scoped (unchanged):** `match.{matchId}.scoring`, `match.{matchId}.graphics` — these are scoring/overlay, not live broadcast.

### `SyncStreamStatuses` command — **Phase 1 blocker**

**File:** `api/app/Console/Commands/SyncStreamStatuses.php`

The command already iterates `MatchStream` rows, but the loop body is **match-coupled and will NPE** once standalone rows exist:

```php
// CURRENT (broken for match_id = null):
$resolver->forMatch($stream->match)->supportsWebhooks();
$service->syncStatus($stream->match);
```

**Required replacement:**

```php
MatchStream::query()
    ->whereNotIn('status', ['ended', 'error'])
    ->whereNotNull('provider_stream_id')
    ->with(['match.tournament'])  // optional relation — do not assume loaded
    ->lazy()
    ->each(function (MatchStream $stream) use ($service, $resolver) {
        // URL-only standalone rows have no provider_stream_id — already excluded by whereNotNull
        if ($stream->provider === 'external') {
            return;
        }

        if ($resolver->forStream($stream)->supportsWebhooks()) {
            return;
        }

        $service->syncStatus($stream);
    });
```

This change **depends on** `LiveStreamService::syncStatus(MatchStream $stream)` and `StreamProviderResolver::forStream()` — ship together in Phase 1, not Phase 2.

---

## Realtime (Reverb) — stream id only

### Replace match-scoped broadcast channels

| Old (remove) | New (only) |
|--------------|------------|
| `match.{matchId}.stream` | `live-stream.{streamId}` — event `live-stream.status.updated` |
| `match.{matchId}.chat` | `live-stream.{streamId}.chat` |
| `match.{matchId}.presence` (viewer count) | `live-stream.{streamId}.presence` |

**No dual-fire.** Match-linked and standalone streams use the **same** channels, keyed by `match_streams.id`.

```php
// LiveStreamStatusUpdated
public function broadcastOn(): array
{
    return [new Channel("live-stream.{$this->streamId}")];
}

public function broadcastAs(): string
{
    return 'live-stream.status.updated';
}
```

Backoffice and app **delete** listeners for `match.{matchId}.stream` / `.chat` / `.presence`. Subscribe only to `live-stream.{streamId}.*`.

#### API routes — stream id only

```php
// api/routes/api/v1/user.php — stream id only
Route::post('live/streams/{stream}/live-comments', [LiveStreamCommentController::class, 'store'])->middleware('throttle:120,1');
Route::post('live/streams/{stream}/live-hearts', [LiveStreamHeartController::class, 'store'])->middleware('throttle:60,1');

// REMOVE — do not keep as wrappers:
// Route::post('matches/{match}/live-comments', …);
// Route::post('matches/{match}/live-hearts', …);
```

#### Service refactor

Rename / generalize `LiveMatchCommentService` → **`LiveStreamCommentService`** (or add parallel methods):

```php
public function send(MatchStream $stream, int $userId, string $displayName, string $rawBody): string
{
    if (! in_array($stream->status, ['live', 'starting'], true)) {
        abort(422, 'This stream is not active.');
    }

    // Redis keys use stream id — see LiveChatRedisKeys below
    …
    LiveStreamChatMessageReceived::dispatch(streamId: $stream->id, …);
}
```

Same pattern for **`LiveStreamHeartService`**. Delete `LiveMatchCommentService` / `LiveMatchHeartController` match-channel dispatches.

#### Redis keys

**File:** `api/app/Support/LiveChat/LiveChatRedisKeys.php`

**Replace** match-scoped Redis keys entirely — do not write `chat:{matchId}:*` anymore:

```php
public static function intervalForStream(int $streamId, int|string $userId): string
{
    return "chat:stream:{$streamId}:interval:{$userId}";
}

public static function purgeStream(int $streamId): void
{
    // scan pattern chat:stream:{$streamId}:*
}
```

On **`end()`**, always `LiveChatRedisKeys::purgeStream($stream->id)`. Remove `purgeMatch()` for chat.

#### Reverb channels

**File:** `api/routes/channels.php`

```php
Broadcast::channel('live-stream.{streamId}.chat', fn () => true);

Broadcast::channel('live-stream.{streamId}.presence', function (User $user, int|string $streamId) {
    $stream = MatchStream::query()->find((int) $streamId);

    if (! $stream || ! in_array($stream->status, ['live', 'starting'], true)) {
        return false;
    }

    return ['id' => $user->id, 'name' => $user->name ?: ($user->nickname ?: 'Viewer')];
});
```

#### App changes

| File | Change |
|------|--------|
| `matchApi.js` or `liveApi.js` | `sendLiveComment({ streamId, body })` → `POST /live/streams/{streamId}/live-comments` |
| `useMatchChatChannel.js` | Rename **`useStreamChatChannel(streamId)`** — subscribe to `live-stream.{streamId}.chat` |
| `useMatchComments.js` | Rename **`useStreamComments(streamId, enabled, onHeart)`** |
| `useMatchPresenceChannel.js` | Rename **`useStreamPresenceChannel(streamId, enabled)`** |
| `LiveBroadcastItem.jsx` | `chatEnabled = liveChatGloballyEnabled && streamChatActive` — **no `linkedMatchId` gate** |
| `LiveBroadcast.jsx` | `useStreamPresenceChannel(streamId, presenceEnabled)` |

```js
// LiveBroadcastItem — chat always tied to stream, not match
const streamId = broadcast?.id ?? null;
const chatEnabled = liveChatGloballyEnabled && streamChatActive;
const { messages } = useStreamComments(streamId, chatEnabled, handleRemoteHeart);
await sendComment({ streamId, body }).unwrap();
sendHeart({ streamId });
```

Update `routes/channels.php` presence authorization to load stream by id when adding stream-scoped presence.

---

## API Changes

### Admin — new resource routes

**File:** `api/routes/api/v1/admin.php`

```php
Route::apiResource('live-streams', LiveStreamController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
Route::post('live-streams/{stream}/end', [LiveStreamController::class, 'end']);
Route::post('live-streams/{stream}/start', [LiveStreamController::class, 'start']);
Route::post('live-streams/{stream}/sync', [LiveStreamController::class, 'sync']);
```

**Controller:** `api/app/Http/Controllers/Admin/LiveStreamController.php`  
(Namespace `Admin\` — do not collide with existing `User\LiveStreamController`.)

**Authorization:** Same middleware as other admin routes (`auth:sanctum` + backoffice access). Only admins / broadcast staff with backoffice API access.

| Action | Behavior |
|--------|----------|
| `index` | Paginated list; filter by `status`; sort by `started_at` desc |
| `store` | Create standalone stream (**title + streaming_url required**); no ingest credentials returned |
| `show` | Stream row + **`streaming_url`** + thumbnail; ingest only when `provider = youtube` |
| `update` | Patch `title`, `description`, **`streaming_url`**, `status` (external streams) |
| `destroy` | Delete row; call YouTube delete **only** when `provider = youtube` |
| `end` | External: set `ended` locally. YouTube: existing provider end |
| `sync` | **404 or no-op for `provider = external`** — no YouTube to poll |
| `start` | **New** — set status `live`, `started_at`, broadcast Reverb (external + optional manual YouTube) |

**Existing match routes** — keep as thin wrappers:

```php
// StreamController@create → LiveStreamService::createForMatch($match, …)
// Same for show, end, destroy, sync
```

### Admin resources

**Update:** `StreamAdminResource` — add `title`, `description`, `match_id` (nullable), **`streaming_url`**.

**New:** `LiveStreamListResource` for index table (id, title, description, **`streaming_url`**, status, provider, started_at, match_id).

### User — live hub

**Refactor:** `LiveStreamController@index` — **full rewrite, not incremental**

**Current code (incompatible with standalone streams):**

```php
// User/LiveStreamController.php — INNER JOIN drops match_id IS NULL rows
TournamentMatch::query()
    ->join('match_streams', 'match_streams.match_id', '=', "{$table}.id")
    ->whereIn('match_streams.status', ['live', 'starting'])
    ->whereHas('tournament', fn ($q) => $q->where('tournament_type', OPEN_TOURNAMENT))
    ...
```

This query can never return standalone streams. Replace entirely:

```php
MatchStream::query()
    ->visibleInApp()
    ->with(['match.homeTeam', 'match.awayTeam', 'match.tournament'])
    ->orderByRaw("CASE status WHEN 'live' THEN 0 WHEN 'starting' THEN 1 ELSE 2 END")
    ->orderByDesc('started_at')
    ->orderByDesc('id')
    ->get();
```

**Resource: replace `LiveStreamMatchResource` — do not extend**

`LiveStreamMatchResource` today:

- Treats `$this->resource` as `TournamentMatch`
- Reads `$match->stream` for status/embed_id
- Calls `$match->streamThumbnailUrl()` (method on `TournamentMatch` — **no match row for standalone**)

**New file:** `LiveStreamResource` serializes a `MatchStream` model:

```php
public function toArray(Request $request): array
{
    $stream = $this->resource;

    return [
        'id' => $stream->id,
        'match_id' => $stream->match_id,
        'tournament_id' => $stream->match?->tournament_id,
        'title' => $stream->displayTitle(),
        'description' => $stream->displayDescription(),
        'streaming_url' => $stream->streaming_url,
        'thumbnail_url' => $stream->thumbnailUrl(),
        'stream' => [
            'status' => $stream->status,
            'embed_id' => $stream->provider_playback_id,
            'playback' => $this->when(
                in_array($stream->status, ['live', 'ended'], true),
                fn () => $stream->playbackForApp(),
            ),
        ],
    ];
}
```

User **`GET /live/streams/{stream}`** returns the same `playback` block from `playbackForApp()` so the viewer works for both YouTube match streams and URL-based standalone streams.

```json
{
  "id": 42,
  "match_id": null,
  "title": "Tapeya Launch Event",
  "description": "Product demo & Q&A",
  "streaming_url": "https://www.youtube.com/watch?v=xxxx",
  "thumbnail_url": "https://i.ytimg.com/vi/xxxx/hqdefault.jpg",
  "stream": {
    "status": "live",
    "embed_id": null,
    "playback": {
      "mode": "iframe",
      "embed_url": "https://www.youtube.com/embed/xxxx?…"
    }
  }
}
```

For match-linked rows, include `match_id`, `tournament_id` for deep links to scorecard when needed:

```json
{
  "id": 42,
  "match_id": 901,
  "tournament_id": 12,
  "title": "Team A vs Team B",
  "description": "Summer Cup 2026",
  "stream": { "status": "live", "embed_id": "…" }
}
```

**Display resolution happens server-side** via `displayTitle()` / `displayDescription()` so app logic stays thin.

### User — single stream viewer

**Add to existing** `User\LiveStreamController` (avoid a second controller file):

```php
GET /live/streams/{stream}   // LiveStreamController@show
```

Route model binding: `{stream}` → `MatchStream` by id. Public (same auth as `GET /live/matches`).

Returns playback payload (same shape as `TournamentMatchResource.stream` block today):

```json
{
  "id": 42,
  "title": "…",
  "description": "…",
  "thumbnail_url": "…",
  "match_id": null,
  "stream": {
    "status": "live",
    "provider": "youtube",
    "playback": { "mode": "iframe", "embed_id": "…", "embed_url": "…" },
    "started_at": "…"
  }
}
```

**Deprecation path for match-only fetch:**

- Keep `GET /matches/{match}` including embedded `stream` for scorecard pages.
- Live broadcast page switches to `GET /live/streams/{streamId}`.

Optional **required for production** compatibility route:

```php
GET /live/broadcast-lookup/match/{match}  → 302 to /live/streams/{streamId} payload
// Or app-side redirect component at /live/broadcast/match/:matchId
```

---

## Mobile App Changes

### API client

**File:** `app/src/store/api/liveApi.js`

```js
getLiveStreams: builder.query({ url: '/live/matches' })  // keep path, new shape
getLiveStream: builder.query({ url: '/live/streams/:streamId' })
```

Add RTK tag `LiveStreams` keyed by stream id.

### Normalization — **`matchId` field collision (audit required)**

**File:** `app/src/lib/utils/liveStreamUtils.js`

**Current bug-prone naming (today):**

```js
// normaliseLiveStreamMatches — matchId is a DISPLAY STRING, not an id
matchId: home.name && away.name ? `${home.name} vs ${away.name}` : `Match ${match.id}`,

// LiveTab.jsx — passes match.id (numeric match PK) to liveBroadcastPath, not match.matchId
liveBroadcastPath(match.id)
```

Two different semantics were overloaded: `matchId` as label vs `match.id` as route key. **Do not map `matchId: row.match_id`** — that would preserve the collision.

Rename function `normaliseLiveStreamMatches` → `normaliseLiveStreams` and use explicit fields:

```js
return (streams ?? []).map((row) => ({
  streamId: row.id,                        // numeric — use for liveBroadcastPath() and React keys
  linkedMatchId: row.match_id ?? null,     // numeric match FK, null for standalone
  tournamentId: row.tournament_id ?? null,
  title: row.title,                        // display line 1 (API-resolved)
  subtitle: row.description ?? '',         // display line 2
  stream: row.stream ?? null,
  thumbnail_url: row.thumbnail_url ?? youtubeStreamThumbnail(row.stream?.embed_id),
}));
```

**Call sites to audit** (grep `matchId`, `tournament_name`, `normaliseLiveStreamMatches`):

| File | Change |
|------|--------|
| `LiveTab.jsx` | `title` / `subtitle`; link via `liveBroadcastPath(item.streamId)` |
| `UpcomingTab.jsx` | Same |
| `LiveMatchSlider.jsx` | Replace `match.matchId` label with `match.title`; link via `streamId` |
| `Live.jsx` | Rename normalized variable `matches` → `streams` |
| `Home.jsx` | Slider props if passed through |

Remove deprecated fields: `matchId` (display string), `tournament_name`, `team1`/`team2` unless scorecard UI needs them later.

### Routes

**File:** `app/src/App.jsx`

```jsx
// Primary viewer route (stream id)
<Route path="/live/broadcast/:streamId" element={<LiveBroadcast />} />

// Optional HTTP redirect for old bookmarks (not Reverb):
// /live/broadcast/match/:matchId → resolve stream id → redirect to /live/broadcast/:streamId
```

**File:** `app/src/lib/utils/liveStreamUtils.js`

```js
export function liveBroadcastPath(streamId) {
  return `/live/broadcast/${streamId}`;
}
```

### Live hub tabs

**Files:**

- `app/src/pages/live/tabs/LiveTab.jsx`
- `app/src/pages/live/tabs/UpcomingTab.jsx`
- `app/src/components/LiveMatchSlider.jsx`
- `app/src/components/live/LiveEventCard.jsx` (no change — already `title` + `line2`)

Update links: `liveBroadcastPath(item.streamId)`.

Card mapping:

| Card field | Source |
|------------|--------|
| `title` | API `title` |
| `line2` | API `description` (nullable — hide if empty) |

### Broadcast viewer page — **lockstep change (single PR)**

These four pieces are coupled today and **must ship together** or the viewer breaks:

| Piece | Current | Target |
|-------|---------|--------|
| Route | `/live/broadcast/:matchId` | `/live/broadcast/:streamId` |
| `useParams()` | `const { matchId } = useParams()` | `const { streamId } = useParams()` |
| Data fetch | `useGetMatchQuery(matchId)` | `useGetLiveStreamQuery(streamId)` |
| Reverb hook | `useMatchStreamChannel(matchId)` | `useLiveStreamChannel(streamId)` — **`live-stream.{streamId}` only** |
| Presence | `useMatchPresenceChannel(matchId, …)` | **`useStreamPresenceChannel(streamId, …)`** — works for standalone + match-linked |
| Child component | `<LiveBroadcastItem match={match} />` | `<LiveBroadcastItem broadcast={stream} />` — see below |

**File:** `app/src/pages/live/LiveBroadcast.jsx`

```js
const { streamId } = useParams();
const { data: broadcast, isError, refetch } = useGetLiveStreamQuery(streamId, { skip: !streamId });

const linkedMatchId = broadcast?.match_id ?? null;
const streamStatus = broadcast?.stream?.status;
const presenceEnabled = streamStatus === 'live' || streamStatus === 'starting';

useLiveStreamChannel(streamId);
const realViewerCount = useStreamPresenceChannel(streamId, presenceEnabled);
```

Pass `broadcast` (not `match`) to `LiveBroadcastItem`.

### `LiveBroadcastItem` — view-model refactor

Today the component treats `match.id` as the chat/presence key and `match.stream` as the player payload. Refactor props:

```js
// Before
<LiveBroadcastItem match={match} … />

// After
<LiveBroadcastItem
  broadcast={broadcast}   // GET /live/streams/{id} response
  …
/>
```

Inside the component:

```js
const streamId = broadcast?.id ?? null;
const stream = broadcast?.stream ?? null;
const streamChatActive = stream?.status === 'live' || stream?.status === 'starting';
const chatEnabled = liveChatGloballyEnabled && streamChatActive;
const { messages } = useStreamComments(streamId, chatEnabled, handleRemoteHeart);
// sendComment({ streamId, body }), sendHeart({ streamId })
```

Standalone and match-linked streams share the same chat/hearts/presence UI — all keyed by **`streamId`**.

### `useMatchStreamChannel` → `useLiveStreamChannel` — **RTK cache strategy**

**File:** `app/src/features/stream/hooks/useMatchStreamChannel.js`

**Current behavior (wrong for standalone):**

```js
// Patches matchApi 'getMatch' only — standalone viewer has no such cache entry
matchApi.util.updateQueryData('getMatch', String(matchId), (draft) => { … });
```

**Required behavior:**

```js
export function useLiveStreamChannel(streamId) {
  useEffect(() => {
    echo.channel(`live-stream.${streamId}`).listen('.live-stream.status.updated', (event) => {
      dispatch(
        liveApi.util.updateQueryData('getLiveStream', String(streamId), (draft) => {
          if (draft?.stream) {
            draft.stream.status = event.status;
            draft.stream.playback = event.playback ?? draft.stream.playback;
          }
        }),
      );

      dispatch(
        liveApi.util.updateQueryData('getLiveStreams', undefined, (draft) => {
          const row = draft?.find?.((r) => String(r.id) === String(streamId));
          if (row?.stream) {
            row.stream.status = event.status;
          }
        }),
      );

      // Optional: patch scorecard getMatch when broadcast.match_id is set (RTK only — not Reverb)
      // if (draft.match_id) { matchApi.util.updateQueryData('getMatch', …) }
    });
  }, [streamId, dispatch]);
}
```

No subscription to `match.{matchId}.stream`. Delete `useMatchStreamChannel.js`.

### Chat / hearts / presence — **enabled on independent streams (v1)**

Do **not** gate chat on `linkedMatchId`. Independent streams use the same bottom panel as match-linked streams; only the backing channel and API path change to **`streamId`**.

See [Presence & live chat — stream-scoped in v1](#presence--live-chat--stream-scoped-in-v1) above.

### Scorecard integration

**Files:** `MatchCard.jsx`, `LiveMatchSlider` on Home — no change to match cards; home slider uses new list shape.

---

## Backoffice Changes

### Side menu

**File:** `backoffice/src/app/layouts/full/shared/nav/sidebar-data.ts`

Add top-level item (after Tournaments or under new section):

```ts
{
  displayName: 'Live Streams',
  iconName: 'solar:videocamera-record-line-duotone',
  route: '/live-streams-management/live-streams',
},
```

Consider adding to `broadcastStaffNavItems` (**locked: yes**).

### Routing module

**New files:**

```
backoffice/src/app/pages/live-streams-management/
  live-streams-management.routes.ts
  live-streams/
    live-streams-list.component.ts
    live-streams-list.component.html
    live-stream-create-dialog/
    live-stream-manage-dialog/   ← refactor from match-stream-dialog
```

**Register in** `backoffice/src/app/app.routes.ts`:

```ts
{
  path: 'live-streams-management',
  loadChildren: () => import('./pages/live-streams-management/live-streams-management.routes'),
}
```

### List page UX

| Column | Source |
|--------|--------|
| Title | `stream.title` |
| Description | truncated `stream.description` |
| **Stream URL** | truncated `stream.streaming_url` (link out) |
| Status | badge (idle / starting / live / ended) |
| Provider | `external` or `youtube` |
| Match | linked match id or "Standalone" |
| Started | `started_at` |
| Actions | Manage, End, Delete |

**Primary action:** "Create Live Stream" → dialog with **title** (required), **streaming URL** (required), description (optional). Actions: **Go Live** / **End** (no RTMP panel for `external` provider).

For match-linked YouTube setup in Match Controller, RTMP panel unchanged; optional `streaming_url` field for sharing.

### Shared stream dialog refactor

Extract shared UI from `match-stream-dialog` into a reusable component:

**New:** `stream-setup-dialog.component.ts`

```ts
export interface StreamSetupDialogData {
  streamId: number;
  mode: 'standalone' | 'match';
  defaultTitle?: string;
  onStreamMutated?: () => void;
}
```

**Service rename:** `MatchStreamService` → `LiveStreamService` (Angular)

Current `MatchStreamRow` has `match_id: number` (non-nullable) and all HTTP paths assume match context. Standalone endpoints return a different primary key scope.

### Backoffice TypeScript interfaces

**File:** `backoffice/src/app/services/live-stream.service.ts` (rename from `match-stream.service.ts`)

```ts
export type LiveStreamStatus = 'idle' | 'starting' | 'live' | 'ended' | 'error';

/** Core row — match_id nullable for standalone */
export interface LiveStreamRow {
  id: number;
  match_id: number | null;
  title: string | null;
  description: string | null;
  streaming_url: string | null;
  provider: string;
  status: LiveStreamStatus;
  provider_stream_id: string | null;
  provider_playback_id: string | null;
  embed_url: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string | null;
}

export interface StreamIngestCredentials {
  rtmp_url: string;
  stream_key: string;
  backup_rtmp_url: string | null;
}

/** Shared payload for show/create responses */
export interface LiveStreamPayload {
  stream: LiveStreamRow | null;
  ingest: StreamIngestCredentials | null;
  thumbnail_url: string | null;
  has_custom_thumbnail: boolean;
}

/** Standalone create (Live Streams menu) */
export interface CreateStandaloneStreamBody {
  title: string;
  streaming_url: string;            // required — HTTPS watch/embed/HLS URL
  description?: string | null;
  status?: LiveStreamStatus;        // optional; default idle
}

/** Match Controller create — title optional (defaults from team names server-side) */
export interface CreateMatchLinkedStreamBody {
  title?: string;
  privacy?: 'public' | 'unlisted';
}

/** List row for Live Streams index table */
export interface LiveStreamListItem {
  id: number;
  title: string;
  description: string | null;
  status: LiveStreamStatus;
  provider: string;
  match_id: number | null;
  started_at: string | null;
}
```

**API methods:**

```ts
// Standalone CRUD (new Live Streams menu)
listStreams(params?: { status?: LiveStreamStatus; page?: number }): Observable<Paginated<LiveStreamListItem>>
createStandaloneStream(body: CreateStandaloneStreamBody): Observable<LiveStreamPayload>
getStream(streamId: number): Observable<LiveStreamPayload>
updateStream(streamId: number, body: { title?: string; description?: string | null; streaming_url?: string; status?: LiveStreamStatus })
startStream(streamId: number): Observable<{ status: LiveStreamStatus }>
endStream(streamId: number): Observable<{ status: string }>
deleteStream(streamId: number): Observable<void>
syncStream(streamId: number): Observable<{ status: LiveStreamStatus }>

// Match Controller wrappers (unchanged URLs, updated return types)
getStreamForMatch(matchId: number): Observable<LiveStreamPayload>
createStreamForMatch(matchId: number, body: CreateMatchLinkedStreamBody): Observable<LiveStreamPayload>
endStreamForMatch(matchId: number): Observable<{ status: string }>
deleteStreamForMatch(matchId: number): Observable<void>
syncStreamForMatch(matchId: number): Observable<{ status: LiveStreamStatus }>
```

Update `MatchStreamDialogComponent` / shared `StreamSetupDialogComponent` to accept `streamId: number` and call `getStream(streamId)` after first create — not `getStreamForMatch` for Reverb subscription (header status listens on `live-stream.{streamId}`).

**Match Controller:** keep match-scoped create URL; read `payload.stream.id` for Reverb channel subscription.

### Reverb in backoffice

**File:** `backoffice/src/app/services/backoffice-reverb.service.ts`

Add:

```ts
listenLiveStream(streamId: number, onStatusUpdated: …): () => void
// channel: live-stream.{streamId} ONLY
```

**Delete** `listenMatchStream()` from `backoffice-reverb.service.ts`. Update `match-stream-header-status` to subscribe using `payload.stream.id`.

---

## File Checklist

### API (Laravel)

| Action | File |
|--------|------|
| Add | `database/migrations/…_make_match_streams_independent.php` |
| Update | `app/Models/MatchStream.php` |
| Add | `app/Streaming/LiveStreamService.php` |
| Update | `app/Streaming/MatchStreamService.php` (delegate or remove) |
| Update | `app/Streaming/StreamProviderResolver.php` |
| Add | `app/Http/Controllers/Admin/LiveStreamController.php` |
| Update | `app/Http/Controllers/Admin/StreamController.php` |
| Update | `app/Http/Controllers/User/LiveStreamController.php` (add `show`) |
| Add | `app/Streaming/Support/StreamUrlPlayback.php` |
| Add | `app/Http/Resources/User/LiveStreamResource.php` |
| Update | `app/features/stream/StreamPlayer.jsx` — ensure `hls` player registered when `streaming_url` is `.m3u8` |
| Update | `app/Http/Resources/Admin/StreamAdminResource.php` |
| Add | `app/Events/Broadcast/LiveStreamStatusUpdated.php` |
| Delete | `app/Events/Broadcast/MatchStreamStatusUpdated.php` |
| Delete | `app/Events/Broadcast/MatchChatMessageReceived.php` |
| Delete | `app/Events/Broadcast/MatchHeartReceived.php` |
| Update | `app/Console/Commands/SyncStreamStatuses.php` |
| Update | `routes/api/v1/admin.php` |
| Add | `app/Http/Controllers/User/LiveStreamCommentController.php` |
| Add | `app/Http/Controllers/User/LiveStreamHeartController.php` |
| Add | `app/Events/Broadcast/LiveStreamChatMessageReceived.php` |
| Add | `app/Events/Broadcast/LiveStreamHeartReceived.php` |
| Update | `app/Services/LiveChat/LiveMatchCommentService.php` → stream-aware (or `LiveStreamCommentService`) |
| Update | `app/Services/LiveChat/LiveMatchHeartService.php` → stream-aware |
| Update | `app/Support/LiveChat/LiveChatRedisKeys.php` — stream-scoped keys + `purgeStream()` |
| Update | `routes/channels.php` — `live-stream.{streamId}.chat` + `.presence` |
| Update | `routes/api/v1/user.php` — `POST live/streams/{stream}/live-comments|live-hearts` |
| Add tests | `tests/Feature/LiveStream/StandaloneStreamTest.php` |
| Add tests | `tests/Feature/LiveStream/LiveStreamListingTest.php` |
| Remove | `app/Http/Resources/User/LiveStreamMatchResource.php` |

### App (React)

| Action | File |
|--------|------|
| Update | `src/store/api/liveApi.js` |
| Update | `src/lib/utils/liveStreamUtils.js` |
| Update | `src/pages/live/Live.jsx` |
| Update | `src/pages/live/LiveBroadcast.jsx` |
| Update | `src/pages/live/LiveBroadcastItem.jsx` (broadcast view-model) |
| Update | `src/pages/live/tabs/LiveTab.jsx` |
| Update | `src/pages/live/tabs/UpcomingTab.jsx` |
| Update | `src/components/LiveMatchSlider.jsx` |
| Delete | `src/features/stream/hooks/useMatchStreamChannel.js` |
| Delete | `src/features/stream/hooks/useMatchChatChannel.js` (replaced by `useStreamChatChannel.js`) |
| Rename/update | `src/features/stream/hooks/useMatchComments.js` → `useStreamComments.js` |
| Rename/update | `src/features/stream/hooks/useMatchPresenceChannel.js` → `useStreamPresenceChannel.js` |
| Update | `src/store/api/liveApi.js` or `matchApi.js` — stream-scoped comment/heart mutations |
| Update | `src/App.jsx` |

### Backoffice (Angular)

| Action | File |
|--------|------|
| Update | `layouts/full/shared/nav/sidebar-data.ts` |
| Add | `pages/live-streams-management/**` |
| Update | `services/match-stream.service.ts` → `live-stream.service.ts` |
| Refactor | `match-stream-dialog/**` → shared `stream-setup-dialog/**` |
| Update | `services/backoffice-reverb.service.ts` |
| Update | `app.routes.ts` |

---

## Implementation Phases

### Phase 1 — Database & service (API only)

1. Migration: nullable `match_id`, partial unique, `title`/`description`.
2. Model helpers: `displayTitle`, `displayDescription`, `thumbnailUrl`, `scopeVisibleInApp`.
3. **`LiveStreamService` — refactor all methods to accept `MatchStream` (not `TournamentMatch`)** for `syncStatus`, `end`, `delete`.
4. **`StreamProviderResolver::forStream()`** — replace `forMatch()` in sync/end/delete paths.
5. **`SyncStreamStatuses` command fix** — use `forStream($stream)` + `syncStatus($stream)` (Phase 1 blocker — cron runs every minute).
6. Admin `LiveStreamController` CRUD + ingest.
7. Refactor `StreamController` to delegate to `LiveStreamService`.
8. Tests: standalone create, **cron sync without NPE**, end/delete on standalone row.

**Exit criteria:** Postman can create standalone stream, receive RTMP credentials, `php artisan streams:sync` updates status without error.

### Phase 2 — User API, Reverb & stream-scoped chat

1. **Full rewrite** `LiveStreamController@index` — `MatchStream::visibleInApp()` (drop `TournamentMatch` JOIN).
2. **Replace** `LiveStreamMatchResource` with `LiveStreamResource`.
3. Add `LiveStreamController@show` — `GET /live/streams/{stream}`.
4. **`LiveStreamStatusUpdated`** on `live-stream.{id}` only — remove match-scoped events.
5. **Stream-scoped chat/hearts/presence** — new routes, events, Redis keys; **remove** `matches/{match}/live-comments|hearts`.
6. API tests: list + standalone chat POST + Reverb on `live-stream.{id}.chat`.

**Exit criteria:** API returns standalone + match streams; viewer endpoint works; comment on independent stream broadcasts to `live-stream.{streamId}.chat`.

### Phase 3 — Mobile app (single PR for viewer lockstep)

1. Update `liveApi` + **`normaliseLiveStreams`** (fix `matchId` collision — use `streamId` / `title` / `subtitle`).
2. Audit all call sites: `LiveTab`, `UpcomingTab`, `LiveMatchSlider`, `Home.jsx` — fix React `key={streamId}`.
3. Route `/live/broadcast/:streamId` + optional bookmark redirect + **`LiveBroadcast.jsx` lockstep**
4. **`useLiveStreamChannel(streamId)`** — `live-stream.{streamId}` only; delete old match-channel hooks.
5. **`useStreamComments` / `useStreamPresenceChannel`** keyed by `streamId` — chat/hearts/presence **enabled for independent streams**.
6. Update Home slider + Live hub cards.

**Exit criteria:** Standalone stream on `/live` plays video; chat/hearts/presence work on stream-scoped channels only.

### Phase 4 — Backoffice UI (before marketing standalone streams)

1. Sidebar + routes + list page (include broadcast staff nav).
2. Create dialog.
3. Manage dialog (reuse stream setup).
4. Match Controller dialog uses shared component; Reverb listens on `stream.id`.

**Exit criteria:** Admin can create/manage standalone stream without opening a tournament.

### Phase 5 — Docs & cleanup

1. Update `LIVE_STREAM_YOUTUBE_FINAL.md` and `LIVE_COMMENTS_ARCHITECTURE.md` cross-references.
2. Optional: rename `MatchStream` model display name to `LiveStream` in docs only.
3. Grep repo for removed channel names (`match.*.stream`, `match.*.chat` for broadcast) — must be zero hits.

---

## Testing Plan

### API

- [ ] Create standalone with `streaming_url` → row has `provider = external`, no `provider_stream_id`
- [ ] `playbackForApp()` returns iframe playback from YouTube `streaming_url`
- [ ] `playbackForApp()` returns hls playback from `.m3u8` `streaming_url`
- [ ] Admin **Go Live** on external stream → status `live`, app hub lists it, viewer plays URL
- [ ] `streams:sync` skips `provider = external` rows
- [ ] PATCH `streaming_url` on standalone updates playback without YouTube call
- [ ] Create match stream → still one stream per match (partial unique enforced)
- [ ] Duplicate match stream → 422
- [ ] Standalone missing title → 422
- [ ] `streams:sync` on standalone row does **not NPE** (no `forMatch(null)`)
- [ ] `streams:sync` transitions standalone stream idle → starting → live
- [ ] End stream calls `LiveChatRedisKeys::purgeStream($streamId)` for all streams
- [ ] `POST /live/streams/{id}/live-comments` works on standalone stream
- [ ] Comment received on `live-stream.{streamId}.chat` Reverb channel
- [ ] `GET /live/matches` includes standalone + open-tournament match streams
- [ ] `GET /live/matches` excludes private-league match streams (unchanged rule)
- [ ] `GET /live/streams/{id}` returns playback without ingest secrets
- [ ] Reverb event fires on `live-stream.{id}`

### App

- [ ] Live hub card shows custom title / description for standalone
- [ ] Match stream card still shows team vs team when title null
- [ ] Tap card → `/live/broadcast/{streamId}` plays video
- [ ] Status badge updates without refresh (via `liveApi.getLiveStream` cache patch, not `getMatch`)
- [ ] Grep confirms no remaining uses of `matchId` as display string in live module
- [ ] Standalone: comment + heart UI works (same as match-linked)
- [ ] Standalone: viewer presence count works
- [ ] Match-linked: comments work on `live-stream.{streamId}.chat` only (no match channel)
- [ ] Legacy `/live/broadcast/match/{matchId}` redirect resolves correct stream
- [ ] `getLiveStreams` RTK cache updates on Reverb status event
- [ ] Standalone: viewer presence count works via `useStreamPresenceChannel(streamId)`

### Backoffice

- [ ] Live Streams menu visible to admin
- [ ] Create → RTMP URL + key copyable
- [ ] Sync / End / Delete work
- [ ] Match Controller stream button still works
- [ ] List shows "Standalone" vs match link

---

## Edge Cases & Notes

| Scenario | Behavior |
|----------|----------|
| Standalone stream ends | Status `ended`; remains in DB; hidden from Live hub tabs |
| Link stream to match later | **Out of scope v1** — would require PATCH `match_id` with validation (no existing match stream) |
| External `streaming_url` changed while live | Allowed via PATCH; app picks up on refetch / Reverb if you broadcast on URL change |
| Invalid streaming URL | 422 on create/update; only `https://` allowed |
| Facebook / custom embed URL | v1: `mode = iframe`, embed `streaming_url` directly in player |
| YouTube title vs DB title | YouTube broadcast title applies only to **match-linked YouTube** creates; standalone uses `streaming_url` only |
| Open tournament filter | Applies only to match-linked streams; standalone streams always eligible when live/starting |
| Private YouTube broadcast | Same as today — embed works for unlisted when embed URL/id known |
| iOS YouTube proxy | Unchanged — applies to all iframe playback |
| `TournamentMatchResource.stream` | Add `id` field (stream row id) so scorecard can link to `/live/broadcast/{streamId}` in a follow-up |
| Empty string title | Treat as unset — use `filled()` in display helpers |

---

## Related Docs

- [LIVE_STREAM_YOUTUBE_FINAL.md](./LIVE_STREAM_YOUTUBE_FINAL.md) — provider layer, YouTube OAuth, RTMP
- [LARAVEL_REVERB_REALTIME.md](./LARAVEL_REVERB_REALTIME.md) — Echo/Reverb setup
- [LIVE_COMMENTS_ARCHITECTURE.md](./LIVE_COMMENTS_ARCHITECTURE.md) — chat architecture; **v1 migrates to stream-scoped channels** (see [Presence & live chat](#presence--live-chat--stream-scoped-in-v1))

---

## Open Questions

**All resolved — see [Locked decisions](#production-readiness--verdict--locked-decisions) above.** Do not start implementation with unresolved items 1–4 from earlier drafts.
