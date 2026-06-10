/**
 * Graphic props builder — maps an active command to the props its component
 * expects, drawing from the graphic session context and the command payload.
 *
 * HOW IT WORKS
 * ────────────
 * GraphicOverlay calls buildGraphicProps(commandKey, session, payload) and
 * spreads the result onto the lazy-loaded graphic component:
 *
 *   <GraphicComponent {...buildGraphicProps(commandKey, session, payload)} />
 *
 * DATA SOURCES
 * ────────────
 * session.context  Live match state (score, teams, batters, bowler …).
 *                  Set via the admin "Update Context" API.
 * payload          Command-specific data supplied when the command was fired
 *                  (player stats, toss decision, leaderboard rows …).
 *
 * ADDING A NEW COMMAND
 * ────────────────────
 * 1. Add a case in the appropriate module under `./props/` (or extend the
 *    coalesce chain below).
 * 2. Accept the same props (with sensible defaults) in the component file.
 *
 * SESSION CONTEXT EXPECTED SHAPE
 * ──────────────────────────────
 * {
 *   match:              { number, venue, status, is_completed, result_summary, winning_team,
 *                         home_team_id, away_team_id,
 *                         toss_winner_side, chose_to_bat_or_bowl,
 *                         home_team_name, away_team_name, home_team_short_code, away_team_short_code,
 *                         home_team_logo_url, away_team_logo_url }
 *   tournament:         { name, short, logo_url }
 *   home_team:          { name, short_code, logo_url }
 *   away_team:          { name, short_code, logo_url }
 *   innings_number:     1 | 2 (active innings for live block)
 *   batting_team:       "home" | "away"
 *   score:              "196-7"
 *   overs:              "14.4"
 *   batters:            [{ id, team_id?, name, runs, balls, …, onStrike (normalized from on_strike) }, ...]
 *   bowler:             { name, figures, overs, user_id?, team_id?, runs_conceded?, balls_bowled?, dots?, wickets?, economy? }
 *   current_over_balls: ["6", "2", "W", "0", "4"]
 *   partnership:        { runs, balls }
 *   target:             197
 *   runs_to_win:        1
 *   balls_remaining:    32
 *   current_rr:         "16.3"
 *   required_rr:        "16.3"
 *   win_probability:    null in 1st innings; in 2nd innings `{ home, away }` 0–100 from
 *                       similar situations in the same tournament + heuristic blend
 *   fall_of_wickets:    [{ number: "1st", score: "2" }, ...]
 *   previous_over:      { runs: 11 }
 *   last_12_balls:      { dots, fours, sixes, wickets, runs }
 *   last_30_balls:      { dots, fours, sixes, wickets, runs }
 *   this_over:          { dots, fours, sixes, wickets, runs }
 *   innings_chart:      [{ innings_number, batting_team, team_name, overs_breakdown:
 *                           [{ over, runs, cumulative, wickets, run_rate (RPO per over) }],
 *                          total_runs, total_wickets, display_overs, fours, sixes }]
 *   graphic_leaderboard_runs:   [{ rank, runs, name, team, image_url? }] — tournament aggregate
 *   graphic_leaderboard_fours:  [{ rank, value, name, team, image_url? }]
 *   graphic_leaderboard_sixes:  [{ rank, value, name, team, image_url? }]
 *   graphic_leaderboard_wickets:[{ rank, wickets, name, team, image_url? }]
 * }
 */

import { buildBreakGraphicProps } from './props/buildBreakGraphicProps';
import { buildCaptionProps } from './props/buildCaptionProps';
import { buildFullScreenGraphicProps } from './props/buildFullScreenGraphicProps';
import { buildLeaderboardProps } from './props/buildLeaderboardProps';
import { buildLowerThirdGraphicProps } from './props/buildLowerThirdGraphicProps';
import { buildPlayerGraphicProps } from './props/buildPlayerGraphicProps';

/**
 * Empty props (`{}`) — intentional
 * ─────────────────────────────────
 * When every builder in the chain returns `undefined`, the overlay still spreads `{}`
 * onto the lazy graphic. That is deliberate for **transition / moment** rows whose
 * JSX is layout- or animation-only (no `session.context` / payload contract): e.g.
 * lower-third `LT_FOUR` … `LT_REPLAY`, `FIFTY_UP`, `HUNDRED_UP`, full-screen
 * `FOUR`/`SIX`/`WICKET`/…, and `FST_*` variants. Breaks and most data-driven commands
 * are handled earlier in the chain (`buildBreakGraphicProps`, `buildLowerThirdGraphicProps`,
 * etc.) and return real props.
 *
 * @param {string|null} commandKey
 * @param {object|null} session  Full graphic session (with .context field)
 * @param {object|null} payload  Active command payload
 * @returns {object} Props to spread onto the graphic component
 */
export function buildGraphicProps(commandKey, session, payload) {
  const ctx = session?.context ?? {};
  const p = payload ?? {};

  return (
    buildCaptionProps(commandKey, ctx, p) ??
    buildBreakGraphicProps(commandKey, ctx, p) ??
    buildFullScreenGraphicProps(commandKey, ctx, p) ??
    buildLowerThirdGraphicProps(commandKey, ctx, p) ??
    buildPlayerGraphicProps(commandKey, ctx, p) ??
    buildLeaderboardProps(commandKey, ctx, p) ??
    {}
  );
}
