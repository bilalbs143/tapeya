# Scoring Flash Graphics — Final Implementation Spec

**Status:** Ready for implementation (sign off §2 decisions first)  
**Approach:** Overlay-ephemera flash layer with sequential queue + undo cancel  
**Scope:** LT-only, v1 (no FST, no fifty/hundred)  
**Files:** 6 total — 3 new, 3 edited

---

## 1. What This Builds

After a scorer stores a ball, a Lower Third graphic automatically flashes on the OBS overlay for 3 seconds per event, then the display returns to whatever the operator last activated — or transparent if nothing is set. Combined deliveries play sequentially: a no-ball six shows `LT_NO_BALL` (3 s) then `LT_SIX` (3 s). If the scorer undoes the ball, the flash cancels immediately.

The overlay remains unauthenticated (public Reverb channel). Backoffice operators retain full manual control — auto-flashes never touch `active_command_id` or the command log.

---

## 2. Product Decisions — Sign Off Before Implementation

| # | Decision | This spec assumes | Alternative |
|---|----------|-------------------|-------------|
| 2.1 | **SSOT framing** | Operator command log = persistent SSOT. Scoring flashes = ephemeral overlay layer. Nothing is written to `match_graphic_commands` for flashes. | Write transient command rows for full audit trail (Cursor approach — higher effort, stronger SSOT). |
| 2.2 | **Undo cancels flash** | Yes — `deleteBall` / `deleteLastBall` dispatch a cancel signal; front-end clears the queue immediately if `ball_id` matches. | Let flash run out naturally (wrong `LT_OUT` stays on air for ~2 s — bad for live ops). |
| 2.3 | **Empty baseline after flash** | When the flash queue empties and `active_command` is null → **transparent overlay** (`renderPlan = null`). Operators set a command if they want something persistent on screen. | Auto-fall-back to `LT_DEFAULT` when no operator command is active. |
| 2.4 | **Opt-out toggle** | `scoring_flash_enabled: true` stored in `MatchGraphicSession.config` (JSON column, already exists). Default on. Operator can disable via existing session-config update endpoint. | Always on in v1, no toggle. |
| 2.5 | **Flash duration** | Fixed at 3 000 ms per item (NB + SIX = 6 000 ms total). Duration config (`auto_flash_duration_ms`) from Claude's original plan is deferred — see §11. | Add `duration_ms` to event payload now, read from session config. |
| 2.6 | **Fifty / hundred** | Excluded from v1. | Include: detect via cumulative runs crossing 50/100 threshold in `ScoringFlashResolver`. |
| 2.7 | **Backoffice flash indicator** | Not shown in v1. | Add transient indicator in backoffice Reverb service listening on `.match.graphic.flash`. |

---

## 3. Architecture — Two-Layer Display Model

```
┌──────────────────────────────────────────────────────────┐
│  LAYER 1 — Persistent (command log)                      │
│  Owner:    backoffice operator                           │
│  Storage:  match_graphic_commands / active_command_id    │
│  Broadcast: .match.graphic.activated                     │
│  Overlay:  session.active_command → Redux cache          │
└──────────────────────────────────────────────────────────┘
        ↑ baseline always intact; never mutated by scoring

┌──────────────────────────────────────────────────────────┐
│  LAYER 2 — Ephemeral flash (overlay-local only)          │
│  Owner:    scoring events                                │
│  Storage:  none (no DB writes, no command rows)          │
│  Broadcast: .match.graphic.flash (same public channel)   │
│  Overlay:  useGraphicFlash hook → in-memory timer queue  │
└──────────────────────────────────────────────────────────┘
        ↑ exists only in JS memory; lost on reconnect
```

**During a flash:** `GraphicControllerProvider` builds its `renderPlan` from a synthetic snapshot whose `commandKey` is the current flash item. When the queue drains it falls back to the real Redux snapshot (Layer 1).

**Operator command mid-flash:** `.match.graphic.activated` still patches the Redux cache. When the flash queue empties the overlay immediately shows the new operator command.

**Reconnect mid-flash:** Flash state is lost; overlay shows whatever `active_command` is in the HTTP session response. Acceptable for ephemeral UI.

---

## 4. API Implementation

### 4.1 New: `ScoringFlashResolver`

