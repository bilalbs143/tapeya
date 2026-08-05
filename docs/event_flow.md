# Tournament Flow

End-to-end flow from tournament request to scheduled tournament matches. Defines who does what and what is implemented vs planned.

---

## 1. Overview

| Step | Actor    | Action                    | Status   |
|------|----------|---------------------------|----------|
| 1    | **User** | Request tournament (tournament request) | ✅ Done  |
| 2    | **Admin**| Verify tournament request & create tournament | ✅ Done  |
| 3    | **Sponsor** / **Organizer** | Create teams (organizer can create on sponsor’s behalf) | ✅ Done (API) |
| 4    | **Organizer** | Add teams to event; create schedule (add teams to match) | ✅ Done (API) |
| 5    | **Organizer** | Announce squad for match (multiple players per team; not playing eleven) | ✅ Done (API) |
| 6    | **Organizer** | Start match: toss, then playing eleven from squad | ✅ Done (API) |
| 7    | **Organizer** | Scorecard: ball-by-ball updates       | ✅ Done (API) |

---

## 2. Step 1: User requests tournament (tournament request) ✅

**Actor:** User (app).

**Behaviour:**

- User submits a **tournament request** (to run a tournament) with:
  - Contact (name, phone)
  - Event name, type, cricket format, venue
  - Start/end dates, number of matches, number of teams, expected players count
  - Country, city, match timings (day / night / day & night)

**Implementation:**

- **User API:** `TournamentRequestController` — store tournament request.
- **Model:** `TournamentRequest` (`tournament_requests`), status: `pending` | `approved` | `rejected`.
- **Event:** `TournamentRequestSubmitted` → admin notification.

---

## 3. Step 2: Admin verifies and creates tournament ✅

**Actor:** Admin (backoffice).

**Behaviour:**

- Admin reviews tournament requests (list, filter by status).
- Admin approves or rejects a request.
- On **approve**, admin creates a **Tournament** (from the tournament request). The tournament is the verified, live entity used for teams and schedule.
- Admin selects an **organizer** (any app user — assigned via `tournaments.organizer_id`) via a searchable dropdown. That assignment is what grants tournament management in the app (see [APP_CAPABILITIES.md](./APP_CAPABILITIES.md)). No contact info (name, phone) is collected on tournament creation.

**Implementation:**

- **Admin API:** `TournamentRequestController` (approve/reject), `TournamentController` (CRUD for tournaments), `GET /admin/users/search?search=` (unified app-user typeahead for organizer selection and other pickers).
- **Models:** `TournamentRequest`, `Tournament` (`tournaments`). Tournament has `organizer_id` (FK to users) — the user who manages the tournament.
- Tournament fields include: organizer_id, event name, type, format, venue, dates, number of matches/teams, match timings, status, images.
- Authorization for organizer actions (matches, squads, toss, scorecard, etc.): user must be the tournament's organizer (`tournament.organizer_id === user.id`).

---

## 4. Step 3: Create teams ✅ Done (API)

**Actors:** Team owner (`teams.user_id`), or **tournament staff** for teams attached to their tournament. Creating a team **for another user** is admin-only (app users create only for themselves).

**Behaviour:**

- For a given (approved) **tournament**, **teams** are created by app users (self-owned) or by **admin** on behalf of an owner.
- Team owner (or tournament staff for that team’s tournament) assigns players to the squad.

**Create team — fields**

| Field           | Description |
|-----------------|-------------|
| **name**        | Team name. |
| **logo**        | Team logo (image URL or file). |
| **code**        | Short code (e.g. team abbreviation). |
| **country**     | Country. |
| **city**        | City. |
| **user_id**     | Sponsor’s user id (team belongs to this sponsor). |
| **created_by**  | Optional. Who created the team: sponsor or organizer (user_id or role so we know if it was created by sponsor vs organizer on behalf). |
| **Icon players**| List of **user_id** (player ids) designated as icon/star players for the team. |

**To implement:**

- Sponsor-facing and organizer-facing APIs/screens to:
  - List events (and, for organizer, list sponsors) so teams can be created for an event or on behalf of a sponsor.
  - **Create team** with: name, logo, code, country, city, user_id (sponsor), created_by (optional), icon players (user_id list).
  - Edit team and manage **squad/players** (add/remove players; drafting flow if required).
