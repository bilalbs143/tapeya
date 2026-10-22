# client page layout blueprint

**Source of truth** for how every screen sits inside the shell: gutters, gaps, headers, sticky CTAs, safe areas, empty/error placement.

If a page invents its own padding, hand-rolls a header, or sticks a CTA with different offsets, it is **wrong** — fix it to match this doc.

Related: [APP_REACT_COPY_CASING.md](./APP_REACT_COPY_CASING.md) · [APP_REACT_FORM_MIGRATION.md](./APP_REACT_FORM_MIGRATION.md) · `.cursor/skills/client-standards/SKILL.md`

---

## 1. Non-negotiable rules

1. **Shell owns chrome; pages own content.** `AppShell` does **not** add page gutters. Every page must apply the canonical gutters below.
2. **One page root.** Almost every screen starts with:

   ```tsx
   <div className="bg-surface flex min-h-full flex-col">
   ```

3. **One horizontal gutter for body content: `px-4`.** Do not mix `px-3`, `px-3.5`, `px-[15px]`, or `px-[18px]` in page bodies. (`px-3.5` is reserved for ScreenBar phone chrome and the desk rail.)
4. **Use `ScreenBar` for subpages.** Do not hand-roll back + title + border. Exception: first-class types that explicitly omit it (hero detail, feed home, profile shelf, immersive, auth).
5. **Use `StickyActionBar` for commit CTAs** on shell pages. Sibling of the body — never nested inside a `px-*` form. Never pass `-mx-*`.
6. **Safe area is not a page concern** when BottomNav (or shell chrome) already owns the bottom inset. StickyActionBar has **no** safe-area pad. Immersive / hide-nav surfaces own their own insets.
7. **Empty / Error / Loading live under the header**, inside the page column — never replace the whole shell.
8. **No double chrome.** One title row only (ScreenBar **or** step header — not both). One sticky footer only.
9. **Tokens only.** No new hex, arbitrary `px-[Npx]` gutters, or one-off `pb-safe` utilities outside the patterns in this doc.

---

## 2. Shell modes (where the page lives)

| Mode | Route examples | What the page gets |
|---|---|---|
| **Normal** | Feed, shop, tournaments, matches list/setup, profile, go-live form, support | TopBar / SideNav, scroll column, `tab:max-w-[800px]`, optional desk rail, BottomNav (phone) |
| **Bare** | Reels, match score/toss, live watch / on-air | Full viewport; phone may overlay BottomNav; **no** max-width column; page owns height + safe areas |
| **Auth** | Login, Register, OTP | Outside `AppShell` — use `AuthShell` only |

**Hide BottomNav** (normal or bare) when:

- `/create` and children
- Operator scoring: `/matches/:id/(score|toss|settings|graphics)`
- Live immersive: `/live/broadcast/:id`, `/live/go-live/:id`

Hub `/live` and form `/live/go-live` **keep** BottomNav.

### Breakpoints (code, not folklore)

| Token | Width | Shell effect |
|---|---|---|
| `sm` | ~640 | Auth card only |
| `tab` | 900 | SideNav + DesktopTopBar; ScreenBar becomes static large title; overlay sheet → dialog |
| `desk` | 1200 | Right rail `384px` |
| `wide` | 1440 | Rail `424px` |

---

## 3. Canonical spacing scale

Use **only** these roles. If you need a new step, update this table first.

