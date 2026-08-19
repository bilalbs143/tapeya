# User-owned live broadcast — scorecard, overlay, and destination

**Status:** Architecture recommendation (not yet implemented)  
**Date:** August 2026  
**Audience:** Product, engineering, broadcast ops  
**Related:** [LIVE_STREAM_YOUTUBE_FINAL.md](./LIVE_STREAM_YOUTUBE_FINAL.md), [GRAPHICS_OVERLAY_ISOLATION_PLAN.md](./GRAPHICS_OVERLAY_ISOLATION_PLAN.md), [LIVE_STREAM_MOBILE_BROADCAST.md](./LIVE_STREAM_MOBILE_BROADCAST.md), [LIVE_STREAM_INDEPENDENT_STREAMS.md](./LIVE_STREAM_INDEPENDENT_STREAMS.md), [LIVE_STREAM_ORIENTATION.md](./LIVE_STREAM_ORIENTATION.md)

---

## 1. What this document decides

Organizers want to **score in Tapeya**, show **Tapeya graphics**, and publish the **composed program** to **their own** Facebook Page, YouTube channel, or another RTMP destination — not onto Tapeya’s official YouTube channel.

Two product paths:

| | Approach 1 — BYO encoder | Approach 2 — In-app encoder |
|---|---|---|
| Camera / mix | OBS, PRISM Live Studio, vMix, Larix, etc. | Tapeya Capacitor app |
| Overlay | Same graphics URL as a browser source | Same graphics engine, composited on device |
| Destination | User’s FB / YouTube / generic RTMP | Same destination layer |
| Who encodes | Their laptop or phone streaming app | Our native plugin |

**Recommendation in one paragraph:** Keep the **graphics overlay as a Chromium HTML engine** (already isolated at `graphics.tapeya.com`). Keep **Laravel as the control plane** (scoring, graphic commands, OAuth, ingest secrets). Do **not** composite camera + overlay on a backend media server in v1. Ship **Approach 1 first** (overlay URL + user-owned destinations). Ship **Approach 2** on the **same overlay engine and same destination API**. Render overlay **on the encoder device** (OBS Chromium or in-app WebView), never by FFmpeg on our servers, unless we later add optional cloud restream.

---

## 2. How this differs from what we already ship

Today (locked in [LIVE_STREAM_YOUTUBE_FINAL.md](./LIVE_STREAM_YOUTUBE_FINAL.md) and [LIVE_STREAM_MOBILE_BROADCAST.md](./LIVE_STREAM_MOBILE_BROADCAST.md)):

| Piece | Current | This feature |
|---|---|---|
| Ingest owner | Tapeya’s YouTube channel (platform OAuth) | **User’s** YouTube / Facebook Page / BYO RTMP |
| Overlay | Signed `graphics.tapeya.com` URL in OBS/vMix browser source | **Reuse unchanged** |
| Scoring | App → API → Reverb `match.{id}.scoring` | Unchanged |
| Graphic commands | Backoffice Match Controller → Reverb `match.{id}.graphics` | Unchanged |
| App “Go Live” (planned) | Phone camera → RTMP → **Tapeya** YouTube (unlisted) | Phone camera → RTMP → **user destination** |
| Tapeya hub playback | YouTube iframe / `streaming_url` | Embed **their** live video (or optional restream later) |

Video and game data stay separate: **YouTube/Facebook carry pixels; Reverb carries scores and graphics state.** That principle does not change.

---

## 3. Shared architecture (both approaches)

```
                    ┌─────────────────────────────────────────┐
                    │  CONTROL PLANE (Laravel + Reverb)        │
                    │  balls, graphic commands, live_streams,  │
                    │  destination OAuth, encrypted ingest key │
                    └───────────┬───────────────┬──────────────┘
                                │               │
              scoring / graphics│               │ ingest URL + key
                                ▼               ▼
┌───────────────────────────────┴───┐   ┌───────┴──────────────────────────┐
│  OVERLAY ENGINE (one artifact)     │   │  DESTINATION PROVIDERS            │
│  graphics.tapeya.com signed URL    │   │  YouTube (user OAuth)             │
│  same bundle OBS already loads     │   │  Facebook Page Live               │
│  Reverb match.{id}.graphics        │   │  Generic RTMP(S)                  │
└───────────────┬────────────────────┘   └───────────────┬──────────────────┘
                │                                        │
     ┌──────────┴──────────┐                  RTMP(S)    │
     ▼                     ▼                             ▼
┌─────────────┐     ┌──────────────┐            ┌─────────────────┐
│ Approach 1  │     │ Approach 2   │            │ User’s channel  │
│ OBS / PRISM │     │ Native mix   │───────────►│ / Page / custom │
│ Browser src │     │ camera+HTML  │            └────────┬────────┘
│ + camera    │─────┘                                    │
└─────────────┘                                          │ public watch URL
                                                         ▼
                                              Tapeya hub embed (optional)
```

