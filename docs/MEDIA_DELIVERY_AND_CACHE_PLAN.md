# Media delivery & cache plan — video + image posts

> **Status:** Final for development  
> **Updated:** 2026-07-28  
> **Related:** [MEDIA_CDN_MIGRATION.md](./MEDIA_CDN_MIGRATION.md) · [SOCIAL_FEED_ARCHITECTURE.md](./SOCIAL_FEED_ARCHITECTURE.md) · [REELS_ARCHITECTURE.md](./REELS_ARCHITECTURE.md)

---

## 0. Access model (product decision)

**No signed / presigned URLs anywhere in the feed.**

| Layer | Policy |
|-------|--------|
| **CDN / B2** | All feed media (video, HLS, posters, images) uses **permanent CDN URLs** (`MediaDisk::url` only). |
| **Visibility** (`public` / `followers` / `private`) | Enforced **only in the API** (list/show/repost). Not via object signatures. |

Trade-off (accepted): anyone who already has the exact CDN URL can fetch the bytes. Discovery and playback UX still go through Laravel visibility checks. UUID paths reduce casual guessing.

### Implementation

- Remove `temporaryUrl()` from `PostPlaybackUrlService` (always `MediaDisk::url`).
- Posts/reels signed-URL settings removed (`reels_signed_urls_*`); permanent CDN only.
- Images already use permanent URLs — no change in style.

### P0 companion: harden API gates

API-only privacy only works if gates are correct. Fix in parallel:

- [x] **Repost leak:** cap repost visibility ≤ original; redact nested `repost_of` media when viewer cannot `findVisible` the original; add tests.  
- [x] Audit explore / following / show / profile for visibility consistency.

---

## 1. Biggest speed problem today

`Reels.jsx` mounts a `ReelItem` (+ hls.js) for **every** loaded reel. `isActive` only pauses — it does not unmount. After scrolling, dozens of players keep buffering (20–40s each). There is also **no** `Hls.Events.ERROR` handling.

Today is not “nothing preloads” — it is **everything mounted loads forever**.  
**Window DOM to prev/current/next before adding prefetch.**

---

## 2. Current baseline

| Area | Reality |
|------|---------|
| Writes | `MediaDisk` ACL-safe |
| Video URLs | Often signed when `MEDIA_DISK=s3` (to remove) |
| Image URLs | Permanent `MediaDisk::url` |
| Transcode | Single 720p + optional single-rung HLS; no ABR ladder |
| Poster | Fast separate queue (keep) |
| Reels DOM | All items mounted; no HLS error UI |
| Images | Little `lazy`; no `srcSet`; CLS risk on image cards |
| `Cache-Control` on objects | Not set |

---

## 3. Design principles

1. Media never proxies through Laravel.  
2. **Permanent CDN URLs only** — no feed signed URLs.  
3. Visibility = API only.  
4. Immutable object keys (UUID / encode id).  
5. `Cache-Control: public, max-age=31536000, immutable` on feed objects.  
6. Window players before prefetch.  
7. Early poster; flip `is_processed` after first ABR rung.  
8. Instrument TTFF / swipe-to-frame / CF HIT %.

---

## 4. Cache layers

```text
L0  Client     windowed players · intentional N+1 prefetch · lazy images · RTK
L1  Cloudflare long HIT on .ts / .m3u8 / images / posters (+ Tiered Cache)
L2  B2         immutable objects + Content-Type + Cache-Control
L3  Redis      optional short-TTL feed JSON later
```

---

## 5. Target flows

### Video (any visibility)

```text
Upload → poster (fast) → permanent CDN poster
      → ABR 360/720 → master.m3u8
      → first rung ready → is_processed = true
      → immutable Cache-Control
API → permanent hls_url / url / poster_url (only if viewer may see post)
React → window ±1 → play → prefetch N+1
```

### Image

```text
Upload → single WebP at original dimensions + width/height
API → permanent urls (only if viewer may see post)
React → lazy img + aspect box (no CLS)
```

---

## 6. Origin + CDN

```text
posts/videos/original|thumbs|progressive|hls/{postId}/{encodeId}/…
posts/images/{postKey}/{uuid}.webp
```

| Header | Value |
|--------|--------|
| `Content-Type` | Correct mime |
| `Cache-Control` | `public, max-age=31536000, immutable` |

Cloudflare: cache rules ~1y; HTTP/3; Tiered Cache; confirm PoPs for **Pakistan / South Asia**. Target **>90% HIT** on hot `.ts`.

---

## 7. Client

