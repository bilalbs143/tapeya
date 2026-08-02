# Sponsored Brand Posts — Final Plan

**Status:** finalized plan (not implemented)  
**Audience:** product + API + app + backoffice  
**Related:** [`SOCIAL_FEED_ARCHITECTURE.md`](./SOCIAL_FEED_ARCHITECTURE.md) §6.7, [`OFFICIAL_ACCOUNT_BADGE.md`](./OFFICIAL_ACCOUNT_BADGE.md), [`SHOP_ECOMMERCE_DESIGN.md`](./SHOP_ECOMMERCE_DESIGN.md)

This doc is the locked end-to-end design. Phase checklists below are implementation gates, not open product questions.

---

## 1. Goal

Run **paid placements** in Tapeya’s Home feed and Reels for brand partners (Pepsi, Nestlé, etc.), measure **impressions / views / clicks**, and expose an **internal campaign dashboard**. Partner-facing portals come later.

| Not this | Meaning today |
|----------|----------------|
| Team “sponsor” role | Cricket team owner — unrelated |
| Shop `Brand` | Ecommerce catalog — products, not feed ads |
| `users.is_official` | Official creator badge — used on brand **accounts**, not the ad system of record |

---

## 2. Locked principles

1. **Campaign-first** — eligibility, pacing, and analytics live on campaign tables. Not `posts.is_sponsored` as source of truth ([feed architecture §6.7](./SOCIAL_FEED_ARCHITECTURE.md)).
2. **Creative = real `posts` row** with `distribution = sponsored_only` — reuse media/transcode/moderation; **do not** leave creatives as unbounded organic Explore inventory (see §3).
3. **Native UI + mandatory disclosure** — same card/reel chrome; Sponsored label is non-optional.
4. **Campaign metrics only in `ad_events`** — no dual-write into `posts.views_count` from sponsored playback (avoids Trending pay-for-boost).
5. **Logged-in attribution in Phase 1** — ad events require auth; device-level advertising attribution is Phase 2 with explicit copy (commercial purpose ≠ organic analytics).
6. **Global kill switch** — system setting / flag `ads_enabled` checked before any injection.

---

## 3. Creative-as-post: connected decision (root cause lock)

Reusing a real post also inherits **repost, organic ranking, and Trending**. Resolve as one package:

| Concern | Locked rule |
|---------|-------------|
| Organic Explore / Following / Search | Creatives use `posts.distribution = sponsored_only`. All organic list scopes (`scopeExplore`, following, search, hashtag, trending) **exclude** `sponsored_only`. |
| Injector | Sole list path that serves `sponsored_only` posts (plus brand “Ad library” admin/profile surfaces). |
| Repost | **Hard-block** repost when `distribution = sponsored_only` (and when `post_id` is attached to any `ad_creatives` row). `PostRepostService` must reject before create. |
| Comments | **Enabled** — same as normal posts (like / comment / save). Moderation via existing report tools if needed. |
| Campaign pause / end / targeting narrow | Injection stops. Creative post stays out of organic feeds because `distribution` does not flip automatically. Ops may later set `distribution = organic` intentionally for a non-paid brand post (new post preferred). |
| Same post, two flights | Allowed: two `ad_creatives` rows (different campaigns) may point at the same `post_id`. Metrics are always keyed by `creative_id` / `campaign_id` in `ad_events`, never by `post_views`. |
| Profile | Brand social profile may list `sponsored_only` posts in an **Ads** section (optional Phase 1.5). Default profile grid shows organic-only. |

**Do not** add a fourth `visibility` enum value for this — `visibility` stays audience ACL; `distribution` is feed-eligibility for ads inventory.

---

## 4. User-facing experience

### 4.1 Surfaces

| Surface | Phase 1 | Notes |
|---------|---------|--------|
| Home mixed (`GET /feed`) | Inject | |
| Reels explore (`GET /reels/feed`) | Inject | |
| Following | No | Phase 2 optional |
| Trending | **Never inject**; `sponsored_only` excluded from trending query | Prevents paid boost via organic formula |
| Hashtag / search | No injection; creatives excluded from organic results | |
| Brand profile grid | Organic posts only by default | |