### 3.1 One overlay engine

The overlay is already the right product:

- Isolated Vite graphics build, Chrome 86 floor, no consumer-app JS ([GRAPHICS_OVERLAY_ISOLATION_PLAN.md](./GRAPHICS_OVERLAY_ISOLATION_PLAN.md)).
- Session-scoped signed URL: `https://graphics.tapeya.com/{sessionId}-{expires}-{signature}`.
- Transparent background, 1920×1080 (or 1080×1920) browser source.
- Live updates via Reverb — **not** baked into the video file.

**Both approaches load that same URL.** Approach 1: OBS/PRISM/vMix Browser Source. Approach 2: an offscreen or overlay `WKWebView` / Android `WebView` using the **same URL and the same command pipeline**. Do not fork a “mobile graphics” React tree.

Scorecard for **fans inside Tapeya** (in-player React chrome) stays a separate UI. Broadcast graphics are the overlay engine. Do not merge those two surfaces.

### 3.2 One destination layer (new)

Add a provider family **orthogonal** to today’s `YouTubeStreamProvider` (Tapeya channel):

| Destination | Creates the live object | Returns to encoder |
|---|---|---|
| **YouTube (user)** | `liveBroadcasts` + `liveStreams` on **their** channel | RTMP URL + stream key |
| **Facebook Page** | `POST /{page-id}/live_videos` | RTMPS URL + key |
| **Custom RTMP** | Nothing — user pastes key from Studio / Live Producer / restream.io | As entered |

Store on `live_streams` (or a child `live_stream_destinations` table if we later allow multi-output):

- `destination_type`: `youtube_user` | `facebook_page` | `custom_rtmp`
- `destination_account_id` (YouTube channel id / Facebook page id)
- `ingest_rtmp_url` + `stream_key_encrypted` (never sent to fan clients)
- `playback` / `embed_url` / `watch_url` for Tapeya hub and “copy link”

`StreamProviderContract` already exists so a **user-OAuth YouTube** class and a **Facebook Page** class can sit beside the platform YouTube provider without rewriting controllers.

### 3.3 Where pixels are composed

| Option | Verdict |
|---|---|
| **Encoder-side (OBS or phone GPU)** | **Default.** Lowest latency, no extra CDN bill, overlay stays HTML. |
| **Backend FFmpeg / media server mix** | **Not for v1.** Doubles uplink (camera to us, then us to FB/YT), adds 2–8s, needs GPU workers, overlay must be rasterized from HTML anyway. |
| **Hybrid restream** | **Later, optional.** User sends **one** RTMP to us; we fan-out to FB + YT. Overlay still composed **before** that single ingest (Approach 1 or 2). |

Cricket graphics (95 commands, themes, flash queues) are a **DOM + WebSocket** problem. Chromium in OBS or a WebView is the scalable renderer. A media server should only **transport** already-composited H.264, never try to redraw scorebugs.

---

## 4. Approach 1 — Tapeya scorecard/overlay + their streaming app

This is how professional cricket already works with us. The gap is **destination ownership**.

### 4.1 User flow

1. Create or open a match in Tapeya; scoring starts as today.
2. Backoffice (or organizer) opens **Broadcast → Overlay URL** (existing signed graphics URL). Copy into OBS/PRISM/vMix as **Browser Source** (transparent, 1080p or 720p).
3. Their app captures camera(s), mixes overlay, encodes.
4. They publish to a destination:
   - **A. Paste key** — YouTube Studio / Facebook Live Producer / restream.io shows RTMP URL + key; they paste into OBS. Tapeya stores the **public watch URL** so the app hub can embed it.
   - **B. Connect account (recommended UX)** — Tapeya OAuth → we create the live video on **their** Page/channel → we show RTMP URL + key **once** (or a “Open in OBS” deep link). They never leave Tapeya to hunt Studio settings.
5. Overlay updates live as balls and graphic commands fire. Their encoder does not need to poll Tapeya.