| Role | Classes | Notes |
|---|---|---|
| **Page body gutter** | `px-4` | All list/form/detail bodies |
| **ScreenBar phone** | `px-3.5 py-2` | Built into `ScreenBar` — do not duplicate |
| **ScreenBar desk** | `tab:px-4 tab:pt-5 tab:pb-4` | Built into `ScreenBar` |
| **Body top under ScreenBar** | `pt-3.5` | Compact forms / dense hubs |
| **Body top (roomier)** | `pt-4` | Lists, multi-section forms |
| **Body bottom (scroll end, no sticky)** | `pb-6` or `pb-8` | Prefer `pb-6` hubs; `pb-8` long lists |
| **Body bottom (before StickyActionBar)** | `pb-4` | Leaves air above the sticky border |
| **Section stack (hub)** | `gap-5` | Cards / bands stacked on hubs |
| **Section stack (dense hub)** | `gap-3.5` | Live hub–style |
| **Form density compact** | `gap-3.5` | ScreenBar + StickyActionBar screens |
| **Form density default** | `gap-6` | Multi-section edit (e.g. Edit Profile) |
| **Form section / row** | `gap-3` | Inside `FormSection` / `FormRow` |
| **StickyActionBar** | `px-4 pt-3 pb-3` | Primitive owns this |
| **Primary sticky CTA** | `min-h-12 w-full` | Full-width primary |
| **Dual sticky CTAs** | `flex gap-2` children | Discard + Save, Back + Next |
| **Empty / error wrapper** | `px-4 py-8` | Around `EmptyState` / `ErrorState` |
| **Skeleton block** | `px-4 pt-4` or `px-4 py-6` | Under ScreenBar |
| **Desk rail** | `px-3.5 py-4 gap-3.5` | Shell aside — pages do not set this |
| **Main max width** | `tab:max-w-[800px]` | Shell — pages do not set this |

### Vertical rhythm (mental model)

```
┌─ ScreenBar (phone sticky) ─────────────────────┐
│  px-3.5 py-2  ·  tab: px-4 pt-5 pb-4           │
├────────────────────────────────────────────────┤
│  Body: px-4 + pt-3.5|pt-4                      │
│  gaps: 3.5 (compact) · 5 (hub) · 6 (default)   │
│  pb-4 if sticky follows · else pb-6|pb-8       │
├─ StickyActionBar (optional) ───────────────────┤
│  px-4 pt-3 pb-3  ·  no safe-area               │
└────────────────────────────────────────────────┘
         ↑ sits above BottomNav in scrollport
```

---

## 4. Page types (pick one)

Every new or ported screen **must** declare its type in the PR/description and follow that blueprint exactly.

### Type A — Subpage form (most common)

**When:** Support, Interest, Go Live form, Seller store/apply/product, Checkout, Cart, Start Match, Quick Match, Match settings (content), etc.

```tsx
<div className="bg-surface flex min-h-full flex-col">
  <ScreenBar title="…" subtitle="…" onBack={() => navigate(…)} />

  <Form
    id="page-form"
    density="compact"
    className="px-4 pt-3.5 pb-4"
    onSubmit={…}
  >
    {/* fields — no outer px-* */}
  </Form>

  <StickyActionBar>
    <Button type="submit" form="page-form" className="min-h-12 w-full">
      Save Changes
    </Button>
  </StickyActionBar>
</div>
```

**Rules**

- StickyActionBar is a **sibling** of `Form`, not a child.
- Do not put `flex-1` on StickyActionBar. `mt-auto` on the bar parks it when content is short.
- Loading / error: replace **body only**, keep ScreenBar:

  ```tsx
  <ScreenBar … />
  <div className="px-4 py-8">
    <ErrorState title="…" onRetry={…} />
  </div>
  ```

**Reference:** `features/support/pages/SupportPage.tsx`

---

### Type B — Multi-section edit form

**When:** Edit Profile (grouped sections, optional full-bleed media).

```tsx
<div className="bg-surface flex min-h-full flex-col">
  <ScreenBar title="Edit Profile" … />

  {/* Optional full-bleed media — no px */}
  <div className="…cover…">{/* edge to edge */}</div>

  <Form density="default" className="pb-4" …>
    <div className="px-4 pt-4 flex flex-col gap-6">
      {/* sections */}
    </div>
  </Form>

  <StickyActionBar>
    <div className="flex gap-2">
      <Button variant="secondary" className="min-h-12 flex-1">Discard</Button>
      <Button type="submit" form="…" className="min-h-12 flex-1">Save Changes</Button>
    </div>
  </StickyActionBar>
</div>
```

**Rules:** Full-bleed media may break out of `px-4`. Field blocks always return to `px-4`. Sticky bar still owns its own `px-4`.

