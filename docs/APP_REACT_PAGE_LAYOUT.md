# client page layout blueprint

**Source of truth** for how every screen sits inside the shell: gutters, gaps, headers, sticky CTAs, safe areas, empty/error placement.

If a page invents its own padding, hand-rolls a header, or sticks a CTA with different offsets, it is **wrong** — fix it to match this doc.

Related: [APP_REACT_COPY_CASING.md](./APP_REACT_COPY_CASING.md) · [APP_REACT_FORM_MIGRATION.md](./APP_REACT_FORM_MIGRATION.md) · `.cursor/skills/client-standards/SKILL.md`

---

## 1. Non-negotiable rules

1. **Shell owns chrome; pages own content.** `AppShell` does **not** add page gutters. Every page must apply the canonical gutters below.
2. **Pick the right page shell** (see §2):
   - **Docked** (most subpages): `DockScreen` or `PageDock` — fixed-height frame; middle pane scrolls.
   - **Document** (home feed only): grow with content; shell column scrolls.
   - **Immersive / auth:** bare shell or `AuthShell` — no `PageDock`.
3. **Prefer `DockScreen`** when the header is a plain `ScreenBar`. Use raw `PageDock` for custom headers (profile, hero, wizard progress) or when the page already owns `ScreenBar` props.
4. **One horizontal gutter for body content: `px-4`.** Do not mix `px-3`, `px-3.5`, `px-[15px]`, or `px-[18px]` in page bodies. (`px-3.5` is reserved for ScreenBar phone chrome and the desk rail.)
5. **Use `ScreenBar` for subpages.** Do not hand-roll back + title + border. Exception: first-class types that explicitly omit it (hero detail, feed home, profile shelf, immersive, auth).
6. **Use `StickyActionBar` for commit CTAs** — pass as `DockScreen` / `PageDock` `footer`. Sibling of the scroll body — never nested inside a `px-*` form. Never pass `-mx-*`.
7. **Safe area is not a page concern** when BottomNav (or shell chrome) already owns the bottom inset. StickyActionBar has **no** safe-area pad on normal shell pages (`edge` only when BottomNav is hidden). Immersive surfaces own their own insets.
8. **Empty / Error / Loading live under the header**, inside the dock body — never replace the whole shell. Keep one `PageDock` for the route; switch states as children.
9. **No double chrome.** One title row only (ScreenBar **or** step header — not both). One footer dock only.
10. **Tokens only.** No new hex, arbitrary `px-[Npx]` gutters, or one-off `pb-safe` utilities outside the patterns in this doc.
11. **Full-height ancestors.** If you wrap `PageDock` (e.g. in `Tabs`), the wrapper must be `h-full min-h-0` so the dock can resolve height. Prefer `PageDock` as the outermost page root when possible.

---

## 2. Shell modes (where the page lives)

| Mode | Route examples | What the page gets |
|---|---|---|
| **Normal** | Shop, tournaments, matches list/setup, profile, go-live form, support, CMS | TopBar / SideNav, `tab:max-w-[800px]`, optional desk rail, BottomNav (phone) |
| **Bare** | Reels, match score/toss, live watch / on-air | Full viewport; phone may overlay BottomNav; **no** max-width column; page owns height + safe areas |
| **Auth** | Login, Register, OTP | Outside `AppShell` — use `AuthShell` only |

**Hide BottomNav** (normal or bare) when:

- `/create` and children
- Operator scoring: `/matches/:id/(score|toss|settings|graphics)`
- Media players: `/live/broadcast/:id`, `/live/go-live/:id`, `/highlights/:id`, `/entertainment/:serialId/e/:episodeId`

Hub `/live`, form `/live/go-live`, `/highlights` list, and entertainment show pages **keep** BottomNav.

### Page scroll contracts (normal shell)

| Contract | Primitive | Who scrolls | Use for |
|---|---|---|---|
| **Dock-scroll** | `DockScreen` / `PageDock` (`body="scroll"`, default) | Middle pane (`data-page-scroll`) | Forms, lists, details, gates |
| **Dock-fill** | `PageDock body="fill"` | Children layout (`flex-1`); often no page scroll | Upload stages, success faces that pin a footer |
| **Document** | No `PageDock` | `ShellScrollport` | **Home feed only** |
| **Immersive** | Bare `AppShell` | Feature-owned | Reels, on-air, scoring pad |

