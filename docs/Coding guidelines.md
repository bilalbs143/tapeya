# Coding Guidelines

Derived from the Tapeya codebase. Follow these rules for all new and modified files.

---

## 1. File & Export Conventions

- **Page-level components** use `export default function`. Utility components (Navbar, Sidebar, HeroSlider, etc.) use named exports.
- **One component per file.** Co-locate small sub-components only if they are never used elsewhere and won't grow. Add a `// CURSOR: move to ...` comment when they should be extracted.
- **File names** match the exported component name exactly: `TournamentAddTeam.jsx` exports `TournamentAddTeam`.

---

## 2. Selectors & Store Access

- Always use **typed selectors** from `@/store/selectors`. Never write inline selector functions in components.

```js
// ✅
const user = useAppSelector(selectUser);

// ❌
const user = useAppSelector((s) => s.auth?.user);
```

- Use `useAppDispatch` (not `useDispatch`) everywhere.

---

## 3. Styling — Tailwind Only

- Use **Tailwind utility classes** for all layout and styling. No inline `style` objects for values that have a Tailwind equivalent.

```jsx
// ✅
<div className="h-[78px] w-[78px] rounded-[17px]" />

// ❌
<div style={{ height: 78, width: 78, borderRadius: 17 }} />
```

- Exception: intentional cross-browser hacks (e.g. `WebkitAppearance`) may use inline style. Add a comment explaining why.
- **Never mix** `text-base` and `text-[13px]` on the same element. One source of truth for font size per element.

---

## 4. Navigation — React Router Only

- Use `<Link>` and `navigate()` for all in-app navigation. Never use `<a href>` for internal routes.

```jsx
// ✅
<Link to="/home">...</Link>

// ❌
<a href="/home">...</a>
```

- Back buttons always use `navigate(-1)` unless there is an explicit documented reason to hardcode a path.

---

## 5. Loading & Error States

- Every data-fetching component must handle **all three states**: loading, error, and empty.
- Use `isSuccess` to gate the empty state so it doesn't flash before the request completes.

```jsx
{isLoading && <p>Loading…</p>}
{isError && <p className="text-red-400">Failed to load.</p>}
{!isLoading && isSuccess && items.length === 0 && <p>No items yet.</p>}
```

- Use Unicode ellipsis `…` not ASCII `...` in loading strings.

---

## 6. Navigation Guard Pattern

- Use `useEffect` for redirect side effects. **Never call `navigate()` during render.**

```jsx
// ✅
useEffect(() => {
  if (!isValidId) navigate('/organizer/tournaments', { replace: true });
}, [isValidId, navigate]);
if (!isValidId) return null;

// ❌
if (!isValidId) {
  navigate('/organizer/tournaments', { replace: true });
  return null;
}
```

---

## 7. Repeated ID Validation

- The `parseTournamentId` pattern appears across 6+ files. Once extracted, always import from `@/lib/utils/tournamentUtils`:

```js
// Target shape (extract and use):
export function parseTournamentId(paramStr, fallbackId) {
  const num = paramStr != null && paramStr !== '' ? Number(paramStr) : fallbackId;
  return Number.isInteger(num) && num > 0 ? num : null;
}
```

- Similarly for `isValidTournamentId` used in tab components.

---

## 8. Early Returns & Shared UI

- When the same markup appears in 3+ early-return branches, extract it to a variable or wrapper:

```jsx
// ✅
const wrap = (children) => <div className="mt-4 pb-6">{children}</div>;
if (!id) return wrap(<p>Select a tournament.</p>);
if (isLoading) return wrap(<p>Loading…</p>);

// ❌ (copy-pasted wrapper in every branch)
if (!id) return <div className="mt-4 pb-6"><p>Select a tournament.</p></div>;
if (isLoading) return <div className="mt-4 pb-6"><p>Loading…</p></div>;
```

---

## 9. Constants & Magic Numbers

- Named constants for all magic numbers and repeated strings. Destination files:

