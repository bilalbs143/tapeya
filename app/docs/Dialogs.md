# Dialog system — architecture & implementation guide

**Scope:** `app/src/components/dialogs/`, `DialogContext`, `BaseDialog`, `ui/Dialog.jsx`.  
**Manually verified:** all 21 registered dialogs + all `openDialog` call sites.

---

## Architecture overview

The app has two dialog tracks:

| Track               | How it works                                                                                      | When to use                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **A — Local**       | Component renders `BaseDialog` directly with its own `open` / `onOpenChange` state                | Heavy forms tied to one screen (e.g. profile edit)                   |
| **B — Centralized** | `DialogManager` renders `BaseDialog`; state lives in `DialogContext` via `openDialog(key, props)` | Everything else — scoring flows, global prompts, cross-route dialogs |

**Default:** use **Track B**. Only use Track A when the dialog is exclusively owned by one page and needs complex RTK Query with `skip: !open`.

### Layer stack

```
ui/Dialog.jsx           — Radix primitives + design tokens
    └── BaseDialog.jsx  — single shell (Dialog → DialogContentDark → flex wrapper)
            └── DialogManager.jsx  — maps key → body component; wraps in BaseDialog
                    └── *Dialog.jsx — body-only components (no BaseDialog inside)
```

```
DialogContext.jsx       — single slot: { key, props }
    └── openDialog(key, props)   — opens a dialog (replaces any open one)
    └── closeDialog()            — clears the slot
```

### Composition pattern (Track B body-only)

Every dialog in `components/dialogs/` must follow this structure — no exceptions:

```jsx
export function MyDialog({ someCallbackProp }) {
  const { closeDialog } = useDialog();

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Title</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>{/* content */}</DialogScrollBody>

      {/* optional — omit for selection/acknowledgment dialogs */}
      <DialogSaveButton onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving…' : 'Save'}
      </DialogSaveButton>
    </>
  );
}
```

Rules:

1. Do **not** import or render `BaseDialog`, `Dialog`, or `DialogContentDark` inside a body component.
2. Call `closeDialog()` after user completes the action (selection, save, confirm).
3. `DialogScrollBody` already includes `px-5 py-4` — do not repeat these in `className`.
4. Register the key in `DIALOG_COMPONENTS` in `DialogManager.jsx`.
5. Add a `DIALOG_CONTENT_CLASS_BY_KEY` entry only if the dialog needs a minimum height.

### `DialogScrollBody` base styles (already included — do not duplicate)

```
min-h-0  flex-1  overflow-y-auto  px-5  py-4
```

Only add extra classes for layout variants: `flex flex-col`, `text-center`, `items-center`, etc.

---

## Design tokens (ui/Dialog.jsx)

| Token                     | Value / purpose                                          |
| ------------------------- | -------------------------------------------------------- |
| `dialogPrimaryTitleClass` | Golden uppercase 14px bold — use on every `DialogTitle`  |
| `DialogHeaderRow`         | `52px` min-height header with built-in close button (×)  |
| `DialogScrollBody`        | Flex-1 scrollable area with hidden scrollbar             |
| `DialogSaveButton`        | White bottom-fused action button                         |
| `DialogHeaderClose`       | Standalone × button (auto-included by `DialogHeaderRow`) |

`DialogHeaderRow` props:

- `hideClose` — removes × (use with multi-step flows)
- `reserveCloseSpace` — keeps a spacer so centred titles stay centred
- `closeSlot` — replace × with a custom element (e.g. loading skeleton)
- `trailing` — extra element between title and ×

---

## Registered dialogs

### Global / app-level

| Key                             | Component                             | Opens from                         | Notes                                                  |
| ------------------------------- | ------------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `appUpdate`                     | `AppUpdateDialog`                     | `AppUpdatePrompt` (interval hook)  | No closeDialog on CTA — opens store URL; dismiss via × |
| `profileStrengthReminder`       | `ProfileStrengthReminderDialog`       | `ProfileStrengthReminderScheduler` | Periodic via `useIntervalDialogPrompt`                 |
| `deleteAccount`                 | `DeleteAccountDialog`                 | `Profile.jsx`                      | Uses `closeSlot` while mutation runs to block dismiss  |
| `pricingSuccess`                | `PricingSuccessDialog`                | `PricingDetail.jsx`                | Success pattern — no bottom button                     |
| `draftingSubmitSquadSuccess`    | `DraftingSubmitSquadSuccessDialog`    | `TeamDetail.jsx`                   | Success pattern — no bottom button                     |
| `tournamentSquadUpdatedSuccess` | `TournamentSquadUpdatedSuccessDialog` | `TournamentSquad.jsx`              | Success pattern — no bottom button                     |

