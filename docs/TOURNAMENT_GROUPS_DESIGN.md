# Tournament Groups – Design & Implementation Plan

This document is the **single reference for everything related to tournament groups**: from user tournament request (Open Group vs Group Wise, number of groups) through organizer flow (assigning teams to groups, creating group-stage and knockout matches) to scorecard (standings and stats per group).

**In scope:** Data model (DB columns), API (request/response, validation), Backoffice (create/edit tournament, request detail), App (tournament request form, organizer add teams/matches, scorecard points table), implementation order, edge cases, and file checklist. **Not in scope:** General tournament/match flow that is unchanged (e.g. toss, playing eleven, ball-by-ball scoring) — see `event_flow.md` for that.

---

## 1. Current State Summary

| Layer | What exists today |
|-------|-------------------|
| **User tournament request** | Contact, tournament name, type, format, venue, dates, **number_of_teams**, expected_players_count, country, city, match_timings, prize. **No number_of_groups.** |
| **Tournament (admin)** | Same fields + organizer_id, status, images. **No number_of_groups.** |
| **tournament_team pivot** | `tournament_id`, `team_id` only. No group. |
| **matches** | `tournament_id`, `home_team_id`, `away_team_id`, date, time, venue, players_per_side, overs, status, etc. **No group.** |
| **Standings API** | `GET /tournaments/{id}/standings` returns a **single flat list** of teams with played/won/lost/tied/points/nrr for the **entire tournament**. |
| **Season stats API** | `GET /tournaments/{id}/season-stats` – tournament-wide only. |
| **App – TournamentRequest** | Form has number_of_teams. **No number_of_groups.** |
| **App – Organizer** | Add team to tournament (no group). Create match by picking any two tournament teams. |
| **App – Scorecard TableTab** | Uses standings API; shows one points table. Mock `pointsTableData.js` has `POINTS_TABLE_GROUPS` but not wired to API. |

---

## 2. Target Behaviour (With Groups)

- **Request / Create tournament:** User (and admin) choose **group mode** via a **radio** with two options:
  - **Open Group** — single table (no groups). Stored as `number_of_groups = 1`.
  - **Group Wise** — group stage. When selected, show a **Number of groups** input (e.g. 2–16). Stored as `number_of_groups` = that value.
- The UI is the same in both **App (Tournament Request)** and **Backoffice (Create/Edit Tournament)**: radio “Open Group” | “Group Wise”, then **only when “Group Wise” is selected** show the “Number of groups” input.

**Group mode UI (App + Backoffice):**

- **Control:** Radio button group with two options:
  - **Open Group** — single table; no groups. Store `number_of_groups = 1`.
  - **Group Wise** — group stage. Store `number_of_groups` = value from the number input.
- **Conditional field:** When **Group Wise** is selected, show a **Number of groups** input (numeric, min 2, max 16). When **Open Group** is selected, hide this input (or disable and clear it).
- **Submit:** Open Group → send `number_of_groups: 1`. Group Wise → send `number_of_groups` = the value entered.

- **Organizer – teams:** When adding a team to a tournament with groups, organizer **assigns the team to a group** (Group 1, Group 2, …). Listing “saved teams” shows group.
- **Organizer – matches:** When creating a match:
  - **Group stage:** Select a group; then pick home/away from that group only.
  - **Knockout/playoff:** Option to create a match “outside” any group (e.g. semi-final, final); pick any two teams from the tournament.
- **Scorecard:**
  - **Standings:** If tournament has groups, show **one points table per group** (Group A, Group B, …). If single table (`number_of_groups === 1`), show current single table.
  - **Season stats:** Can remain tournament-wide; optional later: filter by group.

---

## 3. Data Model Changes

### 3.1 Tournaments & Tournament Requests

- **`tournament_requests`:** Add `number_of_groups` (unsigned tinyint, default 1, min 1, max e.g. 16).
- **`tournaments`:** Add `number_of_groups` (same as above).

**Semantics:** `number_of_groups === 1` means “no groups” (single table / **Open Group**). `number_of_groups >= 2` means **Group Wise** (that many groups). Backward compatible: existing rows can default to 1.

