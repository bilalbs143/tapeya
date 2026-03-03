# Player Stats Schema

Player statistics are derived from ball-by-ball scorecard data and aggregated per player. We maintain **per match** stats and **accumulative stats by tournament type** (and optionally overall). Structure follows international cricket conventions (ICC / ESPN Cricinfo–style).

**Source:** Ball-by-ball data and match/innings data (see [event_flow.md](event_flow.md)). The scorecard is **innings-wise**: every match has **exactly 2 innings**; each match belongs to a **tournament**, and each tournament has a **tournament_type** (`league` \| `open_tournament` \| `emerging`). All deliveries and totals are stored per innings; from that we derive per-match and accumulative-by-tournament-type stats.

**Striker on each ball:** Every delivery must store **striker** (and non-striker). Batting stats are attributed using the striker: runs off the bat, balls faced (no-balls count; wides do not), fours, sixes, and dots all go to the striker for that ball. This ensures player aggregates (runs, average, strike rate, boundaries) are correct.

---

## 1. Two levels of stats we maintain

We maintain stats at **two** levels (both derived from the same ball-by-ball + innings + match data):

| Level | Grain | Use |
|-------|--------|-----|
| **Per match** | One set of stats per **player × match** (and optionally per **player × match × innings**). | Match scorecard, “performance in this match”, match-wise breakdown in profile. |
| **Accumulative by tournament type** | One set of stats per **player × tournament_type** (league, open_tournament, emerging). Sum over all matches in tournaments of that type. | Player profile “League stats”, “Open Tournament stats”, “Emerging stats”; leaderboards by tournament type; **player ranking based only on Open Tournament stats** (see §7). |
| **Overall (optional)** | One set of stats per **player** (all matches, all tournament types). | “Career” or “All” view. |

**Flow (from [event_flow.md](event_flow.md)):** Tournament (has `tournament_type`) → Match (belongs to tournament) → Innings (2 per match) → Balls (per innings, with striker/bowler). So for **per match** we group by `player_id` + `match_id` (and optionally `innings_id`). For **accumulative by tournament type** we group by `player_id` + `tournament_type` (tournament_type comes from match → tournament).

---

## 2. Scope and dimensions

| Dimension      | Description |
|----------------|-------------|
| **Player**     | `user_id` / player id. |
| **Match**      | Each match has **2 innings**. Per-match stats: one row (or set) per player per match; accumulative stats sum over matches. |
| **Tournament type** | `league` \| `open_tournament` \| `emerging` (from `TournamentTypeEnum`). **Accumulative stats** are stored or computed **per tournament type**; “overall” = all types combined. |
| **Season / year** | Optional. Filter stats by event start date or a defined season window. |
| **Format**     | Optional. e.g. overs format (club vs tournament) or ball type; if we support multiple formats, stats can be split. |
| **Team**       | Optional. Stats when playing for a specific team. |

---

## 3. Batting statistics

Batting stats are counted only when the player **batted** in an innings (faced at least one ball or was out without facing). One row per innings; aggregates are sums/averages over those innings. **Attribution:** Each ball in the scorecard has a **striker**; runs off the bat, balls faced (no-balls count, wides do not), fours, sixes, and dots are all attributed to that striker. Aggregation is done by summing over balls where `player_id = striker_id` (and applying run/extra rules). This keeps every player’s stats correct.

### 3.1 Per-innings (raw) fields

| Field            | Key   | Type   | Description |
|------------------|-------|--------|-------------|
| Matches          | Mat   | int    | Number of **matches** in which the player batted (at least one innings). |
| Innings          | I     | int    | Number of **innings** in which the player batted (faced at least one ball or was out for 0). |
| Not outs         | NO    | int    | Number of times the player was **not out** at the end of an innings they batted in. (Retired hurt = not out; retired otherwise = out.) |
| Runs             | R     | int    | Total **runs** scored (including boundaries; excludes extras like byes/leg byes to the batter). |
| Balls faced      | BF    | int    | Total **balls faced**. Include no-balls (batter can score off them); exclude wides (not counted as ball faced by batter). |
| Fours            | 4s    | int    | Number of **fours** (4 runs from one ball). |
| Sixes            | 6s    | int    | Number of **sixes** (6 runs from one ball). |
| Dots             | —     | int    | Balls faced that resulted in **0 runs** off the bat (excluding extras). |
| Highest score    | HS    | string | **Highest score** in an innings. Store as e.g. `"127"` or `"127*"` (asterisk if not out). |
| Hundreds         | 100   | int    | Number of innings with **100 or more** runs. |
| Fifties          | 50    | int    | Number of innings with **50–99** runs (excludes centuries). |