`PageDock` registers with the shell (`pageDockStore`) so `AppShell` uses a fixed-height frame (`overflow-hidden` on the shell column). Route changes reset shell + `[data-scroll-to-top]` panes via `scrollShellToTop`.

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
| **Body bottom (scroll end, no footer)** | `pb-6` or `pb-8` | Prefer `pb-6` hubs; `pb-8` long lists |
| **Body bottom (before StickyActionBar)** | `pb-4` | Leaves air above the footer border |
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
┌─ ScreenBar (PageDock header — pinned) ─────────┐
│  px-3.5 py-2  ·  tab: px-4 pt-5 pb-4           │
├─ data-page-scroll (flex-1 overflow-y-auto) ────┤
│  Body: px-4 + pt-3.5|pt-4                      │
│  gaps: 3.5 (compact) · 5 (hub) · 6 (default)   │
│  pb-4 if footer follows · else pb-6|pb-8       │
├─ StickyActionBar (PageDock footer — pinned) ───┤
│  px-4 pt-3 pb-3  ·  no safe-area (normal)      │
└────────────────────────────────────────────────┘
         ↑ above BottomNav; keyboard pad on PageDock
```

---

## 4. Page types (pick one)

Every new or ported screen **must** declare its type in the PR/description and follow that blueprint exactly.

### Type A — Subpage form (most common)

**When:** Support, Interest, Go Live form, Seller store/apply/product, Checkout, Cart, Start Match, Quick Match, Match settings (content), etc.

```tsx
<DockScreen
  title="…"
  subtitle="…"
  onBack={() => navigate(…)}
  footer={
    <StickyActionBar>
      <Button type="submit" form="page-form" className="min-h-12 w-full">
        Save Changes
      </Button>
    </StickyActionBar>
  }
>
  <Form id="page-form" density="compact" className="px-4 pt-3.5 pb-4" onSubmit={…}>
    {/* fields — no outer px-* */}
  </Form>
</DockScreen>
```

**Rules**

- `footer={…}` is a **sibling** of the scroll body, not a child of `Form`.
- Loading / error: keep `DockScreen` / `PageDock`; swap **children** only:

  ```tsx
  <DockScreen title="…" onBack={…}>
    <div className="px-4 py-8">
      <ErrorState title="…" onRetry={…} />
    </div>
  </DockScreen>
  ```

**Reference:** `features/shop/pages/CartPage.tsx`, `features/support/ui/SupportFormBody.tsx`

---

### Type B — Multi-section edit form

**When:** Edit Profile (grouped sections, optional full-bleed media).

```tsx
<DockScreen title="Edit Profile" onBack={…} footer={<StickyActionBar>…</StickyActionBar>}>
  {/* Optional full-bleed media — no px */}
  <div className="…cover…">{/* edge to edge */}</div>

  <Form density="default" className="pb-4" …>
    <div className="flex flex-col gap-6 px-4 pt-4">
      {/* sections */}
    </div>
  </Form>
</DockScreen>
```

**Rules:** Full-bleed media may break out of `px-4`. Field blocks always return to `px-4`. Footer still owns its own `px-4`.

**Reference:** `features/profile/pages/EditProfilePage.tsx`

---

### Type C — Hub / list

**When:** Matches list, Tournaments list, Live hub, Shop home, Notifications, Rankings, Highlights list, Serials list.

```tsx
<DockScreen title="…" subtitle="…" onBack={…}>
  <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
    {/* sections / cards / EmptyState */}
  </div>
</DockScreen>
```

**Dense hub variant:** `gap-3.5 px-4 pt-3.5 pb-6` (Live hub).

**Rules**

- Prefer `<ScreenBar>` / `DockScreen` over hand-rolled headers. Keep create tiles / filter chips in the **page body** under the bar (not `below=`), same as Score Card / Matches.
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
| **ScreenBar only** | Steps are short; subtitle shows “Step 2 of 3”; progress via `below=` |
| **Step chrome only** | Wizard owns progress UI; page does **not** also mount ScreenBar |

```tsx
<PageDock
  header={<ScreenBar title="Create Tournament" subtitle="Step 2 of 3 · Format" onBack={…} below={…} />}
  footer={
    <StickyActionBar>
      <div className="flex gap-2">
        <Button variant="secondary" className="min-h-12 flex-1">Back</Button>
        <Button type="submit" form="…" className="min-h-12 flex-1">Continue</Button>
      </div>
    </StickyActionBar>
  }
>
  <Form density="compact" className="px-4 pt-3.5 pb-4" …>
    …
  </Form>
</PageDock>
```

Keep success / loading inside the **same** `PageDock` (switch children / footer) so chrome does not unmount.

**Anti-pattern:** Page-level ScreenBar **plus** wizard “Step N of 3” header with its own `px-4` — double chrome.

---

### Type E — Standard detail

**When:** Product detail, Post detail (with ScreenBar), highlight detail, order detail, public profile (with ScreenBar).

```tsx
<DockScreen title="…" onBack={…} action={optional} footer={optionalCommerceFooter}>
  {/* Optional edge-to-edge media */}
  <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
    {/* content */}
  </div>