| Constant type | File |
|---|---|
| Layout heights (navbar, bottom nav) | `src/lib/constants/layout.js` |
| Search config (debounce, min length) | `src/lib/constants/search.js` |
| Pagination sizes | `src/lib/constants/pagination.js` |
| Navigation items (MENU_ITEMS, CATEGORIES, ITEMS) | `src/lib/constants/navigation.js` |
| Table/border styles (BORDER, HEADER_BG) | `src/lib/constants/tableStyles.js` |
| Column definitions (COLUMNS_*) | `src/lib/constants/rankingColumns.js` |
| Fallback image URLs | `src/lib/constants/images.js` |

---

## 10. Debounce — Use the Hook

- Never copy-paste the `useEffect` + `setTimeout` + `clearTimeout` debounce pattern. Use the shared hook:

```js
// ✅
const debouncedSearch = useDebounce(searchTerm, DEBOUNCE_MS);

// ❌ (copy-pasted in TournamentAddTeam, TournamentEditSquad, ShopSearchPopover…)
useEffect(() => {
  const t = setTimeout(() => setDebounced(value), 300);
  return () => clearTimeout(t);
}, [value]);
```

Hook lives at: `src/hooks/useDebounce.js`

---

## 11. Derived State

- State that can be computed from other state must not use `useState` + `useEffect`. Derive it directly.

```js
// ✅
const isOpen = searchTerm.trim().length >= MIN_SEARCH_LENGTH;

// ❌
const [isOpen, setIsOpen] = useState(false);
useEffect(() => { setIsOpen(searchTerm.trim().length >= MIN_SEARCH_LENGTH); }, [searchTerm]);
```

---

## 12. Forms

- Use `react-hook-form` + `zodResolver` for all forms. Do not manage form fields with individual `useState` calls.
- Reset the RTK Query mutation error on form focus: `onFocus={resetApiError}` (not `onFocus={() => resetApiError()}`).
- Date/picker fields: convert MM-DD-YYYY → YYYY-MM-DD before sending to the API via `toApiDate()` in `src/lib/utils/dateUtils.js`.

---

## 13. Shared Icons & Utils

Extract to the correct location instead of defining inline:

| Thing | Destination |
|---|---|
| `CloseIcon`, `ChevronLeft`, `ChevronDown`, `ThumbsUpIcon`, `ThumbsDownIcon` | `src/ui/icons/` |
| `getInitials`, `formatNum`, `formatDecimal` | `src/lib/utils/displayUtils.js` |
| `formatPhoneMasked`, `formatPhoneFull` | `src/lib/utils/phoneUtils.js` |
| `toDateStr`, `parseDate`, `toApiDate`, `formatAge` | `src/lib/utils/dateUtils.js` |
| `playerDisplayRole` | `src/lib/utils/playerUtils.js` |
| `getTeamDisplayMeta` (teamDisplay) | `src/lib/utils/teamUtils.js` |
| `parseTournamentId`, `getTournamentTitle`, `isValidTournamentId` | `src/lib/utils/tournamentUtils.js` |
| `normaliseTournamentMatches`, `normaliseMatchStatus` | `src/lib/utils/scorecardUtils.js` |
| `formatCount` | `src/lib/utils/formatUtils.js` |

---

## 14. Accessibility Rules

- `aria-label` on a link/button is **only needed when there is no visible text**. If the element has a visible text child, remove the `aria-label`.
- `alt=""` alone marks an image decorative. Do not also add `aria-hidden` — they are redundant together.
- `focus:outline-none` on tab panels harms keyboard navigation. Use `focus-visible:outline-none` instead.
- Dead `<button>` elements (no `onClick`, no `href`) must be either wired up, disabled, or marked with a `// TODO` explaining the planned action.
- When a sidebar/modal closes, return focus to the element that triggered it — not the backdrop.

---

## 15. API Responses

- Always unwrap with `result?.data ?? result` until the API normalises via RTK Query `transformResponse`. Add a `// TODO` to remove this once normalised.
- Surface all API errors to the user via `toast.error(getApiErrorMessage(err, 'Fallback message.'))`. Do not silently swallow non-validation errors.
- After a mutation succeeds, invalidate the relevant cache tag or optimistically update state — don't rely on the next background refetch.

