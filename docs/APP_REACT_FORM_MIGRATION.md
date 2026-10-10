# app-react form migration

Track every form / sheet / dialog that must use the **unified form stack** so labels, inputs, selects, hints, and errors stay consistent.

Legacy `app/` standards live in [`FORM_LAYOUT_STANDARDS.md`](./FORM_LAYOUT_STANDARDS.md) (`FormStack` + `FormField`). **Do not port those.** app-react’s stack is the source of truth.

**Last updated:** 2026-10-09

---

## Canonical stack

| Piece | Use |
|---|---|
| Page / sheet body | `Form` with `density="compact"` (screen + StickyActionBar) or `density="default"` (spacious / multi-section) |
| Sections | `FormSection` / `FormRow` when grouping or pairing fields |
| Text / textarea | `Input` / `Textarea` (Field baked in) |
| Select | `SelectField` (wraps `Field`) |
| Custom control (file, chips, picker) | Wrap with `Field` — same label / `*` / hint / error |
| Footer CTA on screens | `StickyActionBar` (not `FormActions`) |
| Footer CTA in dialogs | `FormActions` when cancel + commit sit in-dialog |

**Rules**

1. No hand-rolled mono eyebrow labels for fields.
2. No `(optional)` in labels — required fields use `required` → red `*`.
3. Errors go through `Field` / `Input` `error=` (`role="alert"`).
4. Hints go through `hint=` — never a sibling `<p>` pretending to be FieldMessage.
5. Prefer `gap` from `Form` density — do not invent `gap-3.5` / `gap-6` on the form root.

Reference implementation: [`app-react/src/features/support/pages/SupportPage.tsx`](../app-react/src/features/support/pages/SupportPage.tsx).

Primitives: [`Form.tsx`](../app-react/src/shared/ui/Form.tsx), [`Field.tsx`](../app-react/src/shared/ui/Field.tsx), [`Input.tsx`](../app-react/src/shared/ui/Input.tsx), [`Select.tsx`](../app-react/src/shared/ui/Select.tsx).

---

## Migration checklist

Mark `[x]` when the surface uses `Form` (+ density) and every field uses `Field` / `Input` / `Textarea` / `SelectField` (no ad-hoc labels/errors).

### Support

- [x] `features/support/pages/SupportPage.tsx` — **done** (reference)

### Auth

- [x] `features/auth/pages/LoginPage.tsx` — `Form density="compact"` + `PhoneField`
- [x] `features/auth/pages/RegisterPage.tsx` — `Form density="compact"` + `PhoneField` / `Input` + `required`
- [x] `features/auth/pages/OtpPage.tsx` — `Form density="compact"`; keep `OtpInput`; errors via `FieldMessage`
- [x] `features/auth/ui/PhoneField.tsx` — `FieldLabel` / `FieldMessage` (shared phone primitive)

### Profile / interest

- [x] `features/profile/ui/EditProfileForm.tsx` (+ `EditProfilePage`) — `Form density="default"` + `FormSection` / `Field` chips
- [x] `features/interest/ui/InterestForm.tsx` (+ `InterestPage`) — `Form density="compact"`; avatar/doc via `Field`; no card wrap

### Feed / reels

- [x] `features/feed/pages/CreatePostPage.tsx` — `Form density="compact"`; section labels via `FieldLabel`
- [x] `features/feed/ui/ReportSheet.tsx` — `Form` + `Field` reason / `Textarea` details
- [x] `features/reels/pages/CreateReelPage.tsx` — details step: `Form` + `FieldMessage` (caption stays composer-style)
- [x] `features/reels/ui/ReelCommentSheet.tsx` — comment composer only (out of scope)

### Live

- [x] `features/live/pages/GoLivePage.tsx` — `Form density="compact"`; orientation / thumb via `Field`

### Tournaments

- [x] `features/tournaments/ui/CreateTournamentWizard.tsx` — shared `Form`/`Field`/`FormSection`; `required` (no `*` / optional text)
- [x] `features/tournaments/ui/ManageTeamDialog.tsx` — `Form density="compact"`; logo / group / picked team via `Field`
- [x] `features/tournaments/pages/SquadEditorPage.tsx` — search/`SearchBar` only; no labelled data-entry form (N/A)

### Matches (setup)