### Start Match flow

| Key                        | Component              | Opens from       | Notes                       |
| -------------------------- | ---------------------- | ---------------- | --------------------------- |
| `startMatchToss`           | `TossDialog`           | `StartMatch.jsx` | Reference toss UI           |
| `startMatchTeamSelect`     | `TeamSelectDialog`     | `StartMatch.jsx` | Row tap closes immediately  |
| `startMatchOvers`          | `OversDialog`          | `StartMatch.jsx` | Preset chips + custom input |
| `startMatchPlayersPerSide` | `PlayersPerSideDialog` | `StartMatch.jsx` | Preset chips only           |

### Live scoring flow

| Key                    | Component                    | Opens from         | Notes                                               |
| ---------------------- | ---------------------------- | ------------------ | --------------------------------------------------- |
| `scoringBatsman`       | `ScoringBatsmanPickerDialog` | `ScoringTab.jsx`   | Routes to squad-setup or match-picker variant       |
| `scoringBowler`        | `ScoringBowlerPickerDialog`  | `ScoringTab.jsx`   | Same dual-variant pattern                           |
| `scoringOutReason`     | `OutReasonDialog`            | `ScoringTab.jsx`   | List of dismissal types; no save button             |
| `scoringFielderPicker` | `FielderPickerDialog`        | `ScoringTab.jsx`   | List picker; no save button                         |
| `scoringExtraRuns`     | `ExtraRunsDialog`            | `ScoringTab.jsx`   | Grid picks close dialog                             |
| `scoringShotArea`      | `ShotAreaDialog`             | `ScoringTab.jsx`   | Centred title for stadium graphic                   |
| `scoringRetiredHurt`   | `RetiredHurtConfirmDialog`   | `ScoringTab.jsx`   | Confirm only                                        |
| `scoringCustomScore`   | `CustomScoreDialog`          | `ScoringTab.jsx`   | Numeric input                                       |
| `scoringToss`          | `ScoringTossDialog`          | `ScoringMatch.jsx` | Live-scoring toss (`home`/`away` keys); `hideClose` |
| `inningsEnd`           | `InningsEndDialog`           | `ScoringMatch.jsx` | First-innings break or match over                   |
| `manOfTheMatch`        | `ManOfTheMatchDialog`        | `ScoringMatch.jsx` | Has nested scroll in candidate list                 |

### Child components (not direct keys)

| Component                        | Used by                                                   | Notes                                                            |
| -------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- |
| `MatchPlayerPickerDialog`        | `ScoringBatsmanPickerDialog`, `ScoringBowlerPickerDialog` | Body-only list picker                                            |
| `ScoringSquadPlayerPickerDialog` | `ScoringBatsmanPickerDialog`, `ScoringBowlerPickerDialog` | Props frozen at openDialog time — uses local state to bridge gap |

---

## Non-registered / special cases

| Component           | Location                                   | Notes                                                                                            |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `UserEdit`          | `components/UserProfileTabs/UserEdit.jsx`  | Track A benchmark — owns `BaseDialog` directly; correct for a profile-edit form tied to one page |
| `SuccessDialogBody` | `components/dialogs/SuccessDialogBody.jsx` | Shared icon + title + description for success dialogs                                            |

---

## `openDialog` call sites (complete list)

```
Profile.jsx                         → deleteAccount
PricingDetail.jsx                   → pricingSuccess
TeamDetail.jsx                      → draftingSubmitSquadSuccess
StartMatch.jsx                      → startMatchToss, startMatchTeamSelect,
                                       startMatchOvers, startMatchPlayersPerSide
ScoringMatch.jsx                    → scoringToss, inningsEnd, manOfTheMatch
TournamentSquad.jsx                 → tournamentSquadUpdatedSuccess
ScoringTab.jsx                      → scoringOutReason, scoringFielderPicker,
                                       scoringBatsman, scoringBowler,
                                       scoringShotArea, scoringExtraRuns,
                                       scoringRetiredHurt, scoringCustomScore
AppUpdatePrompt (interval hook)     → appUpdate
ProfileStrengthReminderScheduler    → profileStrengthReminder

```

---

## Implementation steps (completed)

All steps below were implemented. Kept for reference.

---

### Step 1 — Delete `TeamNameDialog.jsx` (dead code) ✅

**File:** `src/components/dialogs/TeamNameDialog.jsx`

Confirmed dead: the file is not imported anywhere in the app and has no key in `DIALOG_COMPONENTS`. Delete it.

No other changes needed — there are no call sites to clean up.

---

### Step 2 — Resolve `tournamentSquadUpdatedSuccess` ✅