- Data model: **teams** table with: name, logo, code, country, city, user_id (sponsor), created_by (nullable; user_id of creator — sponsor or organizer). **team_icon_players** or a JSON/array for icon player user_ids. **event_team** / **team_user** (or similar) to link teams to tournaments and to squad members.

---

## 5. Step 4: Organizer creates schedule (add teams to match) ✅ Done (API)

**Actor:** Organizer.

**Behaviour:**

Once teams are created (Step 3), the **organizer** creates the **schedule** for the tournament. For each **match**, the organizer **adds teams to the match** — i.e. selects which teams will play (e.g. Team A vs Team B) — and sets match details. Each schedule entry (match/fixture) includes:

| Field           | Description / options |
|-----------------|------------------------|
| **Teams in match** | **Add/select teams** for this match (e.g. Team A vs Team B). Organizer picks from the event’s teams; typically 2 teams per match. |
| **Date**        | Match date. |
| **Time**        | Match time. |
| **Venue**       | Venue for this match. |
| **Overs format** | e.g. **Club**, **Tournament** (or league/tournament/friendly as in current `TournamentTypeEnum`). |
| **Ball type**   | e.g. **Leather ball**, **Tennis ball** (map to existing or new enum: e.g. `hard_ball`, `tape_ball`, `tennis_ball`, `hard_tennis`). |
| **Players per side** | Wickets / squad size: **2 to 20** players per side. |

**To implement:**

- Organizer-facing APIs/screens to:
  - List events and their **teams** (created in Step 3).
  - Create **matches/fixtures** for an event: organizer **adds teams to the match** (select 2 teams from event teams), then sets date, time, venue, overs format, ball type, players per side.
- Data model: **matches** or **fixtures** (or **event_matches**) linked to `events` and to **teams** (e.g. match_team pivot or home_team_id / away_team_id), with the above attributes.
- Validation: players per side between 2 and 20.

---

## 6. Step 5: Organizer announces squad for match ✅ Done (API)

**Actor:** Organizer.

**Behaviour:**

Once teams are added to the match (Step 4), the **organizer** **announces the squad** for that match. For each team in the match, the organizer adds **multiple players** to the match squad. This is **not** the playing eleven — the squad is the larger list of players (e.g. 15–18) from which the playing eleven will be chosen **after the toss** (Step 6).

- **Squad** = list of players announced for the match per team (can be more than 11).
- **Playing eleven** = 11 players who will actually play; selected **after** the toss (see Step 6).

**To implement:**

- Organizer-facing APIs/screens to:
  - For a scheduled match, **announce squad**: add multiple players (user_id) per team. Players must be from the team's roster/squad (or event squad). Squad size can follow event/match rules (e.g. max 15–20).
- Data model: **match_squad** or similar (match_id, team_id, user_id) — one row per player in the announced squad. Playing eleven is stored separately **after** toss (Step 6).

---

## 7. Step 6: Organizer starts match (toss, then playing eleven) ✅ Done (API)

**Actor:** Organizer.

**Behaviour:**

For a scheduled match with **squad announced** (Step 5), the organizer **starts the match** in this order:

1. **Toss**
   - Record which team won the toss and what they chose (bat first / bowl first).
   - Example: *"Team X won the toss and chose to bowl first."*

2. **Playing eleven** (after toss)
   - **After** the toss, from each team's **announced squad** (Step 5), the organizer selects the **playing eleven** (11 players who will take the field).
   - Each of the 11 is designated as batsman/bowler (or playing role: batsman, bowler, all-rounder, wicketkeeper).

**To implement:**

- Organizer-facing APIs/screens to:
  - Start a match (match status: e.g. from "scheduled" to "in_progress" or "toss_done").
  - Record **toss**: winning team, choice (bat / bowl).
  - **Then** for each team, **select playing eleven**: choose 11 players from the **announced squad** (not from the full team roster) and assign batting/bowling (or playing) roles.
- Data model: match stores toss outcome (winning_team_id, chose_to_bat_or_bowl). **Playing eleven** as match_players or similar (match_id, team_id, user/player_id, role: batsman/bowler etc.); players must be from the match squad for that team.

**Implementation (API):** `PATCH /api/v1/matches/{match}/toss` (body: winning_team_id, chose_to_bat_or_bowl); recording toss creates the two innings (1 & 2) with batting/bowling teams from toss. `POST /api/v1/matches/{match}/teams/{team}/playing-eleven` (body: player_ids). Match status set to `toss_done`. GET squad and playing-eleven: `GET .../teams/{team}/squad`, `GET .../teams/{team}/playing-eleven`.

