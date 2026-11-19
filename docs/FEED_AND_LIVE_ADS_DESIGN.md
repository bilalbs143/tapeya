# In-Feed + Live Stream Ad System — Design

**Status:** design locked; API + backoffice implemented; client in-feed ads implemented (live watch client still pending)  
**Audience:** product + API + app + backoffice  
**Creative formats in scope:** **image poster** and **video**  
**Related:**
- [`SPONSORED_BRAND_POSTS.md`](./SPONSORED_BRAND_POSTS.md) — locked in-feed campaign plan (Home + Reels)
- [`SOCIAL_FEED_ARCHITECTURE.md`](./SOCIAL_FEED_ARCHITECTURE.md) §6.7
- [`LIVE_STREAM_INDEPENDENT_STREAMS.md`](./LIVE_STREAM_INDEPENDENT_STREAMS.md)
- [`LIVE_STREAM_MOBILE_BROADCAST.md`](./LIVE_STREAM_MOBILE_BROADCAST.md)
- [`SPONSOR_PITCH_DECK_GUIDE.md`](./SPONSOR_PITCH_DECK_GUIDE.md) — inventory sold to brands
- [`GRAPHICS_OVERLAY_ISOLATION_PLAN.md`](./GRAPHICS_OVERLAY_ISOLATION_PLAN.md) — match overlay pipeline

This doc answers: **how Tapeya places paid creatives** in **feed** (simple / automatic) and **live watch** (ops-driven / situational) — grounded in posts spine, YouTube/HLS playback, Reverb, and graphics overlays.

---

## 1. Goal — two different products under one brand catalog

| Surface family | Product surfaces | Control model |
|----------------|------------------|---------------|
| **In-feed** | Home mixed feed, Reels | **Automatic** — campaign eligibility + density injector |
| **Live** | Watch / Go Live viewer | **Manual take** — ops picks creative + stream(s), presses Go / Stop based on the match situation |

Shared principles:

1. Campaign + creative tables own the **catalog** — not a lone `is_sponsored` flag.
2. Simple **Sponsored** label on every paid creative (no “Why am I seeing this?” sheet).
3. Metrics only in `ad_events` (never inflate organic `views_count` / Trending).
4. Global kill switch `ads_enabled`.
5. Phase 1 = authenticated users only for measurable delivery.
6. Feed: no hide-ad / frequency caps / suppressions — density + flight windows are enough.
7. Live: **no auto-scheduler as the product** — humans decide when an ad is on air.

**Feed stays simple. Live is a control-room problem.** Same creatives; different decision engines.

---

## 2. What we mirror (and what we deliberately don’t)

### 2.1 In-feed — keep simple

| Facebook | Tapeya | Verdict |
|----------|--------|---------|
| Native sponsored image / video in Feed & Reels | Inject into `GET /feed` + `GET /reels/feed` via `posts` + `distribution=sponsored_only` | **Yes** — see [`SPONSORED_BRAND_POSTS.md`](./SPONSORED_BRAND_POSTS.md) |
| CTA | `cta_label` + `cta_url` / deep_link | **Yes** |
| “Sponsored” label | Plain label next to brand name | **Yes** |
| Why this ad / Hide / frequency caps | — | **Out of scope** |
| Auction / self-serve Ads Manager | — | **Out of scope** — ops-run campaigns |

Creative body = existing post media pipeline. No parallel ad CDN.

### 2.2 Live — ops take board, not Facebook auto-inventory

Facebook Live mixes join interstitials, L-banners, timed mid-rolls, host breaks, end cards. **Our primary live product is not “eligible campaigns auto-attach to every stream.”** It is:

> Ops (or a trusted host desk) watches the situation → chooses an approved creative → chooses one or more live streams → presses **Make live** → viewers see it → presses **End take** (or it ends with the creative / stream).

