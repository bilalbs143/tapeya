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
 * 1. Add a case below that extracts what the component needs.
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
 *   batters:            [{ id, team_id?, name, runs, balls, ones?, twos?, threes?, fours?, sixes?, dots?, on_strike? }, ...]
 *   bowler:             { name, figures, overs, user_id?, team_id?, runs_conceded?, balls_bowled?, dots?, wickets?, economy? }
 *   current_over_balls: ["6", "2", "W", "0", "4"]
 *   partnership:        { runs, balls }
 *   target:             197
 *   runs_to_win:        1
 *   balls_remaining:    32
 *   current_rr:         "16.3"
 *   required_rr:        "16.3"
 *   win_probability:    { home, away } — chase only; from similar situations in
 *                       the same tournament (2nd-innings replay) + heuristic blend
 *   fall_of_wickets:    [{ number: "1st", score: "2" }, ...]
 *   previous_over:      { runs: 11 }
 *   last_12_balls:      { dots, fours, sixes, wickets, runs }
 *   last_30_balls:      { dots, fours, sixes, wickets, runs }
 *   this_over:          { dots, fours, sixes, wickets, runs }
 *   innings_chart:      [{ innings_number, batting_team, team_name, overs_breakdown:
 *                           [{ over, runs, cumulative, wickets }],
 *                          total_runs, total_wickets, display_overs, fours, sixes }]
 *   graphic_leaderboard_runs:   [{ rank, runs, name, team, image_url? }] — tournament aggregate
 *   graphic_leaderboard_fours:  [{ rank, value, name, team, image_url? }]
 *   graphic_leaderboard_sixes:  [{ rank, value, name, team, image_url? }]
 *   graphic_leaderboard_wickets:[{ rank, wickets, name, team, image_url? }]
 * }
 */

import { graphicDebugLog, graphicLogger } from './graphicDebugLog';

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeTeam(raw = {}) {
  const rawId = raw.id;
  const id =
    rawId != null && rawId !== '' && Number.isFinite(Number(rawId))
      ? Number(rawId)
      : null;
  return {
    id,
    name: raw.name ?? '',
    shortCode: raw.short_code ?? '',
    logoUrl: raw.logo_url ?? null,
  };
}

/** First non-empty trimmed string among arguments. */
function coalesceTrim(...vals) {
  for (const v of vals) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s !== '') return s;
  }
  return '';
}

const PLATFORM_BANNER_TEXT = {
  FOLLOW_PLATFORM: 'Follow us on Tapeya for live match updates',
  DOWNLOAD_PLATFORM:
    'For live streaming & ball-by-ball updates — download the Tapeya app',
};

/** @type {Record<string, { contextKey: string, title: string, metric: 'batting'|'bowling' }>} */
const LEADERBOARD_COMMANDS = {
  HIGHEST_RUNS: { contextKey: 'graphic_leaderboard_runs', title: 'Highest Runs', metric: 'batting' },
  TOP_BATTER: { contextKey: 'graphic_leaderboard_runs', title: 'Top Batter', metric: 'batting' },
  HIGHEST_FOURS: { contextKey: 'graphic_leaderboard_fours', title: 'Highest Fours', metric: 'batting' },
  HIGHEST_SIXES: { contextKey: 'graphic_leaderboard_sixes', title: 'Highest Sixes', metric: 'batting' },
  HIGHEST_WICKETS: { contextKey: 'graphic_leaderboard_wickets', title: 'Highest Wickets', metric: 'bowling' },
  TOP_BOWLER: { contextKey: 'graphic_leaderboard_wickets', title: 'Top Bowler', metric: 'bowling' },
};

function leaderboardRowsFromContext(commandKey, ctx, payloadRows) {
  if (Array.isArray(payloadRows) && payloadRows.length > 0) {
    return payloadRows;
  }
  const meta = LEADERBOARD_COMMANDS[commandKey];
  if (!meta) return [];
  const raw = ctx[meta.contextKey];
  return Array.isArray(raw) ? raw : [];
}

function featuredFromLeaderboardRow(metric, row, explicitFeatured) {
  if (explicitFeatured != null && typeof explicitFeatured === 'object') {
    return explicitFeatured;
  }
  if (!row || typeof row !== 'object') return null;
  const name = row.name;
  if (name == null || String(name).trim() === '') return null;
  const v =
    metric === 'bowling'
      ? row.wickets ?? row.value
      : row.runs ?? row.value;
  return {
    name: String(name),
    value: String(v ?? ''),
    image_url: row.image_url ?? null,
  };
}

