/**
 * Player intro / stats processors → Tapeya player component shapes.
 */
import { parseBowlingFigures } from '../../../core/domain/player';
import { fmt } from '../primitives';
import { resolveTeamCode as resolveTeamSide, toTeamRecord, tournamentSub } from './_shared';
import { toTeams } from './teams.adapter';

function toNum(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** @param {Array<{ label?: string, value?: unknown }>} stats @param {...string} labels */
function findStat(stats, ...labels) {
  for (const label of labels) {
    const hit = stats.find((row) => String(row.label ?? '').toLowerCase() === label.toLowerCase());
    if (hit) return hit.value;
  }
  return null;
}

function statOrDash(value) {
  if (value == null || value === '') return '—';
  return value;
}

function formatOversDisplay(value) {
  if (value == null || value === '') return '0.0';
  return String(value);
}

function splitName(full) {
  const parts = String(full ?? '')
    .trim()
    .split(/\s+/);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
}

function resolveTeamCodeFromPlayerTeam(playerTeam, teams) {
  const needle = String(playerTeam ?? '').toLowerCase();
  if (!needle || !teams) return null;
  if (
    String(teams.home?.code ?? teams.home?.name ?? '')
      .toLowerCase()
      .includes(needle)
  )
    return 'home';
  if (
    String(teams.away?.code ?? teams.away?.name ?? '')
      .toLowerCase()
      .includes(needle)
  )
    return 'away';
  return null;
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toPlayer(props, tokens) {
  let teams = toTeams(props, tokens);
  const fixtureCode = props.teamCode != null ? String(props.teamCode) : null;

  if (fixtureCode && (!teams || !teams[fixtureCode])) {
    teams = {
      ...(teams ?? {}),
      [fixtureCode]: toTeamRecord({ name: fixtureCode, logoUrl: props.logoUrl }, fixtureCode, tokens),
    };
  }

  if (!teams) {
    const home = props.homeTeam
      ? toTeamRecord(props.homeTeam, 'home', tokens, 'home')
      : { code: 'HOME', color: tokens?.homeBgColor || 'var(--accentA)' };
    const away = props.awayTeam
      ? toTeamRecord(props.awayTeam, 'away', tokens, 'away')
      : { code: 'AWAY', color: tokens?.awayBgColor || 'var(--accentB)' };
    teams = { home, away };
  }

  const fullName = props.playerName ?? '';
  const fromParts = splitName(fullName);
  const firstName = props.playerFirstName ?? props.firstName ?? fromParts.firstName;
  const lastName = props.playerLastName ?? props.lastName ?? fromParts.lastName;
  const stats = Array.isArray(props.stats) ? props.stats : [];
  const teamCode =
    fixtureCode ??
    resolveTeamSide({ id: props.teamId, shortCode: props.playerTeam, name: props.playerTeam }, teams) ??
    resolveTeamCodeFromPlayerTeam(props.playerTeam, teams) ??
    'home';

  if (!firstName && !lastName && !fullName) return null;

  return {
    teams,
    sub: tournamentSub(props),
    player: {
      name: fullName || [firstName, lastName].filter(Boolean).join(' '),
      firstName,
      lastName,
      role: props.playerRole ?? props.role ?? '',
      teamCode,
      avatarUrl: props.playerImageUrl ?? props.avatarUrl ?? null,
      logoUrl: props.playerTeamLogoUrl ?? props.logoUrl ?? null,
    },
    statFields: stats.map((s, index) => ({
      key: `stat_${index}`,
      label: String(s.label ?? '').toUpperCase(),
    })),
    statValues: Object.fromEntries(stats.map((s, index) => [`stat_${index}`, s.value ?? '—'])),
    careerLabel: props.headline ?? 'Match Career',
    panelDetail: props.playerRole ?? '',
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toMomPlayer(props, tokens) {
  const resolved = toPlayer(props, tokens);
  if (!resolved) return null;
  return {
    teams: resolved.teams,
    sub: resolved.sub,
    player: {
      ...resolved.player,
      awardLine: props.headline ?? 'Match Award',
      role: props.playerRole ?? resolved.player.role,
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toBatsmanMatchLt(props, tokens) {
  const base = toPlayer(props, tokens);
  if (!base) return null;

  const stats = Array.isArray(props.stats) ? props.stats : [];
  const runs = toNum(props.runs) ?? toNum(findStat(stats, 'runs')) ?? 0;
  const balls = toNum(props.balls) ?? toNum(findStat(stats, 'balls')) ?? 0;
  const notOut = props.isNotOut ?? props.is_not_out ?? props.notOut ?? false;

  return {
    teams: base.teams,
    batter: {
      name: base.player.name,
      teamCode: base.player.teamCode,
      runs,
      balls,
      ones: toNum(props.ones) ?? toNum(findStat(stats, '1s', "1's")) ?? 0,
      twos: toNum(props.twos) ?? toNum(findStat(stats, '2s', "2's")) ?? 0,
      threes: toNum(props.threes) ?? toNum(findStat(stats, '3s', "3's")) ?? 0,
      fours: toNum(props.fours) ?? toNum(findStat(stats, '4s', 'fours')) ?? 0,
      sixes: toNum(props.sixes) ?? toNum(findStat(stats, '6s', 'sixes')) ?? 0,
      sr: props.sr ?? findStat(stats, 'sr', 's/r') ?? fmt.strikeRate(runs, balls),
      notOut: Boolean(notOut),
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toBowlerMatchLt(props, tokens) {
  const base = toPlayer(props, tokens);
  if (!base) return null;

  const stats = Array.isArray(props.stats) ? props.stats : [];
  const parsed = parseBowlingFigures(props.figures);
  const wickets =
    toNum(props.wickets) ?? toNum(props.w) ?? toNum(parsed.wickets) ?? toNum(findStat(stats, 'wkts', 'wickets')) ?? 0;
  const runs = toNum(props.runs_conceded) ?? toNum(props.r) ?? toNum(parsed.runs) ?? toNum(findStat(stats, 'runs')) ?? 0;
  const overs = props.overs ?? props.o ?? findStat(stats, 'overs') ?? '0.0';

  return {
    teams: base.teams,
    bowler: {
      name: base.player.name,
      teamCode: base.player.teamCode,
      w: wickets,
      r: runs,
      o: overs,
      overs,
      figText: props.figText ?? null,
      dots: toNum(props.dots) ?? toNum(findStat(stats, 'dots')) ?? 0,
      extras: toNum(props.extras) ?? toNum(props.extras_conceded) ?? toNum(findStat(stats, 'extras')) ?? 0,
      econ: props.econ ?? props.economy ?? findStat(stats, 'econ') ?? null,
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toBatsmanTournamentLt(props, tokens) {
  const base = toPlayer(props, tokens);
  if (!base) return null;

  const stats = Array.isArray(props.stats) ? props.stats : [];
  const tb = props.tournamentBatting ?? props.tournament_batting ?? null;

  const runs = toNum(tb?.runs) ?? toNum(findStat(stats, 'runs')) ?? 0;
  const matches = toNum(tb?.matches) ?? toNum(findStat(stats, 'matches')) ?? 0;

  return {
    teams: base.teams,
    batter: {
      name: base.player.name,
      teamCode: base.player.teamCode,
      runs,
      matches,
      fours: toNum(tb?.fours) ?? toNum(findStat(stats, '4s', 'fours')) ?? 0,
      sixes: toNum(tb?.sixes) ?? toNum(findStat(stats, '6s', 'sixes')) ?? 0,
      fifties: toNum(tb?.fifties) ?? toNum(findStat(stats, '50s', 'fifties')) ?? 0,
      hundreds: toNum(tb?.hundreds) ?? toNum(findStat(stats, '100s', 'hundreds')) ?? 0,
      sr: statOrDash(tb?.strike_rate ?? findStat(stats, 'sr', 's/r')),
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toBowlerTournamentLt(props, tokens) {
  const base = toPlayer(props, tokens);
  if (!base) return null;

  const stats = Array.isArray(props.stats) ? props.stats : [];
  const tb = props.tournamentBowling ?? props.tournament_bowling ?? null;

  const wickets = toNum(tb?.wickets) ?? toNum(props.wickets) ?? toNum(props.w) ?? toNum(findStat(stats, 'wkts', 'wickets')) ?? 0;
  const runs = toNum(tb?.runs_conceded) ?? toNum(props.runs_conceded) ?? toNum(props.r) ?? toNum(findStat(stats, 'runs')) ?? 0;
  const overs = formatOversDisplay(tb?.overs ?? props.overs ?? props.o ?? findStat(stats, 'overs'));

  return {
    teams: base.teams,
    bowler: {
      name: base.player.name,
      teamCode: base.player.teamCode,
      w: wickets,
      wickets,
      r: runs,
      runs,
      o: overs,
      overs,
      matches: toNum(tb?.matches) ?? toNum(findStat(stats, 'matches')) ?? 0,
      avg: statOrDash(tb?.average ?? findStat(stats, 'avg', 'average')),
      econ: statOrDash(tb?.economy ?? props.econ ?? props.economy ?? findStat(stats, 'econ')),
    },
  };
}