### 4.2 Card anatomy

- Creator row: brand account avatar/name + optional official tick + **Sponsored** disclosure (see §11).
- Body: text / image / video via normal post media.
- CTA: label + URL under caption or reel end-card (`cta_type`: `url` \| `deep_link` only in Phase 1).
- ⋯ menu Phase 1: **Why am I seeing this?**, **Report ad** (wires to existing report flow with `reason=sponsored` or dedicated report type).
- ⋯ menu Phase 2: **Hide this ad**.

### 4.3 Brand account (required for Phase 1 compose)

- `brand_partners.user_id` is **required** before compose-as-brand or attaching a creative.
- User should be `is_official = true` with a stable nickname (`@pepsi`).
- Organic brand posts (distribution `organic`) are normal UGC; paid flights always need an active campaign + approved creative.

---

## 5. Domain model

### 5.1 Entity tree

```
BrandPartner          (Pepsi) — status must be active for injection
  └─ user_id          required for Phase 1 creatives
  └─ Campaign
        └─ Creative   (required post_id, CTA, approval status)
        └─ targeting_json + surface fields on campaign (no placements child table in Phase 1)
```

### 5.2 `posts` addition

| Column | Type | Notes |
|--------|------|--------|
| `distribution` | string/enum | `organic` (default) \| `sponsored_only` |

On-delete: unchanged for existing FKs. New ad tables: see §5.8.

### 5.3 `brand_partners`

| Column | Notes |
|--------|--------|
| `id` | |
| `name`, `slug` | slug unique |
| `logo_path` | nullable |
| `user_id` | **NOT NULL** for creatives workflow; FK `users` `nullOnDelete` only if we later allow unlink — Phase 1: required at create of first creative |
| `shop_brand_id` | nullable FK `shop_brands` `nullOnDelete` — unused until Phase 3 |
| `contact_email` | nullable |
| `status` | `draft` \| `active` \| `paused` \| `archived` |
| `created_at` / `updated_at` | |

**Injection gate:** `status = active` (archived/paused partners serve nothing even if campaigns say active).

### 5.4 `ad_campaigns`

| Column | Notes |
|--------|--------|
| `id` | |
| `brand_partner_id` | FK `cascadeOnDelete` |
| `name` | |
| `status` | `draft` \| `scheduled` \| `active` \| `paused` \| `ended` |
| `objective` | `awareness` \| `traffic` \| `engagement` — **dashboard default sort/highlight only** in Phase 1 (not a separate scoring engine) |
| `starts_at` / `ends_at` | timestamptz; required before leaving `draft` |
| `priority` | unsigned int, default 0; higher wins cross-campaign ties |
| `surfaces` | JSON array: `["home_feed","reels_feed"]` — validated write-time |
| `slot_every_n` | unsigned int, default 8, min 3 |
| `max_ads_per_response` | unsigned int, default 1 — **stateless** (replaces “per session”) |
| `targeting_json` | see §5.6 — validated write-time |
| `daily_impression_cap` | nullable — **Phase 2**; column may exist but ignored in Phase 1 |
| `total_impression_cap` | nullable — Phase 2 |
| `frequency_cap_per_user` | nullable — Phase 2 |
| `frequency_window_hours` | default 24 — Phase 2 |
| `budget_notes` | nullable text |
| `created_by_admin_id` | FK users `nullOnDelete` |
| timestamps | |

**No `ad_placements` table in Phase 1** — surfaces + density live on the campaign (same pragmatism as targeting JSON).

**Status vs flight (single effective rule):**

```
servable = partner.active
        && campaign.status == active
        && starts_at <= now < ends_at
        && ads_enabled
```

- Creating with future `starts_at` → status `scheduled`.
- Cron every minute: `scheduled` → `active` when `starts_at <= now`; `active` → `ended` when `now >= ends_at`.
- Manual `paused` / `ended` always wins over dates (dates alone never resurrect a paused campaign).
- If `status=active` but outside flight window, treat as **not servable** (cron will end it).

### 5.5 `ad_creatives`