---

## 8. Step 7: Scorecard management (ball-by-ball) ✅ Done (API)

**Actor:** Organizer.

**Behaviour:**

The organizer updates the **scorecard** **ball by ball** during the match. The scorecard is maintained **innings-wise**.

**Innings structure**

- Every match has **exactly 2 innings**.
- **Innings 1:** One team bats, the other bowls (batting team and bowling team determined by toss).
- **Innings 2:** The other team bats, the first team bowls.
- All scorecard data (balls, runs, wickets, partnerships, totals) is stored **per innings**. Each ball belongs to one innings; match totals and player stats are derived from the two innings.

**Scorecard & profile stats — three types**

Scorecard and player profile stats are classified by **tournament type** (same as `TournamentTypeEnum`):

| Type              | Value            | Use |
|-------------------|------------------|-----|
| **League**        | `league`         | League matches & stats. |
| **Open Tournament** | `open_tournament` | Open tournament matches & stats. |
| **Emerging**      | `emerging`       | Emerging matches & stats. |

Aggregated stats (batting/bowling) for a player can be filtered or shown separately by these three tournament types.

**Per-ball data (each delivery)**

For every ball, the organizer sends **who is on strike** so that runs, balls faced, and boundaries are attributed to the correct player. Store **striker** and **non-striker** on each delivery.

| Field / concept   | Description / options |
|-------------------|------------------------|
| **Striker**       | Required. Player id of the batsman on strike (facing this ball). All batting stats for this ball are attributed to the striker: runs off the bat, balls faced (except wides), fours, sixes, dots. |
| **Non-striker**   | Required. Player id of the batsman at the other end. Used for partnership and for strike rotation (who becomes striker next ball). |
| **Runs**          | Runs scored (0–6+, or more for boundaries + overthrows). Credited to striker if off the bat; to extras if byes/leg byes. |
| **No ball**       | Flag: delivery was a no ball (extra run + possible runs off bat). Ball counts for striker's balls faced; runs off bat to striker. |
| **Wide ball**     | Flag: delivery was a wide (extra run + possible runs). Does not count as a ball faced by the striker. |
| **Leg bye (lb)**  | Flag: runs as leg byes (not off bat). Runs go to extras; striker still gets a ball faced. |
| **Bye**           | Flag: runs as byes (not off bat). Runs to extras; striker gets a ball faced. |
| **Out**           | Flag: wicket fell this ball; link to batter out, **dismissal type** (see below), fielder/catcher if applicable. |
| **Other extras**  | Penalty, etc., as needed. |

**Strike and stats attribution:** For each ball we must store the **striker**. Runs off the bat, balls faced (including no-balls; excluding wides), and fours/sixes/dots are all attributed to the striker. After each ball, if runs are odd (or on certain extras), striker and non-striker swap; the next delivery must again record who is on strike so aggregates remain correct.

All **possible combinations** are supported (e.g. no ball + 2 runs, wide + out, leg bye + 1 run, etc.). Validation and business rules should allow any valid combination (e.g. no ball + wicket, wide + runs).

**Dismissal type (when out)**

When a wicket falls, the organizer sends **how** the batter was out. Supported values (param / enum to implement later):

| Value                    | Label                |
|--------------------------|----------------------|
| `bowled`                 | Bowled               |
| `caught`                 | Caught               |
| `stumped`                | Stumped              |
| `lbw`                    | LBW                  |
| `run_out`                | Run Out              |
| `over_the_fence`         | Over the Fence       |
| `mankad`                 | Mankad               |
| `retired`                | Retired              |
| `hit_wicket`             | Hit Wicket           |
| `hit_ball_twice`         | Hit Ball Twice       |
| `timed_out`              | Timed Out            |
| `one_hand_one_bounce`    | One Hand One Bounce  |
| `obstructing_the_field`  | Obstructing the Field |

For **caught** / **run out** / **stumped** (and others where relevant), also send fielder/catcher and optionally other involved player IDs.

**Partnership**