`api/app/Services/Broadcast/ScoringFlashResolver.php`

Pure static resolver. Takes a persisted `Ball` model, returns an ordered `array<GraphicCommandKeyEnum>`. Empty array = no flash.

```php
<?php

namespace App\Services\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Models\Ball;
use App\Services\InningsStatsService;

/**
 * Derives the ordered LT-flash command queue from a persisted Ball.
 *
 * Rules (v1 — LT only, no FST, no fifty/hundred):
 *   retired hurt      → []                   (not a dismissal; stored is_wicket=true)
 *   wide              → [LT_WIDE]
 *   wide + wicket     → [LT_WIDE, LT_OUT]
 *   no-ball           → [LT_NO_BALL]
 *   no-ball + 4 bat   → [LT_NO_BALL, LT_FOUR]
 *   no-ball + 6 bat   → [LT_NO_BALL, LT_SIX]
 *   no-ball + wicket  → [LT_NO_BALL, LT_OUT]
 *   wicket            → [LT_OUT]
 *   4 off bat         → [LT_FOUR]
 *   6 off bat         → [LT_SIX]
 *   dot / 1-3 / bye   → []
 *
 * Wide runs off bat is always 0 (InningsStatsService::strikerRunsOffBat returns 0
 * for wide), so LT_FOUR / LT_SIX are never appended on a wide delivery.
 *
 * Wicket on a boundary (e.g. run-out on a four): LT_OUT only — no LT_FOUR.
 *
 * Retired hurt is stored with is_wicket=true but must NOT show LT_OUT.
 */
class ScoringFlashResolver
{
    /**
     * @return GraphicCommandKeyEnum[]
     */
    public static function resolve(Ball $ball): array
    {
        // Retired hurt: is_wicket is true in the DB but it is not a dismissal.
        // Guard this first — all wicket branches below would fire otherwise.
        if ($ball->is_wicket && $ball->isRetiredHurt()) {
            return [];
        }

        $queue = [];

        // ── Wide ─────────────────────────────────────────────────────────────
        if ($ball->is_wide) {
            $queue[] = GraphicCommandKeyEnum::LT_WIDE;

            if ($ball->is_wicket) {
                $queue[] = GraphicCommandKeyEnum::LT_OUT;
            }

            // runsOffBat is always 0 on a wide — no boundary flash.
            return $queue;
        }

        // ── No-ball prefix ───────────────────────────────────────────────────
        if ($ball->is_no_ball) {
            $queue[] = GraphicCommandKeyEnum::LT_NO_BALL;
        }

        // ── Wicket — appended after extra prefix; skip boundary check ────────
        if ($ball->is_wicket) {
            $queue[] = GraphicCommandKeyEnum::LT_OUT;
            return $queue;
        }

        // ── Boundary off bat ─────────────────────────────────────────────────
        $runsOffBat = InningsStatsService::strikerRunsOffBat($ball);

        if ($runsOffBat === 6) {
            $queue[] = GraphicCommandKeyEnum::LT_SIX;
        } elseif ($runsOffBat === 4) {
            $queue[] = GraphicCommandKeyEnum::LT_FOUR;
        }

        // dot / 1 / 2 / 3 (no extras, no boundary) → empty queue
        return $queue;
    }
}
```

### 4.2 New: `MatchGraphicFlashDispatched`

`api/app/Events/Broadcast/Graphics/MatchGraphicFlashDispatched.php`

Broadcasts on the same public channel as `MatchGraphicCommandActivated`. Front-end listens on the same Echo channel.