### 4.2 Integration with OBS / PRISM / vMix

| App | Overlay | Camera | Output |
|---|---|---|---|
| **OBS Studio** (desktop) | Browser Source → graphics URL | Device / NDI / capture card | One or more RTMP services |
| **vMix** | Browser Input (already our production path) | SDI / NDI | RTMP + optional recording |
| **PRISM Live Studio** (mobile/desktop) | Browser overlay / image overlay if browser source is limited on mobile | Phone camera | Facebook / YouTube / custom RTMP |
| **Larix Broadcaster** | Limited HTML overlay; often used as **camera-only** contrib into OBS | Phone as bonded contrib | RTMP |

**PRISM / mobile third-party caveat:** Mobile streaming apps are uneven at full Chromium browser sources. Product copy should say:

- **Desktop OBS/vMix:** first-class overlay (browser source).
- **Phone third-party apps:** overlay works if the app supports a **transparent web overlay URL**; otherwise use Approach 2 or a two-device setup (phone camera via Larix/NDI into a laptop OBS that loads our overlay).

Do not promise pixel-perfect Tapeya themes inside every third-party mobile app.

### 4.3 How the final stream reaches their Page / channel

**They** send the composed RTMP. Facebook and YouTube never pull from Tapeya.

```
OBS (camera + our overlay)
    --RTMPS-->  facebook ingest  →  their Page live video
    --RTMP--->  youtube ingest   →  their channel live
```

Tapeya’s job after go-live:

- Poll or webhook destination status (`LIVE` / `ENDED`) into `live_streams.status` (same `streams:sync` pattern).
- Persist `embed_url` / watch URL for `LiveStreamResource` so `/live` can show **their** stream.
- Never put stream keys in fan APIs (existing rule).

### 4.4 Why Approach 1 ships first

- Overlay URL is **already production**.
- Zero new encoder code.
- Covers clubs that already own OBS/vMix (our real cricket customers).
- Destination OAuth is shared with Approach 2 — build it once.

---

## 5. Approach 2 — Tapeya app captures, composites, and publishes

Goal: one phone, no OBS. Camera + overlay → H.264/AAC → RTMP(S) to the **same destinations**.

### 5.1 Capture

Reuse the locked native stack from [LIVE_STREAM_MOBILE_BROADCAST.md](./LIVE_STREAM_MOBILE_BROADCAST.md):

| | iOS | Android |
|---|---|---|
| Camera / mic | `AVCaptureSession` | Camera2 |
| Encode | VideoToolbox H.264 via **HaishinKit** | MediaCodec via **RootEncoder** |
| Publish | HaishinKit RTMP | RootEncoder RTMP |

Do not introduce Agora/Mux/IVS for v1. Destination is RTMP; those SDKs optimize for **their** ingest, not Facebook/YouTube keys.

### 5.2 Real-time composite (recommended)

**On-device GPU mix, overlay still HTML:**

1. Load the **same signed graphics URL** in a transparent WebView (1080×1920 or 1920×1080 per [LIVE_STREAM_ORIENTATION.md](./LIVE_STREAM_ORIENTATION.md)).
2. Camera frames stay on a GL/Metal texture.
3. Each encode tick: draw camera → draw overlay texture (WebView snapshot or shared compositor) → encode.

Practical implementation notes:

- **Preview** can be a simple stack: `CameraPreview` + transparent `WebView` (what the host sees).
- **Program** (what goes on RTMP) must be an explicit mixer. Do **not** rely on ReplayKit / MediaProjection of the whole app UI — it captures chrome, is brittle on iOS, and tanks battery.
- Cap overlay refresh to encode FPS (25/30). Graphics are sparse (scorebug, wicket full-frame); we do not need 60 fps HTML.
- If WebView snapshot is too heavy on low-end Androids: **fallback program** = camera-only RTMP + tell the user overlay is “preview only” — not acceptable as the default, but a kill-switch for thermal throttling.

**Do not** upload camera to Laravel for overlay burn-in. Venue 4G cannot sustain camera uplink **plus** a second composed downlink.

### 5.3 Encode and publish

