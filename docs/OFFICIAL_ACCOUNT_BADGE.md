# Official account badge (blue tick)

> **Status:** Implemented (v1)  
> **Date:** 2026-07-29  
> **Related:** [SOCIAL_FEED_ARCHITECTURE.md](./SOCIAL_FEED_ARCHITECTURE.md) · [REELS_ARCHITECTURE.md](./REELS_ARCHITECTURE.md)

---

## 0. Goal

Add a Facebook-/X-style **verified / official** mark on Tapeya accounts that staff mark in backoffice. The feed and profile UIs show a small **blue tick** next to the display name whenever that flag is on.

This is **not** email verification and **not** account status (`active` / `blocked`). Those stay separate.

---

## 1. Product decision (v1)

| Decision | Choice |
|----------|--------|
| Who can grant the badge? | **Admins only** (backoffice toggle). No user self-request flow in v1. |
| Flag shape | **`users.is_official` boolean** (default `false`). |
| Visual | Single blue tick next to name / `@nickname` (same mark everywhere). |
| Who sees it? | Everyone who can see that user (public feed, profiles, comments, mentions). |
| Self-service | Out of scope for v1. |

### Why a boolean (not an enum) for v1

Today there is only one intended meaning: “Tapeya-recognized official account.” A bool is enough, matches how you already treat `can_broadcast`, and is easy to toggle.

**Upgrade path later** (only if needed): replace or add `badge_type` enum (`official` / `partner` / `athlete`) with different icons. Do **not** invent multiple badge columns up front.

### Naming

Prefer **`is_official`** over `is_verified`:

- Avoids clash with `email_verified_at` and account `verification_pending`.
- Matches “official Tapeya / org account” language in sports/broadcast context.

API JSON can still expose a friendlier alias if desired (`is_official` is clear enough for clients).

---

## 2. Implementation map (v1)

| Area | Status |
|------|--------|
| `users.is_official` + `User` fillable/cast | Done — also `User::SOCIAL_SUMMARY_COLUMNS` / `socialSummaryWith()` for constrained eager loads |
| Feed / post / comment / mention / profile / `/me` resources | Done — always include `is_official` |
| Constrained `user:…` selects | Must include `is_official` (via `User::socialSummaryWith()`) |
| App `OfficialBadge` + feed / reel / profile / comments | Done |
| Backoffice manage-user toggle + list chip | Done |

---

## 3. Data model

```text
users.is_official  boolean  not null  default false
```

- Migration on `users`.
- `User::$fillable` + `casts(): is_official => boolean`.
- Index **not** required for v1 (low cardinality; filter rarely). Optional later if admin lists “officials only.”

Admin can set it via existing user update endpoint (`UpdateUserRequest` + Admin `UserResource`).

---

## 4. API contract

### Always include on public-facing user payloads

Wherever we already return a person for social UI, add:

```json
"is_official": true
```

**Must update (minimum):**

| Resource | Field path |
|----------|------------|
| `User\PostResource` | `creator.is_official` |
| Nested `repost_of.creator` (when not redacted) | same |
| `User\PostCommentResource` | comment author |
| `User\UserMentionResource` | mention autocomplete |
| `User\PublicUserProfileResource` | profile header |
| `User\UserResource` (self / peers as used by app) | if shown in UI |
| `Admin\User\UserResource` | backoffice form + list |

**Redacted repost stub:** keep `creator: null` — do not leak official status for private originals (same privacy rule as today).

### Example feed creator

```json
"creator": {
  "id": 42,
  "name": "PCB Official",
  "nickname": "pcb",
  "avatar_url": "https://cdn…/avatar.webp",
  "is_official": true
}
```

Clients should treat missing `is_official` as `false` for older cached payloads.

---

## 5. App UI

### Shared component

`OfficialBadge`:

- Renders only when `isOfficial === true`.
- Accessible: `aria-label="Official account"`.
- Fixed size (`sm` / `md`) so it does not blow up next to 12–15px names.
- Color token `--color-official-badge` (verification blue — not brand gold).

### Surfaces (v1 checklist)

| Surface | File (approx.) | Placement |
|---------|----------------|-----------|
| Feed post header | `PostCard.jsx` | After `authorName` |
| Repost embed header | `RepostedPostEmbed.jsx` | After nested author name |
| Reel overlay | `ReelItem.jsx` | After handle / username |
| Creator / public profile | `CreatorReelsProfile.jsx`, profile header | After display name |
| Comments | `PostCommentsThread.jsx` | After commenter name + mention picker |

Normalize in `feedApi.js` (`normalizePost`): map `creator.is_official` → `authorIsOfficial` (and nested `repostOf`).

### Do not

- Put the tick on the avatar ring only (easy to miss; name adjacency matches FB/X).
- Gate follow/like on official status.
- Auto-grant official from `type`, roles, or `can_broadcast`.

---

## 6. Backoffice

In **Users management → Manage user** dialog (next to existing flags like `can_broadcast`):

- Select: **Official account** (`is_official`).
- Help text: “Shows a blue verification tick beside this user’s name in the app. Staff only.”
- Users list: small “Official” chip next to the name when set.

No public “request verification” UI in v1.

---

## 7. Implementation phases

### Phase A — Data + API — done

1. Migration `is_official` on `users`.
2. Model fillable/cast + social summary helper.
3. Admin update validation + resource.
4. User-facing resources (`PostResource` creator, profile, comments, mentions).
5. Feature test: official creator appears in feed JSON; non-official is `false`.

### Phase B — Backoffice — done

1. Manage-user form control.
2. Persist via existing user update.
3. List chip for visibility.

### Phase C — Consumer app — done

1. `OfficialBadge` component.
2. Wire feed / reel / profile / comments.
3. `feedApi` normalize coverage in Vitest.

### Out of scope (backlog)

- User-facing verification request + review queue.
- Multiple badge types / paid verification.
- Search boost or ranking for officials.
- Push copy that mentions “official.”
- Live “Hosted by” string badge (API already exposes `broadcaster.is_official`).

---

## 8. Risks & notes

| Risk | Mitigation |
|------|------------|
| Confusion with email verified | Name field `is_official`; UI copy “Official account” |
| Badge on redacted private repost | Keep `creator: null` on unavailable stubs |
| Inconsistent UI | One shared badge component |
| Constrained eager load omits column | Use `User::socialSummaryWith()` / `SOCIAL_SUMMARY_COLUMNS` |
| Staff abuse | Audit via normal admin auth; optional later: log who flipped the flag |

---

## 9. Success criteria

- Admin can set `is_official` without a deploy.
- Feed post and reel surfaces show a blue tick for those creators only.
- Public profile shows the same tick.
- Non-official users unchanged.
- Private / redacted nested originals still hide identity (no tick leak).

---

## 10. Suggested copy

| Context | Copy |
|---------|------|
| Backoffice label | Official account |
| Backoffice help | Shows a blue verification tick beside this user’s name in the app. Staff only. |
| App `aria-label` | Official account |
| Tooltip (if any) | Official account |