```php
<?php

namespace App\Events\Broadcast\Graphics;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use App\Services\Broadcast\GraphicContextOrchestrator;
use App\Support\Broadcast\GraphicContextHash;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\App;

/**
 * Auto-flash event dispatched after a ball is stored (or cancelled after undo).
 *
 * Shares the public channel `match.{id}.graphics` with MatchGraphicCommandActivated.
 * Does NOT write to match_graphic_commands or mutate active_command_id.
 *
 * Payload:
 *   match_id     int
 *   ball_id      int          front-end uses this to match cancel signals
 *   commands     string[]     ordered GraphicCommandKeyEnum values; [] = cancel
 *   context      array|null   live context captured at ball-store time
 *   context_hash string|null
 */
class MatchGraphicFlashDispatched implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /** @param GraphicCommandKeyEnum[] $commands */
    public function __construct(
        public readonly int $matchId,
        public readonly int $ballId,
        public readonly array $commands,
        public readonly ?array $context,
        public readonly ?string $contextHash,
    ) {}

    /**
     * Build a flash event with live context resolved at dispatch time.
     * Ball is already persisted when this is called, so mergeSessionContext()
     * produces accurate context (same as SyncMatchGraphicContextJob output).
     *
     * @param GraphicCommandKeyEnum[] $commands
     */
    public static function fromSession(
        MatchGraphicSession $session,
        int $ballId,
        array $commands,
    ): self {
        $match = TournamentMatch::query()->find($session->match_id);
        $context = null;
        $contextHash = null;

        if ($match instanceof TournamentMatch) {
            $context = App::make(GraphicContextOrchestrator::class)
                ->mergeSessionContext($session, $match);
            $contextHash = $context !== null
                ? GraphicContextHash::hash($context)
                : null;
        }

        return new self(
            matchId: $session->match_id,
            ballId: $ballId,
            commands: $commands,
            context: $context,
            contextHash: $contextHash,
        );
    }

    public function broadcastOn(): array
    {
        return [new Channel("match.{$this->matchId}.graphics")];
    }

    public function broadcastAs(): string
    {
        return 'match.graphic.flash';
    }

    public function broadcastWith(): array
    {
        return [
            'match_id'     => $this->matchId,
            'ball_id'      => $this->ballId,
            'commands'     => array_map(
                fn (GraphicCommandKeyEnum $k) => $k->value,
                $this->commands,
            ),
            'context'      => $this->context,
            'context_hash' => $this->contextHash,
        ];
    }
}
```

> **Cancel-event context note:** `fromSession()` still calls `mergeSessionContext()` for cancel signals (`commands: []`). The front-end ignores context when the array is empty, so this is harmless. If the extra DB call becomes a concern, a dedicated `MatchGraphicFlashCancelled` event with no context can be introduced — unnecessary for v1.

### 4.3 Edited: `ScorecardController`

`api/app/Http/Controllers/User/ScorecardController.php`

Three hook points.

**`storeBall` — after line 151 (`SyncMatchGraphicContextJob::dispatch`):**

```php
$this->dispatchScoringFlash($match, $ball);
```

**`deleteBall` — capture id *before* delete, call cancel *after* delete:**

```php
// Capture before delete so id is definitely available.
$ballId = $ball->id;

$ball->delete();

// ... existing clearGraphicPendingCreaseIds, completionService, jobs ...

$this->cancelScoringFlash($match, $ballId);
```

**`deleteLastBall` — `$ball` is already fetched at line 302 before delete; capture id there:**

```php
// $ball fetched at line 302 — id is available before and after delete.
$ballId = $ball->id;

$ball->delete();

// ... existing clearGraphicPendingCreaseIds, completionService, jobs ...

$this->cancelScoringFlash($match, $ballId);
```

**Two new private methods at the bottom of the class:**

```php
private function dispatchScoringFlash(TournamentMatch $match, Ball $ball): void
{
    // graphicSession is loaded at line 74 in storeBall via loadMissing.
    $session = $match->graphicSession;
    if (! $session instanceof \App\Models\MatchGraphicSession) {
        return;
    }

    $config = is_array($session->config) ? $session->config : [];
    if (($config['scoring_flash_enabled'] ?? true) === false) {
        return;
    }

    $commands = \App\Services\Broadcast\ScoringFlashResolver::resolve($ball);
    if (empty($commands)) {
        return;
    }

    \App\Events\Broadcast\Graphics\MatchGraphicFlashDispatched::fromSession(
        $session,
        $ball->id,
        $commands,
    )->dispatch();
}

private function cancelScoringFlash(TournamentMatch $match, int $ballId): void
{
    $session = $match->loadMissing('graphicSession')->graphicSession;
    if (! $session instanceof \App\Models\MatchGraphicSession) {
        return;
    }

    \App\Events\Broadcast\Graphics\MatchGraphicFlashDispatched::fromSession(
        $session,
        $ballId,
        [],   // empty commands = cancel signal
    )->dispatch();
}
```