- Portrait 9:16 and landscape 16:9 as already specified.
- Video: H.264, AAC 48 kHz stereo or mono.
- Default targets (tunable): **720p 30 fps ~2.5–4 Mbps** portrait; **720p/1080p ~3.5–6 Mbps** landscape. Prefer 720p on cellular.
- RTMPS for Facebook (required); RTMP or RTMPS for YouTube.
- Reconnect with the **same** stream key (YouTube/Facebook tolerate encoder reconnect).
- End: stop encoder → `LiveStreamService::end()` analogue for **user** destination (complete live video via Graph / YouTube API).

Ingest credentials stay on-device only for the session (Keychain/EncryptedSharedPreferences), fetched from API at start, never logged.

### 5.4 Latency, quality, bandwidth

| Path | Typical glass-to-glass | Notes |
|---|---|---|
| Approach 1 → YouTube | 10–25 s | YouTube transcode; overlay latency is Reverb (~sub-second to OBS) |
| Approach 1 → Facebook | 5–15 s | Often snappier than YouTube |
| Approach 2 → same destinations | Same as above **plus** 0.2–0.8 s device mix | Dominated by FB/YT, not our mixer |
| Backend composite + restream | +2–8 s and 2× uplink | Avoid for live cricket unless multi-destination SaaS |

Scoring UX stays instant in the Tapeya app (Reverb). Viewers on Facebook/YouTube will always see **delayed** video vs the scorer’s phone — set expectations in the Go Live UI (“viewers see YouTube delay”).

---

## 6. Should we support both from day one?

**Product: yes. Engineering: sequenced, shared spine.**

| Phase | Ship | Why |
|---|---|---|
| **P0** | Approach 1 + **custom RTMP paste** + overlay URL copy | Works this week with existing graphics; covers OBS/vMix clubs |
| **P1** | **YouTube user OAuth** + **Facebook Page OAuth** destination providers | Same for OBS keys *and* in-app publish; one OAuth UX |
| **P2** | Approach 2 native mix → P1 destinations | Hard part; overlay and destinations already stable |
| **P3** | Optional cloud restream (one ingest, FB+YT) | Cost center; only if users demand dual-post |

Shipping Approach 2 before P1 would still dump video onto **Tapeya’s** channel (current Go Live design) — that is a different product (in-app discovery) and **not** “their Page / their channel.”

---

## 7. Authentication and permissions

Secrets live in Laravel (Spatie settings for **app** credentials; per-user tokens encrypted). Fan APIs never see refresh tokens or stream keys.

### 7.1 YouTube (user’s channel)

- Google OAuth **on the user**, scopes: `https://www.googleapis.com/auth/youtube` (or `youtube.force-ssl`).
- APIs: `liveBroadcasts.insert`, `liveStreams.insert`, `liveBroadcasts.bind`, `liveBroadcasts.transition` (`testing` → `live` → `complete`).
- Channel must have **live streaming enabled** (Google often requires 24h after first enable).
- Unlisted vs public is **their** choice; default **unlisted** until they opt into public.
- Quota: live create is expensive; reuse `YouTubeQuotaTracker` patterns, keyed per user.
- Store refresh token per user; create a **new** broadcast per Tapeya `live_streams` row.

This is **not** the existing platform `youtube:authorize` CLI token.

### 7.2 Facebook Pages

- Facebook Login with **Page** publishing (not only user timeline). Typical permissions (subject to App Review): `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `publish_video`, `pages_read_user_content` as Graph requires at review time.
- After login: list Pages the user manages → user picks **one Page**.
- Exchange for **Page access token** (long-lived).
- `POST /{page-id}/live_videos` with title/description → response includes `secure_stream_url` (RTMPS) and `id`.
- End: `POST /{live-video-id}?end_live_video=true` (confirm current Graph field names at implement time).
- **User profiles** (non-Page) live video is restricted; **Pages are the product**. Groups/Events can be a later destination type.
- Business verification + App Review is on the critical path — start review in P0 while P1 is coded.

### 7.3 Custom RTMP

- Fields: URL (`rtmp://` / `rtmps://`) + stream key.
- Validate HTTPS-not-required (RTMP is not HTTP); refuse credentials in query logs.
- User is responsible for that platform’s ToS (Twitch, restream.io, custom nginx).

### 7.4 Tapeya hub playback

If we have an embeddable watch URL:

- YouTube: existing iframe `playback.mode = iframe`.
- Facebook: plugin / embed URL (`playback.mode = iframe`) — already contemplated as “other HTTPS” in independent-streams playback.
- Custom RTMP-only destinations may have **no** public playback; hub card can deep-link out or hide “Watch”.

---

## 8. Data model (additive)

