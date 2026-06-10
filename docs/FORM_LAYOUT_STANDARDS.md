# Form Layout Standards

Single source of truth for form spacing, layout primitives, and migration targets across the Tapeya app (`app/src`).

**Status:** Migration complete (Phases 0–5). Use §10 PR checklist for new form work.  
**Last updated:** 2026-06-08

---

## 1. Executive summary

Form spacing is standardized across pages, dialogs, and scoring modals via shared layout primitives in `app/src/ui/form/`.

**Canonical patterns:**
- **Page / data-entry dialogs:** `FormStack` + `FormField` + `Input`/`Textarea`/`PhoneInput` — default `gap-6` (24px) between fields; `gap-4` (16px) for compact auth/dialog flows.
- **Scoring picker dialogs:** `FormStack density="compact"` + `DialogFormSection` for section labels and control offsets.
- **Filter popovers / sheet search:** `FormField` + `Input` tokens inside `FormStack density="compact"` (filter bars remain out of scope for full page-form rhythm).

Reference implementations: `TournamentRequest.jsx` (page), `UserEdit.jsx` (dialog), `WideBallDialog.jsx` (scoring picker).

---

## 2. Spacing token reference

| Token | Tailwind | px | Usage |
|-------|----------|-----|-------|
| **Field internal** | `gap-2` | 8px | Label → control (within one field) |
| **Control → error** | `gap-1` | 4px | Input wrapper to validation message |
| **Field stack (default)** | `gap-6` / `space-y-6` | 24px | Between fields in data-entry forms |
| **Field stack (compact)** | `gap-4` / `space-y-4` | 16px | Auth flows, 2–3 field dialogs |
| **Section gap** | `gap-8` / `space-y-8` | 32px | Between titled form sections |
| **Section divider** | `border-t border-[#FFFFFF14] pt-6` | — | Visual break inside long forms |
| **Grid (desktop)** | `lg:grid-cols-3 lg:gap-6` | 24px | Wide page forms (3-col) |
| **Grid (2-col)** | `lg:grid-cols-2 lg:gap-x-6 lg:gap-y-6` | 24px | Interest form, StartMatch pairs |
| **Toggle / chip row** | `gap-2` | 8px | ToggleGroup, pill selectors |
| **Card / option row** | `gap-3` | 12px | Team cards, radio card lists |
| **Actions row** | `gap-3 pt-2` | 12px + 8px top | Submit / cancel button groups |
| **Dialog body padding** | `px-5 py-4` | — | `DialogScrollBody` default |
| **Sheet body padding** | `px-4 py-4` | — | `BottomSheet` default |

### Typography tokens

| Element | Classes |
|---------|---------|
| Field label | `text-[14px] text-muted` |
| Required asterisk | `text-red-300` |
| Validation error | `text-sm text-red-200` |
| Helper / hint text | `text-[12px] text-muted` |
| Scoring section label | `text-[13px] font-medium text-white` |
| Scoring validation | `text-sm text-red-200 mt-1` (unify from current `text-red-400` variants) |

### Control tokens

| Element | Classes |
|---------|---------|
| Text input height | `h-12` |
| Input padding | `px-4 py-3` |
| Input radius | `rounded-[6px]` |
| Input background | `bg-surface` |
| Textarea min height | `min-h-[144px]` |
| Focus ring | `focus:ring-2 focus:ring-[#FF9700]/50` |

---

## 3. Target architecture

### 3.1 New shared components (`app/src/ui/form/`)

```
ui/form/
  FormStack.jsx       # Vertical field list — replaces ad-hoc space-y-* / gap-*
  FormSection.jsx     # Optional title + divider + FormStack
  FormActions.jsx     # Submit / secondary button row
  DialogFormSection.jsx  # Scoring dialog section label + control offset
```

Class strings live in `lib/constants/formLayout.js` (single source of truth).

#### `FormStack`

```jsx
// density: 'default' (gap-6) | 'compact' (gap-4)
// layout: 'stack' | 'grid-2' | 'grid-3'
<FormStack density="default" layout="grid-3" className="pb-8">
  <FormField …><Input … /></FormField>
  …
  <FormActions>…</FormActions>
</FormStack>
```