| Column | Notes |
|--------|--------|
| `id` | |
| `campaign_id` | FK `cascadeOnDelete` |
| `post_id` | **NOT NULL**, FK `posts` `restrictOnDelete` (detach creative before deleting post) |
| `name` | |
| `cta_label` | required |
| `cta_url` | required, URL validated |
| `cta_type` | `url` \| `deep_link` only (Phase 1) |
| `disclosure_label` | default `Sponsored` |
| `status` | `pending_review` \| `approved` \| `rejected` \| `paused` |
| `weight` | unsigned int default 1 — **reserved**; Phase 1 selection ignores weight |
| `reviewed_by_admin_id` | nullable |
| `reviewed_at` | nullable |
| timestamps | |

**Injection requires** `status = approved` (and campaign/partner servable).

**No nullable `post_id`, no inline asset columns** — parallel media stack is rejected.

### 5.6 `targeting_json` (Phase 1 subset)

```json
{
  "platforms": ["ios", "android", "web"],
  "countries": ["PK", "AE"],
  "languages": ["en", "ur"]
}
```

**Write-time validation (Form Request):**

- Unknown keys → 422.
- `platforms` ⊆ `{ios,android,web}`.
- `countries` ⊆ ISO-3166-1 alpha-2 allowlist we maintain (start with `PK`, `AE`).
- `languages` ⊆ app locale allowlist.
- Empty array for a key means “no restriction” on that dimension.

Empty / null `targeting_json` → match all (still subject to auth + caps).

Audience segments (teams, interests) = **Phase 2**; when they ship, revisit §11 transparency (“Why am I seeing this?”).

### 5.7 `ad_events` (append-only)

| Column | Notes |
|--------|--------|
| `id` | bigint |
| `campaign_id` | indexed |
| `creative_id` | indexed |
| `post_id` | |
| `brand_partner_id` | denormalized |
| `event_type` | `impression` \| `view` \| `click` \| `hide` \| `report` |
| `user_id` | NOT NULL in Phase 1 |
| `viewer_key` | HMAC of user id (stable); kept for Phase 2 device path |
| `surface` | `home_feed` \| `reels_feed` |
| `platform` | |
| `watched_ms` | nullable |
| `completion_rate` | nullable |
| `client_event_id` | UUID from client — **unique** for idempotency |
| `occurred_at` | client timestamp (clamped); rollup uses this, not insert time |
| `meta` | JSON (app version, slot index, response_id) |
| `created_at` | server insert time |

Indexes:

- `unique(client_event_id)`
- `(campaign_id, event_type, occurred_at)`
- `(creative_id, occurred_at)`
- `(user_id, creative_id, event_type, occurred_at)` — frequency / unique reach

### 5.8 `ad_stats_daily`

| Column | Notes |
|--------|--------|
| `date` | date (from `occurred_at` in app TZ) |
| `campaign_id` | |
| `creative_id` | |
| `impressions_raw` | count of impression events after idempotent insert |
| `impressions_unique` | distinct `user_id` with ≥1 impression that day |
| `views_raw` / `views_unique` | |
| `clicks_raw` / `clicks_unique` | |
| `sum_watched_ms` | video views only |

Unique key: `(date, campaign_id, creative_id)` — rollup upsert is idempotent.

### 5.9 `ad_audit_logs`

| Column | Notes |
|--------|--------|
| `id` | |
| `actor_admin_id` | nullable |
| `entity_type` | `brand_partner` \| `campaign` \| `creative` |
| `entity_id` | |
| `action` | `created` \| `updated` \| `paused` \| `ended` \| `approved` \| `rejected` \| … |
| `before` / `after` | JSON snapshots |
| `created_at` | |

### 5.10 Phase 2: `ad_user_suppressions`

| Column | Notes |
|--------|--------|
| `user_id` | |
| `grain` | `creative` \| `campaign` \| `brand_partner` |
| `grain_id` | |
| `created_at` | |
| unique `(user_id, grain, grain_id)` | |

Default Hide action grain: **`campaign`** (hiding one Pepsi flight hides that campaign’s creatives, not every Nestlé ad).