function buildLeaderboardGraphicProps(commandKey, ctx, p) {
  const meta = LEADERBOARD_COMMANDS[commandKey];
  if (!meta) return {};
  const mc = buildMatchCtx(ctx);
  const rows = leaderboardRowsFromContext(commandKey, ctx, p.rows);
  return {
    title: p.title ?? meta.title,
    subtitle: coalesceTrim(p.subtitle, mc.tournamentName) || 'Tournament',
    rows,
    featured: featuredFromLeaderboardRow(meta.metric, rows[0], p.featured),
    tournamentLogoUrl: p.tournament_logo_url ?? mc.tournamentLogoUrl,
  };
}

function buildTournamentOverviewProps(ctx, p, defaultMatchLabel) {
  const mc = buildMatchCtx(ctx);
  const matchNumber =
    ctx.match?.number != null && String(ctx.match.number).trim() !== ''
      ? `Match ${String(ctx.match.number).trim()}`
      : '';
  return {
    tournamentName: coalesceTrim(p.tournament_name, mc.tournamentName),
    tournamentLogoUrl: p.tournament_logo_url ?? mc.tournamentLogoUrl,
    matchLabel: coalesceTrim(
      p.match_label,
      p.subtitle,
      p.label,
      defaultMatchLabel,
      mc.tournamentShort,
      matchNumber,
    ),
  };
}

/**
 * API-shaped `home_team` / `away_team` objects merged with `context.match`.
 * Reverb often sends only `match`; this keeps names, codes, and logos aligned
 * everywhere we call {@link normalizeTeam} (scoreboard + match chrome).
 *
 * @param {Record<string, unknown>} ctx
 * @returns {{ home_team: Record<string, unknown>, away_team: Record<string, unknown> }}
 */
function resolveContextTeams(ctx = {}) {
  const m = ctx.match ?? {};
  const h =
    ctx.home_team && typeof ctx.home_team === 'object' ? { ...ctx.home_team } : {};
  const a =
    ctx.away_team && typeof ctx.away_team === 'object' ? { ...ctx.away_team } : {};

  return {
    home_team: {
      ...h,
      id: h.id ?? m.home_team_id,
      name: h.name ?? m.home_team_name ?? '',
      short_code: h.short_code ?? m.home_team_short_code ?? '',
      logo_url: h.logo_url ?? m.home_team_logo_url ?? null,
    },
    away_team: {
      ...a,
      id: a.id ?? m.away_team_id,
      name: a.name ?? m.away_team_name ?? '',
      short_code: a.short_code ?? m.away_team_short_code ?? '',
      logo_url: a.logo_url ?? m.away_team_logo_url ?? null,
    },
  };
}

/**
 * Build chart-ready data from the `innings_chart` context array.
 *
 * @param {Array}  inningsChart  ctx.innings_chart from session context
 * @param {'cumulative'|'runs'|'run_rate'}  mode
 *   - 'cumulative'  → WORM: total runs scored up to that over (line chart)
 *   - 'run_rate'    → RUN_RATE_CHART: scoring rate (runs/valid_balls×6) per over (line chart)
 *   - 'runs'        → MANHATTAN: runs scored in each individual over (bar chart)
 */
function buildChartData(inningsChart, mode) {
  if (!inningsChart || inningsChart.length === 0) {
    return { chartSeries: [], summaryCards: [], overCategories: [], yAxisMax: 100 };
  }

  const maxOvers = Math.max(
    ...inningsChart.map((inn) => inn.overs_breakdown?.length ?? 0),
  );

  const overCategories = Array.from({ length: maxOvers }, (_, i) =>
    String(i + 1).padStart(2, '0'),
  );

  const chartSeries = inningsChart.map((inn) => {
    const breakdown = inn.overs_breakdown ?? [];
    const data = Array.from({ length: maxOvers }, (_, i) => {
      const over = breakdown[i];
      if (!over) return null;
      switch (mode) {
        case 'cumulative':  return over.cumulative;
        case 'run_rate':    return over.run_rate ?? 0;
        case 'runs':        return over.runs;
        default:            return over.runs;
      }
    });
    return { name: inn.team_name ?? `Innings ${inn.innings_number}`, data };
  });

  const allValues = chartSeries.flatMap((s) => s.data.filter((v) => v !== null));
  const yAxisMax = allValues.length > 0 ? Math.ceil(Math.max(...allValues) * 1.15) : 100;

  const summaryCards = inningsChart.map((inn) => ({
    team: inn.team_name ?? '',
    score: `${inn.total_runs}/${inn.total_wickets}`,
    overs: inn.display_overs ?? '',
    six: inn.sixes ?? 0,
    four: inn.fours ?? 0,
  }));

  return { chartSeries, summaryCards, overCategories, yAxisMax };
}