Responsive behavior built in:
- `layout="grid-3"`: single column mobile → `lg:grid-cols-3 lg:gap-6 lg:space-y-0`
- `layout="grid-2"`: single column mobile → `lg:grid-cols-2 lg:gap-x-6 lg:gap-y-6`

#### `FormSection`

```jsx
<FormSection title="Personal Details" divider>
  …fields…
</FormSection>
```

Uses `gap-8` between sections; divider: `border-t border-[#FFFFFF14] pt-6`.

#### `FormActions`

```jsx
<FormActions align="start">  {/* start | end | between | stack */}
  <Button … />
</FormActions>
```

Default: `flex flex-col gap-3 pt-2 sm:flex-row sm:items-center`.

#### `DialogFormSection`

For scoring / picker dialogs that use white section labels instead of `FormField`:

```jsx
<DialogFormSection label="Reason" controlOffset="md">  {/* sm=mt-2, md=mt-3 */}
  <RadioOptionList … />
</DialogFormSection>
```

### 3.2 Fixes to existing primitives

| Component | Current issue | Target |
|-----------|---------------|--------|
| `FormField` | `gap-1` + label `mb-2` stacks ~12px | Use `gap-2` only; remove `mb-2` from label |
| `FileUploadField` | Label `mb-1`, root `gap-1.5`, error `text-red-300` | Align to FormField: `gap-2`, `text-red-200` |
| `CountryCityFields` | Internal `gap-6` breaks rhythm in `gap-4` forms | Default `gap-4`; accept `density` prop |
| `Input` / `Textarea` | Each wraps in `gap-1` (fine) | No change |
| Scoring raw inputs | `rounded-[8px] bg-surface-raised` | Extract `dialogInputClass` or migrate to `Input` |

### 3.3 Label copy convention

- **No trailing colons** on labels (remove from `TournamentRequest.jsx`).
- Optional fields: append `(optional)` in label text, not a separate hint.
- Required fields: use `FormField required` (renders red `*`).

---

## 4. Complete form inventory

### 4.1 Page forms — full submit (`<form>`)

| File | Type | Current stack | Target |
|------|------|---------------|--------|
| `pages/auth/Login.jsx` | Auth OTP request | `space-y-4` | `FormStack compact` |
| `pages/auth/Register.jsx` | Auth signup | `space-y-4` | `FormStack compact` |
| `pages/auth/Otp.jsx` | Auth OTP verify | `space-y-6` | Keep (non-field layout) |
| `pages/TournamentRequest.jsx` | Tournament request | `space-y-6` / `lg:grid-cols-3 gap-6` | **Reference** → `FormStack grid-3` |
| `pages/Support.jsx` | Contact support | `space-y-4` | `FormStack default` |
| `pages/interest/InterestForm.jsx` | Tournament interest | `space-y-4` / `lg:grid-cols-2 lg:gap-y-4` | `FormStack grid-2` + `FormSection` (desktop gap 4→6) |
| `pages/shop/ShopCheckout.jsx` | Checkout | `space-y-6` / `lg:grid-cols-3` | `FormStack grid-3` |
| `pages/feed/ActivityFeedDetail.jsx` | Comment bar | Inline flex | Out of scope (chat UI) |

### 4.2 Page forms — RHF without `<form>`

| File | Type | Current stack | Target |
|------|------|---------------|--------|
| `pages/organizer/scoring/StartMatch.jsx` | Match setup | `space-y-6` | `FormStack default` |
| `pages/reels/UploadReels.jsx` | Reel upload | `mb-4` ad hoc | `FormStack compact` + label on caption |

### 4.3 Page forms — partial / search

| File | Type | Current stack | Target |
|------|------|---------------|--------|
| `pages/drafting/TeamDetail.jsx` | Squad search | `mb-4 gap-1` manual | `FormField` wrapper |
| `pages/organizer/tournaments/TournamentSquad.jsx` | Squad search | `mb-4 gap-1` manual | `FormField` wrapper |
| `pages/shop/ShopFilter.jsx` | Product filter | `gap-3` | Document as filter bar (not FormStack) |
| `pages/shop/ShopCategory.jsx` | Category filter | `gap-3` | Same |
| `pages/shop/ShopCart.jsx` | Qty select | Inline | Out of scope (line-item control) |