**Reference:** `features/profile/ui/EditProfileForm.tsx`

---

### Type C — Hub / list

**When:** Matches list, Tournaments list, Live hub, Shop home, Notifications, Rankings, Highlights list, Serials list.

```tsx
<div className="bg-surface flex min-h-full flex-col">
  <ScreenBar title="…" subtitle="…" onBack={…} /* or sticky={false} if below= */ />

  {/* Optional sticky filters / search — ScreenBar below= OR sibling under bar */}
  <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
    {/* sections / cards / EmptyState */}
  </div>
</div>
```

**Dense hub variant:** `gap-3.5 px-4 pt-3.5 pb-6` (Live hub).

**Rules**

- Prefer `<ScreenBar>` over hand-rolled headers. Keep create tiles / filter chips in the **page body** under the bar (not `below=`), same as Score Card / Matches.
- FAB / primary create: ScreenBar `action` **or** first body row — not a second floating header.
- Empty: inside the body stack, `EmptyState` with `size="lg"` when the list is the whole page.
- No StickyActionBar unless the hub itself commits (rare).

**Anti-pattern:** Copying ScreenBar’s `px-3.5 py-2 tab:px-4 tab:pt-5` into a custom `<header>`.

---

### Type D — Wizard / multi-step

**When:** Create Tournament, Start Match (multi-block), Interest if stepped.

**Pick exactly one header model:**

| Model | Use when |
|---|---|
| **ScreenBar only** | Steps are short; subtitle shows “Step 2 of 3” |
| **Step chrome only** | Wizard owns progress UI; page does **not** also mount ScreenBar |

```tsx
<div className="bg-surface flex min-h-full flex-col">
  <ScreenBar title="Create Tournament" subtitle="Step 2 of 3 · Format" onBack={…} />

  <Form density="compact" className="px-4 pt-3.5 pb-4" …>
    …
  </Form>

  <StickyActionBar>
    <div className="flex gap-2">
      <Button variant="secondary" className="min-h-12 flex-1">Back</Button>
      <Button type="submit" form="…" className="min-h-12 flex-1">Continue</Button>
    </div>
  </StickyActionBar>
</div>
```

**Anti-pattern:** Page-level ScreenBar **plus** wizard “Step N of 3” header with its own `px-4` — double chrome.

---

### Type E — Standard detail

**When:** Product detail, Post detail (with ScreenBar), highlight detail, order detail, public profile (with ScreenBar).

```tsx
<div className="bg-surface flex min-h-full flex-col">
  <ScreenBar title="…" onBack={…} action={optional} />

  {/* Optional edge-to-edge media */}
  <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
    {/* content */}
  </div>

  {/* Optional commerce CTA */}
  <StickyActionBar>
    <Button className="min-h-12 w-full">Add to Cart</Button>
  </StickyActionBar>
</div>
```

**Thread + composer variant (Post detail):** comments body `px-4`; bottom composer uses the **same** sticky contract as StickyActionBar when BottomNav is visible (no extra safe-area). Prefer aligning `CommentComposer` sticky styles with StickyActionBar over inventing a third footer.

---

### Type F — Hero detail (no ScreenBar)

**When:** Public tournament cover, marketing-style detail with full-bleed hero.

```tsx
<div className="bg-surface flex min-h-full flex-col">
  <div className="relative">
    {/* cover h-[…] full bleed */}
    <button
      type="button"
      aria-label="Back"
      className="absolute inset-x-3.5 top-[max(14px,env(safe-area-inset-top))] …"
      onClick={…}
    />
  </div>

  <div className="px-4 pt-3.5 pb-6 flex flex-col gap-4">
    {/* title, tabs, panels */}
  </div>
</div>
```

**Rules:** Floating back is the only header chrome. Tabs/content return to `px-4`. Do not also mount ScreenBar.

---

### Type G — Profile shelf

**When:** You page, public profile tabs shelf.

- Header component (`ProfileHeader`) replaces ScreenBar.
- Tabs: `px-4`.
- Grid / shelves: `p-4` or `px-4 pt-4 pb-6`.
- No StickyActionBar (edit lives on a Type A/B subpage).