**No separate column for “group wise” vs “open group”:** The mode is derived from `number_of_groups` only. Do **not** add a `group_mode`, `is_group_wise`, or similar column — it would be redundant and could get out of sync. The UI uses a radio for UX, but the API and DB store only `number_of_groups` (1 = Open Group, 2–16 = Group Wise).

### 3.2 Tournament–Team (Pivot)

- **`tournament_team`:** Add `group_index` (unsigned tinyint, nullable).
  - When `tournament.number_of_groups > 1`: each team must have `group_index` in `1 .. number_of_groups`.
  - When `number_of_groups === 1`: `group_index` can be null (or 1) for all.

**Option considered:** Separate `tournament_groups` table (id, tournament_id, name). For simplicity we use **group_index** (1-based) and derive labels in app (“Group A”, “Group 1”, etc.) from index. Can add a `tournament_groups` table later if names need to be editable.

### 3.3 Matches

- **`matches`:** Add `group_index` (unsigned tinyint, nullable).
  - **NotNull (1..N):** Group-stage match; both teams should belong to that group (validated in API).
  - **Null:** Knockout/playoff/final; no group restriction on teams.

---

## 4. API Changes (Step-by-Step)

### 4.1 Tournament Request (User)

| Item | Change |
|------|--------|
| **Request** | `StoreTournamentRequestRequest`: add `number_of_groups` (optional, integer, min 1, max 16). Default 1 if omitted. |
| **Model** | `TournamentRequest`: add `number_of_groups` to fillable and migration. |
| **Resource** | User tournament request response: include `number_of_groups` (for success page only if needed). |

### 4.2 Admin – Tournament Request & Tournament CRUD

| Item | Change |
|------|--------|
| **Admin resources** | `TournamentRequestResource`: include `number_of_groups`. |
| **StoreTournamentRequest (admin)** | Add `number_of_groups` (optional, integer, min 1, max 16). |
| **UpdateTournamentRequest (admin)** | Add `number_of_groups` (same). |
| **Tournament model** | Add `number_of_groups` to fillable; migration on `tournaments`. |
| **TournamentResource (admin)** | Include `number_of_groups`. |

### 4.3 User – Tournament Resource & Teams

| Item | Change |
|------|--------|
| **TournamentResource (user)** | Include `number_of_groups` so app knows if tournament has groups. |
| **Attach teams** | `AttachTeamsToTournamentRequest`: add optional `group_index` (integer, min 1, max e.g. 16). When tournament has `number_of_groups > 1`, require `group_index` within 1..number_of_groups. |
| **Pivot** | When attaching, save `group_index` on `tournament_team`. |
| **List teams** | `GET /tournaments/{id}/teams`: include `group_index` (and optionally `group_label`) per team. So `TeamResource` when used in tournament context, or a wrapper, must expose group. Easiest: **response** from list tournament teams includes group_index per team (e.g. from pivot). |

**Implementation note:** List teams: use `tournament->teams()->withPivot('group_index')->get()` and in resource (or a dedicated TournamentTeamResource) expose `group_index` from pivot.

### 4.4 Matches

| Item | Change |
|------|--------|
| **Store match** | `StoreTournamentMatchRequest`: add optional `group_index` (nullable integer, 1..N). If provided, validate that both `home_team_id` and `away_team_id` belong to that group for this tournament. |
| **Match model** | Add `group_index` to fillable; migration. |
| **Match resource** | Include `group_index` in match response (for schedule/fixtures to show “Group A”, etc.). |

### 4.5 Standings

| Item | Change |
|------|--------|
| **Response shape** | When `tournament.number_of_groups <= 1`: keep current format `{ tournament_id, standings: [ {...}, ... ] }`. |
| **When number_of_groups > 1** | Return `{ tournament_id, number_of_groups, groups: [ { group_index: 1, group_name: "Group A", standings: [ ... ] }, ... ] }`. Compute standings per group: only teams in that group_index and only matches that have that group_index. |
| **Query param (optional)** | `?group_index=1` to return only that group’s standings (for app flexibility). |