</DockScreen>
```

**Thread + composer variant (Post detail):** comments body `px-4`; bottom composer uses the **same** footer contract as StickyActionBar when BottomNav is visible (no extra safe-area). Prefer aligning `CommentComposer` with StickyActionBar over inventing a third footer.

---

### Type F — Hero detail (no ScreenBar)

**When:** Public tournament cover, marketing-style detail with full-bleed hero.

```tsx
<PageDock header={<HeroWithFloatingBack … />}>
  <div className="flex flex-col gap-4 px-4 pt-3.5 pb-6">
    {/* title, tabs, panels */}
  </div>
</PageDock>
```

**Rules:** Floating back is the only header chrome. Tabs/content return to `px-4`. Do not also mount ScreenBar.

---

### Type G — Profile shelf

**When:** You page, public profile tabs shelf.

- Header component (`ProfileHeader`) replaces ScreenBar — usually in `PageDock` `header` (pinned) or scroll body.
- If `Tabs` wraps `PageDock`, give `Tabs` `className="flex h-full min-h-0 flex-col"`.
- Tabs triggers: `px-4` on the strip wrapper.
- Grid / shelves: `p-4` or `px-4 pt-4 pb-6`.
- No StickyActionBar (edit lives on a Type A/B subpage).

---

### Type H — Feed / home

**When:** Home feed with sticky tab strip.

- **No `PageDock`** — document scroll in the shell column.
- Root: `bg-surface flex min-h-full flex-col`.
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

Name is historical — on docked pages it is a **pinned footer**, not CSS `position: sticky`. Keyboard lift is owned by `PageDock` (`paddingBottom` from `--keyboard-inset`), not the bar.

**Native keyboard:** WebView full height; JS pads via `--keyboard-inset`. iOS: `Keyboard.resize: 'none'`. Android: `adjustNothing` + `SystemBars.insetsHandling: 'disable'` (avoids Cap 8 double IME pad / white gap). No `resizeOnFullScreen`.

| Do | Don’t |
|---|---|
| Pass as `DockScreen` / `PageDock` `footer` | Nest inside `Form` or any `px-*` wrapper |
| Let the bar own `px-4` | Pass `className="px-…"` or `-mx-4` |
| `min-h-12` primary buttons | Random heights per screen |
| Rely on BottomNav for home-indicator inset | Add `pb-[max(…,env(safe-area-inset-bottom))]` on normal shell pages |
| Use `edge` only when BottomNav is hidden | Use for “View more” mid-page links |

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
| `sticky` | **Default off.** Prefer `PageDock` header for pinned chrome. Opt in only for non-dock scroll columns (legacy / media). |

**Do not** re-implement ScreenBar padding/typography in feature code.

Tap title → `scrollShellToTop` (shell + page scroll panes).

---

## 7. Empty / Error / Loading

| State | Placement | Classes |
|---|---|---|
| Loading (skeletons) | Under ScreenBar / in dock body | `px-4 pt-4` or `px-4 py-6` |
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
- [ ] Root: `DockScreen` / `PageDock` (or Type H document / Type I `h-full` / Type J AuthShell)
- [ ] Body gutter `px-4` only (no ad-hoc horizontal pad)
- [ ] Header: ScreenBar **or** documented exception (F/G/H/I/J)
- [ ] StickyActionBar via `footer` + `min-h-12` CTAs if committing
- [ ] No double header / double footer; one dock per route
- [ ] Empty/Error under header with `px-4 py-8` wrapper when needed
- [ ] Safe area only if immersive / hide-nav
- [ ] Copy casing follows [APP_REACT_COPY_CASING.md](./APP_REACT_COPY_CASING.md)
- [ ] Form density: `compact` with footer CTA, `default` for multi-section edit

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
9. ~~Pass 2–3 shell hubs/forms~~ — gutters / StickyActionBar heights aligned
10. ~~Layout root~~ — docked pages use `PageDock` / `DockScreen` (not hand-rolled `min-h-full` + CSS sticky)

---

## 11. Quick map: type → shell → footer

| Type | Shell | Header | Body | Footer |
|---|---|---|---|---|
| A Subpage form | Normal + dock | `DockScreen` / ScreenBar | `Form` compact `px-4 pt-3.5 pb-4` | StickyActionBar (`footer`) |
| B Multi-section edit | Normal + dock | `DockScreen` | `Form` default + `px-4` sections | StickyActionBar dual |
| C Hub / list | Normal + dock | `DockScreen` (± `below`) | `gap-5 px-4 pt-4 pb-6` | BottomNav only |
| D Wizard | Normal + dock | ScreenBar **or** step chrome | compact `px-4` | StickyActionBar |
| E Detail | Normal + dock | `DockScreen` | `px-4` ± media | Optional StickyActionBar |
| F Hero detail | Normal + dock | Floating back | Hero + `px-4` | None |
| G Profile shelf | Normal + dock | ProfileHeader | Tabs `px-4` | None |
| H Feed / home | Normal **document** | Sticky tabs | Full-bleed cards | None |
| I Immersive | Bare | Custom + safe-area | Full viewport | Own dock |
| J Auth | None | AuthShell | Auth gutters | AuthShell `action` |