### 3.2 Derived batting stats (formulas)

| Stat            | Formula / definition |
|-----------------|----------------------|
| **Batting average** (Ave) | `Runs / (Innings − Not outs)`. If `(I − NO) = 0`, show `—` or N/A. |
| **Strike rate** (SR)       | `(Runs / Balls faced) × 100`. Two decimal places. If `BF = 0`, show `—` or N/A. |
| **Boundaries**             | `Fours + Sixes` (can be displayed as 4s/6s split). |

### 3.3 Batting schema summary (per match and accumulative by tournament type)

| Key | Name           | Type    | Stored / derived |
|-----|----------------|---------|-------------------|
| Mat | Matches        | int     | Count of matches batted in. |
| I   | Innings        | int     | Count of innings batted in. |
| NO  | Not outs       | int     | Count. |
| R   | Runs           | int     | Sum. |
| BF  | Balls faced    | int     | Sum. |
| 4s  | Fours          | int     | Sum. |
| 6s  | Sixes          | int     | Sum. |
| HS  | Highest score  | string  | Max runs in one innings + "\*" if not out. |
| 100 | Hundreds       | int     | Count of innings ≥ 100. |
| 50  | Fifties        | int     | Count of innings 50–99. |
| Ave | Batting average| float   | R / (I − NO). |
| SR  | Strike rate    | float   | 100 × R / BF. |

---

## 4. Bowling statistics

Bowling stats are counted when the player **bowled** at least one ball in an innings.

### 4.1 Per-innings (raw) fields

| Field            | Key   | Type   | Description |
|------------------|-------|--------|-------------|
| Matches          | Mat   | int    | Number of **matches** in which the player bowled. |
| Innings          | I     | int    | Number of **innings** in which the player bowled (or “O” for overs-based count if preferred). |
| Overs            | O     | float  | **Overs** bowled. e.g. `4.2` = 4 full overs + 2 balls. (Store as decimal or as balls then convert: balls/6.) |
| Maidens          | M     | int    | **Maiden overs** (over in which 0 runs were scored off the bat; extras may or may not count per local rules—typically no runs in the over). |
| Runs conceded    | R     | int    | **Runs** conceded (including boundaries; include extras attributed to bowler: no-balls, wides). |
| Wickets          | W     | int    | **Wickets** taken (caught, bowled, lbw, stumped, run out by bowler, etc.). |
| No balls         | NB    | int    | **No balls** bowled. |
| Wides            | Wd    | int    | **Wides** bowled. |
| Best bowling (innings) | BBI | string | **Best bowling in an innings**: wickets/runs, e.g. `"5/20"`. (Best = most wickets; tie-break = fewer runs.) |
| Best bowling (match) | BBM  | string | **Best bowling in a match**: over 2 innings in same match (e.g. Tests). For single-innings matches, BBM = BBI. |
| 5 wickets        | 5w    | int    | Number of **innings** in which the bowler took **5 or more** wickets. |
| 10 wickets       | 10w   | int    | Number of **matches** in which the bowler took **10 or more** wickets (mainly for multi-innings formats). |

### 4.2 Derived bowling stats (formulas)

| Stat               | Formula / definition |
|--------------------|----------------------|
| **Bowling average** (Ave) | `Runs conceded / Wickets`. If `Wickets = 0`, show `—` or N/A. |
| **Economy rate** (Econ)  | `Runs conceded / Overs`. If `Overs = 0`, show `—` or N/A. |
| **Strike rate** (SR)     | `Balls bowled / Wickets` (balls per wicket). If `Wickets = 0`, show `—` or N/A. (Balls = Overs × 6 for full overs + remainder.) |

