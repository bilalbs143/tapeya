# Desktop UI — least-change improvement plan

Reviewed live at **1440×900** (`wide`) against `http://localhost:5180` on 13 Nov 2026. Goal: improve **desk / wide** feel with **small, breakpoint-scoped** edits so phone (`< tab`) stays untouched.

Related: [APP_REACT_PAGE_LAYOUT.md](./APP_REACT_PAGE_LAYOUT.md) · `.cursor/skills/client-standards/SKILL.md`

---

## 1. How to change safely (non-negotiable)

| Do | Don’t |
|---|---|
| Prefer `desk:` / `wide:` (and existing `tab:` only when tablet already needs it) | Change base (mobile) classes unless fixing a shared bug |
| Prefer **one shared primitive** (`FormRow`, grid utility, shell) over per-page rewrites | Invent a second page shell or new max-width system per feature |
| Keep `PageDock` / `DockScreen` / document-scroll contracts | Nest sticky CTAs inside `px-*` form bodies |
| Ship shell fixes first (everyone benefits) | Rebuild page trees for “desktop mode” |

**Breakpoint reminder**

| Token | Width | What you already get |
|---|---|---|
| `tab` | 900 | SideNav + DesktopTopBar; ScreenBar large title; sheets → dialogs |
| `desk` | 1200 | Right rail `384px` |
| `wide` | 1440 | Right rail `424px`; SideNav labelled |

**Measured shell at 1440:** SideNav `312` + main ≈ `704` (`tab:max-w-[800px]`) + rail `424`. The main column is already narrower than the max-width cap once both sidebars are open — density wins come from **using that ~700px better**, not from adding more chrome.

---

## 2. Verdict by surface (what I saw)

### Shell (all authenticated pages)

| Observation | Severity | Least change |
|---|---|---|
| Right rail is viewport-height, always shows **Start Something** + **DeskMediaRail** + Help footer | Good (keep) | Polish only |
| **Score a Match** appears in DesktopTopBar **and** Start Something | Medium noise | Soften rail primary CTA on desk, or demote to text link when top bar already shows Score |
| SideNav **Shop / Score** CTA pair always looks “selected” (Shop styled as primary) even on Home / Matches / Ranking | Medium confusion | Restyle so neither reads as “current route”; keep active state only on real nav rows |
| **Get the App** card visually collides with last nav labels (e.g. Become a Seller) | High polish bug | SideNav-only: ensure scrollable `nav` never paints under sticky footer (`min-h-0`, clear separation / shadow / extra `pb`) |
| Duplicate Help/Support (SideNav Support + rail footer) | Low | Leave, or drop Support from one place later |

### Home (`/`) — document scroll

| Observation | Severity | Least change |
|---|---|---|
| Composer “Reel” + desk placeholder copy | Good | Done |
| Mid-column HomeRail hidden at desk (`tab:flex desk:hidden`); rail owns next match / gear | Good | Keep |
| Reels / products still phone-style HScroll bands | Low | Optional: slightly larger reel chips at `desk:` only |
| Feed post column already correct width | — | No change |

### List / hub pages

| Page | What stood out | Least change |
|---|---|---|
| **Shop** `/shop` | Popular / offers are **HScroll rails**; few items → empty feel beside cards | At `desk:`, prefer `ProductGrid` (`grid-cols-2 tab:grid-cols-3`) for rails with ≤6 items *or* bump rail card width only (`desk:w-40`) — no mobile class edits |
| **Matches** `/matches` | Start / Quick tiles 2-col already good; list rows read fine | Optional: status + CTA as `tab:grid` row so “Save Toss” doesn’t dominate height |
| **Tournaments** `/tournaments` | Sparse previous list; lots of dead vertical space | Empty/sparse: keep ScreenBar; optional desk empty illustration only |
| **Discover** `/discover` | Single-column people rows; Follow sits far right | `desk:grid desk:grid-cols-2` on the people list container only |
| **Ranking** `/ranking` | Leaderboard rows look intentional | Leave; optional denser `tab:text-*` already fine |
| **Notifications** `/notifications` | Short list + large empty column | Leave list; don’t invent cards |
| **Highlights** `/highlights` | `grid-cols-2 tab:grid-cols-3` but sparse data → left-heavy | Keep grid; with more data it’s fine. Optional `desk:gap-4` |
| **Entertainment** `/entertainment` | `grid-cols-3` always; one show → huge empty band | Keep 3-col; don’t force stretch. Optional caption under poster at `desk:` |
| **Live** `/live` | Empty state + busy right rail | Keep empty copy; don’t duplicate rail CTAs in body |

### Form pages

| Page | What stood out | Least change |
|---|---|---|
| **Create Post** `/create` | Full-bleed textarea + media rows feel very wide | Wrap body in `tab:max-w-[560px]` **or** leave width and use `FormRow` only for paired controls; keep StickyActionBar full column width |
| **Quick Match** `/quick-match` | Overs / players already pairable; rosters stack | Put Overs + Players in existing `FormRow` (`tab:grid-cols-2`) if not already; roster stacks stay 1-col on phone |
| **Create Tournament** `/tournaments/create` | Wizard details stretch; type / play-mode cards full width | `FormRow` for short fields (name / short name); keep type cards 1-col on phone, 2-col from `tab:` where already present |
| **Seller product / Go Live** | Gated / redirected in this session | Same recipe as other forms when opened: `Form` + `FormRow` + `StickyActionBar` |

### Profile / you (`/you`)

| Observation | Least change |
|---|---|
| Hero + empty reels state fine at desk | Optional: `desk:max-w-*` on action row only if Edit feels oversized |
| Reels grid already `grid-cols-3` | Leave |

---