| Capability | On Tapeya? | Notes |
|------------|------------|-------|
| **Manual take: overlay / L-banner** | **Yes — core** | Corner/strip companion over viewer chrome while stream stays live |
| **Manual take: break / mid-roll video** | **Yes — core** | Client-side ad wall; does **not** splice YouTube RTMP |
| **Multi-stream same take** | **Yes** | One action → N selected streams (e.g. all cameras on a match) |
| **Late joiner sees current take** | **Yes** | Stream bootstrap returns *active take*, not a campaign lottery |
| **Manual terminate** | **Yes — core** | Instant clear for all viewers on those streams |
| Auto join interstitial every open | Optional later | Not Phase 1 live product |
| Timer every N minutes mid-roll | **Not the product** | Situation-based human trigger instead |
| True SSAI into YouTube encode | **No** | Needs first-party HLS; deferred |
| YouTube’s own iframe ads | **Avoid** | Wrong brand, breaks chrome |

**Hard constraint (locked):** Live ingest is **YouTube RTMP → YouTube playback**. We never burn ads into the encode in v1. All live ads are a **client UI layer** (plus optional match **graphics** logo slots as parallel inventory).

---

## 3. Creative types (shared catalog)

One creative schema; **surface decides render**. Feed and live can reuse the same approved creative.

| `creative_format` | Assets | Feed | Live take modes |
|-------------------|--------|------|-----------------|
| `image` | 1 image | Native post card | Overlay (break = hold image) |
| `video` | 1 video (+ poster) | Native video / Reel | Break mid-roll; overlay may use poster only |

Specs (ops checklist) — same spirit as feed plan: feed ratios match organic cards; live overlay safe margins; break video short (≈6–30s). CTA Phase 1: `url` | `deep_link` only.

Live creatives prefer the same `ad_creatives.post_id` spine so feed + live share assets and admin compose-as-brand.

---

## 4. Architecture split

```
┌──────────────────────────────────────────────────────────────┐
│                     Brand catalog (shared)                   │
│   brand_partners → ad_campaigns → ad_creatives → posts       │
└───────────────────────────┬──────────────────────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          ▼                                   ▼
┌─────────────────────┐             ┌─────────────────────────┐
│  FEED (automatic)   │             │  LIVE (manual takes)    │
│  AdDecision /       │             │  LiveAdTake board       │
│  PostFeed injector  │             │  start / stop / fan-out │
│  density + targeting│             │  stream-scoped state    │
└─────────┬───────────┘             └────────────┬────────────┘
          │                                      │
          ▼                                      ▼
   Home / Reels cards                    Watch / Go Live chrome
          │                                      │
          └──────────► POST /ads/events ◄────────┘
```

| Concern | Feed | Live |
|---------|------|------|
| Who decides *when* | Algorithm + density | **Human** (ops desk / allowlisted host) |
| Who decides *what* | Eligible campaign priority | **Human** picks creative from approved catalog |
| Who decides *where* | All matching users’ feeds | **Human** picks stream(s) |
| State store | Stateless per request (+ optional cache) | **Active take(s)** per stream (durable + realtime) |
| Realtime | Not required | **Required** — Reverb (or equivalent) to all viewers |
| Terminate | N/A (scroll past) | **First-class Stop** |

Campaigns still matter for live (brand, flight window, approval, reporting rollup) — but they do **not** auto-fire onto streams. The **take** is the live delivery unit.

---

## 5. Live domain: the Take

Think of a take like a graphics “on air” cue — not like a feed injection.

### 5.1 Conceptual model

```
LiveAdTake
  id
  creative_id          → approved ad_creatives (+ post media)
  campaign_id          → denormalized for reporting
  mode                 → overlay | break
  presentation hints   → position, skip policy, etc. (light)
  stream_ids[]         → one or many live_streams / match streams
  status               → draft | live | ended | cancelled
  started_by / ended_by
  started_at / ended_at
  optional note        → “halftime Pepsi”, ops context
```

**Invariants (architecture-level):**

1. At most **one live take per stream** at a time (or one per mode family — product lock later; default: one active take total).
2. Starting a take on a stream that already has one either **rejects** or **replaces** (product lock; recommend **replace with explicit confirm**).
3. Ending a take is idempotent and fan-outs `ended` to all subscribers.
4. Stream end (YouTube/status → ended) **auto-ends** any active take on that stream.
5. Global `ads_enabled=false` or per-stream “ads allowed=false” blocks **start**; if already live, prefer **force end**.

### 5.2 Control plane (ops / host)

Primary UX is a **Live takes console** (backoffice; later optional host strip):