---

## 16. Key Props

- Never use array index as a React `key` when items can be reordered or the list is server-driven. Use a stable `id` field.

```jsx
// ✅
teams.map((team) => <TeamCard key={team.id} ... />)

// ❌
teams.map((team, index) => <TeamCard key={index} ... />)
```

---

## 17. `text:white` Typo

This has appeared multiple times. It is always wrong. The correct class is `text-white`.

```jsx
// ✅  className="text-white"
// ❌  className="text:white"
```

---

## 18. Memo & Performance

- Wrap list-item components in `React.memo` when they appear in large scrollable lists (e.g. `ListingProductCard`).
- Always set `displayName` on memoised components for DevTools readability.
- Move `toBatterCard` / `toOtherCard` style transform functions **outside** the component body so they are not recreated on every render.

---

## 19. Custom Tailwind Classes & Animations

When using a bare string class that has no import (e.g. `hero-swiper`, `animate-badge-pop`), add a comment stating where it is defined:

```jsx
// `hero-swiper` controls pagination dot styles.
// Defined in: src/index.css (or src/styles/swiper.css)
<Swiper className="hero-swiper" />
```

---

## 20. Placeholder Data & Temporary Workarounds

Mark all temporary code explicitly so it is not left in production:

```js
// TODO: remove isPlaceholderRoute once all routes supply real numeric IDs.
const isPlaceholderRoute = String(tournamentId).startsWith('placeholder-');

// TODO: replace MOCK_MATCHES with useGetMatchQuery(matchId) once endpoint is ready.
```

Hardcoded season strings (`2026 - SEASON 3`), Unsplash fallback URLs, and `70% Complete` progress bars all need the same treatment.

---

## 21. Component Responsibility — Single Purpose

- Each component does **one thing**. If a component fetches data, renders a list, handles pagination, and manages a modal, split it.
- The rule of thumb: if you need to scroll more than one screen to read a component, it needs to be broken up.
- Page components own data fetching and state. Presentational components receive props and render — no API calls inside cards, rows, or icon components.

```jsx
// ✅ Page fetches, card renders
function TeamsPage() {
  const { data: teams } = useGetTeamsQuery();
  return teams.map((t) => <TeamCard key={t.id} team={t} />);
}

// ❌ Card fetches its own data
function TeamCard({ teamId }) {
  const { data } = useGetTeamQuery(teamId); // wrong layer
}
```

---

## 22. Props — Keep Interfaces Narrow

- Pass only what the component needs. Avoid spreading entire objects as props.
- Boolean props use implicit `true`: `<Button disabled />` not `<Button disabled={true} />`.
- Callback props are named `on<Event>`: `onClose`, `onSubmit`, `onRemove` — never `handleClose` as a prop name.

```jsx
// ✅
<TeamCard name={team.name} logo={team.logo} onRemove={handleRemove} />

// ❌
<TeamCard team={team} handlers={handlers} />
```

---

## 23. Conditional Rendering

- Prefer ternary or `&&` for simple conditions. Use early returns for complex multi-branch logic.
- Never nest ternaries more than one level deep — extract to a variable or sub-component.

```jsx
// ✅
const content = isLoading ? <Spinner /> : <List items={items} />;
return <div>{content}</div>;

// ❌
return (
  <div>
    {isLoading ? <Spinner /> : hasError ? <Error /> : items.length ? <List /> : <Empty />}
  </div>
);
```

- Avoid `&&` with non-boolean left-hand values — `count && <Badge>` renders `0` when count is 0. Use `count > 0 &&` or a ternary.

```jsx
// ✅
{count > 0 && <Badge>{count}</Badge>}

// ❌
{count && <Badge>{count}</Badge>}  // renders "0" when count === 0
```

---

## 24. useEffect — Rules & Discipline