- **Partnership** between two batsmen is maintained: the runs scored while that pair is at the crease together.
- Store or derive: for each pair (batter A, batter B), the partnership runs and optionally balls faced during that stand.
- When a wicket falls, the current partnership ends; the new batter forms a new partnership with the non-striker. Totals can be computed from ball-by-ball data (striker + non_striker IDs per ball, runs per ball) or stored explicitly per partnership segment.

**Shot / side of ground (fielding position)**

Additionally, for each ball the organizer can send **which side of the ground** the shot went to (or where the ball went). Options — use `ShotPositionEnum`:

| Value            | Label          |
|------------------|----------------|
| `deep_fine_leg`  | Deep fine leg  |
| `third_man`      | Third man      |
| `deep_point`     | Deep point     |
| `deep_cover`     | Deep cover     |
| `long_off`       | Long off       |
| `long_on`        | Long on        |
| `mid_wicket`     | Mid wicket     |
| `square_leg`     | Square leg     |

**Detailed match stats (max stats to maintain)**

The following stats are maintained **per innings** (each match has 2 innings), then aggregated at match level and to player profile by event type (league / open tournament / emerging). Implement as derived from ball-by-ball data or stored aggregates.

**Batting (per player, per innings; then aggregate per match / per event type)**

| Stat              | Description |
|-------------------|-------------|
| Runs              | Total runs scored (including boundaries). |
| Balls faced       | Number of balls faced. |
| Fours             | Number of 4s. |
| Sixes             | Number of 6s. |
| Dots              | Balls with 0 runs (off bat). |
| Strike rate       | (Runs / Balls faced) × 100. |
| Batting position  | Order in which they batted (1–11). |

**Bowling (per bowler, per innings; then aggregate per match / per event type)**

| Stat              | Description |
|-------------------|-------------|
| Overs             | Overs bowled (e.g. 4.2 = 4 full + 2 balls). |
| Maidens           | Maiden overs (0 runs in that over). |
| Runs conceded     | Total runs given away (including extras attributed to bowler where applicable). |
| Wickets           | Number of wickets taken. |
| No balls          | No balls bowled. |
| Wides             | Wides bowled. |
| Economy           | Runs per over (runs / overs). |
| Dot balls         | Balls with 0 runs (off bat + not extra). |

**Extras (per innings / per match)**

| Stat              | Description |
|-------------------|-------------|
| Byes              | Runs as byes. |
| Leg byes          | Runs as leg byes. |
| Wides             | Wide balls (count + extra runs). |
| No balls          | No balls (count + extra runs). |
| Penalty           | Penalty runs. |
| Total extras      | Sum of all extra runs. |

**Match / innings totals**

Each **innings** has its own totals (runs, wickets, fours, sixes, extras, etc.). A **match** has 2 innings, so match-level view is the sum or display of both innings.

| Stat              | Description |
|-------------------|-------------|
| Total runs        | Innings total (batting runs + extras). One value per innings; match = Innings 1 + Innings 2. |
| Total wickets     | Wickets lost in that innings. |
| Total fours       | Team fours in innings. |
| Total sixes       | Team sixes in innings. |
| Total extras      | Innings extras (breakdown: byes, leg byes, wides, no balls, penalty). |
| Total no balls    | Count of no balls in innings. |
| Total wides       | Count of wides in innings. |
| Run rate          | Runs per over (total / overs). |
| Powerplay runs    | (Optional) Runs in powerplay overs if format has powerplay. |

**Partnership stats (per pair, per innings)**

| Stat              | Description |
|-------------------|-------------|
| Partnership runs  | Runs added by that pair. |
| Balls in partnership | Balls faced during that stand. |
| Wicket number     | Which wicket (1–10) this partnership was for. |

**Fielding (per player, per match / per event type)**

| Stat              | Description |
|-------------------|-------------|
| Catches           | Catches taken. |
| Run outs          | Run outs (direct or assist). |
| Stumpings         | Stumpings (for wicketkeeper). |

**To implement**

- Organizer APIs/screens to add/update balls (ball-by-ball) **per innings** (select innings 1 or 2 for the match).
- Data model:
  - **innings** table: match_id, innings_number (1 or 2), batting_team_id, bowling_team_id, optional status. Each match has exactly 2 innings.
  - **balls** or **deliveries** table: **innings_id** (required; links to which of the 2 innings), over, ball_in_over, **striker_id** (required), **non_striker_id** (required), bowler_id, runs, is_no_ball, is_wide, is_leg_bye, is_bye, is_wicket, **dismissal_type** (enum above), out_player_id, fielder_id (optional), **shot_position** (nullable, `ShotPositionEnum`), etc. Storing striker on every ball ensures runs, balls faced, fours, sixes and dots are attributed to the correct player.