### 4.4 Dialog forms — data entry (FormField pattern)

| File | Current stack | Target |
|------|---------------|--------|
| `components/UserProfileTabs/UserEdit.jsx` | `gap-4` | `FormStack default` inside `DialogScrollBody` |
| `components/dialogs/ManageTeamDialog.jsx` | `space-y-4` | `FormStack default` |
| `components/dialogs/CustomScoreDialog.jsx` | No gap on body | `FormStack compact` |
| `components/dialogs/OversDialog.jsx` | `gap-4`, Input without label | Add `FormField` labels |
| `components/dialogs/PlayersPerSideDialog.jsx` | `gap-4`, Input without label | Add `FormField` labels |

### 4.5 Dialog forms — scoring bespoke (text/textarea)

| File | Notes | Target |
|------|-------|--------|
| `AdditionalRunsDialog.jsx` | Raw input, `text-red-400` error | `DialogFormSection` + `Input` |
| `ReviseTargetDialog.jsx` | Inline actions (not DialogSaveButton) | `DialogFormSection` + `FormActions` |
| `MatchNotesDialog.jsx` | AddNoteForm bespoke textarea | `FormField` + `Textarea` |
| `EndEventDialog.jsx` | Radio + textarea + switch | `DialogFormSection` each block |
| `EndInningsDialog.jsx` | Same family as EndEvent | Same |
| `EndMatchDialog.jsx` | Same family | Same |
| `AddBreakDialog.jsx` | Radio + textarea | `DialogFormSection` |
| `DeclareResultDialog.jsx` | Cards + textarea | `DialogFormSection` |

### 4.6 Dialog forms — picker / selection (no text inputs)

All use `DialogScrollBody gap-4` with `mt-3` section offsets. Migrate labels to `DialogFormSection`:

`TossDialog`, `ScoringTossDialog`, `PenaltyRunsDialog`, `NoBallDialog`, `WideBallDialog`, `OverthrowDialog`, `ExtraRunsDialog`, `EditBallDialog`, `RunOutDialog`, `CaughtOutDialog`, `ObstructTheFieldDialog`, `RetiredDismissalDialog`, `RetiredOutDialog`, `RetiredHurtDialog`, `MankadDialog`, `WhoIsOutDismissalDialog`, `SubstitutePlayerDialog`, `ChangeWicketKeeperDialog`, `FielderPickerDialog`, `ManOfTheMatchDialog`, `TeamSelectDialog`, `ChangeSquadDialog`, `OutReasonDialog`, `ShotAreaDialog`, `MatchPlayerPickerDialog`, `ScoringBatsmanPickerDialog`, `ScoringBowlerPickerDialog`, `ScoringSquadPlayerPickerDialog`, `MatchRulesDialog`

**Toss dialogs exception:** Currently `gap-6` between major blocks — align to `gap-6` for top-level sections, `gap-4` within `DialogFormSection`.

### 4.7 Sheets & popovers

| File | Type | Target |
|------|------|--------|
| `ui/CountryPickerSheet.jsx` | Search sheet | ✅ `Input` tokens; toolbar aligned to header (`px-5`) |
| `components/scoring/ActionMenuSheet.jsx` | Action grid | Out of scope (no inputs) |
| `components/scoring/wicket-summary/WicketSummaryScreen.jsx` | Summary footer | Document footer action pattern in `FormActions` |
| `MatchNotesDialog.jsx` (filter popover) | Filter popover | ✅ `FormStack compact` + `FormField` + `Input` |
| `components/highlights/HighlightSearchPopover.jsx` | Search | Filter bar pattern |
| `components/shop/ShopSearchPopover.jsx` | Search | Filter bar pattern |

### 4.8 Live / stream inputs