### 4.6 Season Stats (Optional)

- Keep tournament-wide only for now.
- Later: optional `?group_index=1` to filter batting/bowling stats to matches in that group.

---

## 5. Backoffice Changes (Step-by-Step)

| # | Task | Details |
|---|------|---------|
| 1 | **Tournament request list/detail** | Show `number_of_groups` in request detail. No form change if admin only updates status; if admin can edit request, add field. |
| 2 | **Create tournament (from request or standalone)** | Add **radio**: “Open Group” | “Group Wise”. When **Group Wise** is selected, show **Number of groups** input (2–16). Default: Open Group. When creating from request, pre-fill from request (if request had group_wise, set radio + number). Submit: Open Group → `number_of_groups = 1`; Group Wise → `number_of_groups` = input value. |
| 3 | **Edit tournament** | Same radio + conditional Number of groups. Allow edit (consider: reducing groups may require reassigning teams – validation or warning). |
| 4 | **Tournament request service / types** | Include `number_of_groups` in request payload when creating tournament from request (if that flow exists) and in TypeScript types. |

---

## 6. App Changes (Step-by-Step)

### 6.1 Tournament Request (User)

| # | Task | Details |
|---|------|---------|
| 1 | **Form – radio** | Add a **radio** with two options: **Open Group** | **Group Wise**. Default: Open Group. |
| 2 | **Form – conditional input** | When **Group Wise** is selected, show **Number of groups** input (number, 2–16). Hide when Open Group is selected. |
| 3 | **Validation** | `tournamentRequestSchema`: add `group_mode` (enum: `'open' \| 'group_wise'`) and `number_of_groups` (required when group_mode is `group_wise`, 2–16; optional otherwise). |
| 4 | **Submit** | Open Group → send `number_of_groups: 1`. Group Wise → send `number_of_groups` = value from input. |

### 6.2 Organizer – Teams

| # | Task | Details |
|---|------|---------|
| 1 | **Add team** | When tournament has `number_of_groups > 1`, show group selector (Group 1, 2, …). Pass `group_index` in `attachTeamsToTournament` mutation. |
| 2 | **Saved teams list** | Show each team’s group (e.g. “Group A”). Use `group_index` from list teams response. Optionally allow “Move to group” if product needs it. |
| 3 | **API** | `attachTeamsToTournament` mutation: accept `group_index` when tournament has groups. `getTournamentTeams`: handle response that includes `group_index` per team. |

### 6.3 Organizer – Create Match (Start Match / Fixture)

| # | Task | Details |
|---|------|---------|
| 1 | **Match form** | If tournament has groups: add “Match type” or “Group” dropdown: “Group 1”, “Group 2”, …, “Knockout / Playoff”. |
| 2 | **Team dropdowns** | If “Group X” selected: filter team list to teams in that group only. If “Knockout”: show all tournament teams. |
| 3 | **Submit** | Send `group_index` when group stage (1..N); omit or null for knockout. |
| 4 | **Schedule/fixtures list** | Show group badge/label per match when applicable. |

### 6.4 Scorecard – Points Table (TableTab)

| # | Task | Details |
|---|------|---------|
| 1 | **API** | Use updated standings endpoint: response either `standings` (single) or `groups` (array of { group_index, group_name, standings }). |
| 2 | **TableTab** | If response has `groups`, render **one table per group** (e.g. section per group or tabs). If single `standings`, keep current single table. |
| 3 | **Tags/cache** | Ensure cache invalidation still works (e.g. when match result changes, standings refetch). |

### 6.5 Scorecard – Season Stats (StatsTab)

| # | Task | Details |
|---|------|---------|
| 1 | **Current** | Keep tournament-wide. No change required for first iteration. |
| 2 | **Later** | Optional group filter and API `?group_index=` if needed. |

### 6.6 Other App Touchpoints

- **Tournament detail / overview:** Show “Groups: 4” or “Single table” based on `number_of_groups`.
- **Upcoming tournaments / fixtures:** If match has `group_index`, show “Group A” etc. in match card where relevant.