1. Filter **live streams** (match, title, status=live).
2. Pick **approved creative** (image/video preview).
3. Pick **mode** (overlay vs break).
4. Select stream(s) — single or multi.
5. **Make live** → persist take → broadcast to those stream channels.
6. Console shows **On air** rows with elapsed time → **End take**.
7. Panic: **End all takes** (global or per match).

Situation examples (why manual wins):

- Wicket → quick Pepsi overlay for 20s → End  
- Innings break → break video mid-roll → End on complete or manual  
- Wrong creative → End immediately, start another  
- Sponsor only wants *this* derby stream, not every Go Live

### 5.3 Viewer plane

```
                    ┌──────────────────┐
                    │ Live takes API   │
                    │ start / stop     │
                    └────────┬─────────┘
                             │ persist + authorize
                             ▼
                    ┌──────────────────┐
                    │ Reverb channel   │
                    │ live-stream.{id} │  (or .ads subchannel)
                    │ take.started     │
                    │ take.ended       │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   Watcher A            Watcher B           Late joiner
   (event)              (event)             GET stream → active_take
```

- **Already watching:** react to `take.started` / `take.ended`.
- **Joins mid-take:** stream show/bootstrap includes `active_take` (or null) so they sync without waiting for the next event.
- **Reconnect:** same — trust server active take, not only last client event.

Player owns **live A/V**. Take layer owns **UI creative**. Never mutate the YouTube encode.

### 5.4 Presentation modes (UX intent, not pixel specs)

| Mode | Intent | Viewer behaviour |
|------|--------|------------------|
| `overlay` | Companion while live continues | L-banner / corner; Sponsored + CTA; optional local dismiss for *that viewer only* (does not end the take for others) |
| `break` | Attention interrupt | Dim/hold live chrome → play creative → return to live (“rejoin in progress” honesty) |

Ops chooses mode **per take**, not as a campaign auto-surface lottery.

### 5.5 Who may press the button

| Actor | Role |
|-------|------|
| Backoffice ops | Primary — multi-stream, all matches |
| Allowlisted host / producer | Optional later — break on *their* stream only |
| Brand partner | **No** direct on-air control in v1 (catalog + reports only) |

AuthZ is take-start/stop scoped; creatives must already be **approved** and campaign **servable**.

### 5.6 What we will not do in Live v1

- Auto-attach every active live campaign to every stream on open.
- Timer-based mid-rolls as the default product.
- Burn-in / SSAI into YouTube.
- Auction per stream minute.
- Viewer “Hide ad” that mutates global take state.
- Parallel competing takes from multiple brands on one stream without ops replacing.

### 5.7 Parallel inventory (not the take board)

Match **graphics logo slots** (“brought to you by”) stay in the graphics/OBS theme pipeline. Link to campaigns later if reporting needs it. Same brand story; different control surface.

---

## 6. In-feed system (summary — unchanged simplicity)

Full locked design: [`SPONSORED_BRAND_POSTS.md`](./SPONSORED_BRAND_POSTS.md).

| Item | Decision |
|------|----------|
| Creative | Real post, `distribution=sponsored_only` |
| Inject | After organic page; cursor organic-only |
| Density | `slot_every_n`, `max_ads_per_response`, … |
| Metrics | `/ads/events` only |
| Never | Trending injection; dual-write `views_count` |

Image + video in Feed Phase 1. No live-take machinery on feed.

---

## 7. Metrics (shared dictionary, different grain)

Same event types as feed where they apply; live tags **take_id** + stream + mode.

| Event | Meaning on live |
|-------|-----------------|
| `impression` / `view` / `click` | Same visibility / dwell / CTA rules as feed, applied to take chrome |
| `complete` | Break video finished |
| `skip` | Viewer skipped break (if allowed) |
| `dismiss` | Viewer closed *local* overlay (take may still be live for others) |

Ops also needs **take-level** reporting: started_at, ended_at, duration on air, streams covered, unique viewers exposed — not only raw pixel events. Feed dashboards stay campaign/creative; live adds a **takes** lens.

---

## 8. Client touchpoints (directional)

