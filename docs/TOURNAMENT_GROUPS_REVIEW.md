# Tournament Groups – Review (Verification, Fixes, Improvements)

End-to-end review of the groups feature: issues found, fixes applied, and optional improvements.

---

## 1. Potential issues and fixes applied

### 1.1 MatchCard used with raw API shape (ScorecardDetails)

**Issue:** `ScorecardDetails` passes matches from `useGetTournamentMatchesQuery` directly to `ScheduleTab` → `MatchCard`. The API returns `home_team`, `away_team`, `id`, `status`; MatchCard expected a normalised shape (`team1`, `team2`, `matchId`). Result: “Home team” / “Away team” and missing match id in the schedule tab.

**Fix:** MatchCard now accepts both shapes. Added `getMatchDisplay(match)` which:
- Derives `team1`/`team2` from `match.team1 ?? match.home_team ?? match.homeTeam` (and same for team2).
- Derives `matchId` from `match.matchId`, or “Home vs Away”, or `Match ${match.id}`.
- Normalises `status` from API values (`scheduled`, `in_progress`, `completed`) to `upcoming` / `live` / `result`.

So both **ScorecardDetails** (raw API) and **ScorecardHome** (normalised via `normaliseTournamentMatches`) work correctly.

**Files:** `app/src/components/scorecard/MatchCard.jsx`

---

### 1.2 Group badge missing on ScorecardHome schedule

**Issue:** `normaliseTournamentMatches` did not pass through `group_index`, so when ScorecardHome renders the schedule (via ScorecardTabs → MatchCard), the group badge never appeared.

**Fix:** Include `group_index: match.group_index ?? undefined` in the object returned by `normaliseTournamentMatches`.

**Files:** `app/src/lib/utils/scorecardUtils.js`

---

### 1.3 TournamentSavedTeams: missing number_of_groups when navigating with state

**Issue:** When opening Saved Teams with `location.state.tournament` set, the code skipped the tournament API fetch and used only state. If state had a minimal tournament object (e.g. from list) without `number_of_groups`, the “Move to group” dropdown never appeared.

**Fix:** Always fetch tournament by id when `tournamentId` is valid; use API result as primary, state as fallback: `tournament = tournamentFromApi ?? tournamentFromState ?? null`. Removed `skip: !isValidId || !!tournamentFromState` so the query runs whenever we have a valid id.

**Files:** `app/src/pages/organizer/tournaments/TournamentSavedTeams.jsx`

---

### 1.4 Score display in MatchCard

**Minor:** Avoid rendering score when it’s empty string so the layout doesn’t reserve space for nothing. Use `score1 != null && score1 !== ''` (and same for score2) before rendering.

**Files:** `app/src/components/scorecard/MatchCard.jsx`

---

## 2. Verification summary (no change needed)

| Area | Check | Result |
|------|--------|--------|
| **API – pivot** | Tournament model uses `withPivot('group_index')` | OK |
| **API – update team group** | Controller checks organizer, attachment, `number_of_groups > 1`; request validates `group_index` 1..max | OK |
| **API – UpdateTournamentTeamRequest** | When `number_of_groups <= 1`, max is 1; controller returns clear “does not use groups” message | OK |
| **FixturesTab** | `numberOfGroups` optional; when missing, no “Knockout” badge (safe) | OK |
| **Format label** | “Single table” when `number_of_groups == null` or `<= 1`; “Groups: N” when `> 1` in all three places | OK |
| **Move to group** | Dropdown only when `numberOfGroups > 1`; PATCH only when new value differs from current | OK |

---

## 3. Simplifications and consistency

- **MatchCard:** Single place to handle both API and normalised match shapes, so ScheduleTab and ScorecardTabs do not need to normalise before passing. Status normalisation is local to MatchCard and aligned with `scorecardUtils.normaliseMatchStatus`.
- **Tournament source:** TournamentSavedTeams now prefers API over state for the tournament object, so `number_of_groups` (and other fields) are reliable for the move-to-group UI.

---

## 4. Optional future improvements

- **Error feedback for move group:** If `updateTournamentTeamGroup` fails, show a toast or inline message instead of failing silently.
- **ScorecardDetails format label:** Tournament name could replace the raw `tournamentId` in the header (tournament is already fetched); same as the existing TODO in the file.
- **API – move team:** Consider validating that the team is not in matches that have already progressed (e.g. toss done) before allowing group change; design doc did not require this, so it’s optional.

---

## 5. File checklist (groups-related)