**Chosen: Option A** — `TournamentSquad.jsx` calls `openDialog('tournamentSquadUpdatedSuccess')` on successful save.

**Option A — Wire the dialog (use the existing component)**

Find where a squad is successfully saved in tournament flow. The likely file is somewhere in `src/pages/organizer/tournaments/` (e.g. `TournamentAddSquad.jsx` or `TournamentSavedTeams.jsx`). Where a toast like `toast.success('Squad updated.')` is called, replace it with:

```js
openDialog('tournamentSquadUpdatedSuccess');
```

Remove the toast import for that specific call if it becomes unused.

**Option B — Remove the dialog (keep the toast)**

If the toast is the correct permanent UX, clean up the dead registration:

1. Delete `src/components/dialogs/TournamentSquadUpdatedSuccessDialog.jsx`
2. In `src/components/dialogs/DialogManager.jsx`, remove:
   - The import line: `import TournamentSquadUpdatedSuccessDialog from './TournamentSquadUpdatedSuccessDialog';`
   - The registry entry: `tournamentSquadUpdatedSuccess: TournamentSquadUpdatedSuccessDialog,`

---

### Step 3 — Fix redundant padding on 3 dialogs ✅

These dialogs pass classes to `DialogScrollBody` that are already included in the base token (`px-5 py-4`). Remove only the redundant ones and keep any meaningful layout additions.

**3a. `FielderPickerDialog.jsx`**

```jsx
// Before
<DialogScrollBody className="px-5 pb-4">

// After — px-5 and pb-4 are both in the base token
<DialogScrollBody>
```

**3b. `InningsEndDialog.jsx`**

```jsx
// Before
<DialogScrollBody className="flex min-h-0 flex-1 flex-col px-5 pb-4 text-center">

// After — keep flex flex-col (needed for internal layout) and text-center;
//          remove px-5 (in base), pb-4 (same as py-4 in base), min-h-0 flex-1 (in base)
<DialogScrollBody className="flex flex-col text-center">
```

**3c. `ManOfTheMatchDialog.jsx`**

```jsx
// Before
<DialogScrollBody className="flex min-h-0 flex-1 flex-col px-5 pb-4 text-center">

// After — same reasoning as InningsEndDialog
<DialogScrollBody className="flex flex-col text-center">
```

---

### Step 4 — Remove redundant "Done" button from `TeamSelectDialog` ✅

**File:** `src/components/dialogs/TeamSelectDialog.jsx`

Each row in the list already calls `closeDialog()` on tap. The "Done" footer button only calls `closeDialog()` as well — it does nothing additional. Remove the `DialogSaveButton` (or equivalent Done button) at the bottom. The dialog closes naturally when the user taps a team row.

Verify after removing: tapping a team row still closes the dialog and the selection is persisted.

---

### Step 5 — Replace inline `ScoringMatchTossDialog` with the manager pattern ✅

**Files:** `src/pages/organizer/scoring/ScoringMatch.jsx`, `src/components/dialogs/DialogManager.jsx`

The inline `ScoringMatchTossDialog` (~90 lines, at the bottom of `ScoringMatch.jsx`) duplicates the toss dialog UI but uses:

- Raw `Dialog` + `DialogContentDark` instead of `BaseDialog`
- Orange `Button` instead of `DialogSaveButton`
- `'home'` / `'away'` team key format instead of the `A` / `B` used by `TossDialog`

**Steps:**

**5a.** Create `src/components/dialogs/ScoringTossDialog.jsx` as a body-only component following the Track B pattern. It receives the same props that the current `ScoringMatchTossDialog` receives (`homeTeamName`, `awayTeamName`, `tossWinner`, `setTossWinner`, `tossDecision`, `setTossDecision`, `isSaving`, `onSave`) but renders using `DialogHeaderRow` + `DialogScrollBody` + `DialogSaveButton`:

```jsx
export function ScoringTossDialog({
  homeTeamName,
  awayTeamName,
  tossWinner,
  setTossWinner,
  tossDecision,
  setTossDecision,
  isSaving,
  onSave,
}) {
  const canSave = !!tossWinner && !!tossDecision && !isSaving;
  return (
    <>
      <DialogHeaderRow hideClose>
        <DialogTitle className={dialogPrimaryTitleClass}>Who Won the Toss?</DialogTitle>
      </DialogHeaderRow>
      <DialogScrollBody>
        {/* team buttons (home/away) */}
        {/* bat/bowl toggle */}
      </DialogScrollBody>
      <DialogSaveButton onClick={onSave} disabled={!canSave}>
        {isSaving ? 'Saving toss…' : 'Save Toss'}
      </DialogSaveButton>
    </>
  );
}
```