| File | Type | Target |
|------|------|--------|
| `pages/live/LiveBroadcastItem.jsx` | Comment input row | Chat pattern — do not force FormStack |
| `pages/feed/ActivityFeedDetail.jsx` | Comment bar | Same |

### 4.9 Excluded (no form inputs)

Confirm/delete dialogs, success dialogs, graphics-controller overlays, scoring tables, cart quantity selects.

---

## 5. Known inconsistencies (audit findings)

### Critical (visible to users on same flows)

1. **Field stack:** `space-y-4` vs `space-y-6` across comparable forms.
2. **UserEdit vs TournamentRequest:** Same field types, 16px vs 24px vertical rhythm.
3. **CountryCityFields:** 24px internal gap while parent form uses 16px.
4. **FileUploadField:** Tighter label (`mb-1`) and different error color (`text-red-300`).
5. **Label colons:** TournamentRequest only.

### Moderate

6. **Validation styles:** Four variants in scoring dialogs (`text-[11px]`–`text-[13px] text-red-400`).
7. **Input styling split:** `Input` (`rounded-[6px] bg-surface`) vs scoring raw inputs (`rounded-[8px] bg-surface-raised`).
8. **Missing labels:** OversDialog, PlayersPerSideDialog.
9. **Action patterns:** Auth `mt-4` vs Support flex row vs ShopCheckout raw button vs DialogSaveButton.
10. **FormField double spacing:** `gap-1` wrapper + `mb-2` label.

### Low

11. **`<form>` semantics:** StartMatch, UploadReels omit `<form>`.
12. **RHF vs useState:** UserEdit uses manual state (violates Coding guidelines §12).
13. **ShopCheckout:** Minimal client validation UI.
14. **Dialog vs sheet horizontal padding:** `px-5` vs `px-4`.

---

## 6. Implementation plan

### Phase 0 — Foundation (1 PR)

**Goal:** Create tokens and layout primitives without migrating consumers.

1. Add `app/src/lib/constants/formLayout.js` with exported class constants.
2. Add `FormStack`, `FormSection`, `FormActions`, `DialogFormSection`.
3. Fix `FormField` spacing (`gap-2`, remove label `mb-2`).
4. Fix `FileUploadField` label/error alignment.
5. Add `density` prop to `CountryCityFields` (`default: gap-4`).
6. Export new components from their modules under `ui/form/` (no barrel `index.js`).
7. Add Storybook-style usage examples in this doc (§7).
8. **Remove `formFieldLabelEditClass`** from `FormField.jsx` — it is already unused in the codebase (confirmed by grep). Safe to delete now.

**Files touched:** ~8 new/modified in `ui/`.

### Phase 1 — Reference implementations (1 PR)

Migrate the two reference forms to prove the system:

1. `pages/TournamentRequest.jsx` → `FormStack layout="grid-3"`, remove label colons.
2. `components/UserProfileTabs/UserEdit.jsx` → `FormStack default`, migrate to RHF + zodResolver.

**Acceptance:** Side-by-side screenshot comparison shows identical field/control spacing; dialog matches page rhythm.

### Phase 2 — Page forms (1–2 PRs)

| Priority | Files |
|----------|-------|
| P0 | `ShopCheckout.jsx`, `Support.jsx`, `InterestForm.jsx` |
| P1 | `StartMatch.jsx`, auth (`Login`, `Register`) |
| P2 | `UploadReels.jsx`, squad search pages |

### Phase 3 — Data-entry dialogs (1 PR)

`ManageTeamDialog`, `CustomScoreDialog`, `OversDialog`, `PlayersPerSideDialog`, scoring text dialogs (`AdditionalRuns`, `ReviseTarget`, `MatchNotes`, `EndEvent*`, `AddBreak`, `DeclareResult`).

### Phase 4 — Scoring picker dialogs (2–3 PRs)

Batch migrate ~25 picker dialogs to `DialogFormSection`. Extract shared `dialogInputClass` if raw inputs remain.

Group by domain:
- Toss / penalty / extras
- Dismissals
- Squad / player pickers

### Phase 5 — Sheets, popovers, cleanup ✅