### 5.11 Intentionally deferred tables

- `ad_placements` — folded into campaign columns.
- Inline creative assets — never in Phase 1–2.
- Billing / invoices.

---

## 6. Feed injection

### 6.1 Hook point

After organic cursor page load in `PostFeedService::explore` (and videos-only reels path), **before** `PostResource` / viewer hydration.

**Cursor rule (mandatory):** pagination cursors and `next_cursor` are derived **only from the organic paginator**. The merged response array must never be used to compute the next page token. Document + assert in tests.

### 6.2 Density (stateless)

- Config: `slot_every_n` (campaign or global default), `max_ads_per_response` (default 1).
- Insert at most `max_ads_per_response` ads into each response.
- Position: after item index `min(slot_every_n, organicCount) - 1` when `organicCount >= min_organic_before_ad` (global default **3**).  
  If `organicCount < min_organic_before_ad`, **skip ads** for that response (no silent forever-zero when `perPage < slot_every_n` — density is gated by organic count + max_per_response, not by requiring a full page of 8).
- `perPage` remains client 1–20; small pages may get 0–1 ads depending on organic count.

### 6.3 Selection (Phase 1)

1. Feature flag on.
2. Load servable campaigns for surface + targeting match.
3. Among approved creatives, pick **highest `campaign.priority`, then lowest `creative.id`** (deterministic). Ignore `weight` until Phase 3 A/B.
4. Cap concurrent campaigns implicitly by `max_ads_per_response` (usually 1). No auction.
5. Cross-campaign ties never use creative `weight`.

### 6.4 Organic collision

Because creatives are `sponsored_only`, they **do not appear** in the organic page — Phase 1 “one Pepsi creative” cannot self-dedupe into invisibility.

If we later allow `distribution = both`, rule becomes: **suppress the organic duplicate and keep the sponsored envelope** (never drop the ad slot).

### 6.5 API envelope

```json
{
  "id": 123,
  "type": "video",
  "distribution": "sponsored_only",
  "sponsorship": {
    "is_sponsored": true,
    "campaign_id": 9,
    "creative_id": 42,
    "disclosure_label": "Sponsored",
    "cta": { "label": "Learn more", "url": "https://…", "type": "url" },
    "brand": { "name": "Pepsi", "logo_url": "…", "partner_id": 3 }
  }
}
```

Organic items: `"sponsorship": null`.

### 6.6 Eligible-campaigns hot path (Phase 1 conscious deferral)

Phase 1: query servable campaigns with indexes; no Redis cache required at demo scale.

**Required indexes day one:**

- `ad_campaigns (status, starts_at, ends_at)`
- `ad_campaigns (brand_partner_id, status)`
- `ad_creatives (campaign_id, status, post_id)`
- `brand_partners (status)`
- `posts (distribution, published_at)`

Phase 2: cache active campaign snapshot in Redis (TTL 30–60s) invalidated on audit-logged mutations.

### 6.7 Frequency caps (Phase 2)

- Counter advances at **injection time** (synchronous), not on confirmed impression.
- Key: `(user_id, campaign_id, window)`.
- Confirmed impressions remain the dashboard truth; injection caps are pacing.

---

## 7. Metrics dictionary (locked)

### 7.1 Impression

Shown on device — **not** “returned in JSON”.

| Surface | Trigger |
|---------|---------|
| Home feed | ≥50% of card visible for **≥1s** |
| Reels | Active player for **≥1s** (same dwell floor as feed — no instant swipe-past impressions) |

- Client sends `client_event_id`; server unique-inserts.
- Dashboard **impressions_raw** = successful inserts; **impressions_unique** = distinct users/day.

### 7.2 View

| Creative type | Definition |
|---------------|------------|
| Video | `watched_ms` / completion thresholds **same as organic reel settings** (≥3s or ≥25% by default), recorded as `ad_events.type = view` with `creative_id` + `campaign_id` |
| Image / text | **Dwell view:** ≥50% visible for **≥2s** (stricter than impression). Not equal to impression. |

**Path (locked — no dual-write):**