**5b.** Register it in `DialogManager.jsx`:

```js
import { ScoringTossDialog } from './ScoringTossDialog';

const DIALOG_COMPONENTS = {
  // ...existing keys...
  scoringToss: ScoringTossDialog,
};
```

**5c.** In `ScoringMatch.jsx`, replace the `tossDialogOpen` useState + `ScoringMatchTossDialog` render with:

```js
// Replace local state:
// const [tossDialogOpen, setTossDialogOpen] = useState(false);
// with a ref to track whether toss was shown (dialog open state lives in context now)

// In the toss trigger useEffect:
openDialog('scoringToss', {
  homeTeamName: apiMatch?.home_team?.name,
  awayTeamName: apiMatch?.away_team?.name,
  tossWinner,
  setTossWinner,
  tossDecision,
  setTossDecision,
  isSaving: isUpdatingToss,
  onSave: handleSaveToss,
});

// handleSaveToss calls closeDialog() after a successful save instead of setTossDialogOpen(false)
```

**5d.** Delete the `ScoringMatchTossDialog` function at the bottom of `ScoringMatch.jsx` (~lines 968–1061).

**5e.** Remove the `tossDialogOpen` useState, `setTossDialogOpen` calls, and the `<ScoringMatchTossDialog ... />` JSX from the render.

**Note:** `setTossWinner` / `setTossDecision` are setter functions — they work fine as frozen props because they are stable `useState` setters. The dialog will update `ScoringMatch`'s own state directly.

---

### Step 6 — Extract shared `SuccessDialogBody` component ✅

**Files:** `PricingSuccessDialog.jsx`, `DraftingSubmitSquadSuccessDialog.jsx`, `TournamentSquadUpdatedSuccessDialog.jsx`

All three success dialogs share the same visual structure: centered icon (thumbs-up with green tick badge) + bold white title + secondary grey description. The SVG markup is duplicated across all three.

**6a.** Create `src/components/dialogs/SuccessDialogBody.jsx`:

```jsx
/**
 * Shared body for success dialogs. Used by Pricing, DraftingSubmitSquad,
 * and TournamentSquadUpdated success dialogs.
 */
export function SuccessDialogBody({ title, description }) {
  return (
    <DialogScrollBody className="flex flex-col items-center justify-center py-2 text-center">
      {/* thumbs-up icon + green tick badge (extract SVG here) */}
      <DialogTitle className="mb-1.5 text-[14px] font-bold text-white">{title}</DialogTitle>
      {description && <DialogDescription className="text-[13px] leading-snug text-[#A2A6AB]">{description}</DialogDescription>}
    </DialogScrollBody>
  );
}
```

**6b.** Refactor each success dialog to use `SuccessDialogBody`, passing `title` and `description` as props. The result is each dialog becomes ~10 lines.

---

## Checklist for new dialogs

- [ ] Track A or Track B? (A = one screen owns it, B = everything else)
- [ ] Body-only: no `BaseDialog`, `Dialog`, or `DialogContentDark` inside
- [ ] Structure: `DialogHeaderRow` → `DialogScrollBody` → optional `DialogSaveButton`
- [ ] `DialogTitle` uses `dialogPrimaryTitleClass`
- [ ] Do not add `px-5`, `py-4`, `min-h-0`, or `flex-1` to `DialogScrollBody className` — already in base
- [ ] Register key in `DIALOG_COMPONENTS` (DialogManager.jsx)
- [ ] Add `openDialog(key, props)` call at every entry point
- [ ] Call `closeDialog()` after success/selection
- [ ] `DIALOG_CONTENT_CLASS_BY_KEY` entry if the panel needs `min-height`
- [ ] RTK Query: `skip: !open` if dialog owns queries (Track A only)
- [ ] Select dropdowns inside scroll body: `z-[100]` on `SelectContent`
- [ ] Update this doc's inventory table

---

## File map

```
src/
├── context/DialogContext.jsx                    — openDialog, closeDialog, single slot
├── components/dialogs/
│   ├── DialogManager.jsx                        — DIALOG_COMPONENTS registry + BaseDialog wrapper
│   ├── BaseDialog.jsx                           — shared shell
│   ├── SuccessDialogBody.jsx                    — (Step 6: shared success layout)
│   └── *Dialog.jsx                              — body-only components
├── components/UserProfileTabs/UserEdit.jsx      — Track A benchmark
├── ui/Dialog.jsx                                — primitives + design tokens
├── hooks/useIntervalDialogPrompt.js             — periodic openDialog trigger
└── App.jsx                                      — DialogProvider + DialogManager mount
```