| Topic | Spec |
|-------|------|
| Window | Mount prev/current/next only; **destroy** hls.js outside |
| HLS | Buffer ~10–20s; `ERROR` → retry / “Tap to retry” |
| Prefetch | After windowing: N+1 only; Save-Data guard |
| Images | lazy, width/height or aspect-ratio; fix image `PostCard` CLS |
| RTK | No media bytes in Redux |

---

## 8. Encode (v1)

360 / 720. H.264 + AAC. HLS 2–4s.
**Restructure `PostTranscodeService`:** set `processed_path` / `is_processed` after the **first** usable rung; finish ladder in background.

---

## 9. Image encode (v1)

One WebP per upload at the **original pixel dimensions** (no thumb/feed ladder).  
Always store `width`, `height`, `mime`, `size_bytes` on `post_media`.

---

## 10. API shapes (always permanent URLs)

```json
"playback": {
  "type": "hls",
  "hls_url": "https://cdn…/master.m3u8",
  "url": "https://cdn…/_720.mp4",
  "poster_url": "https://cdn…/poster.webp",
  "is_processed": true,
  "duration_ms": 15240,
  "width": 720,
  "height": 1280
}
```

```json
"media": [{
  "id": 12,
  "kind": "image",
  "width": 3024,
  "height": 4032,
  "url": "https://cdn…/{uuid}.webp",
  "sort_order": 0
}]
```

No signature query strings. Do not return the post (or nested original media) if the viewer fails visibility checks.

---

## 11. Instrumentation

Ship with Phase A/B: TTFF, swipe-to-frame, stall ratio, CF HIT analytics, light RUM → analytics/logs.

---

## 12. Phases

### P0 — API visibility hardening (parallel)

- [x] Repost visibility ≤ original + redact nested media + tests.  
- [x] Visibility audit on feed paths.

### Phase A — Permanent CDN + headers

- [x] Remove feed `temporaryUrl`; always `MediaDisk::url`.
- [x] Remove posts/reels signed-URL settings (`reels_signed_urls_*`).
- [x] `Cache-Control` + `Content-Type` on puts.  
- [ ] CF rules + Tiered Cache + PoP check.  
- [ ] RUM baseline.

### Phase B — Windowing + HLS errors (before prefetch)

- [x] prev/current/next only; destroy outside.  
- [x] HLS fatal error recovery UI.

### Phase C — Prefetch N+1

- [x] Warm next reel only; concurrency 1.

### Phase D — ABR + early ready

- [x] Ladder; early `is_processed`; master.m3u8.
- [x] Keep playable on later-rung failure; rethrow pre-ready for queue retries.
- [x] `abr_complete` + resume path (`posts:resume-incomplete-abr`).

### Phase E — Image WebP + CLS

- [x] Single original-dimension WebP per upload; `width`/`height` + aspect boxes (incl. `RepostedPostEmbed`).

### Phase F — Backlog

Redis feed JSON, blurhash, dual codec, CF Image Resizing.

---

## 13. Risks

| Risk | Mitigation |
|------|------------|
| CDN URL leak if link shared | Accepted; API gates discovery; fix repost leak (P0); delete on takedown |
| Eager players | Phase B windowing |
| Viral origin stampede | CF Tiered Cache |
| Encode cost | Cap 1080p; scale workers |

---

## 14. Success metrics

| Metric | Target |
|--------|--------|
| Live video/hls instances | ≤ 3 |
| TTFF (4G, warm edge) | < 1s p50 |
| Swipe N→N+1 (warm) | < 200ms p50 |
| CF HIT `.ts` | > 90% hot |
| Image CLS | 0 on feed cards |

---

## 15. Code touchpoints

| Work | Where |
|------|--------|
| Kill signed playback | `PostPlaybackUrlService`, PostsSettings / seeders |
| Headers | `MediaDisk` + writers |
| Windowing / errors / prefetch | `Reels.jsx`, `ReelItem`, `useReelHls` |
| ABR | `PostTranscodeService`, jobs, `config/posts.php` |
| Images | compose, `PostResource`, `PostCard` |
| Visibility | `PostRepostService`, feed show paths |

---

## 16. Summary

1. **No signed URLs in feed** — permanent CDN only; **API gates** visibility.  
2. Harden API (repost leak) in P0.  
3. Window reels → then prefetch → ABR → image WebP/CLS.  
4. Immutable objects + long Cloudflare cache + measure.

Laravel: upload → encode → CDN URLs.  
React: window → play → prefetch.  
Cloudflare: HIT everything.