| File | Purpose |
|------|--------|
| `api/.../TournamentTeamController.php` | index (group_index in pivot), store (group_index), update (move group), destroy |
| `api/.../UpdateTournamentTeamRequest.php` | Validates group_index for PATCH |
| `api/routes/api/v1/user.php` | PATCH tournaments/{t}/teams/{team} |
| `app/.../MatchCard.jsx` | Group badge; dual shape (API + normalised) |
| `app/.../FixturesTab.jsx` | Group / Knockout badge; numberOfGroups prop |
| `app/.../scorecardUtils.js` | normaliseTournamentMatches includes group_index |
| `app/.../UpcomingTournamentDetails.jsx` | Format label; passes numberOfGroups to FixturesTab |
| `app/.../Tournaments.jsx` | TournamentCard format row |
| `app/.../ScorecardDetails.jsx` | Tournament fetch; format label |
| `app/.../TournamentSavedTeams.jsx` | Move-to-group dropdown; tournament from API preferred |
| `app/.../tournamentApi.js` | updateTournamentTeamGroup mutation |

---

## 6. Planned next steps

The following were in the original implementation plan. **Steps 3, 4, and 5 are done** (group badge, format label, move team to group); see §1 and §5 above. **Step 2** (create tournament from request) and **Step 6** (season stats by group, optional) remain.

---

### Step 2: Create tournament from request (Backoffice)

**Goal:** When admin wants to create a tournament from an approved request, open the manage-tournament dialog with form pre-filled from the request (including group mode and number of groups).

| # | Task | Details |
|---|------|---------|
| 2.1.1 | **Tournament request detail dialog** | Add a button **“Create tournament”** (or “Create tournament from request”). Show when request exists (e.g. only when status is `approved`, or for any status). |
| 2.1.2 | **Open manage-tournament dialog with request data** | On click, open `ManageTournamentDialogComponent` with `mode: 'create'` and optional `fromRequest?: TournamentRequest`. Pass the request so the form can pre-fill. |
| 2.1.3 | **Manage tournament dialog – accept `fromRequest`** | Extend `ManageTournamentDialogData`: add optional `fromRequest?: TournamentRequest`. In `initializeForm()`, when `data.fromRequest` is set, pre-fill fields from the request (tournament_name, tournament_type, cricket_format, venue_name, start_date, end_date, number_of_matches, number_of_teams, country, city, match_timings, prize). For groups: set `group_mode` to `'group_wise'` if `fromRequest.number_of_groups > 1`, else `'open'`; set `number_of_groups` to the request’s value (or 2 when group_wise). Do **not** set organizer (admin must choose). |
| 2.1.4 | **After create (optional)** | After successful create, close the request detail dialog and refresh the list; optionally show a success message. |

**Files to touch**

- `backoffice/.../tournament-request-detail-dialog/`: add “Create tournament” button; open manage dialog with `{ mode: 'create', fromRequest: tournamentRequest }`.
- `backoffice/.../manage-tournament-dialog/manage-tournament-dialog.component.ts`: extend dialog data with `fromRequest?`; in `initializeForm()` branch on `data.fromRequest` and patch form (including `group_mode` and `number_of_groups`).

---

### Step 3–5: Done

- **Step 3** – Group badge on fixtures: MatchCard and FixturesTab show “Group N” / “Knockout” (see §1.1, §5).
- **Step 4** – Tournament overview format: “Single table” / “Groups: N” on UpcomingTournamentDetails, ScorecardDetails, Tournaments list (see §5).
- **Step 5** – Move team to group: PATCH endpoint, UpdateTournamentTeamRequest, `updateTournamentTeamGroup` mutation, dropdown in TournamentSavedTeams (see §1.3, §2, §5).

---

### Step 6: Season stats by group (API + App, optional)

**Goal:** Filter season stats (top run scorers, wicket takers, etc.) by group via optional `?group_index=` and a group filter in the app.

| Area | Task |
|------|------|
| **API** | `TournamentStatsController::seasonStats`: accept optional query `group_index` (1..N). When present, restrict stats to matches where `match.group_index = group_index`. |
| **App** | `getTournamentSeasonStats`: optional param `group_index`. In stats view, add dropdown “All” / “Group 1” / “Group 2” … when tournament has groups; refetch with selected `group_index`. |

**Files to touch**

- `api/app/Http/Controllers/User/TournamentStatsController.php`: in `seasonStats()`, read `request('group_index')`; if valid, filter match set by `group_index`.
- `app/src/store/api/tournamentApi.js`: add optional `group_index` to `getTournamentSeasonStats` query params.
- App stats view (e.g. scorecard StatsTab): group filter UI and pass `group_index` into the query.

---

### Implementation order (remaining)

| Order | Step | Notes |
|-------|------|--------|
| 1 | **Step 2** – Create tournament from request | Improves backoffice UX. |
| 2 | **Step 6** – Season stats by group | Optional; can be done last. |