- Sponsored playback / dwell → **`POST /ads/events`** only (`type=view`).
- Do **not** call `PostViewService` for `sponsored_only` posts (or no-op if called).
- `post_views` / `posts.views_count` unchanged by ads → Trending cannot be bought via Option A leakage.
- Reusing a post across two flights: each flight’s views are independent rows in `ad_events` keyed by `creative_id`.

VTR = views_raw / impressions_raw (can be &lt; 1 for images). Completion rate KPI is **video-only**; hide on image/text dashboard widgets.

### 7.3 Click

Primary: CTA tap → `type=click`.  
Secondary (optional Phase 2): brand avatar → `click` with `meta.target=profile`.

### 7.4 Derived KPIs

| KPI | Formula | Notes |
|-----|---------|--------|
| CTR | clicks_raw / impressions_raw | |
| VTR | views_raw / impressions_raw | |
| Unique reach | distinct users with ≥1 impression in range | |
| Frequency | impressions_raw / reach | |
| Completion | avg completion_rate on **video** views | N/A for image/text |

---

## 8. Event pipeline & rollups

### 8.1 Ingest

`POST /ads/events` batch body:

```json
{
  "events": [
    {
      "client_event_id": "uuid",
      "type": "impression",
      "creative_id": 42,
      "campaign_id": 9,
      "surface": "home_feed",
      "platform": "ios",
      "occurred_at": "2026-08-01T18:00:00Z",
      "watched_ms": null,
      "completion_rate": null,
      "meta": {}
    }
  ]
}
```

Rules:

- Auth required (Phase 1).
- Reject if creative/campaign not servable **at occurred_at** (or currently ended — still accept late events within 72h for completed flights so offline mobile is not lost; attribute to `occurred_at` day).
- Idempotent on `client_event_id`.
- Clamp absurd `watched_ms` / future `occurred_at`.

### 8.2 Rollup job

- Hourly upsert into `ad_stats_daily` by `(date, campaign_id, creative_id)` from `occurred_at`.
- Idempotent: recompute aggregates for touched dates (or incremental with watermarks + periodic full rebuild for last 3 days to absorb late events).
- Late events: included in the `occurred_at` date on next rollup; do not invent a separate “insert day” metric.

### 8.3 Retention

| Store | Retain | Why |
|-------|--------|-----|
| `ad_events` | **90 days** | Enough for dispute windows + debug; volume grows with impressions |
| `ad_stats_daily` | **24 months** | Partner reporting across seasons |
| `ad_audit_logs` | **24 months** | Ops accountability |

Scheduled command `ads:purge-expired-events` daily. Document in `routes/console.php` when implemented.

---

## 9. Admin / ops

### 9.1 Workflow (Phase 1)

1. Create **Brand Partner** with required `user_id` (official account).
2. Compose post **as that user** → system sets `distribution=sponsored_only` (comments stay on).
3. Create **Campaign** (dates, surfaces, `slot_every_n`, targeting). Phase 2 cap fields: **hidden or disabled** in UI with “Coming in Phase 2” — not silently ignored while looking editable.
4. Attach **Creative** (post + CTA) → status `pending_review`.
5. Second admin (or same in Phase 1 with explicit “Approve”) → `approved`.
6. Campaign becomes servable when status/flight/partner gates pass.
7. Dashboard reads `ad_stats_daily` (+ raw drill-down).

### 9.2 Approval gate

No injection while creative is `pending_review` or `rejected`.  
CTA URL + trademark/content checked at human review (reactive user reports are **backup**, not the gate).

### 9.3 Dry-run: `GET /admin/ad-campaigns/{id}/eligibility-preview`

**Input query:**

| Param | Notes |
|-------|--------|
| `user_id` | Hypothetical viewer (required) |
| `surface` | `home_feed` \| `reels_feed` |
| `platform` | |
| `country` | optional override |
| `at` | ISO time, default now |

**Output:**

```json
{
  "servable": false,
  "reasons": [
    "creative_pending_review",
    "outside_flight_window",
    "partner_archived",
    "targeting_platform_mismatch"
  ],
  "would_select_creative_id": null
}
```