### 4.3 Bowling schema summary (per match and accumulative by tournament type)

| Key | Name            | Type   | Stored / derived |
|-----|-----------------|--------|-------------------|
| Mat | Matches         | int    | Count of matches bowled in. |
| I   | Innings         | int    | Count of innings bowled in. |
| O   | Overs           | float  | Sum. |
| M   | Maidens         | int    | Sum. |
| R   | Runs conceded   | int    | Sum. |
| W   | Wickets         | int    | Sum. |
| NB  | No balls        | int    | Sum. |
| Wd  | Wides           | int    | Sum. |
| BBI | Best (innings)  | string | Best wickets/runs in one innings. |
| BBM | Best (match)    | string | Best wickets/runs in one match. |
| 5w  | Five wickets    | int    | Count of innings with ≥ 5 wickets. |
| 10w | Ten wickets     | int    | Count of matches with ≥ 10 wickets. |
| Ave | Bowling average | float  | R / W. |
| Econ| Economy         | float  | R / O. |
| SR  | Strike rate     | float  | Balls / W. |

---

## 5. Fielding statistics

Counted when the player **took a catch**, **effected a run out** (direct or assist), or **made a stumping** (as wicketkeeper).

### 5.1 Fields

| Field       | Key | Type | Description |
|-------------|-----|------|-------------|
| Catches     | Ct  | int  | **Catches** taken (excluding stumpings). |
| Run outs    | RO  | int  | **Run outs** (direct throw or assist). |
| Stumpings   | St  | int  | **Stumpings** (as wicketkeeper). |
| Dismissals  | —   | int  | **Total dismissals** = Ct + RO + St. (Optional; can be derived.) |

### 5.2 Fielding schema summary (per match and accumulative by tournament type)

| Key | Name       | Type | Stored / derived |
|-----|------------|------|-------------------|
| Mat | Matches    | int  | Matches in which the player fielded (appeared in XI). Optional. |
| Ct  | Catches    | int  | Sum. |
| RO  | Run outs   | int  | Sum. |
| St  | Stumpings  | int  | Sum. |

---

## 6. All-round / career summary

For a **player profile** or **leaderboard**, we can expose:

- **Per match:** Batting/bowling/fielding stats for that player in that match (and optionally per innings). Used for scorecards and “performance in this match”.
- **Accumulative by tournament type:** For each of the three tournament types (league, open tournament, emerging), one set of batting, bowling, and fielding aggregates (Mat, I, R, HS, Ave, SR, etc.). Used for “League stats”, “Open Tournament stats”, “Emerging stats” and leaderboards.
- **Overall (optional):** One set of aggregates across all tournament types (“career” or “all”).

**Event type breakdown:** Accumulative stats are maintained **by tournament type** (league, open_tournament, emerging). Each match’s tournament has an tournament_type; when aggregating “League” we sum over all matches in league tournaments. Per-match stats are independent of tournament type (they are just player + match).

---

## 7. Player ranking (Open Tournament)

We support **player ranking** based **only on Open Tournament** tournament type stats. Rankings use the accumulative stats where `tournament_type = open_tournament`; league and emerging matches are excluded.

| Aspect | Description |
|--------|-------------|
| **Source** | Accumulative batting, bowling, and fielding stats for `tournament_type = open_tournament` only (same schema as §3–5, filtered by tournament type). |
| **Ranking categories** | e.g. **Batting** (by runs, average, strike rate, hundreds), **Bowling** (by wickets, economy, average, 5w), **Fielding** (by catches, stumpings, run outs), or **All-round** (combined criteria). Each ranking list is ordered using only open tournament stats. |
| **Minimum qualification** | Optional: e.g. minimum matches or innings in open tournament to appear in rankings (to avoid skew from very few games). |
| **Use** | Leaderboards, “Open Tournament rankings”, player profile “Open Tournament rank”, and any feature that needs to compare players solely on open tournament performance. |

**Implementation:** Use accumulative stats keyed by `player_id` + `tournament_type`; for ranking, filter where `tournament_type = 'open_tournament'` and sort by the chosen metric(s). Rankings can be stored (e.g. refreshed on scorecard update or nightly) or computed at read time.

