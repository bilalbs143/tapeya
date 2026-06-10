import { normalizeBatters, resolveContextTeams, toNum } from './graphicPropsHelpers';

function playerBase(p = {}) {
  const player = p.player ?? {};
  return {
    playerName: player.name ?? '',
    playerTeam: player.team ?? '',
    playerRole: player.role ?? '',
    playerImageUrl: player.image_url ?? null,
    playerTeamLogoUrl: player.team_logo_url ?? p.team_logo_url ?? null,
    stats: Array.isArray(p.stats) ? p.stats : [],
  };
}

/** Logo URL for `team_id` from context home/away (full URLs from API). */
function teamLogoUrlForTeamId(ctx, tid) {
  const t = toNum(tid);
  if (t == null) return null;
  const { home_team, away_team } = resolveContextTeams(ctx);
  const m = ctx.match ?? {};
  const homeId = toNum(home_team.id ?? m.home_team_id);
  const awayId = toNum(away_team.id ?? m.away_team_id);
  if (homeId != null && t === homeId) return home_team.logo_url ?? null;
  if (awayId != null && t === awayId) return away_team.logo_url ?? null;
  return null;
}

function withResolvedTeamLogo(ctx, p, props) {
  const fromCtx = teamLogoUrlForTeamId(ctx, p.team_id);
  const url = props.playerTeamLogoUrl || fromCtx || null;
  return { ...props, playerTeamLogoUrl: url };
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
function buildDefaultBatsmanMatchStats({ runs, balls, dots = 0, ones = 0, twos = 0, threes = 0, fours = 0, sixes = 0 }) {
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
    economyDisplay != null && economyDisplay !== '' && economyDisplay !== '—'
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
    return withResolvedTeamLogo(ctx, p, base);
  }
  const uid = toNum(p.user_id);
  const tid = toNum(p.team_id);
  if (uid == null) {
    return withResolvedTeamLogo(ctx, p, base);
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
    return withResolvedTeamLogo(ctx, p, {
      ...base,
      playerName: batter.name,
      playerTeam: teamNameForTid() || base.playerTeam,
    });
  }

  const bow = ctx.bowler ?? {};
  const bowUid = toNum(bow.user_id);
  if (bow?.name && bowUid === uid) {
    const bowTid = toNum(bow.team_id);
    return withResolvedTeamLogo(ctx, p, {
      ...base,
      playerName: bow.name,
      playerTeam: teamNameForTid() || base.playerTeam,
      playerTeamLogoUrl: base.playerTeamLogoUrl ?? teamLogoUrlForTeamId(ctx, tid) ?? teamLogoUrlForTeamId(ctx, bowTid),
    });
  }

  return withResolvedTeamLogo(ctx, p, base);
}

/**
 * @param {string|null} commandKey
 * @param {Record<string, unknown>} ctx
 * @param {Record<string, unknown>} p
 * @returns {Record<string, unknown>|undefined}
 */
export function buildPlayerGraphicProps(commandKey, ctx, p) {
  switch (commandKey) {
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
      const isDismissed = !!(row?.isDismissed ?? row?.is_dismissed);
      const inferredNotOut = row != null && !isDismissed;
      return {
        ...merged,
        runs,
        balls,
        isNotOut: p.is_not_out ?? inferredNotOut,
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
      const runsConc = toNum(p.runs_conceded) ?? toNum(bow.runs_conceded) ?? toNum(parsed.runs) ?? 0;
      const wickets = toNum(p.wickets) ?? toNum(bow.wickets) ?? toNum(parsed.wickets) ?? 0;
      const ballsBowled = toNum(p.balls_bowled) ?? toNum(bow.balls_bowled) ?? bowlingBallsFromOversDisplay(oversStr) ?? 0;
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
      // Semantics: these keys suggest a team/squad bowling sheet; until a dedicated
      // component exists, the overlay reuses the player-card career layout with payload
      // stats (operator-driven "featured bowler" / squad spotlight).
      return {
        ...mergePlayerPropsFromSession(ctx, p),
        headline: p.headline ?? 'Career Stats',
      };

    case 'BATTING_SUMMARY':
    case 'BATTING_SQUAD':
    case 'INNING_FIGURES':
      // Same trade-off as BOWLING_* — team/squad/innings labels map to BatsmanInningsStats
      // in graphicRegistry; props stay player-shaped until true innings summary UI ships.
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

    default:
      return undefined;
  }
}