Itemized reasons, not a bare boolean.

### 9.4 Dashboard widgets (internal)

1. Flight status + effective servable flag  
2. Time series: impressions / views / clicks (raw)  
3. CTR / VTR  
4. Platform / country breakdown from event meta + targeting  
5. Per-creative table  

CSV export can wait for Phase 2; Phase 1 screen is enough for the Pepsi demo.

### 9.5 Audit

Every pause/end/edit/approve/reject writes `ad_audit_logs`.

---

## 10. App / client

| Area | Work |
|------|------|
| Feed / Reels | Sponsored disclosure + CTA; honor `sponsorship` envelope |
| Impression | Feed + Reels both use ≥50% / ≥1s (Reels: active + 1s dwell) |
| View | Video → threshold via `/ads/events`; image/text → 2s dwell view |
| Click | CTA → event → open URL / deep link |
| Report ad | Phase 1 ⋯ action → report API |
| Why am I seeing this? | Phase 1 static sheet (objective + “based on general app usage / region”) |
| Hide ad | Phase 2 + `ad_user_suppressions` |
| Comments | Normal comment UI (enabled) |

Keep social layout — no banner-style AdCard.

---

## 11. Disclosure, privacy, legal

### 11.1 Disclosure UI (Phase 1 requirements)

Mirror the rigor of the Official badge pattern:

- Label text: default **Sponsored** (localizable).
- Placement: adjacent to creator name (feed + reels overlay), always visible without opening ⋯.
- Contrast: use a dedicated token (e.g. `--color-sponsored-label`) meeting WCAG AA against the chrome behind it; do not rely on low-contrast gray-on-video.
- Size: at least the Official tick’s touch/readability floor.
- Timing: visible for the entire time the card/reel is on screen (not a 1s toast).

### 11.2 “Why am I seeing this?”

Phase 1: static copy — paid partnership; may use coarse factors (country/platform/language) when targeting is set; no per-user interest dossier.

**Phase 2:** when audience segments ship, **revisit this section** — transparency must name segment-style reasons, not only geo/platform.

### 11.3 Consent / attribution

- Phase 1: **authenticated users only** for injection + events (advertising purpose).
- Do not reuse anonymous `X-Device-Id` organic view keys for ads in Phase 1.
- Phase 2 device-level ads: separate consent/copy review for AE/PK before enabling.

### 11.4 Age / region interim constraint (Phase 1)

- **No age targeting** in `targeting_json` for Phase 1 (even though `users.date_of_birth` exists).
- Creatives must be **general audience** (suitable for the app’s minimum age). Ops approval checklist includes “general audience OK for PK + AE”.
- Market-specific restricted categories (alcohol, etc.): ops rejects at `pending_review`; no automated classifier in Phase 1.
- Full legal matrix for PK vs AE ad labeling → tracked outside this eng plan; eng ships Sponsored disclosure + approval gate as the interim control.

### 11.5 Retention

See §8.3 — enforced by purge command when built.

---

## 12. Relation to existing systems

| System | Relationship |
|--------|----------------|
| `posts` + media + HLS | Required creative body; `distribution=sponsored_only` |
| `PostRepostService` | Must block sponsored inventory |
| `PostCommentService` | Unchanged — comments allowed on sponsored creatives |
| `PostFeedService` | Organic scopes exclude `sponsored_only`; injector merges after cursor |
| `PostViewService` | Unused for sponsored_only playback |
| `users.is_official` | Brand account badge |
| `shop_brands` | Phase 3 product CTA only |
| Team sponsor role | Out of scope |

---

## 13. API sketch

| Method | Path | Purpose |
|--------|------|---------|
| Admin CRUD | `/admin/brand-partners`, `/admin/ad-campaigns`, `/admin/ad-creatives` | Ops |
| Approve/reject | `POST /admin/ad-creatives/{id}/approve` etc. | Gate |
| Dry-run | `GET /admin/ad-campaigns/{id}/eligibility-preview` | §9.3 |
| Stats | `GET /admin/ad-campaigns/{id}/stats?from&to` | Dashboard |
| Events | `POST /ads/events` | Client batch |
| Feed | existing `/feed`, `/reels/feed` | May include `sponsorship` |