> **`cancelScoringFlash` uses `loadMissing`** because `deleteBall`/`deleteLastBall` do not call `$match->loadMissing('graphicSession')` before this point, unlike `storeBall` (which loads it at line 74).

---

## 5. Frontend Implementation

### 5.1 Correct Render Path

```
GraphicEchoProvider
  └── GraphicControllerProvider          ← flash injection happens here ONLY
        └── GraphicOverlayContent
              └── GraphicRenderer
```

`GraphicControllerProvider` is the only place where `renderPlan` is produced. Flash logic must override the snapshot **inside this component**. Do not touch `GraphicOverlayContent` or `useGraphicSession`.

Real overlay entry: `app/src/graphics/entry/GraphicOverlay.jsx`  
`app/src/pages/graphics-controller/GraphicOverlay.jsx` is a re-export — do not edit.

### 5.2 New: `useGraphicFlash.js`

`app/src/hooks/useGraphicFlash.js`

Manages the flash queue and per-item timers. Returns the currently-active flash item or `null`.

```js
import { useEffect, useRef, useState } from 'react';

import { useGraphicEcho } from '@/pages/graphics-controller/GraphicEchoContext';

const FLASH_DURATION_MS = 3_000;

/**
 * Subscribes to `.match.graphic.flash` on `match.{matchId}.graphics`.
 * Manages the sequential command queue and per-item timers.
 *
 * Returns the active flash item { commandKey, context, contextHash } or null.
 *
 * Timer pattern: a single useEffect watches the queue array reference.
 * Every setQueue(...) produces a new reference, so the effect cleans up the
 * previous timer and starts a fresh one. No nested callbacks; no orphan timers.
 *
 * @param {string|number|undefined} matchId
 * @returns {{ commandKey: string, context: object|null, contextHash: string|null } | null}
 */
export function useGraphicFlash(matchId) {
  const echo = useGraphicEcho();

  // Queue of { commandKey, context, contextHash } objects to display in order.
  const [queue, setQueue] = useState([]);

  // Ref tracks the ball_id of the currently-playing flash for cancel matching.
  // Using a ref avoids stale-closure issues in the Reverb event handler.
  const currentBallIdRef = useRef(null);

  // ── Timer: advance queue by one item after FLASH_DURATION_MS ─────────────
  // Dependency is the queue array reference itself. Every setQueue(...) call
  // produces a new reference, so this effect re-runs on every queue mutation,
  // cleaning up the previous timer before scheduling the next.
  useEffect(() => {
    if (queue.length === 0) return;

    const timer = setTimeout(() => {
      setQueue((prev) => prev.slice(1));
    }, FLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [queue]); // array reference changes on every mutation — intentional

  // ── Reverb listener ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!matchId || !echo) return undefined;

    const handler = (event) => {
      const commands = Array.isArray(event.commands) ? event.commands : [];
      const incomingBallId = String(event.ball_id ?? '');

      if (commands.length === 0) {
        // Cancel signal: clear only if ball_id matches the active flash.
        if (
          incomingBallId !== '' &&
          String(currentBallIdRef.current ?? '') === incomingBallId
        ) {
          currentBallIdRef.current = null;
          setQueue([]); // timer effect will clean up via its cleanup fn
        }
        return;
      }

      // New flash: replace any in-flight queue (timer cleans up automatically).
      currentBallIdRef.current = event.ball_id ?? null;
      const items = commands.map((key) => ({
        commandKey: key,
        context: event.context ?? null,
        contextHash: event.context_hash ?? null,
      }));
      setQueue(items);
    };

    // echo.channel() returns the cached channel instance — same object used by
    // useGraphicChannel. stopListening removes only this handler without
    // affecting the channel subscription or other listeners.
    echo.channel(`match.${matchId}.graphics`).listen('.match.graphic.flash', handler);

    return () => {
      echo
        .channel(`match.${matchId}.graphics`)
        .stopListening('.match.graphic.flash', handler);
      // Do NOT call echo.leave() here — useGraphicChannel owns the lifecycle.
    };
  }, [matchId, echo]);

  return queue.length > 0 ? queue[0] : null;
}
```