---

## 7. Implementation Order (Recommended)

Implement in this order to keep API and clients in sync and avoid breaking existing behaviour.

### Phase 1 – Data & API (backward compatible)

1. **Migrations**
   - `tournament_requests`: add `number_of_groups` (default 1).
   - `tournaments`: add `number_of_groups` (default 1).
   - `tournament_team`: add `group_index` (nullable).
   - `matches`: add `group_index` (nullable).

2. **Models & validation**
   - TournamentRequest, Tournament: fillable + casts if needed.
   - TournamentMatch: fillable.
   - Tournament::teams(): `withPivot('group_index')`.

3. **Request/response**
   - User: StoreTournamentRequestRequest + TournamentRequest model + resource (number_of_groups).
   - Admin: StoreTournamentRequest, UpdateTournamentRequest, Tournament model, TournamentResource, TournamentRequestResource (number_of_groups).
   - User Tournament resource: add number_of_groups.
   - AttachTeamsToTournamentRequest: add group_index (required when tournament.number_of_groups > 1).
   - TournamentTeamController::index: return teams with pivot group_index (e.g. custom resource or append).
   - StoreTournamentMatchRequest: add group_index (optional); validate teams in group when group_index present.
   - TournamentMatch model + TournamentMatchResource: group_index.

4. **Standings**
   - TournamentStatsController::standings: if number_of_groups > 1, compute per-group standings and return `groups` array; else return current flat `standings`.

### Phase 2 – Backoffice

5. **Backoffice**
   - Tournament request detail: display number_of_groups.
   - Manage tournament dialog (create/edit): add Number of groups field; form and API payload.
   - Types/services: number_of_groups in tournament and request types and create/update payloads.

### Phase 3 – App

6. **App – Tournament request**
   - Form + validation + submit: number_of_groups.

7. **App – Organizer teams**
   - Add team: group selector when tournament has groups; attach with group_index.
   - Saved teams: show group from API.

8. **App – Organizer matches**
   - StartMatch: group/match-type dropdown; filter teams by group; send group_index.

9. **App – Scorecard**
   - TableTab: support groups response; render one table per group.
   - Remove or keep mock pointsTableData.js only for non-API fallback; prefer API.

---

## 8. Edge Cases & Validation

- **Reducing number_of_groups:** If tournament already has teams in group 4 and admin sets number_of_groups to 2, either reject or require reassigning teams (e.g. in app) before saving. Recommend: allow edit but show warning; organizer must move teams to valid groups.
- **Match validation:** When creating a group-stage match (group_index set), ensure both home and away teams have that group_index in tournament_team. Return 422 if not.
- **Standings when no groups:** number_of_groups === 1 or null: existing behaviour (single standings array). No breaking change for existing clients.
- **Updating a team’s group (optional):** If product needs “Move team to another group”, add an API to update the `group_index` for an existing tournament_team row (e.g. PATCH/PUT on the attach or a dedicated endpoint). Not required for MVP; organizer can remove and re-add the team to the new group if needed.

---

## 9. Files to Touch (Checklist)

Use this list to verify each touchpoint when implementing.

### API (Laravel)