---

## 14. Engineering touchpoints

| Layer | Area |
|-------|------|
| Migrations | `distribution` on posts; ad_* tables + indexes |
| Feed | `PostFeedService` scopes + injector; cursor tests |
| Repost | Guard for sponsored inventory |
| Resource | `PostResource` sponsorship envelope |
| Admin | `Admin/Ads/*` + Angular module; Phase 2 fields disabled |
| App | disclosure, dwell timers, events, report |
| Console | flight reconcile cron; `ads:purge-expired-events`; stats rollup |
| Settings | `ads_enabled`, defaults for `slot_every_n`, `min_organic_before_ad` |

---

## 15. Phased delivery

### Phase 0 — Spec (this doc) ✅ locked

Metric definitions, creative-as-post package, no dual-write, surfaces, disclosure, interim legal constraint.

### Phase 1 — MVP

- Schema: partners, campaigns (with surfaces/density), creatives (approval), `ad_events`, `ad_stats_daily`, `ad_audit_logs`, posts.distribution
- Organic exclusion + repost guard
- Injector (deterministic pick, cursor-safe)
- Client: disclosure, CTA, impression (1s both surfaces), view (video thresholds / image 2s dwell), click, report ad, why-this-ad sheet
- Backoffice: partner (user required), compose-as-brand, campaign, creative pending→approved, internal dashboard, eligibility dry-run
- Crons: flight reconcile + hourly rollup
- Feature flag `ads_enabled`
- Phase 2 columns may exist but **UI-disabled**

**Success:** One approved Pepsi creative injects into Home/Reels for a logged-in user; impressions/clicks appear on admin dashboard within one rollup hour (or immediate raw query).

### Phase 2 — Controls

- Frequency / daily / total caps (injection-time counting)
- Targeting enforced beyond write-validation (already stored in Phase 1)
- Hide ad + `ad_user_suppressions` (campaign grain default)
- CSV export
- Optional following-feed injection
- **Revisit §11.2** when audience segments are designed
- Caching for eligible campaigns
- Device-level ads only after consent review

### Phase 3 — Partner experience

- Partner read-only dashboard / magic link
- Creative A/B via `weight`
- Shop product CTA (`cta_type=product` + product_id)
- Stricter density tokens if partners demand
- Anomaly alerts

### Phase 4 — Scale (only if needed)

- Auction / marketplace
- Segment targeting
- Server-side impression beacon
- HLL unique reach
- Billing module

---

## 16. Locked product answers

1. **Organic brand posts without a campaign?** Yes — `distribution=organic` on the official account.  
2. **Same post in organic Explore while also an ad?** No for Phase 1 creatives (`sponsored_only`).  
3. **Money / CPM in-product?** No — external contracts; dashboard is delivery proof.  
4. **Age/region legal?** Interim: general-audience creatives + Sponsored disclosure + human approval; no age targeting; PK/AE ops checklist. Deeper legal matrix outside eng Phase 1.  
5. **Likes / comments notify brand user?** Yes (normal post notifications). Comments stay enabled.  
6. **Repost sponsored creative?** Blocked.  
7. **View for image/text?** 2s dwell at ≥50% visible — not equal to impression.  
8. **Dual-write views_count?** No.  
9. **Frequency-cap counter?** Injection-time (Phase 2).  
10. **max_per_session?** Replaced by `max_ads_per_response`.

---

## 17. Out of scope

- Stories / live mid-roll / push ads  
- Self-serve brand signup  
- Shop coupons as this system  
- Team “sponsor” role as advertiser model  
- Real-time bidding  
- Inline creatives without `posts`  
- Anonymous ad tracking in Phase 1  
- Automated age-gated creative policies  

---

## 18. One-sentence summary

**Approved campaign creatives are real `sponsored_only` posts that never enter organic Explore; the feed injector inserts them with a mandatory Sponsored envelope, and the app records impressions/views/clicks only in `ad_events` for an audited admin dashboard.**