**Why `[queue]` as the timer dependency works:**
- `setQueue(items)` on a new flash event → new array reference → effect runs, old timer cancelled, new timer started for `items[0]`
- `setQueue(prev => prev.slice(1))` when timer fires → new array reference → effect runs again; if `[B]` → timer for B; if `[]` → early return, no timer
- `setQueue([])` on cancel → empty array → early return, no timer

**Channel coexistence with `useGraphicChannel`:**  
Both hooks call `echo.channel('match.X.graphics')` which returns the same cached `Channel` instance (Laravel Echo v2.3.4 confirmed). `useGraphicChannel` owns `echo.leave()` on unmount. `useGraphicFlash` uses `stopListening` (removes only its handler) so the channel subscription is not prematurely closed.

### 5.3 `useGraphicChannel.js` — No Changes

`app/src/hooks/useGraphicChannel.js` does not need to be edited. Flash subscription is managed entirely within `useGraphicFlash`.

### 5.4 Edited: `GraphicControllerProvider.jsx`

`app/src/graphics/entry/GraphicControllerProvider.jsx`

Add `useGraphicFlash` import. Derive `activeSnapshot`. Wire into `renderPlan`.

**Add to imports:**

```js
import { useGraphicFlash } from '@/hooks/useGraphicFlash';
```

**Add after the existing `snapshot` useMemo (inside `GraphicControllerProvider`):**

```js
const flashItem = useGraphicFlash(matchId);

/**
 * When a flash is active, build a synthetic snapshot by overriding commandKey
 * and commandType on the real snapshot.
 *
 * Falls back to the real snapshot when no flash is playing.
 *
 * If the session is still loading (snapshot === null), flash is suppressed
 * (cannot build a render plan without match/live context). This is safe in
 * practice: a flash event arrives only after the scorer stores a ball, which
 * requires an active session that the overlay will already have loaded.
 */
const activeSnapshot = useMemo(() => {
  if (!flashItem || !snapshot) return snapshot;
  return {
    ...snapshot,
    commandKey: flashItem.commandKey,
    commandType: 'LOWER_THIRD',
    displayMode: null,
    // contextHash: keep snapshot's hash (context data is the same; SyncJob
    // has updated it by the time the first 3 s timer fires).
  };
}, [snapshot, flashItem]);
```

**Replace the existing `renderPlan` useMemo** (currently uses `snapshot`) to use `activeSnapshot`:

```js
const renderPlan = useMemo(() => {
  if (!activeSnapshot?.commandKey) return null;
  return processGraphicCommand(activeSnapshot);
}, [
  activeSnapshot?.commandId,
  activeSnapshot?.contextHash,
  activeSnapshot?.commandKey,
  activeSnapshot?.commandType,
  activeSnapshot?.themeSlug,
]);
```

No other changes to the component. The `value` useMemo, context provider, debug log effect — all remain unchanged.

---

## 6. Resolver — Complete Ball Coverage

| Ball state | `is_wide` | `is_no_ball` | `is_wicket` | `runsOffBat` | Queue |
|---|---|---|---|---|---|
| Dot | — | — | — | 0 | `[]` |
| 1 / 2 / 3 off bat | — | — | — | 1–3 | `[]` |
| Four off bat | — | — | — | 4 | `[LT_FOUR]` |
| Six off bat | — | — | — | 6 | `[LT_SIX]` |
| Wide | ✓ | — | — | 0 | `[LT_WIDE]` |
| Wide + wicket (run-out / stumped) | ✓ | — | ✓ | 0 | `[LT_WIDE, LT_OUT]` |
| No-ball (no runs / 1–3) | — | ✓ | — | 0–3 | `[LT_NO_BALL]` |
| No-ball + 4 off bat | — | ✓ | — | 4 | `[LT_NO_BALL, LT_FOUR]` |
| No-ball + 6 off bat | — | ✓ | — | 6 | `[LT_NO_BALL, LT_SIX]` |
| No-ball + wicket | — | ✓ | ✓ | — | `[LT_NO_BALL, LT_OUT]` |
| Clean wicket (bowled, caught, etc.) | — | — | ✓ | 0 | `[LT_OUT]` |
| Run-out on a four | — | — | ✓ | 4 | `[LT_OUT]` — no LT_FOUR on wicket delivery |
| Bye / leg-bye | — | — | — | 0 | `[]` (not off bat) |
| No-ball + bye | — | ✓ | — | 0 | `[LT_NO_BALL]` |
| **Retired hurt** | — | — | ✓ | — | `[]` — `isRetiredHurt()` guard fires first |