function normalizeBatters(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((b) => ({
    id: b.id ?? b.user_id ?? b.userId ?? null,
    name: b.name ?? '',
    runs: b.runs ?? 0,
    balls: b.balls ?? 0,
    fours: b.fours ?? 0,
    sixes: b.sixes ?? 0,
    ones: b.ones ?? 0,
    twos: b.twos ?? 0,
    threes: b.threes ?? 0,
    dots: b.dots ?? 0,
    onStrike: !!(b.on_strike ?? b.onStrike),
  }));
}

function scoreboardBase(ctx = {}) {
  const { home_team, away_team } = resolveContextTeams(ctx);
  const homeTeam = normalizeTeam(home_team);
  const awayTeam = normalizeTeam(away_team);
  const isBattingAway = (ctx.batting_team ?? 'home') === 'away';
  const battingTeam = {
    ...(isBattingAway ? awayTeam : homeTeam),
    score: ctx.score ?? '',
    overs: ctx.overs ?? '',
  };
  const bowlingTeam = isBattingAway ? homeTeam : awayTeam;
  return {
    battingTeam,
    bowlingTeam,
    batters: normalizeBatters(ctx.batters),
    bowler: {
      name: ctx.bowler?.name ?? '',
      figures: ctx.bowler?.figures ?? '',
      overs: ctx.bowler?.overs ?? '',
      userId: ctx.bowler?.user_id ?? ctx.bowler?.userId ?? null,
      runsConceded: ctx.bowler?.runs_conceded ?? null,
      ballsBowled: ctx.bowler?.balls_bowled ?? null,
      dots: ctx.bowler?.dots ?? null,
      wickets: ctx.bowler?.wickets ?? null,
      economy: ctx.bowler?.economy ?? null,
    },
    currentOverBalls: ctx.current_over_balls ?? [],
  };
}

function playerBase(p = {}) {
  const player = p.player ?? {};
  return {
    playerName: player.name ?? '',
    playerTeam: player.team ?? '',
    playerRole: player.role ?? '',
    playerImageUrl: player.image_url ?? null,
    stats: Array.isArray(p.stats) ? p.stats : [],
  };
}