## 3. Prioritized backlog (least code → most impact)

### P0 — shell polish (1–3 files, zero page risk)

1. **SideNav footer collision** — `SideNav.tsx`  
   - Keep `nav` as `flex-1 min-h-0 overflow-y-auto`.  
   - Add a hard visual separation before “Get the App” (border / padding) so last shop row never looks stacked on the promo card.  
   - Phone drawer is a different component → mobile untouched.

2. **Primary CTA clarity** — `ShellPrimaryCtas.tsx` / DesktopTopBar  
   - Shop + Score should read as **actions**, not as the active nav item.  
   - Prefer neutral secondary + one brand accent, not “Shop always selected.”

3. **Right-rail CTA redundancy** — `SideRail.tsx`  
   - At `desk:`, change “Score a Match” from giant green button to text / secondary if DesktopTopBar already shows the same CTA.  
   - One className branch; Start Something stays useful for Tournament / Top Players.

### P1 — shared form / list density (reuse primitives)

4. **Use `FormRow` on short paired fields** (`@/shared/ui/Form`)  
   - Targets: Quick Match overs/players, Create Tournament name/short name, seller price/stock pairs.  
   - Already `grid-cols-1 tab:grid-cols-2` → phone unchanged.

5. **People lists → 2 columns from desk**  
   - Discover (and optionally Suggested bands elsewhere):  
     `className="… desk:grid desk:grid-cols-2 desk:gap-x-3"` on the list wrapper.  
   - Rows stay the same component.

6. **Create Post width** — keep full column width (same as other dock forms). Do not add `desk:max-w-*`.

### P2 — shop / media fill (still small)

7. **Shop home rails at desk** — `ShopHomeBody` / `ProductRail`  
   - Least invasive: larger rail card width at `desk:` only.  
   - Slightly more work: if `products.length <= 6`, render `ProductGrid` instead of `HScroll` when `matchMedia` / CSS `desk:` wrapper with two markup branches — prefer CSS-only width bump first.

8. **Highlights / Entertainment gaps**  
   - Only if product wants denser catalogs: `desk:grid-cols-4` on media grids.  
   - Skip until catalogs are larger; sparse data looks worse with more columns.

### P3 — defer (more design / more risk)

- Widening main column (`wide:max-w-[920px]`) — shell change; re-check feed + every dock page.  
- Page-specific right-rail content beyond home (shop filters, match ops) — useful later, not “least change.”  
- Immersive surfaces (Reels, live watch, scoring pad) — own layouts; out of scope for this pass.

---

## 4. Page-type recipes (copy these)

### A. Form (DockScreen / PageDock)

```tsx
// Phone: single column. From tab: pair short fields.
<Form density="compact" className="px-4 pt-3.5 pb-4">
  <FormRow>
    <Field label="Overs">…</Field>
    <Field label="Players Per Side">…</Field>
  </FormRow>
  {/* long blocks stay full width */}
</Form>
```

Optional desk-only reading width:

```tsx
<div className="desk:max-w-[560px]">{/* fields */}</div>
```

Footer stays sibling `StickyActionBar` — full column.

### B. People / notification-style list

```tsx
<ul className="desk:grid desk:grid-cols-2">
  {items.map(…)}
</ul>
```

### C. Product / media catalog

```tsx
// Prefer existing tokens
<div className="grid grid-cols-2 gap-3 tab:grid-cols-3">{/* … */}</div>
// Only if catalogs are dense:
// desk:grid-cols-4
```

### D. Hub empty state

Keep centered empty copy in the main column. Do **not** duplicate Start Something CTAs in the body — the rail already owns them.

---

## 5. Explicit non-goals (protect mobile)

- No new phone breakpoints, no BottomNav changes.  
- No removing `px-4` page gutters.  
- No moving home to `PageDock`.  
- No restyling immersive players for desk in this pass.  
- No changing API / data density just to fill the rail.

---

## 6. Suggested ship order

| Sprint slice | Files (approx.) | User-visible win | Status |
|---|---|---|---|
| 1 | `SideNav.tsx`, `ShellPrimaryCtas.tsx` | Nav stops looking broken / confusing | Done |
| 2 | `SideRail.tsx` | Less CTA triple-repeat | Done |
| 3 | Quick Match + Create Tournament (`FormRow`); Create Post stays full width | Forms feel designed for desk | Done |
| 4 | Discover list grid | Lists use horizontal space | Done |
| 5 | Shop rail width / optional grid swap | Shop home less empty | Done (width bump only) |

---

## 7. Review checklist (per PR)

- [ ] Diff only adds `tab:` / `desk:` / `wide:` (or fixes a clear shared bug).  
- [ ] Phone screenshot unchanged for the same route.  
- [ ] Sticky CTA still full dock width.  
- [ ] Right rail still scrolls independently; Help footer still pinned.  
- [ ] No new hex / arbitrary `px-[Npx]` outside layout doc tokens.

---

## 8. Session notes (pages opened)

| Route | Reviewed |
|---|---|
| `/` | Yes — feed + rail |
| `/shop` | Yes |
| `/matches` | Yes |
| `/tournaments` | Yes |
| `/tournaments/create` | Yes — wizard step 1 |
| `/create` | Yes — create post |
| `/quick-match` | Yes |
| `/live` | Yes — empty hub |
| `/entertainment` | Yes — sparse grid |
| `/discover` | Yes |
| `/you` | Yes |
| `/ranking` | Yes |
| `/highlights` | Yes |
| `/notifications` | Yes |
| `/seller/products/new`, `/live/go-live` | Redirected / gated in this session — apply form recipe when accessible |

Viewport used: CDP `Emulation.setDeviceMetricsOverride` **1440×900**, not phone.