---

### Type H — Feed / home

**When:** Home feed with sticky tab strip.

- No ScreenBar.
- Sticky tabs: `px-4` (match body gutter).
- Post cards: full-bleed horizontal (edge borders), not inset cards unless design system says so.
- Optional `useShellRail` for desk rail content.
- Empty states: under the tab strip, `px-4 py-8` or full EmptyState.

---

### Type I — Immersive / bare

**When:** Reels, Match score pad, Live watch, Go-live on-air.

```tsx
<div className="bg-surface flex h-full min-h-0 flex-col">
  {/* custom chrome + safe-area top */}
  {/* body fills viewport */}
  {/* dock: pb-[max(Npx,env(safe-area-inset-bottom))] when BottomNav hidden */}
</div>
```

**Rules**

- Root is `h-full` / `h-[100dvh]` / `min-h-0` flex column — not `min-h-full` scroll document.
- Page **owns** safe-area top and bottom when shell chrome is absent or BottomNav is hidden.
- Do not use StickyActionBar unless the immersive surface intentionally mirrors shell forms (rare).
- Scoring pad docks and reel chrome follow feature-local patterns, but must stay consistent **within** that feature.

---

### Type J — Auth

**When:** Login, Register, OTP.

- Use `AuthShell` only — do not invent a page header.
- Forms: `Form density="compact"` inside AuthShell body.
- Primary CTA: AuthShell `action` prop (in-flow), **not** StickyActionBar.
- Gutters are owned by AuthShell (`px-6` phone body, card `sm:px-8 …`). Do not wrap again in `px-4`.

---

## 5. StickyActionBar contract

| Do | Don’t |
|---|---|
| Sibling of body inside `flex min-h-full flex-col` | Nest inside `Form` or any `px-*` wrapper |
| Let the bar own `px-4` | Pass `className="px-…"` or `-mx-4` |
| `min-h-12` primary buttons | Random heights per screen |
| Rely on BottomNav for home-indicator inset | Add `pb-[max(…,env(safe-area-inset-bottom))]` on shell pages |
| Use for Save / Submit / Continue / Checkout | Use for “View more” mid-page links |

**Dual actions:**

```tsx
<StickyActionBar>
  <div className="flex gap-2">
    <Button variant="secondary" className="min-h-12 flex-1">Discard</Button>
    <Button type="submit" form="…" className="min-h-12 flex-1">Save Changes</Button>
  </div>
</StickyActionBar>
```

**Status + CTA** (Quick Match / Start Match): helper text above buttons inside the same StickyActionBar — still one bar, one border.

Primitive: `shared/ui/StickyActionBar.tsx`.

---

## 6. ScreenBar contract

| Prop | Behaviour |
|---|---|
| `title` / `subtitle` | Title Case chrome — see copy casing doc |
| `onBack` | Required; button `tab:hidden` |
| `action` | Top-aligned with title (icons, text button, Post) |
| `below` | Tabs/filters stuck with title on phone; drops title bottom border |
| `sticky` | Default `true` on phone; forced static from `tab:` |

**Do not** re-implement ScreenBar padding/typography in feature code.

---

## 7. Empty / Error / Loading

| State | Placement | Classes |
|---|---|---|
| Loading (skeletons) | Under ScreenBar | `px-4 pt-4` or `px-4 py-6` |
| Loading (spinner block) | Under ScreenBar | Prefer local skeletons; `LoadingState` if used |
| Error | Under ScreenBar | Wrapper `px-4 py-8` + `<ErrorState />` |
| Empty (page) | Under ScreenBar / in hub body | `<EmptyState size="lg" />` inside `px-4` stack |
| Empty (tab pane) | Inside pane | `px-4 py-10` or EmptyState sm/md |

Do **not** double-pad: `ErrorState` already includes internal padding — the outer `px-4 py-8` is the page gutter/air, not a second copy of the state padding. Avoid wrapping ErrorState in yet another `px-6`.