---

## 8. Storage and derivation

- **Striker per ball:** Ball-by-ball records must include `striker_id` (and `non_striker_id`) on every delivery so that batting stats (runs, balls faced, fours, sixes, dots) are attributed to the correct player when aggregating.
- **Option A (derived):** No separate “player_stats” table; compute from **balls/deliveries** (keyed by **innings_id**; each match has 2 innings) + **innings** + **match_players**. Good for single source of truth; heavier for heavy reads.
- **Option B (materialized):** Maintain **per match** stats (e.g. `player_match_batting`, `player_match_bowling`, `player_match_fielding` keyed by `player_id` + `match_id`, optionally + `innings_id`) and **accumulative by tournament type** (e.g. `player_batting_stats` keyed by `player_id` + `tournament_type`; same for bowling/fielding). Updated on scorecard change or via job.
- **Option C (hybrid):** Ball-by-ball as source; cached/materialized views or tables for profile and leaderboard APIs.

Formulas (Ave, SR, Econ, BBI, etc.) can be computed at read time from raw counts or stored for performance.

**Implementation note:** The API uses **Option B (materialized)**. All columns and API response keys use **full names** (e.g. `matches`, `innings`, `runs`, `balls_faced`, `highest_score`, `average`, `strike_rate`; bowling: `overs`, `maidens`, `runs_conceded`, `wickets`, `no_balls`, `wides`, `best_bowling_innings`, `best_bowling_match`, `five_wickets`, `ten_wickets`, `economy`; fielding: `catches`, `run_outs`, `stumpings`). Stats are stored in the following tables and updated when the scorecard changes:

**Per-match tables** (keyed by `player_id` + `match_id`):

- `player_match_batting` — batting totals for the match
- `player_match_bowling` — bowling totals for the match
- `player_match_fielding` — catches, run outs, stumpings for the match

**Accumulative tables** (keyed by `player_id` + `tournament_type`):

- `player_batting_stats` — batting by tournament type (league, open_tournament, emerging)
- `player_bowling_stats` — bowling by tournament type
- `player_fielding_stats` — fielding by tournament type

Ball-by-ball remains the source of truth. When a ball is added, updated, or deleted, `RefreshMatchStatsJob` is dispatched: it recomputes per-match stats for that match from balls, writes/updates the per-match tables, then recomputes accumulative stats for each player involved (by aggregating their per-match rows for that tournament type) and upserts the accumulative tables. Reads use the tables first and fall back to computing from balls if no rows exist (e.g. before the job has run). **Partnerships** are still derived on read from balls (striker/non_striker + runs per stand).

**Endpoints:**

- **Per-match stats (scorecard):** `GET /api/v1/matches/{match}/player-stats` — batting, bowling, fielding for the match.
- **Player accumulative stats:** `GET /api/v1/users/{user}/stats?tournament_type=league|open_tournament|emerging|all` — batting, bowling, fielding for the user, optionally by tournament type.
- **Rankings:** `GET /api/v1/rankings?tournament_type=...&category=batting|bowling|fielding&sort=...&min_innings=...` — leaderboard (e.g. Open Tournament).

Partnerships are included in the scorecard response: each innings in `GET /api/v1/matches/{match}/scorecard` has a `partnerships` array (player_1_id, player_2_id, runs, balls, wicket_number).

---

## 9. Notation (international style)

- **Batting:** `R (BF)` e.g. `45 (32)` = 45 runs off 32 balls. `HS` with `*` = not out, e.g. `127*`.
- **Bowling:** `O–M–R–W` e.g. `4.2–0–28–3` = 4.2 overs, 0 maidens, 28 runs, 3 wickets. **Best:** `W/R` e.g. `5/20`.
- **Team score:** `R/W` e.g. `150/3` = 150 runs for 3 wickets (order may vary by region).

---

**Status:** Schema for documentation and implementation reference. Stats are driven by ball-by-ball and match data described in [event_flow.md](event_flow.md). Implement enums and tables when building the scorecard and profile APIs.