| Area | Role |
|------|------|
| Feed / Reels | Sponsored envelope only ([`SPONSORED_BRAND_POSTS.md`](./SPONSORED_BRAND_POSTS.md)) |
| Watch / Go Live viewer | Subscribe to take channel; render overlay/break/end from `active_take` + events |
| iOS YouTube native overlay | Take chrome in **React layer** above Cap player; respect LIVE / Exit safe zones |
| Events | Shared `/ads/events` + take_id |
| Feature flags | `ads_enabled`; per-stream ads allowed |

No client-side “every 10 min fire mid-roll” scheduler as product behaviour.

---

## 9. Admin / backoffice (directional)

Two modules, one catalog:

1. **Ads catalog** (already planned): partners → campaigns → creatives → approve — shared with feed.
2. **Live takes board** (new live product): live streams list → pick creative → mode → Make live / End take → on-air monitor.

Preview: phone frame mock for overlay vs break. Stats: feed surfaces vs live takes breakdown.

Compose-as-brand still creates the underlying post used by feed injection **and** live takes.

---

## 10. Phased delivery (architecture phases)

### Feed Phase 1

Ship [`SPONSORED_BRAND_POSTS.md`](./SPONSORED_BRAND_POSTS.md) — automatic Home + Reels.

### Live Phase 1 — Manual take board

- Durable take model + start/stop API  
- Reverb fan-out + bootstrap `active_take`  
- Modes: **overlay** + **break** (image and/or video)  
- Multi-stream select  
- Manual terminate + stream-end auto-end  
- Events + take-level ops view  
- **Success:** During a live match, ops starts a Pepsi overlay on the watch stream; all viewers see it; ops ends it; dashboard shows take duration + impressions/clicks.

### Live Phase 2 — Desk power

- Host/producer break button (scoped)  
- Multi-match blast presets (“all live match streams”)  
- Stronger on-air monitor (who’s watching, force-end all)

### Live Phase 3 — Partner / richer

- Partner read-only “minutes on air”  
- Pinned sponsored chat as a take mode  
- Shop CTA  

### Phase 4 — Only if product needs true stitch

- First-party live HLS + SSAI  
- Until then, client take layer remains the live ad product  

---

## 11. Capability matrix

| Ask | Feed | Live |
|-----|------|------|
| Image / video creatives | **Yes** | **Yes** |
| Automatic placement | **Yes** | **No** (manual takes) |
| Ops pick creative + stream + Go/Stop | **n/a** | **Yes — core** |
| Situation-based timing | **n/a** | **Yes** |
| Sponsored label + CTA + measurement | **Yes** | **Yes** |
| Late joiner sync | **n/a** | **active_take** |
| SSAI / burn-in on YouTube path | **n/a** | **No** |
| Match graphics logo | **n/a** | Parallel (graphics pipeline) |
| Self-serve brand auction | **No** | **No** |

---

## 12. Relation to existing docs

| Doc | Relationship |
|-----|----------------|
| `SPONSORED_BRAND_POSTS.md` | **Source of truth** for feed schema, injector, metrics, admin catalog MVP. This doc does **not** replace it. |
| `SPONSORED_BRAND_POSTS.md` §17 live mid-roll note | **Superseded for planning** — live delivery is the **take board** here; feed doc stays feed-only. |
| Live stream / Reverb docs | Takes ride the same realtime philosophy as status + graphics: server owns truth, clients subscribe. |
| Graphics overlay docs | Logo slots remain separate inventory; optional campaign link later. |
| Pitch deck | Live branding sold as situational on-air presence, not “guaranteed every N minutes.” |

---

## 13. Open product decisions (lock before Live Phase 1 build)

1. **Replace vs reject** when starting a take on a stream that already has one?  
2. **Viewer dismiss overlay** — local only (recommended) vs request-to-end (no)?  
3. **Break honesty copy** — keep “live continues — rejoin in progress”?  
4. **Host start/stop** in Phase 1 or Phase 2?  
5. **Same creative** on feed + live same day — allowed (metrics split by surface / take)?  
6. **Go Live (UGC) streams** — ops-only takes, host opt-in, or ads off by default?

---

## 14. One-sentence summary

**Feed ads are a simple automatic injector over approved sponsored posts; live ads are an ops take board — pick creative, pick stream(s), Make live / End take over a client UI layer — so on-air presence follows the match situation without needing SSAI or YouTube burn-in.**
