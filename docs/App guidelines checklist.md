# App Guidelines Compliance Checklist

Use this with **docs/Coding guidelines.md** when preparing or updating the app. Items marked ✅ are done; others are recommended next steps.

---

## Done (preparation pass)

- **App.jsx** — JSDoc at top; import order: React Router → UI → components/layouts/pages (§28).
- **ShopCheckout.jsx** — Uses `selectUser` from `@/store/selectors` instead of inline selector (§2).
- **tournamentUtils.js** — Added `src/lib/utils/tournamentUtils.js` with `parseTournamentId` and `isValidTournamentId` (§7). Use in:
  - TournamentAddTeam, TournamentAddSquad, TournamentEditSquad, TournamentCreateTeamIntro, TournamentFinalSquad, TournamentSavedTeams, Tournaments
  - FixturesTab (both copies), SquadsTab, TeamsTab, UpcomingTournamentDetails, UpcomingTournaments

---

## JSDoc and file headers (§27, top-of-page docs)

- **Every component/page** has a top-of-file block that includes:
  - Component name and short description; for pages, the route (e.g. `Route: /scorecard/:tournamentId`).
  - **Coding guidelines: docs/Coding guidelines.md** so the guidelines are referenced in one place.
- **Existing files**: Many already have long block comments (CURSOR / FIXED / TODO). The guidelines reference line has been added to those; new files should use the same pattern.

---

## Selectors (§2)

- **Grep for**: `useAppSelector((s)` or `useAppSelector((state)`.
- **Replace with**: Named selectors from `@/store/selectors`. Add new selectors in `selectors.js` if needed.

---

## Constants (§9)

- Create under `src/lib/constants/` as needed:
  - `layout.js` — NAVBAR_HEIGHT, bottom nav height.
  - `search.js` — debounce ms, min search length.
  - `pagination.js` — page sizes.
  - `navigation.js` — MENU_ITEMS, CATEGORIES, etc.
  - `tableStyles.js` — BORDER, HEADER_BG.
  - `rankingColumns.js` — COLUMNS_*.
  - `images.js` — fallback image URLs.
- Replace magic numbers and repeated strings with named constants.

---

## Debounce (§10)

- Use `useDebounce` from `src/hooks/useDebounce.js`; remove any copy-pasted `setTimeout`/`clearTimeout` debounce in components.

---

## Shared utils (§13)

- Ensure icons live in `src/ui/icons/`.
- Ensure display/date/phone/player/team/tournament/scorecard/format helpers live in `src/lib/utils/*` as per the table in §13.

---

## Loading / error / empty (§5)

- Every data-fetching UI: handle loading, error, and empty; use `isSuccess` before showing empty state; use `…` (Unicode) in loading text.

---

## Navigation guard (§6)

- Redirects: use `useEffect` + `navigate()`, never `navigate()` during render.

---

## Keys (§16)

- No `key={index}` for lists that can reorder or are server-driven; use stable `id`.

---

## Accessibility (§14)

- `aria-label` only when there is no visible text; avoid `alt=""` + `aria-hidden`; use `focus-visible:outline-none` where needed; return focus on modal/sidebar close.

---

## Other quick checks

- **text:white** — Must be `text-white` (§17).
- **Forms** — react-hook-form + zodResolver; `onFocus={resetApiError}`; dates via `toApiDate()` (§12); layout via `FormStack` / `FormSection` / `FormActions` — see [FORM_LAYOUT_STANDARDS.md](./FORM_LAYOUT_STANDARDS.md) §10.
- **API errors** — `toast.error(getApiErrorMessage(err, 'Fallback'))`; never swallow in empty `catch` (§15, §26).
- **Placeholder / temp code** — Mark with `// TODO:` and describe what will replace it (§20).
- **Env / dev-only** — Gate with `import.meta.env.DEV` (§32).

When editing a file, skim the relevant guideline sections and this checklist so new code stays compliant.