| File | Change |
|------|--------|
| **Migrations** | New migration: `tournament_requests.number_of_groups`, `tournaments.number_of_groups`, `tournament_team.group_index`, `matches.group_index`. |
| `api/app/Models/TournamentRequest.php` | Add `number_of_groups` to fillable. |
| `api/app/Models/Tournament.php` | Add `number_of_groups` to fillable; `teams()` relation `->withPivot('group_index')`. |
| `api/app/Models/TournamentMatch.php` | Add `group_index` to fillable. |
| `api/app/Http/Requests/User/StoreTournamentRequestRequest.php` | Add rule `number_of_groups` (optional, int, 1–16). |
| `api/app/Http/Requests/Admin/StoreTournamentRequest.php` | Add `number_of_groups`. |
| `api/app/Http/Requests/Admin/UpdateTournamentRequest.php` | Add `number_of_groups`. |
| `api/app/Http/Requests/User/AttachTeamsToTournamentRequest.php` | Add `group_index` (required when tournament has groups). |
| `api/app/Http/Requests/User/StoreTournamentMatchRequest.php` | Add optional `group_index`; validate teams in group. |
| `api/app/Http/Controllers/User/TournamentRequestController.php` | No logic change if request only passes validated data. |
| `api/app/Http/Controllers/User/TournamentTeamController.php` | `index`: return pivot `group_index`; `store`: save `group_index` on attach. |
| `api/app/Http/Controllers/User/TournamentMatchController.php` | `store`: accept and validate `group_index`. |
| `api/app/Http/Controllers/User/TournamentStatsController.php` | `standings`: when `number_of_groups > 1`, return per-group standings. |
| `api/app/Http/Resources/User/TournamentResource.php` | Add `number_of_groups`. |
| `api/app/Http/Resources/User/TournamentMatchResource.php` | Add `group_index`. |
| `api/app/Http/Resources/Admin/TournamentRequestResource.php` | Add `number_of_groups`. |
| `api/app/Http/Resources/Admin/TournamentResource.php` | Add `number_of_groups`. |
| Tournament teams response | Either extend TeamResource with pivot or return `group_index` in list (e.g. custom resource for tournament-teams). |

### Backoffice (Angular)

| File | Change |
|------|--------|
| `backoffice/src/app/services/tournament-request.service.ts` | Type: add `number_of_groups`. |
| `backoffice/src/app/services/tournaments.service.ts` | Tournament type + create/update payload: `number_of_groups`. |
| `backoffice/.../tournament-request-detail-dialog/*` | Display `number_of_groups` in request detail. |
| `backoffice/.../manage-tournament-dialog/*` | Form: **radio** “Open Group” \| “Group Wise”; when Group Wise, **Number of groups** input (2–16); submit `number_of_groups` (1 for Open, input value for Group Wise). |

### App (React)

| File | Change |
|------|--------|
| `app/src/lib/validations/tournamentRequest.js` | Schema: add `group_mode` ('open' \| 'group_wise'), `number_of_groups` (required when group_wise, 2–16). |
| `app/src/pages/TournamentRequest.jsx` | **Radio** “Open Group” \| “Group Wise”; when Group Wise, show **Number of groups** input; submit `number_of_groups` (1 for Open, input for Group Wise). |
| `app/src/store/api/tournamentApi.js` | `getTournamentStandings`: handle `groups` shape; `attachTeamsToTournament`: body `group_index`; `createTournamentMatch`: body `group_index`. |
| `app/src/pages/organizer/tournaments/TournamentAddTeam.jsx` | When tournament has groups, group selector; pass `group_index` to attach. |
| `app/src/pages/organizer/tournaments/TournamentSavedTeams.jsx` | Show group per team (from API). |
| `app/src/pages/organizer/scoring/StartMatch.jsx` | Group/match-type dropdown; filter teams by group; send `group_index`. |
| `app/src/pages/scorecard/tabs/TableTab.jsx` | If standings response has `groups`, render one table per group. |

---

## 10. Summary

| Area | Main change |
|------|-------------|
| **Request/Create (UI)** | **Radio**: “Open Group” \| “Group Wise”. When **Group Wise**, show **Number of groups** input (2–16). Stored as `number_of_groups` (1 = Open, 2–16 = Group Wise). Same UX in **App (Tournament Request)** and **Backoffice (Create/Edit Tournament)**. |
| **Request/Create (API)** | Add `number_of_groups` (1 = no groups, >1 = group stage). |
| **Teams** | Pivot has `group_index`; organizer assigns team to group when adding. |
| **Matches** | `group_index` optional; when set, group-stage match (both teams in that group); when null, knockout. |
| **Standings** | Per-group when number_of_groups > 1; single table when 1. |
| **App** | Request form, add-team group selector, match form group/type + team filter, TableTab by group. |

This plan keeps existing behaviour when `number_of_groups` is 1 and adds full group-stage support across API, backoffice, and app when it is greater than 1.