- Every `useEffect` must have a clearly named cleanup if it registers a listener, timer, or subscription.
- Never put a function call in a dependency array that is recreated every render — wrap it in `useCallback` first or move it outside the component.
- Split effects by concern — one `useEffect` per side effect, not one giant effect doing five things.
- If an effect has no dependencies (`[]`), add a comment explaining why it should only run once.

```js
// ✅
useEffect(() => {
  // Intentional: register scroll listener once on mount.
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

---

## 25. useMemo & useCallback — When to Use

- `useMemo` for **expensive computations** or when a value is passed to a child wrapped in `React.memo`.
- `useCallback` for **callback props** passed to memoised children, or used as a `useEffect` dependency.
- Do not wrap every value in `useMemo` — premature memoisation adds overhead and noise.

```js
// ✅ — large list sort that runs on every render
const sorted = useMemo(() => items.sort(compareFn), [items]);

// ❌ — trivial derivation that doesn't need memoisation
const label = useMemo(() => `Hello ${name}`, [name]);
```

---

## 26. Async / Error Handling

- All `async` functions must have a `try/catch`. Never `await` without handling the rejection.
- Always call `.unwrap()` on RTK Query mutations so errors are catchable:

```js
// ✅
try {
  await updateProfile(payload).unwrap();
} catch (err) {
  toast.error(getApiErrorMessage(err, 'Failed to save.'));
}

// ❌
await updateProfile(payload); // rejects silently if the mutation fails
```

- `console.error` is acceptable for development logging inside catch blocks. Do not use `console.log` in production paths.

---

## 27. TypeScript / PropTypes Mindset (JS Projects)

Even though the project uses JavaScript, write as if TypeScript is coming:

- Document non-obvious prop shapes with JSDoc:
  ```js
  /** @param {{ id: number, name: string, logo: string | null }} team */
  function TeamCard({ team }) { ... }
  ```
- Validate external data at the boundary (API response). Use optional chaining + nullish coalescing everywhere below that.
- Avoid `any`-equivalent patterns like spreading unknown objects directly into JSX.

---

## 28. Imports — Order & Aliases

Always use the `@/` alias for project imports. Group and order imports as follows, with a blank line between each group:

```js
// 1. React and hooks
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// 3. React Router
import { Link, useNavigate } from 'react-router-dom';

// 4. Assets (images, SVGs)
import logo from '@/assets/images/logos/tapeya-logo.svg';

// 5. Internal — lib (utils, validations, constants)
import { formatPrice } from '@/lib/format';

// 6. Internal — store (API hooks, selectors, slices)
import { useGetTeamsQuery } from '@/store/api/teamApi';
import { selectUser } from '@/store/selectors';

// 7. Internal — UI components
import { Button } from '@/ui/Button';

// 8. Internal — feature components (relative imports)
import { TeamCard } from './TeamCard';
```

---

## 29. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `TournamentCard` |
| Hooks | camelCase prefixed `use` | `useDebounce`, `useFixedOnScroll` |
| Utils / helpers | camelCase | `formatPrice`, `parseTournamentId` |
| Constants | SCREAMING_SNAKE_CASE | `PAGE_SIZE`, `DEBOUNCE_MS` |
| Event handlers (internal) | `handle` prefix | `handleSubmit`, `handleDelete` |
| Callback props (external) | `on` prefix | `onClose`, `onRemove` |
| Boolean variables | `is`/`has`/`can`/`should` prefix | `isLoading`, `hasError`, `canSubmit` |
| RTK Query hooks | generated names | `useGetTeamsQuery`, `useUpdateProfileMutation` |

---

## 30. Comments — What to Comment and How

- **Comment the why, not the what.** Code explains what; comments explain intent, constraints, and non-obvious decisions.
- Use `// TODO:` for planned work with a description of what needs to happen.
- Use `// CURSOR:` for extraction/refactor instructions aimed at AI-assisted editing.
- Use `// Fixed:` inside changed code to explain what was wrong and why it was changed.
- Do not comment self-explanatory code:

```js
// ❌ — obvious
// Set loading to true
setIsLoading(true);

// ✅ — explains a non-obvious constraint
// Must remain at module level — cannot be inside the component or it
// gets reverted on unmount (see ScrollRestoration.jsx for context).
window.history.scrollRestoration = 'manual';
```

---

## 31. No Orphan Interactivity

Every interactive element must do something. If a feature is not implemented yet:

1. Make the element `disabled` with a visual indicator, **or**
2. Render it as a non-interactive element (`<div>` / `<span>`), **or**
3. Add a `// TODO:` comment explaining the planned action.

Never leave a `<button type="button" onClick={() => {}} />` or `<button>` with no handler in committed code.

---

## 32. Environment & Feature Flags

- Development-only UI (OTP hints, debug panels, mock data banners) must be gated behind `import.meta.env.DEV`:

```jsx
// ✅
{import.meta.env.DEV && latestOtp && (
  <p>For testing: OTP is {latestOtp}</p>
)}

// ❌ — ships to production
{latestOtp && <p>For testing: OTP is {latestOtp}</p>}
```

- Hardcoded strings that will change (season labels, API base URLs, image CDN paths) belong in environment variables or constants files — never inline in JSX.

---

## 33. Folder Structure Rules

Keep features self-contained. When a component, hook, or util is used by more than one feature, promote it to the shared layer:

```
src/
  assets/           # images, SVGs, fonts
  components/       # shared cross-feature components
  features/
    auth/
      components/   # LoginPhoneForm, ProfilePicker, ProfileCard
      hooks/        # useProfileLogin
    teams/
      components/   # TeamCard, TeamLogoIcon, TeamRow
    tournaments/
      components/   # FixtureCard, SquadTeams, SquadSingle
    ranking/
      components/   # PlayerCard, RankingSection, StatsTable
    scorecard/
      components/   # MatchHeader, TeamFlag, WinProbabilityCard
    notifications/
      components/   # NotificationCard
  hooks/            # useDebounce, useFixedOnScroll
  lib/
    constants/      # layout, search, navigation, images, tableStyles
    utils/          # dateUtils, displayUtils, teamUtils, tournamentUtils…
    validations/    # Zod schemas
    format.js       # formatPrice, formatDate, formatDateRange
    apiErrors.js    # getApiErrorMessage
  pages/            # route-level page components
  store/
    api/            # RTK Query endpoints
    selectors.js    # all named selectors
    slices/         # Redux slices
  ui/               # design system (Button, Input, Select, Avatar…)
    icons/          # CloseIcon, ChevronLeft, ThumbsUpIcon…
```

New files go in the most specific folder that makes sense. If they need to be shared, promote upward — never reach down into a feature from another feature.

---

## 34. Avoid These Patterns

A quick blacklist of things that have caused real bugs or tech debt in this codebase:

| Pattern | Why | Alternative |
|---|---|---|
| `<a href="/internal">` | Full page reload | `<Link to="/internal">` |
| `navigate()` during render | React warning, state corruption | `useEffect(() => navigate(...), [])` |
| `useState` + `useEffect` for derived values | Stale state, extra renders | Compute inline |
| `index` as React `key` | Broken reconciliation on reorder | Stable `id` field |
| `text:white` | Invalid Tailwind class, invisible | `text-white` |
| `aria-label` duplicating visible text | Fragile, diverges on label change | Remove `aria-label`, let text be the name |
| `alt=""` + `aria-hidden` together | Redundant | `alt=""` alone |
| `focus:outline-none` on tab panels | Removes keyboard focus indicator | `focus-visible:outline-none` |
| Inline selector `useAppSelector(s => s.auth.x)` | Not typed, duplicated | Named selector in `selectors.js` |
| `onClick={() => fn()}` when `onClick={fn}` works | New reference every render | `onClick={fn}` directly |
| Magic numbers inline | Undocumented, hard to change | Named constant |
| Silently swallowing API errors in `catch {}` | User sees nothing, bug is hidden | `toast.error(getApiErrorMessage(...))` |