`InningsStatsService::strikerRunsOffBat($ball)` returns 0 for wide, 0 for bye/leg-bye, and derives correctly from `runs_off_bat`/`runs` for no-ball. It is the authoritative source — do not re-derive in the resolver.

---

## 7. Timing & Context Accuracy

```
scorer taps "store ball"
        │
        ▼
  DB transaction (ball persisted)            ← ScorecardController line 123-129
        │
        ├─ SyncMatchGraphicContextJob::dispatch()   queued (ShouldBeUnique, runs in ms)
        │
        ├─ dispatchScoringFlash()                   inline, synchronous
        │    └─ mergeSessionContext()               reads live DB after ball persist
        │    └─ MatchGraphicFlashDispatched fires   → Reverb → overlay
        │
        └─ MatchStateUpdated::dispatch()            scoring private channel
```

`mergeSessionContext()` runs after the ball is in the DB, so context delivered with the flash event already includes the ball's contribution to the scorecard. `SyncMatchGraphicContextJob` runs concurrently and updates the Redux cache — it will have completed long before the first 3 s timer fires on the overlay, so `snapshot.live` is accurate by the time the queue drains back to Layer 1.

---

## 8. Edge Case Catalogue

| Scenario | Behaviour |
|---|---|
| Rapid consecutive balls | Each `storeBall` replaces the queue (`setQueue(items)` → new reference → previous timer cancelled). |
| Operator activates command during flash | `.activated` patches Redux cache as normal. Flash plays out. On queue empty, overlay shows new operator command. |
| Operator clears graphic (`LT_EMPTY`) mid-flash | Same — `LT_EMPTY` patches cache; flash plays; then overlay shows `LT_EMPTY`. |
| `active_command` is null after flash ends | `renderPlan = null` → transparent overlay (§2.3). |
| Scorer undoes 1 s into `LT_OUT` (3 s flash) | Cancel dispatched. Front-end receives `commands: []`, `ball_id` matches `currentBallIdRef` → `setQueue([])` → timer effect clears, `renderPlan` falls back to Layer 1. |
| Undo when flash already finished | Cancel arrives, `ball_id` does not match current ref (queue already empty) → no-op. |
| `scoring_flash_enabled: false` | `dispatchScoringFlash` returns early. No event fired. |
| No graphic session for this match | Both helpers guard on `instanceof MatchGraphicSession` and return early. |
| Retired hurt wicket | `isRetiredHurt()` guard at top of resolver → `[]`. No flash. |
| NB + boundary: context accuracy | Ball is persisted. `mergeSessionContext()` runs after. Context is accurate for both items. |
| `deleteBall` cancel | `$ballId = $ball->id` captured before `$ball->delete()`. Cancel dispatched with correct id. |
| `deleteLastBall` cancel | `$ball` fetched at line 302 before delete. `$ballId` captured. Cancel dispatched. |
| Match-winning six / wicket | Flash plays normally; `MatchCompletionService` preserves command history, so baseline is intact after flash. |
| OBS reconnect mid-flash | Flash state (JS memory) lost. Overlay shows `active_command` from HTTP session. Acceptable for ephemeral layer. |
| Session still loading when flash arrives | `snapshot === null` → `activeSnapshot === null` → flash suppressed. Rare in practice: scorer cannot be on the scoring app without the session already loaded on OBS. |

---

## 9. File Inventory

### New files

| File | Purpose |
|---|---|
| `api/app/Services/Broadcast/ScoringFlashResolver.php` | Ball → `GraphicCommandKeyEnum[]` resolver |
| `api/app/Events/Broadcast/Graphics/MatchGraphicFlashDispatched.php` | Public broadcast event on `match.{id}.graphics` |
| `app/src/hooks/useGraphicFlash.js` | Flash queue + timers + Reverb listener |

### Edited files

