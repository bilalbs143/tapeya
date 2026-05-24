# Live Match Comments — Architecture & Implementation

> **Single source of truth** for ephemeral real-time chat on live match streams.
> Consolidated from two prior drafts. Supersedes both.
>
> **Core constraint**: comments are **not stored anywhere** — no database writes,
> no Redis persistence. Redis holds only anti-abuse state (rate limits, dedup, mute).
> Reverb is the sole delivery mechanism.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [System Overview](#2-system-overview)
3. [Current Realtime Landscape](#3-current-realtime-landscape)
4. [Channel Architecture](#4-channel-architecture)
5. [Redis Strategy — Operational Only](#5-redis-strategy--operational-only)
6. [Backend Implementation](#6-backend-implementation)
7. [Frontend Implementation](#7-frontend-implementation)
8. [Rate Limiting & Spam Prevention](#8-rate-limiting--spam-prevention)
9. [Event Flow — End to End](#9-event-flow--end-to-end)
10. [Connection Lifecycle](#10-connection-lifecycle)
11. [Scaling & Performance](#11-scaling--performance)
12. [Memory Budget](#12-memory-budget)
13. [Configuration — LiveChatSettings](#13-configuration--livechatsettings)
14. [Implementation Steps](#14-implementation-steps)
15. [Testing Checklist](#15-testing-checklist)
16. [Do-Not-Affect Checklist](#16-do-not-affect-checklist)
17. [Out of Scope](#17-out-of-scope)

---

## 1. Design Principles


| Constraint                        | Decision                                                                            | Reason                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **No DB writes**                  | Comments never touch any table                                                      | Core requirement; eliminates DB as a bottleneck                                          |
| **No Redis persistence**          | Redis holds only rate-limit / dedup / mute keys (all with short TTLs)               | Redis is operational memory, not a store                                                 |
| **Truly ephemeral**               | Late joiners see only messages from the moment they subscribe                       | Matches YouTube live chat behaviour; simplest path                                       |
| **Isolated channel**              | Dedicated `match.{id}.chat` — never reuse scoring, stream, or graphics channels     | One channel's traffic cannot disrupt another                                             |
| **HTTP ingest, WebSocket egress** | POST is easy to authenticate and rate-limit; Reverb fans out approved messages only | Keeps broadcast clean; rejects never reach subscribers                                   |
| **Sync broadcast**                | `ShouldBroadcastNow` — inline, no queue                                             | Matches existing `MatchStreamStatusUpdated` and `MatchStateUpdated`; sub-second delivery |
| **Service-layer logic**           | Business rules in `LiveMatchCommentService`, not the controller                     | Testable; controller stays thin                                                          |
| **Tuneable without deploy**       | Rate limits, kill switch via `LiveChatSettings` (Spatie)                            | Ops can throttle or disable chat without a code push                                     |
| **Client-owned state**            | React local state + `useReducer` — never RTK Query cache                            | Comments are not game state; no cache pollution                                          |
| **One WebSocket connection**      | Echo singleton with ref-counted subscribers                                         | Sharing with `useMatchStreamChannel` avoids duplicate connections                        |


---

## 2. System Overview

```
Authenticated viewer types a comment and presses Send
          │
          ▼
POST /api/v1/matches/{match}/live-comments    ← auth:api + IP throttle middleware
          │
          ├─ SendLiveCommentRequest  →  validate body (max 200 chars)
          ├─ LiveMatchCommentService
          │    ├─ assertStreamEligible()   →  stream status must be live|starting
          │    ├─ assertNotMuted()         →  optional Redis mute key check
          │    ├─ assertIntervalLimit()    →  SET NX interval key (e.g. 1 per 2 s)
          │    ├─ assertBurstLimit()       →  INCR burst key (e.g. 20 per 10 min)
          │    └─ assertNotDuplicate()     →  SET NX hash of body (10 s window)
          │
          └─ MatchChatMessageReceived::dispatch()   ← ShouldBroadcastNow, no queue
                    │
                    ▼
           Reverb broadcasts on  match.{matchId}.chat
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
    Viewer A (sender)    Viewer B … N
    seenIds dedup        appendCapped()
    → skip if own id     → local state update
                         → CommentList re-renders (last 4 visible)
```

**Nothing in this path touches:**

- `match.{id}.scoring` / `MatchStateUpdated`
- `match.{id}.stream` / `MatchStreamStatusUpdated`
- `match.{id}.graphics` / overlay events
- Any backoffice channel or DB connection pool

---

## 3. Current Realtime Landscape

Existing channels — do **not** reuse for chat:


| Channel               | Type                 | Event                          | Payload                   | Frequency       | Subscribers                            |
| --------------------- | -------------------- | ------------------------------ | ------------------------- | --------------- | -------------------------------------- |
| `match.{id}.scoring`  | Private (`auth:api`) | `.match.state.updated`         | Large (full match state)  | Every ball      | App scorecard, scoring app, backoffice |
| `match.{id}.stream`   | Public               | `.match.stream.status.updated` | Small (status + playback) | Rare            | App live broadcast, scorecard badge    |
| `match.{id}.graphics` | Public               | `.match.graphic.`*             | Medium                    | Operator-driven | OBS overlay                            |


**Chat uses a fourth, dedicated channel:** `match.{id}.chat`.

Reverb subscription filters remain completely separate. A comment burst never triggers scorecard cache invalidation, overlay re-renders, or backoffice listeners.

---

## 4. Channel Architecture

### New channel


| Channel           | Type       | Who can subscribe    | Who can send                         |
| ----------------- | ---------- | -------------------- | ------------------------------------ |
| `match.{id}.chat` | **Public** | Any connected client | Authenticated users only (HTTP POST) |


**Why public, not presence?**
Presence channels require every viewer to authenticate the WebSocket handshake via `/broadcasting/auth`. That adds latency and server load proportional to concurrent viewer count. A public channel has zero handshake cost per subscriber. Viewer count is **Phase 2** on a separate `match.{id}.presence` channel — see [§14 Phase 2](#phase-2--viewer-presence--backoffice-count-estimated-3-4-h).

**Why public channel callbacks cannot guard subscription:**
`Broadcast::channel()` callbacks only execute for *private* and *presence* channels. For a public channel the callback is never called at subscribe time — no DB query is triggered. Subscription access control for the public chat channel is therefore enforced exclusively at the HTTP POST level (the only place that matters: auth guards who can *send*).

### `routes/channels.php`

```php
/*
 * Public match chat channel — no WebSocket auth required.
 * Comments are sent via authenticated HTTP POST; receiving is unrestricted.
 * Isolated from scoring, stream-status, and graphics channels.
 */
Broadcast::channel('match.{matchId}.chat', function () {
    return true;
});
```

### Event name


| Class                      | `broadcastAs()`      | Echo listener         |
| -------------------------- | -------------------- | --------------------- |
| `MatchChatMessageReceived` | `match.chat.message` | `.match.chat.message` |


---

## 5. Redis Strategy — Operational Only

Redis is used **exclusively** as a guard layer. No comment text is stored. All keys expire automatically.

### 5.1 Key inventory

```
chat:{matchId}:interval:{userId}    String (flag)    TTL = minIntervalSec (e.g. 2 s)
chat:{matchId}:burst:{userId}       String (counter) TTL = burstWindow     (e.g. 600 s)
chat:{matchId}:dedup:{userId}       String (hash)    TTL = 10 s
chat:{matchId}:mute:{userId}        String (flag)    TTL = muteDuration or manual
```

All keys are namespaced by `matchId`, making per-match purge trivial (§6.6).

### 5.2 Interval rate limit (per user, per match)

Enforces a minimum gap between sends:

```
SET chat:{matchId}:interval:{userId}  1  NX  EX {minIntervalSec}
```

- Returns `OK` → allow (key set for the first time).
- Returns `nil` → key exists → user is within the cooldown → reject `429 RATE_LIMITED`.
- Default `minIntervalSec`: `2` (from `LiveChatSettings::$minIntervalSec`).
- Atomic by nature of `SET NX` — no race condition, no Lua script needed.

### 5.3 Burst rate limit (per user, per match)

Catches sustained flooding within a longer window:

```
$count = INCR chat:{matchId}:burst:{userId}
if $count === 1: EXPIRE chat:{matchId}:burst:{userId} {burstWindowSec}
if $count > burstMax: reject 429 RATE_LIMITED
```

- Default `burstMax`: `20`, `burstWindowSec`: `600` (10 minutes).
- Values come from `LiveChatSettings` — no hard-coded constants in service.

### 5.4 Duplicate suppression (per user, per match)

Prevents copy-paste spam and double-tap sends:

```
$hash = hash('xxh3', mb_strtolower(trim($body)));
SET chat:{matchId}:dedup:{userId}  $hash  NX  EX 10
```

- `NX` means only written if not present. Returns `nil` → same message within 10 s → reject `422 DUPLICATE_MESSAGE`.
- `xxh3` is faster than `md5` for short strings; either works.

### 5.5 Mute (optional, Phase 2)

```
SET chat:{matchId}:mute:{userId}  1  EX {muteDurationSec}
```

- Set by a future moderation endpoint.
- Checked before rate limits in `assertNotMuted()`.
- If key exists → reject silently with `202` (shadow-ban behaviour) or `403 MUTED`.

### 5.6 What Redis is NOT for

- Storing comment text or history
- Cross-match analytics
- Full-text search
- Late-join chat history (viewers join and receive from the current moment only)

---

## 6. Backend Implementation

### 6.1 File structure

```
api/app/
  Events/Broadcast/
    MatchChatMessageReceived.php         NEW
  Http/Controllers/User/
    LiveMatchCommentController.php       NEW
  Http/Requests/User/
    SendLiveCommentRequest.php           NEW
  Services/LiveChat/
    LiveMatchCommentService.php          NEW
  Support/LiveChat/
    LiveChatRedisKeys.php                NEW   key builder + purge helper
  Settings/
    LiveChatSettings.php                 NEW   Spatie settings
api/routes/
  channels.php                           ADD  chat channel entry
  api/v1/user.php                        ADD  one route
```

### 6.2 `MatchChatMessageReceived` event

```php
<?php

namespace App\Events\Broadcast;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Ephemeral chat message during a live match stream.
 *
 * ShouldBroadcastNow — inline, no queue, no DB write.
 * Channel: match.{matchId}.chat  (public).
 * Target payload budget: < 300 bytes.
 */
final class MatchChatMessageReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public readonly int    $matchId,
        public readonly string $id,        // ULID — time-ordered, client dedup key
        public readonly string $name,      // author display name (never email/phone)
        public readonly string $body,      // sanitized comment text
        public readonly string $sentAt,    // ISO 8601
    ) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [new Channel("match.{$this->matchId}.chat")];
    }

    public function broadcastAs(): string
    {
        return 'match.chat.message';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return [
            'id'      => $this->id,
            'name'    => $this->name,
            'text'    => $this->body,
            'sent_at' => $this->sentAt,
        ];
    }
}
```

**Payload shape** (no `match_id` — channel already scopes it; no `avatar` — adds size and PII risk):

```json
{ "id": "01JXYZ...", "name": "Ali", "text": "Great shot!", "sent_at": "2026-05-22T18:00:01Z" }
```

**Why `ShouldBroadcastNow` over `ShouldBroadcast`?**
`ShouldBroadcast` enqueues a job: serialization overhead + Redis round-trip for the job payload + queue-worker scheduling latency. For chat that must feel instant, synchronous dispatch within the HTTP request adds only ~2–5 ms — acceptable given the endpoint already makes 2–3 Redis calls.

### 6.3 `SendLiveCommentRequest`

```php
<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class SendLiveCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // route is behind auth:api
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'min:1', 'max:200'],
        ];
    }
}
```

### 6.4 `LiveChatRedisKeys`

Centralises key construction and provides a single purge call used at stream end:

```php
<?php

namespace App\Support\LiveChat;

use Illuminate\Support\Facades\Redis;

final class LiveChatRedisKeys
{
    public static function interval(int $matchId, int|string $userId): string
    {
        return "chat:{$matchId}:interval:{$userId}";
    }

    public static function burst(int $matchId, int|string $userId): string
    {
        return "chat:{$matchId}:burst:{$userId}";
    }

    public static function dedup(int $matchId, int|string $userId): string
    {
        return "chat:{$matchId}:dedup:{$userId}";
    }

    public static function mute(int $matchId, int|string $userId): string
    {
        return "chat:{$matchId}:mute:{$userId}";
    }

    /**
     * Purge all chat operational keys for a match when the stream ends.
     * Uses SCAN to avoid blocking Redis with a large DEL.
     */
    public static function purgeMatch(int $matchId): void
    {
        $pattern = "chat:{$matchId}:*";
        $cursor   = 0;

        do {
            [$cursor, $keys] = Redis::scan($cursor, 'MATCH', $pattern, 'COUNT', 100);
            if (!empty($keys)) {
                Redis::del(...$keys);
            }
        } while ($cursor !== '0');
    }
}
```

### 6.5 `LiveMatchCommentService`

```php
<?php

namespace App\Services\LiveChat;

use App\Events\Broadcast\MatchChatMessageReceived;
use App\Models\TournamentMatch;
use App\Settings\LiveChatSettings;
use App\Support\LiveChat\LiveChatRedisKeys;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class LiveMatchCommentService
{
    public function __construct(private readonly LiveChatSettings $settings) {}

    /**
     * Validate, guard, and broadcast a chat comment.
     *
     * Returns the generated ULID on success.
     * Throws HttpException variants on failure — controller needs no if/else.
     */
    public function send(TournamentMatch $match, int $userId, string $displayName, string $rawBody): string
    {
        // ── Kill switch ────────────────────────────────────────────────────
        if ($this->settings->enabled !== 1) {
            abort(403, 'Live chat is currently disabled.');
        }

        // ── Stream eligibility ─────────────────────────────────────────────
        $stream = $match->stream;
        if (!$stream || !in_array($stream->status, ['live', 'starting'], true)) {
            abort(422, 'This match does not have an active stream.');
        }

        // ── Mute check ─────────────────────────────────────────────────────
        if (Redis::exists(LiveChatRedisKeys::mute($match->id, $userId))) {
            abort(403, 'You are currently muted from this chat.');
        }

        // ── Sanitise ───────────────────────────────────────────────────────
        $body = mb_substr(strip_tags(trim($rawBody)), 0, $this->settings->bodyMax);

        if ($body === '') {
            abort(422, 'Comment cannot be empty.');
        }

        // ── Interval limit (1 per minIntervalSec) ─────────────────────────
        $intervalKey = LiveChatRedisKeys::interval($match->id, $userId);
        $set = Redis::set($intervalKey, 1, 'NX', 'EX', $this->settings->minIntervalSec);

        if ($set === null) {
            abort(429, 'You are sending comments too quickly.');
        }

        // ── Burst limit (burstMax per burstWindowSec) ─────────────────────
        $burstKey = LiveChatRedisKeys::burst($match->id, $userId);
        $count    = Redis::incr($burstKey);

        if ($count === 1) {
            Redis::expire($burstKey, $this->settings->burstWindowSec);
        }

        if ($count > $this->settings->burstMax) {
            abort(429, 'You have reached the comment limit for this session.');
        }

        // ── Duplicate suppression (same text within 10 s) ─────────────────
        $hash     = hash('xxh3', mb_strtolower($body));
        $dedupKey = LiveChatRedisKeys::dedup($match->id, $userId);
        $dedup    = Redis::set($dedupKey, $hash, 'NX', 'EX', 10);

        if ($dedup === null) {
            abort(422, 'Duplicate message.');
        }

        // ── Build and broadcast ────────────────────────────────────────────
        $id     = (string) Str::ulid();
        $sentAt = now()->toIso8601String();

        MatchChatMessageReceived::dispatch(
            matchId: $match->id,
            id:      $id,
            name:    $displayName,
            body:    $body,
            sentAt:  $sentAt,
        );

        return $id;
    }
}
```

### 6.6 `LiveMatchCommentController`

```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\SendLiveCommentRequest;
use App\Models\TournamentMatch;
use App\Services\LiveChat\LiveMatchCommentService;
use Illuminate\Http\JsonResponse;

class LiveMatchCommentController extends Controller
{
    use BaseControllerTrait;

    public function __construct(private readonly LiveMatchCommentService $service) {}

    /**
     * POST /api/v1/matches/{match}/live-comments
     *
     * Thin controller — all rules live in LiveMatchCommentService.
     */
    public function store(SendLiveCommentRequest $request, TournamentMatch $match): JsonResponse
    {
        $user = $request->user();

        $id = $this->service->send(
            match:       $match->loadMissing('stream'),
            userId:      $user->id,
            displayName: $user->name ?: $user->nickname ?: 'Viewer',
            rawBody:     $request->validated('body'),
        );

        return $this->success(['id' => $id], 201);
    }
}
```

### 6.7 Route (`routes/api/v1/user.php`)

Add inside the `auth:api` group, near the existing live-stream route:

```php
// Live match chat — ephemeral comments, no DB writes
Route::post('matches/{match}/live-comments', [LiveMatchCommentController::class, 'store'])
    ->middleware('throttle:120,1'); // IP-level safety net: 120 req/min
```

`throttle:120,1` is a coarse IP-level safety net (Laravel default throttle, separate from per-user Redis limits). Set it high enough that legitimate users never hit it; it exists only to deflect automated floods.

### 6.8 Stream-end Redis cleanup

When a stream ends, call from `MatchStreamService::end()` (or the sync command):

```php
use App\Support\LiveChat\LiveChatRedisKeys;

LiveChatRedisKeys::purgeMatch($match->id);
```

This removes all interval, burst, dedup, and mute keys for the match. SCAN-based deletion avoids blocking Redis.

---

## 7. Frontend Implementation

### 7.1 File structure

```
app/src/
  config/
    echoManager.js                   UPDATE  singleton with ref-counting
  features/stream/
    hooks/
      useMatchChatChannel.js         NEW     WebSocket subscription
      useMatchComments.js            NEW     state management
  store/api/
    matchApi.js                      ADD     sendLiveComment mutation
  pages/live/
    LiveBroadcastItem.jsx            WIRE    handleSend → mutation, add CommentList
```

### 7.2 Echo manager singleton (`echoManager.js`)

Both `useMatchStreamChannel` and `useMatchChatChannel` need the same WebSocket connection. Ref-counting prevents disconnecting while the other hook is still subscribed.

```js
// src/config/echoManager.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let _echo = null;
let _refs = 0;

export function acquireEcho() {
  if (!_echo) {
    _echo = new Echo({
      broadcaster:    'reverb',
      key:            import.meta.env.VITE_REVERB_APP_KEY,
      wsHost:         import.meta.env.VITE_REVERB_HOST,
      wsPort:         import.meta.env.VITE_REVERB_PORT ?? 80,
      wssPort:        import.meta.env.VITE_REVERB_PORT ?? 443,
      forceTLS:       (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
      enabledTransports: ['ws', 'wss'],
      client:         new Pusher(import.meta.env.VITE_REVERB_APP_KEY, { wsHost: '...', cluster: '' }),
    });
  }
  _refs += 1;
  return _echo;
}

export function releaseEcho() {
  _refs -= 1;
  if (_refs <= 0 && _echo) {
    _echo.disconnect();
    _echo = null;
    _refs = 0;
  }
}
```

Update `useMatchStreamChannel` to use `acquireEcho` / `releaseEcho` instead of its current pattern.

### 7.3 `useMatchChatChannel` hook

```js
// src/features/stream/hooks/useMatchChatChannel.js
import { useEffect, useRef } from 'react';
import { acquireEcho, releaseEcho } from '@/config/echoManager';

/**
 * Subscribe to the public `match.{matchId}.chat` Reverb channel.
 *
 * Accepts a stable `onMessage` callback via ref — the channel is never
 * re-subscribed when the parent re-renders.
 *
 * @param {string|number|null} matchId
 * @param {(msg: object) => void} onMessage  Stable (wrap in useCallback or pass dispatch)
 */
export function useMatchChatChannel(matchId, onMessage) {
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage; // always latest, no re-subscribe needed

  useEffect(() => {
    if (!matchId) return;

    const echo = acquireEcho();

    echo
      .channel(`match.${matchId}.chat`)
      .listen('.match.chat.message', (payload) => {
        callbackRef.current?.(payload);
      });

    return () => {
      echo.leave(`match.${matchId}.chat`);
      releaseEcho();
      // Do NOT call echo.disconnect() — releaseEcho() handles that
      // when the ref-count drops to zero.
    };
  }, [matchId]);
}
```

### 7.4 RTK Query mutation (`matchApi.js`)

```js
sendLiveComment: builder.mutation({
  query: ({ matchId, body }) => ({
    url: `/matches/${matchId}/live-comments`,
    method: 'POST',
    body: { body },
  }),
  // No cache tags — comments are ephemeral, not in RTK state
}),
```

Export: `useSendLiveCommentMutation`.

**Important**: never invalidate `Match` or `LiveStreams` tags here. Comments are not game state.

### 7.5 `useMatchComments` hook

Manages local comment state. No initial fetch (no history endpoint — truly ephemeral). Subscribes to the chat channel and maintains a capped in-memory list.

```js
// src/features/stream/hooks/useMatchComments.js
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useMatchChatChannel } from './useMatchChatChannel';

const MAX_MESSAGES = 100; // browser memory cap; only last 4 are ever rendered

/** O(1) dedup via a Set; much faster than array.some() at high volume */
function makeReducer() {
  const seenIds = new Set();

  return function reducer(state, action) {
    switch (action.type) {
      case 'RESET':
        seenIds.clear();
        return [];

      case 'ADD': {
        if (seenIds.has(action.msg.id)) return state; // already received (own echo or duplicate)
        seenIds.add(action.msg.id);

        const next = [...state, action.msg];
        return next.length > MAX_MESSAGES ? next.slice(1) : next; // evict oldest
      }

      default:
        return state;
    }
  };
}

/**
 * @param {string|number|null} matchId
 * @param {boolean} [enabled]  Pass false when stream is idle/ended to skip subscribe
 * @returns {{ messages: object[] }}
 */
export function useMatchComments(matchId, enabled = true) {
  // Reducer is created once with a stable seenIds closure
  const reducerRef = useRef(null);
  if (!reducerRef.current) reducerRef.current = makeReducer();

  const [messages, dispatch] = useReducer(reducerRef.current, []);

  // Reset when matchId changes or chat is disabled
  useEffect(() => {
    dispatch({ type: 'RESET' });
    reducerRef.current = makeReducer(); // fresh seenIds Set for the new match
  }, [matchId]);

  const handleMessage = useCallback((msg) => {
    dispatch({ type: 'ADD', msg });
  }, []);

  useMatchChatChannel(enabled && matchId ? matchId : null, handleMessage);

  return { messages };
}
```

### 7.6 Wiring into `LiveBroadcastItem`

```js
// Inside LiveBroadcastItem
import { useSendLiveCommentMutation } from '@/store/api/matchApi';
import { useMatchComments } from '@/features/stream/hooks/useMatchComments';

// Component body:
const matchId      = match?.id;
const streamStatus = match?.stream?.status;
const chatEnabled  = streamStatus === 'live' || streamStatus === 'starting';

const [sendComment, { isLoading: isSending }] = useSendLiveCommentMutation();
const { messages } = useMatchComments(matchId, chatEnabled);

const canSend = comment.trim().length > 0 && !isSending && chatEnabled;

const handleSend = useCallback(async () => {
  const body = comment.trim();
  if (!body || isSending) return;

  setComment(''); // optimistic clear

  try {
    await sendComment({ matchId, body }).unwrap();
  } catch (err) {
    if (err?.data?.type === 'TOO_MANY_REQUESTS') {
      toast('Slow down a little 🏏');
    }
    // Silent discard for other errors — comment is ephemeral
  }
}, [comment, isSending, matchId, sendComment]);
```

Pass `messages` down to `BroadcastBottomPanel` → `CommentList`.

### 7.7 `CommentList` component

Only the last 4 messages are rendered — no virtualisation needed for 4 items. The component is memoised to prevent re-renders from unrelated state changes in the parent.

```jsx
import { memo, useEffect, useRef } from 'react';

const VISIBLE = 4;

const CommentList = memo(function CommentList({ messages }) {
  const bottomRef = useRef(null);
  const visible   = messages.slice(-VISIBLE);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (visible.length === 0) return null;

  return (
    <ul
      className="flex flex-col gap-2 [mask-image:linear-gradient(to_top,black_75%,transparent)]"
      aria-label="Live comments"
      aria-live="polite"
      aria-atomic="false"
    >
      {visible.map((m) => (
        <li key={m.id} className="flex items-start gap-2">
          <div className="min-w-0">
            <span className="text-[13px] font-bold text-white">{m.name} </span>
            <span className="text-[12px] text-white/80">{m.text}</span>
          </div>
        </li>
      ))}
      <li ref={bottomRef} aria-hidden />
    </ul>
  );
});

export default CommentList;
```

**No avatar images** — eliminates `<img>` fetch cost for every comment in a high-traffic session and avoids broken image states.

`**aria-live="polite"` + `aria-atomic="false"`** — screen readers announce new comments without interrupting ongoing speech.

### 7.8 Pages that must NOT subscribe to chat


| Page                                   | Reason                                                    |
| -------------------------------------- | --------------------------------------------------------- |
| Backoffice match controller            | No chat UI; avoids redundant WS traffic                   |
| Graphics overlay (`/overlay/:matchId`) | OBS performance — one extra channel can cause frame drops |
| Scorecard viewer                       | Read-only; chat is broadcast-page only                    |


---

## 8. Rate Limiting & Spam Prevention

### Layered defence (backend)


| Layer             | Mechanism                 | Default            | Implementation           |
| ----------------- | ------------------------- | ------------------ | ------------------------ |
| 1 — IP safety net | Laravel `throttle:120,1`  | 120 req / min / IP | Route middleware         |
| 2 — Auth          | `auth:api` (Sanctum)      | Required to send   | Route middleware         |
| 3 — Mute          | Redis flag per user/match | Manual / 1 h       | `assertNotMuted()`       |
| 4 — Interval      | Redis `SET NX EX`         | 1 msg per 2 s      | `assertIntervalLimit()`  |
| 5 — Burst         | Redis INCR                | 20 / 10 min        | `assertBurstLimit()`     |
| 6 — Dedup         | Redis `SET NX hash`       | Same text / 10 s   | `assertNotDuplicate()`   |
| 7 — Content       | `strip_tags` + max length | 200 chars          | In service sanitise step |


**A spam request must clear all 7 layers.** Each is cheap and independent.

### Numeric defaults (from `LiveChatSettings`)

All defaults are in `SystemSettingsSeeder`. Admins can change them live without redeploying.


| Setting          | Default | Purpose                                          |
| ---------------- | ------- | ------------------------------------------------ |
| `enabled`        | `1`     | Kill switch; set to `0` to disable chat entirely |
| `minIntervalSec` | `2`     | Seconds between sends                            |
| `burstMax`       | `20`    | Max sends per burst window                       |
| `burstWindowSec` | `600`   | Burst window duration (10 min)                   |
| `bodyMax`        | `200`   | Max comment character length                     |


### Error responses


| Condition         | HTTP | `type`              |
| ----------------- | ---- | ------------------- |
| Chat disabled     | 403  | `FORBIDDEN`         |
| Stream not live   | 422  | `VALIDATION_ERROR`  |
| Muted             | 403  | `FORBIDDEN`         |
| Interval exceeded | 429  | `TOO_MANY_REQUESTS` |
| Burst exceeded    | 429  | `TOO_MANY_REQUESTS` |
| Duplicate message | 422  | `DUPLICATE_MESSAGE` |


Frontend response: show a brief toast for `429`, silent discard for `422 DUPLICATE_MESSAGE`, permanent disable of the input for `403` (disabled or muted).

---

## 9. Event Flow — End to End

```
[Viewer A — browser]
  comment = "Great delivery!"
  send button pressed
        │
        ▼
POST /api/v1/matches/42/live-comments   { body: "Great delivery!" }
Authorization: Bearer <token>
        │
        ▼
[Laravel HTTP worker — ~5–8 ms total]
  auth:api        → resolves User id=7, name="Ali"
  throttle:120,1  → pass
  FormRequest     → validate (200 chars, non-empty)
  LiveMatchCommentService::send()
    assertStreamEligible()  → stream.status = 'live'  ✓
    assertNotMuted()        → key absent               ✓
    sanitise body           → "Great delivery!"
    SET chat:42:interval:7  1 NX EX 2  → OK            ✓
    INCR chat:42:burst:7    → 3 (< 20)                 ✓
    SET chat:42:dedup:7     <hash> NX EX 10  → OK      ✓
    id = Str::ulid()        → "01JXYZ..."
    MatchChatMessageReceived::dispatch(matchId:42, id:"01JXYZ...", name:"Ali",
                                       body:"Great delivery!", sentAt:"...")
      → Reverb → match.42.chat  →  all subscribers
  return 201 { data: { id: "01JXYZ..." } }
        │
        ▼
[Reverb fan-out — < 50 ms to all clients]
  event: .match.chat.message
  { id: "01JXYZ...", name: "Ali", text: "Great delivery!", sent_at: "..." }
        │
   ┌────┴─────────────────┐
   ▼                       ▼
[Viewer A — sender]      [Viewer B … N — other watchers]
  seenIds has "01JXYZ..."  seenIds does NOT have it
  → skip (dedup)           → dispatch ADD
                           → messages = [..., newMsg]
                           → CommentList re-renders (4 visible)
```

**Total latency sender → all other viewers: ~50–200 ms** (HTTP request + Reverb fan-out). Under 200 ms on LAN/hosted infra with normal RTT.

---

## 10. Connection Lifecycle

### State machine per matchId

```
enter /live/broadcast/:matchId
        │
        ▼
acquireEcho() + subscribe match.{id}.chat
        │                    │
        │                    ▼
        │           stream.status = 'live' or 'starting'
        │           → chatEnabled = true, input active
        │
        ├─ stream.status → 'ended' (via useMatchStreamChannel)
        │       → chatEnabled = false, input hidden
        │       → dispatch RESET (clear messages)
        │       → leave channel + releaseEcho()
        │
        ├─ matchId changes
        │       → leave old channel + releaseEcho()
        │       → dispatch RESET
        │       → acquireEcho() + subscribe new channel
        │
        └─ navigate away from page
                → useEffect cleanup fires
                → leave channel + releaseEcho()
                → if refs = 0: Echo disconnects
```

### WebSocket reconnect

Echo (Pusher-compatible) reconnects automatically on drop. On reconnect there is no re-fetch — viewers simply resume receiving from the current moment, consistent with the ephemeral design. No gap-fill is attempted.

If the `connected` event is useful for debugging:

```js
echo.connector.pusher.connection.bind('connected', () => {
  // No re-fetch needed — chat is ephemeral
  console.debug('[chat] Reverb reconnected — resuming from current moment');
});
```

### Auth token expiry

If the Sanctum token expires mid-session, the HTTP POST returns `401`. The frontend should surface "Session expired — please refresh" and stop accepting input. The WebSocket subscription (public channel) continues receiving messages because public channels require no auth.

---

## 11. Scaling & Performance

### Request path cost (single comment)


| Step                              | Cost        |
| --------------------------------- | ----------- |
| Auth middleware (token cache hit) | ~1 ms       |
| Redis SET NX (interval)           | ~0.5 ms     |
| Redis INCR (burst)                | ~0.5 ms     |
| Redis SET NX (dedup)              | ~0.5 ms     |
| `ShouldBroadcastNow` dispatch     | ~2–5 ms     |
| **Total per request**             | **~5–8 ms** |


No DB queries in the hot path.

### Expected throughput


| Scenario                    | Aggregate comment rate | Reverb frames/s (1,000 viewers) |
| --------------------------- | ---------------------- | ------------------------------- |
| Casual match (50 viewers)   | ~2 msg/s               | 2,000                           |
| Hot match (500 viewers)     | ~8 msg/s               | 8,000                           |
| Viral final (2,000 viewers) | ~15 msg/s              | 30,000                          |


Reverb on a single node handles tens of thousands of frames/s. Comment payloads are ~~250 bytes — far smaller than `match.state.updated` (~~several KB). Chat traffic is orders of magnitude lighter than scoring.

### Horizontal scaling

Reverb already uses Redis pub/sub as its internal message bus. Adding a second Reverb node behind a load balancer requires zero application changes — `MatchChatMessageReceived` publishes to Redis pub/sub and all Reverb nodes fan out to their own subscribers.

HTTP workers (PHP-FPM / Octane) scale horizontally; Redis rate limit keys are shared across all instances.

### Spike mitigation


| Spike type                 | Mitigation                                                        |
| -------------------------- | ----------------------------------------------------------------- |
| Many new subscribers       | Reverb horizontal scale                                           |
| High comment rate per user | Interval + burst limits block sustained floods                    |
| Redis hot key              | Keys are scoped by `{matchId}:{userId}` — naturally sharded       |
| DDoS on comment endpoint   | IP throttle + auth required                                       |
| Operator emergency         | Set `live_chat_enabled = 0` in admin → `403` instantly, no deploy |


---

## 12. Memory Budget

### Redis (per active match, 100 concurrent chatters)


| Key type  | Count | Size      | Total                |
| --------- | ----- | --------- | -------------------- |
| Interval  | 100   | ~8 bytes  | ~800 bytes           |
| Burst     | 100   | ~8 bytes  | ~800 bytes           |
| Dedup     | 100   | ~32 bytes | ~3.2 KB              |
| Mute      | 0–few | ~8 bytes  | negligible           |
| **Total** |       |           | **< 5 KB per match** |


For 10 simultaneous matches: < 50 KB. Effectively zero Redis pressure.

### Browser (per viewer)


| Item             | Cap               | Size                     |
| ---------------- | ----------------- | ------------------------ |
| `messages` array | 100 items         | ~100 × 250 bytes = 25 KB |
| `seenIds` Set    | 100 entries       | ~100 × 24 bytes = 2.4 KB |
| Rendered DOM     | 4 `<li>` elements | negligible               |
| **Total**        |                   | **< 30 KB**              |


---

## 13. Configuration — LiveChatSettings

### Why Spatie settings, not `.env`

Rate limits, the kill switch, and body max are **operational** values that ops must be able to change during a live match without redeploying. This is the same pattern as `StreamingSettings`. Values live in the `settings` table, edited via Admin → System Settings.

### `LiveChatSettings` class

```php
<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Operational tunables for the live match chat feature.
 * Editable from Admin → System Settings → Live Match Chat.
 */
class LiveChatSettings extends Settings
{
    /** 1 = enabled, 0 = kill switch (all POSTs return 403). */
    public int $enabled;

    /** Minimum seconds between sends per user per match. */
    public int $minIntervalSec;

    /** Max messages per user per burstWindowSec. */
    public int $burstMax;

    /** Duration of the burst window in seconds. */
    public int $burstWindowSec;

    /** Max comment body length in characters. */
    public int $bodyMax;

    public static function group(): string
    {
        return 'live_chat';
    }
}
```

### System setting keys


| Key                          | Property         | Type    | Default | Admin editable |
| ---------------------------- | ---------------- | ------- | ------- | -------------- |
| `live_chat_enabled`          | `enabled`        | INTEGER | `1`     | Yes            |
| `live_chat_min_interval_sec` | `minIntervalSec` | INTEGER | `2`     | Yes            |
| `live_chat_burst_max`        | `burstMax`       | INTEGER | `20`    | Yes            |
| `live_chat_burst_window_sec` | `burstWindowSec` | INTEGER | `600`   | Yes            |
| `live_chat_body_max`         | `bodyMax`        | INTEGER | `200`   | Yes            |


Wire keys in `SystemSettingGroupEnum::LIVE_CHAT`, `SystemSettingKeyEnum`, and `SystemSettingRegistry::definitions()`.

### Public vs admin-only


| Key                 | Expose on `GET /api/v1/system-settings` (public)? | Reason                                                 |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| `live_chat_enabled` | **Yes**                                           | App hides chat UI entirely when `0`                    |
| All others          | **No**                                            | Server-authoritative; client mirrors limits in UX only |


Add `live_chat_enabled` to `SystemSettingKeyEnum::publicKeys()`. The frontend reads it once on app boot and disables the entire chat subscription + UI when `0`.

### Implementation checklist (settings)

- `LiveChatSettings` class + `config/settings.php` entry
- `SystemSettingGroupEnum::LIVE_CHAT` (`live_chat` → label "Live Match Chat")
- `SystemSettingKeyEnum` — five cases + registry definitions/rules
- `SystemSettingsSeeder::seedLiveChat()` with defaults above
- `EnsureSpatieSettingsDatabaseProperties` defaults for `live_chat` group
- `live_chat_enabled` in `SystemSettingKeyEnum::publicKeys()`

---

## 14. Implementation Steps

### Group A — Backend core (estimated: 2–3 h)

**A-1** `LiveChatSettings` + system settings wiring (§13 checklist)

- Done when: `GET /api/v1/system-settings` includes `live_chat_enabled`

**A-2** `LiveChatRedisKeys.php`

- Key builder methods + `purgeMatch()` using SCAN
- Done when: PHPUnit confirms key name format and purge runs without blocking

**A-3** `MatchChatMessageReceived.php`

- Pattern from `MatchStreamStatusUpdated`; channel `match.{id}.chat`; event `match.chat.message`
- Payload: `{ id, name, text, sent_at }`
- Done when: `MatchChatMessageReceived::dispatch(...)` visible in Reverb debug output

**A-4** `SendLiveCommentRequest.php`

- Rule: `body` required string max `bodyMax`
- Done when: missing / too-long body returns 422 validation error

**A-5** `LiveMatchCommentService.php`

- All guards in order: kill-switch → stream-eligible → mute → sanitise → interval → burst → dedup → build ULID → dispatch
- Done when: unit test with fake Redis asserts event dispatched once on valid input, zero times when rate limited

**A-6** `LiveMatchCommentController.php` + route + channel registration

- Route: `POST matches/{match}/live-comments` inside `auth:api`, `throttle:120,1`
- `channels.php`: `match.{matchId}.chat` → `fn() => true`
- Done when: `POST /api/v1/matches/1/live-comments` with valid Bearer token returns 201 and Reverb shows the event on `match.1.chat`

**A-7** Stream-end cleanup

- Call `LiveChatRedisKeys::purgeMatch($matchId)` inside `MatchStreamService::end()`
- Done when: after ending a stream, no `chat:{matchId}:`* keys remain in Redis

---

### Group B — Frontend hooks (estimated: 2 h)

**B-1** `echoManager.js` — singleton with `acquireEcho` / `releaseEcho` ref-counting

- Update `useMatchStreamChannel` to use the manager
- Done when: two hooks on the same page share one WebSocket connection (verify in devtools Network → WS)

**B-2** `sendLiveComment` mutation in `matchApi.js`

- `POST /matches/${matchId}/live-comments`; no tag invalidation
- Done when: mutation callable from components, correct endpoint in Network tab

**B-3** `useMatchChatChannel.js`

- `acquireEcho()` + `.channel(...).listen(...)` + cleanup with `leave` + `releaseEcho`
- `callbackRef` pattern — channel never re-subscribed on parent re-render
- Done when: messages received in callback; leaving the page unsubscribes cleanly

**B-4** `useMatchComments.js`

- `makeReducer()` with closure `seenIds` Set; RESET on matchId change; ADD with O(1) dedup; cap at 100
- `chatEnabled` parameter gates the subscription
- Done when: 101st message evicts the 1st; duplicate id skipped; reset clears Set

---

### Group C — UI wiring (estimated: 1–2 h)

**C-1** Wire `handleSend` in `LiveBroadcastItem`

- `useSendLiveCommentMutation` + `useMatchComments`
- Optimistic input clear; 429 toast; `canSend` gates on `!isSending && chatEnabled`
- Done when: comment appears on a second browser tab within 200 ms

**C-2** `CommentList` component (memoised, `aria-live="polite"`)

- Last 4 visible; gradient mask; `bottomRef` auto-scroll; no avatars
- Done when: new comments scroll into view; old ones fade out correctly

**C-3** Hide chat input when stream is not `live` or `starting`

- When `stream.status` → `ended`: dispatch RESET, hide `CommentList` and `CommentInputRow`
- Show a static "Stream has ended" note instead
- Done when: ending the stream in backoffice immediately hides the input for all viewers

**C-4** `live_chat_enabled` public setting check

- Read from system settings on app boot; if `0`, render nothing in chat subtree
- Done when: toggling kill switch in admin instantly stops new viewers seeing chat UI (existing subscribers see the channel go quiet)

---

### Group D — Hardening (estimated: 30 min)

**D-1** 429 feedback UX — disable send button for `minIntervalSec` seconds client-side

- Mirrors server behaviour; reduces redundant retries
- Done when: button stays disabled for 2 s after each send (matching default `minIntervalSec`)

**D-2** Feature test (API)

- `Http::fake()` not needed — use `Event::fake()` + fake Redis
- Assert `MatchChatMessageReceived` dispatched once on valid input
- Assert zero dispatches on rate-limited or duplicate input
- Assert no `DB::table(...)` inserts anywhere in the request lifecycle

---

### Phase 2 — Viewer presence & backoffice count (estimated: 3–4 h)

> **Not part of Phase 1 (Groups A–D).** Chat ships first on a **public** channel with zero per-subscriber auth cost. Viewer count is a separate concern and uses a **dedicated presence channel** — never mixed with `match.{id}.chat`.

#### Why presence is Phase 2, not Phase 1

Presence channels require every viewer to authenticate the WebSocket handshake via `/broadcasting/auth`. That adds latency and server load proportional to concurrent viewer count. A public chat channel has zero handshake cost per subscriber. Keeping presence off the chat hot path preserves sub-second comment delivery and avoids coupling viewer spikes to chat infrastructure.

| Concern | Chat (Phase 1) | Presence (Phase 2) |
|--------|----------------|---------------------|
| Channel | `match.{id}.chat` (public) | `match.{id}.presence` (presence) |
| Auth at subscribe | None | `auth:api` per viewer |
| Payload | Comment text | Join/leave + count only |
| Subscribers | App broadcast page | App broadcast + backoffice stream panel |
| DB writes | None | None (count from Reverb presence) |

#### Channel architecture

```
match.{matchId}.presence    ← Laravel PresenceChannel
Event: .match.presence.updated (optional — or use Pusher member_added/removed client-side)
```

**`routes/channels.php`:**

```php
use Illuminate\Broadcasting\PresenceChannel;

Broadcast::channel('match.{matchId}.presence', function (User $user, int|string $matchId) {
  // Optional: restrict to matches with an active stream
  return ['id' => $user->id, 'name' => $user->name ?: 'Viewer'];
});
```

- **App:** subscribe only on `/live/broadcast/:matchId` while stream is `live` or `starting`; use Echo `join()` not `channel()`.
- **Backoffice:** subscribe from the match stream panel (Live Streaming section) while an operator has the panel open — display live count; do **not** subscribe from match controller scoring UI.
- **Do not** piggyback presence on `.chat` or `.stream` events.

#### Backoffice — Live Streaming panel

Add a **viewer count** block to the existing match stream panel (or live streaming area in backoffice):

- Label: **“X watching”** (or “X viewers”)
- Source: presence channel member count (`channel.members` / Echo `.here()` / `.joining()` / `.leaving()`)
- Updates in real time as viewers join or leave the broadcast page
- No chat subscription required — operators see audience size without chat WS traffic

#### Frontend (app)

- Extend `echoManager` (or a sibling `useMatchPresenceChannel`) to `join('match.{id}.presence')` with Sanctum token on `/broadcasting/auth`.
- Ref-count alongside stream + chat; leave on page unmount or stream `ended`.
- **Optional v2:** show “X watching” on the broadcast page for viewers (product decision — backoffice is the minimum for Phase 2).

#### Implementation checklist (Phase 2)

- [x] `routes/channels.php` — `match.{matchId}.presence` presence callback
- [x] App: `useMatchPresenceChannel` (auth Echo join, cleanup on unmount)
- [x] Backoffice: presence subscribe in match stream panel + “X watching” UI
- [x] Verify three channels on broadcast page share **one** Echo connection (stream public + chat public + presence authenticated)
- [ ] Stream end: leave presence channel; count drops for operators (manual verify)
- [ ] Load test: 500+ presence members does not affect chat POST latency or scoring channels

#### Do-not-affect (Phase 2)

- `match.{id}.chat` event shape and public subscribe path — unchanged
- Scoring, graphics, stream status channels — unchanged
- No DB table for viewer sessions; presence state lives in Reverb only

See also §17 (Out of Scope) — presence remains explicitly excluded from Phase 1.

---

## 15. Testing Checklist


| Scenario                            | Expected result                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| POST with valid token + live stream | 201 + Reverb event on `match.{id}.chat`                                                       |
| POST while stream status = `idle`   | 422 VALIDATION_ERROR                                                                          |
| POST while stream status = `ended`  | 422 VALIDATION_ERROR                                                                          |
| POST — same text twice within 10 s  | First → 201; second → 422 DUPLICATE_MESSAGE                                                   |
| POST — faster than minIntervalSec   | 429 TOO_MANY_REQUESTS                                                                         |
| POST — exceeds burstMax in window   | 429 TOO_MANY_REQUESTS                                                                         |
| Two viewers on same match           | Both receive the WS event; sender dedups by id                                                |
| Scoring ball arrives simultaneously | Chat subscribers on `.chat` receive nothing; scoring subs on `.scoring` receive nothing extra |
| Stream ends                         | Redis keys purged; chat input hidden; messages cleared                                        |
| Navigate away from broadcast page   | Channel left; no memory leak in Echo manager                                                  |
| `live_chat_enabled = 0`             | POST returns 403; frontend hides input                                                        |
| Feature test                        | No DB inserts; event dispatched exactly once on success                                       |


---

## 16. Do-Not-Affect Checklist

Before merging any chat PR, confirm:

- `MatchStateUpdated` event — unchanged
- `MatchStreamStatusUpdated` event — unchanged
- `MatchGraphicCommandActivated` / `MatchGraphicCaptionChanged` — unchanged
- `getMatch` / `getMatchState` RTK Query tags — not invalidated by chat mutation
- Backoffice Reverb services — do not import or reference chat hooks
- `StreamPlayer` / `IframeStreamPlayer` — untouched
- No new Laravel migrations (no comment table)
- Queue depth — not increased (chat uses `ShouldBroadcastNow`)
- Scoring channel `match.{id}.scoring` — no new listeners
- Graphics overlay page — does not subscribe to `.chat`

---

## 17. Out of Scope

> **Explicitly out of scope for this implementation (do not add, even as a "quick win"):**
>
> - **Comment history for late joiners** — violates the no-persistence constraint; non-negotiable
> - **Viewer presence / backoffice viewer count** — implemented in [§14 Phase 2](#phase-2--viewer-presence--backoffice-count-estimated-3-4-h)
> - **Profanity filter, moderation UI, reconnect buffer** — each requires its own design; not part of this phase


| Feature                                      | Why excluded                                                                                                                                                                                                      | Phase                   |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Comment history for late joiners             | Requires storing comment text in Redis or DB — violates the core no-persistence constraint. Viewers join and receive from the current moment only (same behaviour as YouTube live chat).                          | Never                   |
| Comment persistence beyond stream duration   | Explicitly excluded; Redis rate-limit keys are purged on stream end; no comment text is ever written                                                                                                              | Never                   |
| Storing comments for analytics or legal hold | Explicitly excluded by the no-DB-write constraint                                                                                                                                                                 | Never                   |
| Reconnect buffer                             | Buffering missed messages during a WebSocket drop-reconnect requires temporary storage of comment text. Viewers who reconnect simply resume from the current moment — consistent with the ephemeral design.       | Never (in current form) |
| Profanity / ML content filter                | Adds synchronous latency on the hot path. Can be layered in later as an async pre-check without changing the broadcast path.                                                                                      | Future                  |
| Comment moderation UI in backoffice          | Requires DB records and admin tooling. The Redis `mute` key (§5.5) is already a stub for Phase 2.                                                                                                                 | Phase 2                 |
| Viewer presence / backoffice viewer count    | Implemented — dedicated `match.{id}.presence` channel, separate from chat. See [§14 Phase 2](#phase-2--viewer-presence--backoffice-count-estimated-3-4-h). | Phase 2 (done)          |
| Comment reactions / threading / @mentions    | Separate feature with its own event shape, UI, and state                                                                                                                                                          | Future                  |
| Push notifications for comments              | Inappropriate for ephemeral real-time chat                                                                                                                                                                        | Never                   |


---

> **Implementation start point:** Group A-1 (LiveChatSettings) → A-2 (Redis keys) → A-3 (event) → A-5 (service) → A-6 (controller + route) → Group B → Group C.
> **Phase 2 (after MVP):** [Viewer presence & backoffice count](#phase-2--viewer-presence--backoffice-count-estimated-3-4-h).
> Each step has a clear "done when" criterion and can be implemented and verified independently.