- Store or derive **partnerships** (pair of batters + runs/balls for that stand).
- Derive or store all **detailed match stats** above from ball-by-ball data; expose per match, per innings, and per player (with event-type filter: league / open tournament / emerging).
- Event type is inherited from the match’s event; use it to tag scorecard and aggregate **profile stats** into the three buckets: league, open tournament, emerging.
- Expose event type, shot position, and **dismissal type** enums via enum endpoints when implemented.
- **Player stats** (batting, bowling, fielding) follow the [Player stats schema](player_stats_schema.md): we maintain **per match** stats and **accumulative stats by event type** (league / open tournament / emerging), plus international-style fields (average, strike rate, hundreds, fifties, best bowling, etc.).

**Implementation (API):** `innings` table and `balls` table; two innings created when toss is recorded. `POST /api/v1/matches/{match}/innings/{innings}/balls` to add a ball; `PATCH` and `DELETE` for update/remove. `GET /api/v1/matches/{match}/scorecard` returns both innings with balls and totals. When a ball is added, updated, or deleted, `RefreshMatchStatsJob` is dispatched to refresh materialized player stats. `DismissalTypeEnum` and `TossChoiceEnum` exposed via `GET /api/v1/enums`. For caught, run out, and stumped dismissals, `fielder_id` is required. Per-match and accumulative player stats follow [player_stats_schema.md](player_stats_schema.md).

---

## 9. Flow summary

```
User                    Admin                   Sponsor                Organizer
  |                       |                         |                        |
  |-- Request event ----->|                         |                        |
  |   (event_requests)    |                         |                        |
  |                       |-- Verify & create ----->|                        |
  |                       |   (events)              |                        |
  |                       |                         |-- Create teams ------->|
  |                       |                         |   (sponsor or organizer |
  |                       |                         |    on sponsor's behalf)|
  |                       |                         |                        |-- Create schedule: add teams
  |                       |                         |                        |   to each match (matches: teams,
  |                       |                         |                        |    date, time, venue,
  |                       |                         |                        |    overs format,
  |                       |                         |                        |    ball type,
  |                       |                         |                        |    players per side 2–20)
  |                       |                         |                        |
  |                       |                         |                        |-- Announce squad (multiple players
  |                       |                         |                        |   per team; not playing eleven)
  |                       |                         |                        |
  |                       |                         |                        |-- Start match: toss
  |                       |                         |                        |   (Team X won, chose to bowl)
  |                       |                         |                        |-- Playing eleven from announced squad
  |                       |                         |                        |   (11 players, batsmen + bowlers)
  |                       |                         |                        |
  |                       |                         |                        |-- Scorecard: innings-wise (2 innings
  |                       |                         |                        |   per match), ball-by-ball per innings
  |                       |                         |                        |   (runs, no ball, wide, lb, out,
  |                       |                         |                        |    shot position; stats by league
  |                       |                         |                        |    / open tournament / emerging)
```

---

## 10. Current enums (for reference)

- **Tournament type:** `TournamentTypeEnum` — league, open_tournament, emerging (scorecard & profile stats use these three types).
- **Cricket format / ball type:** `CricketFormatEnum` — hard_ball, tape_ball, tennis_ball, hard_tennis.
- **Match timings:** `MatchTimingEnum` — day, night, day_and_night.
- **Shot position (side of ground):** `ShotPositionEnum` — deep_fine_leg, third_man, deep_point, deep_cover, long_off, long_on, mid_wicket, square_leg (for ball-by-ball scorecard).
- **Dismissal type (when out):** to be implemented — bowled, caught, stumped, lbw, run_out, over_the_fence, mankad, retired, hit_wicket, hit_ball_twice, timed_out, one_hand_one_bounce, obstructing_the_field.

Overs format (club vs tournament) and “players per side” (2–20) are to be added or mapped to existing event/match models when implementing Step 4.

---

**Status:** Steps 1–7 implemented (API). Steps 3–7: teams, schedule, squad, toss & playing eleven, scorecard (ball-by-ball + partnerships + player stats). Player stats use Option B (materialized tables); see [player_stats_schema.md](player_stats_schema.md).