/** Coerce API / JSON numbers that may arrive as strings. */
function toNum(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Parse "2/34" bowling figures → wickets and runs conceded. */
function parseBowlingFigures(figures) {
  const m = String(figures ?? '').match(/^(\d+)\s*\/\s*(\d+)/);
  if (!m) return { wickets: null, runs: null };
  return { wickets: Number(m[1]), runs: Number(m[2]) };
}

/** Convert overs display "3.4" to legal balls (6 balls per full over). */
function bowlingBallsFromOversDisplay(oversStr) {
  if (oversStr == null || oversStr === '') return null;
  const s = String(oversStr).trim();
  const parts = s.split('.');
  if (parts.length === 1) {
    const w = parseInt(parts[0], 10);
    return Number.isFinite(w) ? w * 6 : null;
  }
  const whole = parseInt(parts[0], 10) || 0;
  const frac = parseInt(parts[1], 10) || 0;
  return whole * 6 + Math.min(5, frac);
}

/** Batsman match lower-third grid when payload has no `stats`. */
function buildDefaultBatsmanMatchStats({
  runs,
  balls,
  dots = 0,
  ones = 0,
  twos = 0,
  threes = 0,
  fours = 0,
  sixes = 0,
}) {
  const r = Number(runs) || 0;
  const b = Number(balls) || 0;
  const sr = b > 0 ? ((r / b) * 100).toFixed(1) : '—';
  return [
    { label: 'Runs', value: r },
    { label: 'Balls', value: b },
    { label: 'Dots', value: dots },
    { label: '1s', value: ones },
    { label: '2s', value: twos },
    { label: '3s', value: threes },
    { label: '4s', value: fours },
    { label: '6s', value: sixes },
    { label: 'SR', value: sr },
  ];
}

/** Bowler match lower-third grid when payload has no `stats`. */
function buildDefaultBowlerMatchStats({ runs, balls, dots = 0, wickets = 0, economyDisplay }) {
  const r = Number(runs) || 0;
  const b = Number(balls) || 0;
  const d = Number(dots) || 0;
  const w = Number(wickets) || 0;
  const econ =
    economyDisplay != null &&
    economyDisplay !== '' &&
    economyDisplay !== '—'
      ? String(economyDisplay)
      : b > 0
        ? ((r / b) * 6).toFixed(2)
        : '—';
  return [
    { label: 'Runs', value: r },
    { label: 'Balls', value: b },
    { label: 'Dots', value: d },
    { label: 'Wkts', value: w },
    { label: 'Econ', value: econ },
  ];
}

/**
 * When the command payload is only `{ user_id, team_id, innings_number }` from the
 * match controller, merge names from `session.context` (batters / bowler / teams).
 */
function mergePlayerPropsFromSession(ctx, p, extra = {}) {
  const base = { ...playerBase(p), ...extra };
  if (String(base.playerName ?? '').trim() !== '') {
    return base;
  }
  const uid = toNum(p.user_id);
  const tid = toNum(p.team_id);
  if (uid == null) {
    return base;
  }

  const { home_team, away_team } = resolveContextTeams(ctx);
  const m = ctx.match ?? {};
  const homeId = toNum(home_team.id ?? m.home_team_id);
  const awayId = toNum(away_team.id ?? m.away_team_id);

  const teamNameForTid = () => {
    if (tid == null) return '';
    if (homeId != null && tid === homeId) return home_team.name ?? '';
    if (awayId != null && tid === awayId) return away_team.name ?? '';
    return '';
  };

  const batters = normalizeBatters(ctx.batters);
  const batter = batters.find((b) => toNum(b.id) === uid);
  if (batter?.name) {
    return {
      ...base,
      playerName: batter.name,
      playerTeam: teamNameForTid() || base.playerTeam,
    };
  }

  const bow = ctx.bowler ?? {};
  const bowUid = toNum(bow.user_id ?? bow.userId);
  if (bow?.name && bowUid === uid) {
    return {
      ...base,
      playerName: bow.name,
      playerTeam: teamNameForTid() || base.playerTeam,
    };
  }

  return base;
}

function buildMatchCtx(ctx = {}) {
  const { home_team, away_team } = resolveContextTeams(ctx);
  const homeTeam = normalizeTeam(home_team);
  const awayTeam = normalizeTeam(away_team);
  const matchNumber = ctx.match?.number ?? '';
  const tournamentName = ctx.tournament?.name ?? '';
  const matchLabel = tournamentName;
  return {
    homeTeam,
    awayTeam,
    matchNumber,
    venue: ctx.match?.venue ?? '',
    tournamentName,
    tournamentShort: ctx.tournament?.short ?? '',
    tournamentLogoUrl: ctx.tournament?.logo_url ?? null,
    matchLabel,
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {string|null} commandKey
 * @param {object|null} session  Full graphic session (with .context field)
 * @param {object|null} payload  Active command payload
 * @returns {object} Props to spread onto the graphic component
 */
export function buildGraphicProps(commandKey, session, payload) {
  const ctx = session?.context ?? {};
  const p = payload ?? {};

  switch (commandKey) {
    // ── Text cards ────────────────────────────────────────────────────────────

    case 'CUSTOM': {
      const parts = [p.title, p.description].filter(
        (v) => v != null && String(v).trim() !== '',
      );
      return { text: parts.join('\n\n'), fontSize: p.font_size };
    }

    // RowTextBanner requires `text`; controllers often send only innings context.
    case 'FOLLOW_PLATFORM':
    case 'DOWNLOAD_PLATFORM': {
      const text =
        coalesceTrim(p.text, p.message, p.headline, p.title, p.body) ||
        PLATFORM_BANNER_TEXT[commandKey] ||
        'Tapeya';
      return { text };
    }

    // ── Innings break ─────────────────────────────────────────────────────────

    case 'INNINGS_BREAK': {
      const mc = buildMatchCtx(ctx);
      return { homeTeam: mc.homeTeam, awayTeam: mc.awayTeam };
    }

    // ── Generic breaks — same layout, different label ─────────────────────────

    case 'DRINKS':
    case 'TEA_BREAK':
    case 'LUNCH_BREAK':
    case 'RAIN':
    case 'RAIN_STOPPED':
    case 'STRATEGIC_TIMEOUT': {
      const mc = buildMatchCtx(ctx);
      const LABELS = {
        DRINKS: 'Drinks',
        TEA_BREAK: 'Tea Break',
        LUNCH_BREAK: 'Lunch Break',
        RAIN: 'Rain Delay',
        RAIN_STOPPED: 'Rain Stopped',
        STRATEGIC_TIMEOUT: 'Strategic Timeout',
      };
      return {
        homeTeam: mc.homeTeam,
        awayTeam: mc.awayTeam,
        label: LABELS[commandKey] ?? 'Break',
      };
    }

    // ── Match / tournament context ────────────────────────────────────────────

    case 'THIS_MATCH':
    case 'MATCH_INFO':
    case 'SCORECARD_FULL':
    case 'NEXT_MATCH': {
      const mc = buildMatchCtx(ctx);
      return {
        homeTeam: mc.homeTeam,
        awayTeam: mc.awayTeam,
        matchNumber: mc.matchNumber,
        venue: mc.venue,
        tournamentName: mc.tournamentName,
      };
    }

    case 'INTRO_LT': {
      const mc = buildMatchCtx(ctx);
      return {
        homeTeam: mc.homeTeam,
        awayTeam: mc.awayTeam,
        matchLabel: mc.matchLabel,
      };
    }

    case 'TOURNAMENT_NAME':
      return buildTournamentOverviewProps(ctx, p, '');

    case 'SELECT_DRAW':
      return buildTournamentOverviewProps(ctx, p, 'Select Draw');

    case 'POINT_TABLE':
      return buildTournamentOverviewProps(ctx, p, 'Points Table');

    case 'MATCH_SUMMARY_FS': {
      const mc = buildMatchCtx(ctx);
      return {
        homeTeam: {
          ...mc.homeTeam,
          score: p.home_score ?? ctx.score ?? '',
          overs: p.home_overs ?? ctx.overs ?? '',
        },
        awayTeam: {
          ...mc.awayTeam,
          score: p.away_score ?? '',
          overs: p.away_overs ?? '',
        },
      };
    }

    case 'RESULT_LT': {
      const mc = buildMatchCtx(ctx);
      const fromPayload =
        p.result_line != null && String(p.result_line).trim() !== ''
          ? String(p.result_line).trim()
          : '';
      const fromContext =
        ctx.match?.result_summary != null && String(ctx.match.result_summary).trim() !== ''
          ? String(ctx.match.result_summary).trim()
          : '';
      const resultLine = fromPayload || fromContext;
      const winningTeam = p.winning_team ?? ctx.match?.winning_team ?? null;
      graphicDebugLog('RESULT_LT', {
        commandKey,
        contextMatch: ctx.match ?? null,
        contextKeys: ctx && typeof ctx === 'object' ? Object.keys(ctx) : [],
        payload: p,
        fromPayload,
        fromContext,
        resultLine,
        winningTeam,
      });
      return {
        homeTeam: mc.homeTeam,
        awayTeam: mc.awayTeam,
        resultLine,
        winningTeam,
      };
    }

    case 'TOSS_LT': {
      const mc = buildMatchCtx(ctx);
      const fromPayload =
        p.decision != null && String(p.decision).trim() !== ''
          ? String(p.decision).trim()
          : '';
      const m = ctx.match ?? {};
      const side = m.toss_winner_side;
      const choice = m.chose_to_bat_or_bowl;
      const winnerName =
        side === 'home'
          ? mc.homeTeam.name
          : side === 'away'
            ? mc.awayTeam.name
            : '';
      let fromContext = '';
      if (winnerName && (choice === 'bat' || choice === 'bowl')) {
        const elected =
          choice === 'bat' ? 'elected to bat first' : 'elected to bowl first';
        fromContext = `${winnerName} won the toss and ${elected}`;
      }
      const decision = fromPayload || fromContext;
      graphicLogger('info', 'TOSS_LT.buildGraphicProps', {
        commandKey,
        contextKeys: ctx && typeof ctx === 'object' ? Object.keys(ctx) : [],
        contextMatch: m,
        toss_winner_side: side,
        chose_to_bat_or_bowl: choice,
        winnerName,
        homeName: mc.homeTeam.name,
        awayName: mc.awayTeam.name,
        fromPayload,
        fromContext,
        decision,
        payloadRaw: p,
      });
      return {
        homeTeam: mc.homeTeam,
        awayTeam: mc.awayTeam,
        decision,
      };
    }

    // ── Playing XI ────────────────────────────────────────────────────────────

    case 'PLAYING_11':
    case 'PLAYING_ELEVEN_HOME':
    case 'PLAYING_ELEVEN_AWAY': {
      const mc = buildMatchCtx(ctx);
      const side =
        { PLAYING_ELEVEN_HOME: 'home', PLAYING_ELEVEN_AWAY: 'away' }[commandKey] ?? 'both';
      return {
        homeTeam: { ...mc.homeTeam, players: p.home_team?.players ?? [] },
        awayTeam: { ...mc.awayTeam, players: p.away_team?.players ?? [] },
        matchLabel: mc.matchLabel,
        side,
      };
    }

    // ── Live scoreboard lower-thirds ──────────────────────────────────────────

    case 'LT_DEFAULT':
      return scoreboardBase(ctx);

    case 'MINI_SCORECARD':
      return scoreboardBase(ctx);

    case 'MATCH_SUMMARY': {
      const mc = buildMatchCtx(ctx);
      const matchup = [
        mc.homeTeam.shortCode || mc.homeTeam.name,
        mc.awayTeam.shortCode || mc.awayTeam.name,
      ]
        .filter(Boolean)
        .join(' vs ');
      return {
        ...scoreboardBase(ctx),
        matchup,
        tournamentLabel: mc.matchLabel,
        stats: Array.isArray(p.stats) ? p.stats : [],
      };
    }

    case 'RUN_RATE':
      return {
        ...scoreboardBase(ctx),
        target: ctx.target ?? null,
        currentRR: ctx.current_rr ?? '',
        requiredRR: ctx.required_rr ?? '',
      };

    case 'CURRENT_PARTNERSHIP':
    case 'CURRENT_PARTNERSHIP_FS':
    case 'PARTNERSHIP_LIST':
      return {
        ...scoreboardBase(ctx),
        partnershipRuns: ctx.partnership?.runs ?? 0,
        partnershipBalls: ctx.partnership?.balls ?? 0,
      };

    case 'LAST_12_BALLS': {
      const s = ctx.last_12_balls ?? {};
      return {
        ...scoreboardBase(ctx),
        ballsLabel: 'Last 12 Balls',
        dots:    s.dots    ?? 0,
        fours:   s.fours   ?? 0,
        sixes:   s.sixes   ?? 0,
        wickets: s.wickets ?? 0,
        runs:    s.runs    ?? 0,
      };
    }

    case 'LAST_30_BALLS': {
      const s = ctx.last_30_balls ?? {};
      return {
        ...scoreboardBase(ctx),
        ballsLabel: 'Last 30 Balls',
        dots:    s.dots    ?? 0,
        fours:   s.fours   ?? 0,
        sixes:   s.sixes   ?? 0,
        wickets: s.wickets ?? 0,
        runs:    s.runs    ?? 0,
      };
    }

    case 'THIS_OVER': {
      const s = ctx.this_over ?? {};
      return {
        ...scoreboardBase(ctx),
        ballsLabel: 'This Over',
        dots:    s.dots    ?? 0,
        fours:   s.fours   ?? 0,
        sixes:   s.sixes   ?? 0,
        wickets: s.wickets ?? 0,
        runs:    s.runs    ?? 0,
      };
    }

    case 'PREVIOUS_OVER':
      return {
        ...scoreboardBase(ctx),
        lastOverRuns: ctx.previous_over?.runs ?? p.last_over_runs ?? 0,
      };

    case 'NEED_TARGET':
    case 'NEED_TARGET_FS':
    case 'FDR':
      return {
        ...scoreboardBase(ctx),
        runsToWin: ctx.runs_to_win ?? 0,
        ballsRemaining: ctx.balls_remaining ?? 0,
      };

    case 'LAST_WICKET':
    case 'LAST_WICKET_FS': {
      const fow = ctx.fall_of_wickets ?? p.wickets ?? [];
      return {
        ...scoreboardBase(ctx),
        wickets: Array.isArray(fow) ? fow : [],
      };
    }

    case 'AT_STAGE': {
      const base = scoreboardBase(ctx);
      const m = ctx.at_stage_mirror;
      const hasMirror =
        m != null &&
        typeof m === 'object' &&
        (m.batting_team === 'home' || m.batting_team === 'away');
      if (hasMirror) {
        const teams = resolveContextTeams(ctx);
        const raw = m.batting_team === 'away' ? teams.away_team : teams.home_team;
        const nt = normalizeTeam(raw);
        return {
          ...base,
          mirrorBattingTeam: {
            ...nt,
            score: m.score ?? '',
            overs: m.overs ?? '',
          },
          mirrorBatters: normalizeBatters(m.batters),
          mirrorBowler: m.bowler ?? { name: '', figures: '', overs: '' },
          mirrorCurrentOverBalls: Array.isArray(m.current_over_balls) ? m.current_over_balls : [],
          mirrorInningsLabel: m.innings_label ?? '1st Innings',
          comparisonTeamName: '',
          comparisonScore: '',
          comparisonOvers: '',
        };
      }
      const comp = p.comparison_team ?? {};
      return {
        ...base,
        mirrorBattingTeam: null,
        mirrorBatters: [],
        mirrorBowler: { name: '', figures: '', overs: '' },
        mirrorCurrentOverBalls: [],
        mirrorInningsLabel: '',
        comparisonTeamName: comp.name ?? '',
        comparisonScore: comp.score ?? '',
        comparisonOvers: comp.overs ?? '',
      };
    }

    case 'WIN_PREDICTION':
      return {
        ...scoreboardBase(ctx),
        winProbHome: ctx.win_probability?.home ?? 0,
        winProbAway: ctx.win_probability?.away ?? 0,
      };

      // ── Chart comparisons ─────────────────────────────────────────────────────

    case 'WORM': {
      // Line chart — cumulative runs per over (worm chart).
      const mc = buildMatchCtx(ctx);
      const inningsChart = Array.isArray(ctx.innings_chart) ? ctx.innings_chart : [];
      const { chartSeries, summaryCards, overCategories, yAxisMax } =
        buildChartData(inningsChart, 'cumulative');
      return {
        chartSeries, summaryCards, overCategories, yAxisMax,
        matchLabel: mc.matchLabel,
        chartTitle: 'Worm',
        yAxisLabel: 'Runs',
      };
    }

    case 'RUN_RATE_CHART': {
      // Line chart — run rate (RPO) in each over.
      const mc = buildMatchCtx(ctx);
      const inningsChart = Array.isArray(ctx.innings_chart) ? ctx.innings_chart : [];
      const { chartSeries, summaryCards, overCategories, yAxisMax } =
        buildChartData(inningsChart, 'run_rate');
      return {
        chartSeries, summaryCards, overCategories, yAxisMax,
        matchLabel: mc.matchLabel,
        chartTitle: 'Run Rate',
        yAxisLabel: 'RPO',
      };
    }

    case 'MANHATTAN': {
      // Bar chart — runs scored in each over.
      const mc = buildMatchCtx(ctx);
      const inningsChart = Array.isArray(ctx.innings_chart) ? ctx.innings_chart : [];
      const { chartSeries, summaryCards, overCategories, yAxisMax } =
        buildChartData(inningsChart, 'runs');
      return {
        chartSeries, summaryCards, overCategories, yAxisMax,
        matchLabel: mc.matchLabel,
        chartTitle: 'Manhattan',
        yAxisLabel: 'Runs',
      };
    }

    // ── Player lower-thirds ───────────────────────────────────────────────────

    case 'BATSMAN_NAME_LT':
    case 'BATSMAN_NAME_FS':
    case 'BOWLER_NAME_LT':
    case 'BOWLER_NAME_FS':
    case 'MOM':
      return mergePlayerPropsFromSession(ctx, p);

    case 'BATSMAN_MATCH_LT':
    case 'BATSMAN_MATCH_FS': {
      const merged = mergePlayerPropsFromSession(ctx, p);
      const uid = toNum(p.user_id);
      const batters = normalizeBatters(ctx.batters);
      const row = uid != null ? batters.find((b) => toNum(b.id) === uid) : null;
      const runs = toNum(p.runs) ?? row?.runs ?? 0;
      const balls = toNum(p.balls) ?? row?.balls ?? 0;
      const payloadStats = Array.isArray(p.stats) ? p.stats : [];
      const stats =
        payloadStats.length > 0
          ? payloadStats
          : buildDefaultBatsmanMatchStats({
            runs,
            balls,
            dots: row?.dots ?? 0,
            ones: row?.ones ?? 0,
            twos: row?.twos ?? 0,
            threes: row?.threes ?? 0,
            fours: row?.fours ?? 0,
            sixes: row?.sixes ?? 0,
          });
      return {
        ...merged,
        runs,
        balls,
        isNotOut: p.is_not_out ?? false,
        stats,
      };
    }

    case 'BATSMAN_TOURNAMENT_LT':
    case 'BATSMAN_TOURNAMENT_FS':
      return {
        ...mergePlayerPropsFromSession(ctx, p),
        headline: p.headline ?? 'Career Overview',
      };

    case 'BOWLER_MATCH_LT':
    case 'BOWLER_MATCH_FS': {
      const merged = mergePlayerPropsFromSession(ctx, p);
      const bow = ctx.bowler ?? {};
      const figures = p.figures ?? bow.figures ?? '';
      const oversStr = p.overs ?? bow.overs ?? '';
      const parsed = parseBowlingFigures(figures);
      const runsConc =
        toNum(p.runs_conceded) ??
        toNum(bow.runs_conceded) ??
        toNum(parsed.runs) ??
        0;
      const wickets =
        toNum(p.wickets) ??
        toNum(bow.wickets) ??
        toNum(parsed.wickets) ??
        0;
      const ballsBowled =
        toNum(p.balls_bowled) ??
        toNum(bow.balls_bowled) ??
        bowlingBallsFromOversDisplay(oversStr) ??
        0;
      const dotsBowled = toNum(p.dots) ?? toNum(bow.dots) ?? 0;
      const payloadStats = Array.isArray(p.stats) ? p.stats : [];
      const stats =
        payloadStats.length > 0
          ? payloadStats
          : buildDefaultBowlerMatchStats({
            runs: runsConc,
            balls: ballsBowled,
            dots: dotsBowled,
            wickets,
            economyDisplay: bow.economy,
          });
      return {
        ...merged,
        figures,
        overs: oversStr,
        stats,
      };
    }

    case 'BOWLER_TOURNAMENT_LT':
    case 'BOWLER_TOURNAMENT_FS':
    case 'BOWLING_SUMMARY':
    case 'BOWLING_SQUAD':
      return {
        ...mergePlayerPropsFromSession(ctx, p),
        headline: p.headline ?? 'Career Stats',
      };

    case 'BATTING_SUMMARY':
    case 'BATTING_SQUAD':
    case 'INNING_FIGURES':
      return {
        ...mergePlayerPropsFromSession(ctx, p),
        headline: p.headline ?? 'This Tournament',
      };

    case 'TOUR_FOURS':
    case 'TOUR_SIXES':
    case 'TOUR_FIFTIES':
    case 'TOUR_HUNDREDS':
    case 'TOUR_RUNS':
    case 'TOUR_WICKETS':
      return mergePlayerPropsFromSession(ctx, p);

    // ── Tournament leaderboards ───────────────────────────────────────────────

    case 'HIGHEST_RUNS':
    case 'HIGHEST_SIXES':
    case 'HIGHEST_FOURS':
    case 'TOP_BATTER':
    case 'HIGHEST_WICKETS':
    case 'TOP_BOWLER':
      return buildLeaderboardGraphicProps(commandKey, ctx, p);

    // ── Event-text keys (FOUR, SIX, OUT, WICKET, etc.) — no dynamic props ─────
    // These components always render fixed text that IS the graphic event.
    default:
      return {};
  }
}