- [x] `features/matches/pages/QuickMatchPage.tsx` — shared `Form`/`Field` (dropped local Field)
- [x] `features/matches/pages/StartMatchPage.tsx` — shared `Form`/`Field`; Venue via `Input`
- [x] `features/matches/pages/MatchSettingsPage.tsx` — `Form` + labelled `Textarea` officials
- [x] `features/matches/ui/AddQuickMatchPlayerSheet.tsx` — `Form density="compact"` + required Name/Phone
- [x] `features/matches/ui/DeclareSquadScreen.tsx` — search/roster UI; no labelled data-entry form (N/A)

### Matches (scoring sheets — compact)

Keep density="compact". Unify labels/errors even when the body is chip/pad heavy.

- [x] `features/matches/ui/CreaseSetupSheet.tsx` — squad picker + `SearchBar`; status chrome only (N/A for Field stack)
- [x] `features/matches/ui/WicketSheet.tsx` — detail step: `Form` + `Field` (who / fielder / runs)
- [x] `features/matches/ui/NoBallSheet.tsx` — run pad only (N/A)
- [x] `features/matches/ui/OverflowSheet.tsx` — action menu (N/A)
- [x] `features/matches/ui/OverthrowSheet.tsx` — run pad only (N/A)
- [x] `features/matches/ui/EditBallSheet.tsx` — `Form` + `Field` runs/extra/zone; labelled custom runs `Input`
- [x] `features/matches/ui/AdminActionSheet.tsx` — `Form density="compact"` + `Field` / labelled controls (all action modes)
- [x] `features/matches/ui/ScoringPad.tsx` — custom-score dialog: `Form` + labelled `Input`
- [x] `features/matches/ui/DeclareResultSheet.tsx` — `Form density="compact"` + `Field` / `Textarea`
- [x] `features/matches/ui/EndMatchSheet.tsx` — `Form` + `Field` reason / `Textarea` comments
- [x] `features/matches/ui/MatchStateSheet.tsx` — `Form` + `Field` target/then/reason; labelled comments
- [x] `features/matches/ui/PenaltySheet.tsx` — `Form` + `Field` award/runs/reason
- [x] `features/matches/ui/ZonePickerSheet.tsx` — zone pad only (N/A)

### Shop / seller

- [x] `features/shop/pages/CheckoutPage.tsx` — `Form density="compact"` + `FormSection` / `FormRow`
- [x] `features/shop/pages/SellerApplyPage.tsx` — `Form` + `FormSection` (no card wrap)
- [x] `features/shop/pages/SellerStorePage.tsx` — `Form` + `FormSection`
- [x] `features/shop/pages/SellerProductFormPage.tsx` — `Form density="compact"`
- [x] `features/shop/pages/SellerOrderDetailPage.tsx` — `Form density="compact"` (status / shipping fields)
- [x] `features/shop/ui/SellerBrandDialog.tsx` — `Form` + `Field` logo
- [x] `features/shop/ui/SellerCategoryDialog.tsx` — `Form` + `Field` image

### Out of scope (not field forms)

Leave alone unless they grow real form chrome:

- Comment composers (`CommentComposer`, live `ChatDock`)
- Pure search bars / filter chips
- Scoring pad / crease strip (action UI, not data-entry forms)
- Cart quantity stepper / product buy sheet without labelled fields

---

## Known inconsistencies to fix while migrating

These showed up during inventory — resolve as each row is checked off:

| Issue | Where it shows up | Target |
|---|---|---|
| Hand-rolled `flex flex-col gap-3.5` form root | Interest, Register, Checkout, GoLive, … | `Form density="compact"` |
| Card/border wrapping field groups | Interest (non-compact), older Support | Fields open on page; cards only for non-field CTAs (e.g. WhatsApp) |
| Custom mono label + sibling error `<p>` | Support Attachment (fixed), scoring sheets | `Field` |
| `(optional)` in labels | Was widespread; stripped once — do not reintroduce | `required` / `*` only |
| Mixed select patterns | Some native `<select>`, some `SelectField` | `SelectField` |
| Mixed input heights | `h-12` vs `h-[50px]` vs default | Prefer `h-12` / design tokens on Input |

---

## PR checklist (new or touched forms)

- [ ] Root is `Form` with an explicit `density`
- [ ] Every labelled control uses `Input` / `Textarea` / `SelectField` / `Field`
- [ ] Required fields pass `required` (red `*`); no `(optional)` text
- [ ] Errors via `error=`; hints via `hint=`
- [ ] Screen submit uses `StickyActionBar` when the page already uses that pattern
- [ ] This file’s checkbox for the surface is marked `[x]`