- CountryPickerSheet search input alignment — done (`Input` + toolbar `px-5`)
- MatchNotesDialog filter popover — done (`FormStack` + `FormField` + `Input`)
- Removed `formFieldLabelCheckoutClass` export from `FormField.jsx`
- ESLint rule for raw `space-y-*` / `gap-*` on `<form>` — `tapeya-form-layout/no-raw-form-field-spacing`

### Phase 6 — Documentation & enforcement ✅

- Linked from `APP_CODING_STYLE.md` and `Coding guidelines.md` §12
- PR checklist in §10 below

---

## 7. Usage examples

### Page form (3-column responsive)

```jsx
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';

<form onSubmit={handleSubmit(onSubmit)}>
  <FormStack layout="grid-3" className="pb-8">
    <FormField label="Contact Person Name" htmlFor="contact_person_name" required>
      <Input id="contact_person_name" error={errors.contact_person_name?.message} {...register('contact_person_name')} />
    </FormField>
    {/* …more fields… */}
    <FormActions align="start" className="lg:col-span-3">
      <Button type="submit" variant="auth" className="lg:w-[150px]">Submit</Button>
    </FormActions>
  </FormStack>
</form>
```

### Dialog form

```jsx
<DialogScrollBody>
  <FormStack density="default">
    <FormField label="Name" htmlFor="name" required>
      <Input id="name" className="max-w-none" … />
    </FormField>
    <CountryCityFields density="default" … />
  </FormStack>
</DialogScrollBody>
<DialogSaveButton form="profile-form" type="submit" … />
```

### Scoring dialog section

```jsx
<DialogScrollBody>
  <FormStack density="default">
    <DialogFormSection label="Reason" controlOffset="md">
      <RadioOptionList … />
    </DialogFormSection>
    <DialogFormSection label="Comments" controlOffset="sm">
      <Textarea rows={3} … />
    </DialogFormSection>
  </FormStack>
</DialogScrollBody>
```

### Sectioned long form

```jsx
<FormStack layout="grid-2">
  <FormSection title="Personal Details" divider className="lg:col-span-2">
    {/* avatar + name fields */}
  </FormSection>
  <FormSection title="Other Details" divider className="lg:col-span-2">
    {/* remaining fields */}
  </FormSection>
  <FormActions className="lg:col-span-2">…</FormActions>
</FormStack>
```

---

## 8. Responsive guidelines

| Breakpoint | Behavior |
|------------|----------|
| `< lg` | Single column; `FormStack` uses vertical `gap-6` (or `gap-4` compact) |
| `≥ lg` | `grid-2` / `grid-3` layouts activate; vertical `space-y-0`, grid `gap-6` |
| Dialog (~380px) | Always single column; full-width inputs (`max-w-none`) |
| Auth (`lg:max-w-[400px]`) | Single column; use `compact` density |
| Actions | Stack vertically on mobile (`flex-col gap-3`); row on `sm+` |

---

## 9. Out of scope

These UI patterns are **not** FormStack forms:

- Search/filter bars (`ShopFilter`, `ShopCategory`, popover search)
- Inline chat/comment inputs (`LiveBroadcastItem`, `ActivityFeedDetail`)
- Cart quantity selects
- OTP digit cells (custom layout)
- Graphics-controller broadcast overlays
- Confirm/delete dialogs without inputs

---

## 10. PR checklist (forms)

- [ ] Uses `FormStack` (or documented exception)
- [ ] No raw `space-y-*` / `gap-*` on `<form>` (ESLint `tapeya-form-layout/no-raw-form-field-spacing`)
- [ ] Field labels via `FormField` (no manual `Label` + spacing)
- [ ] No trailing colons on labels
- [ ] Validation via control `error` prop → `text-sm text-red-200`
- [ ] `CountryCityFields` uses matching `density`
- [ ] Actions via `FormActions` or `DialogSaveButton` (not ad-hoc `mt-4`)
- [ ] RHF + zodResolver for new/edited submit forms
- [ ] Responsive grid via `FormStack layout` prop, not duplicated class strings