---

## 8. Safe area cheat sheet

| Surface | Top | Bottom |
|---|---|---|
| Normal shell page | Shell TopBar | BottomNav owns inset — **StickyActionBar: none** |
| Bare + overlay BottomNav (reels phone) | Page chrome | BottomNav overlay owns inset |
| Bare + hide BottomNav (score, on-air) | Page chrome | Page dock must include `pb-[max(…,env(safe-area-inset-bottom))]` |
| AuthShell | AuthShell header | AuthShell body |
| Hero floating back | `top-[max(14px,env(safe-area-inset-top))]` | n/a |

---

## 9. Checklist (paste into PR)

- [ ] Page type declared (A–J)
- [ ] Root: `bg-surface flex min-h-full flex-col` (or Type I `h-full` / Type J AuthShell)
- [ ] Body gutter `px-4` only (no ad-hoc horizontal pad)
- [ ] Header: ScreenBar **or** documented exception (F/G/H/I/J)
- [ ] StickyActionBar sibling + `min-h-12` CTAs if committing
- [ ] No double header / double sticky footer
- [ ] Empty/Error under header with `px-4 py-8` wrapper when needed
- [ ] Safe area only if immersive / hide-nav
- [ ] Copy casing follows [APP_REACT_COPY_CASING.md](./APP_REACT_COPY_CASING.md)
- [ ] Form density: `compact` with sticky, `default` for multi-section edit

---

## 10. Known debt (fix toward this doc)

Track and burn down — do not copy these patterns into new screens:

1. ~~Hand-rolled hub headers (Matches / Tournaments)~~ → `ScreenBar` (create tiles in body)
2. ~~Create Tournament double chrome~~ → ScreenBar subtitle + progress `below`; wizard body only
3. ~~Create Post ScreenBar `action` commit~~ → `StickyActionBar`
4. ~~`CommentComposer` safe-area vs StickyActionBar~~ → sticky matches StickyActionBar when BottomNav visible
5. ~~`ListRow` `px-[15px]`~~ → `px-4 py-3`
6. Skill `reference.md` claiming SideNav at `sm:` → code uses `tab:` (this doc wins)
7. Immersive scoring / live watch still use feature-local `px-3.5` docks — keep consistent **within** Type I; do not copy onto normal shell pages
8. Feed home sticky tabs (Type H) — intentional non-ScreenBar; keep `px-4` gutter alignment
9. ~~Pass 2 shell hubs/forms~~ — Shop home/seller hubs, Start/Quick Match, Ranking, Go Live sticky CTA heights/gutters aligned to this scale
10. ~~Pass 3 remaining shell pages~~ — OrderSuccess/Workspace/Upcoming gutters; Broadcast Graphics sticky `min-h-12`; Product Detail `pb-4`; Create Reel StickyActionBar sibling; FanLiveDock sticky (no safe-area over BottomNav); Discover/PublicTournament roots; empty wrappers `px-4`

---

## 11. Quick map: type → shell → footer

| Type | Shell | Header | Body | Footer |
|---|---|---|---|---|
| A Subpage form | Normal | ScreenBar | `Form` compact `px-4 pt-3.5 pb-4` | StickyActionBar |
| B Multi-section edit | Normal | ScreenBar | `Form` default + `px-4` sections | StickyActionBar (dual) |
| C Hub / list | Normal | ScreenBar (± `below`) | `gap-5 px-4 pt-4 pb-6` | BottomNav only |
| D Wizard | Normal | ScreenBar **or** step chrome | compact `px-4` | StickyActionBar |
| E Detail | Normal | ScreenBar | `px-4` ± media | Optional StickyActionBar |
| F Hero detail | Normal | Floating back | Hero + `px-4` | None |
| G Profile shelf | Normal | ProfileHeader | Tabs `px-4` | None |
| H Feed / home | Normal | Sticky tabs | Full-bleed cards | None |
| I Immersive | Bare | Custom + safe-area | Full viewport | Own dock |
| J Auth | None | AuthShell | Auth gutters | AuthShell `action` |