| File | Change |
|---|---|
| `api/app/Http/Controllers/User/ScorecardController.php` | `dispatchScoringFlash()` in `storeBall`; `cancelScoringFlash()` in `deleteBall` + `deleteLastBall`; two new private methods |
| `app/src/graphics/entry/GraphicControllerProvider.jsx` | Import `useGraphicFlash`; add `flashItem` + `activeSnapshot` memos; switch `renderPlan` to use `activeSnapshot` |

**`app/src/hooks/useGraphicChannel.js` — no changes.**  
**`app/src/pages/graphics-controller/GraphicOverlay.jsx` — re-export only, do not touch.**

**Total: 6 files (3 new, 3 edited).**

---

## 10. Test Matrix

### PHPUnit — `ScoringFlashResolverTest`

`api/tests/Unit/Services/Broadcast/ScoringFlashResolverTest.php`

Use a data provider covering each §6 row. Ball attributes can be set directly on a `Ball` model without persisting (resolver only reads model attributes and calls `InningsStatsService::strikerRunsOffBat`, which can be tested with a real or mocked Ball).

```php
// testResolve(array $attrs, array $expectedValues)
// $expectedValues = array of GraphicCommandKeyEnum::value strings

dataset:
  'dot'                 → attrs: []                                      expected: []
  'four off bat'        → attrs: [runs=>4]                               expected: ['LT_FOUR']
  'six off bat'         → attrs: [runs=>6]                               expected: ['LT_SIX']
  'wide'                → attrs: [is_wide=>true, runs=>1]                expected: ['LT_WIDE']
  'wide + wicket'       → attrs: [is_wide=>true, is_wicket=>true, ...]   expected: ['LT_WIDE','LT_OUT']
  'no-ball only'        → attrs: [is_no_ball=>true, runs=>1]             expected: ['LT_NO_BALL']
  'no-ball + 4'         → attrs: [is_no_ball=>true, runs=>5]             expected: ['LT_NO_BALL','LT_FOUR']
  'no-ball + 6'         → attrs: [is_no_ball=>true, runs=>7]             expected: ['LT_NO_BALL','LT_SIX']
  'no-ball + wicket'    → attrs: [is_no_ball=>true, is_wicket=>true,...] expected: ['LT_NO_BALL','LT_OUT']
  'clean wicket'        → attrs: [is_wicket=>true, dismissal=>caught]    expected: ['LT_OUT']
  'run-out on four'     → attrs: [is_wicket=>true, runs=>4, dismissal=>run_out] expected: ['LT_OUT']
  'bye four'            → attrs: [is_bye=>true, runs=>4]                 expected: []
  'no-ball bye'         → attrs: [is_no_ball=>true, is_bye=>true, runs=>5] expected: ['LT_NO_BALL']
  'retired hurt'        → attrs: [is_wicket=>true, dismissal=>retired_hurt] expected: []
```

### JS — `useGraphicFlash`

```
single-item flash:
  - fires '.match.graphic.flash' with commands:['LT_SIX']
  - hook returns { commandKey:'LT_SIX' }
  - advance timers by 3000ms → hook returns null

two-item flash (NB+6):
  - fires with commands:['LT_NO_BALL','LT_SIX']
  - t=0:    returns { commandKey:'LT_NO_BALL' }
  - t=3000: returns { commandKey:'LT_SIX' }
  - t=6000: returns null

cancel matching ball_id:
  - fire flash ball_id:42
  - 1000ms later: fire cancel commands:[] ball_id:42
  - hook returns null immediately

cancel non-matching ball_id:
  - fire flash ball_id:42
  - fire cancel commands:[] ball_id:99
  - hook still returns active item (no-op)

rapid replace:
  - fire flash A (2 items)
  - 1000ms later fire flash B (1 item)
  - hook returns B's first item; A's timer does not fire
  - t=3000 after B: returns null

session not loaded (snapshot null):
  - verified at GraphicControllerProvider level: activeSnapshot===null → renderPlan===null
```

---

## 11. Out of Scope — v1

- FST variants (no scoring-triggered full-screen transitions)
- Fifty / hundred milestone flashes
- Configurable flash duration (`auto_flash_duration_ms` from Claude's original plan — deferred)
- Audit trail of auto-flashes in `match_graphic_commands`
- Backoffice "flash active" indicator
- `updateBall` re-flash (ball edits do not trigger a new flash)
- Per-command-key duration map