Keep `live_streams` as the broadcast row (`match_id` nullable, `owner_user_id` for self-serve). Add destination fields or a 1:N destinations table:

```
live_streams
  destination_type
  destination_external_id      -- yt video id / fb live video id
  destination_account_id       -- channel or page
  watch_url / embed_url
  ingest_* (existing encrypted columns)

user_broadcast_accounts
  user_id
  provider                     -- youtube | facebook
  provider_user_id
  refresh_token_encrypted
  pages/channels cache json
```

Do not reuse `StreamingSettings` platform YouTube OAuth for user destinations.

Graphic sessions stay on **match** (`match_graphic_sessions`). Approach 2 still requires a match (or a future standalone graphic session) so the overlay URL has a session id. If we allow overlay on standalone non-match streams later, that is a separate graphics-session change — out of scope for v1 of **destination**, not overlay.

---

## 9. Reliability and ops

| Risk | Mitigation |
|---|---|
| User channel cannot go live | Preflight API: YouTube live enabled; Facebook Page token valid; show a blocking error before opening camera |
| Overlay blank in OBS | Existing isolation plan; signed URL expiry refresh in UI |
| Phone thermal / bitrate drop | Adaptive bitrate in plugin; overlay snapshot skip under load |
| ToS on **their** channel | Their problem legally; we still need community guidelines in-app and a kill switch to stop **our** encoder |
| Dual-write status (YT vs our DB) | Keep `streams:sync` but call **user** provider with **user** token |
| Key leak | Same as today: ingest only on owner `show` of Go Live / OBS setup; rotate by creating a new live object |

Supervisor / cron: extend `posts:process-auto-engagement`-style isolation — **do not** mix user-OAuth YouTube calls into the platform channel quota pool without labeling.

---

## 10. Recommended technology summary

| Layer | Choice |
|---|---|
| Overlay | Existing graphics artifact + Reverb (device Chromium) |
| Scoring | Existing ball API + Reverb |
| Destinations | New providers: user YouTube, Facebook Page, custom RTMP |
| Approach 1 encoder | Customer OBS / vMix / PRISM |
| Approach 2 encoder | HaishinKit + RootEncoder + WebView overlay mix |
| Media server | None in v1; optional restream later (Cloudflare / nginx-rtmp / Mux) |
| App / backoffice | Copy overlay URL; destination connect UI; never expose keys to fans |

---

## 11. UX sketch (shared)

1. **Where should this go live?** YouTube (connect) · Facebook Page (connect) · I have my own stream key.
2. **How are you sending video?** “OBS / vMix / PRISM” → show overlay URL + ingest. “This phone” → camera UI (Approach 2, P2).
3. **Overlay** always: open/copy graphics URL + “Keep this Browser Source on top, 1080p, transparent.”
4. After live: share watch link; optional “Show on Tapeya Live hub.”

---

## 12. What we explicitly will not do in v1

- Server-side FFmpeg overlay burn-in.
- Streaming to Tapeya’s YouTube channel **as a substitute** for user-owned destinations (keep that as the separate official/self-serve hub product).
- Facebook **profile** (non-Page) Live as a supported target.
- Promising full overlay inside every third-party **mobile** streaming app.
- Multi-destination fan-out without a dedicated restream budget.

---

## 13. Definition of done (feature)

- [ ] Custom RTMP destination + overlay URL copy works with OBS against a real YouTube Studio key and a real Facebook Live Producer key.
- [ ] User YouTube OAuth creates a broadcast on **their** channel; OBS and (later) in-app plugin both use that ingest.
- [ ] Facebook Page OAuth + Page picker; RTMPS publish; live ends via Graph.
- [ ] Fan `GET` playback never includes ingest URL or stream key.
- [ ] Overlay is the **same** signed graphics URL in OBS and in the in-app WebView.
- [ ] Approach 2: camera + overlay visible on RTMP VOD (not preview-only), 720p cellular default, reconnect documented.
- [ ] App Review submitted for Facebook Page live permissions before P1 production.

---

## 14. Bottom line

**Best technical approach:** one **HTML overlay engine** (already built), one **user-owned destination layer** (new), two **encoders** (theirs then ours). Compose on the **device that already has the camera**. Use the **backend** only for scores, graphic commands, OAuth, and secrets. Support **both approaches** as one product with a **P0 → P1 → P2** sequence so we do not rebuild graphics twice and we do not block clubs who already stream from OBS.
