import { toNum } from '../../../core/utils';
import { parseBowlingFigures } from '../../domain/player';
import { tournamentLabelOnly, withMatchTeams } from './matchContext';

export { parseBowlingFigures };

/** @typedef {import('../../../types.js').GraphicSessionSnapshot} GraphicSessionSnapshot */

export function playerBase(p = {}) {
  const player = p.player ?? {};
  return {
    playerName: player.name ?? '',
    playerFirstName: player.first_name ?? p.first_name ?? '',
    playerLastName: player.last_name ?? p.last_name ?? '',
    playerTeam: player.team ?? player.team_name ?? p.team_name ?? '',
    playerRole: player.role ?? p.playing_role ?? '',
    playerBattingStyle: player.batting_style ?? p.batting_style ?? '',
    playerBowlingStyle: player.bowling_style ?? p.bowling_style ?? '',
    playerImageUrl: player.avatar_url ?? player.image_url ?? null,
    playerTeamLogoUrl: player.team_logo_url ?? p.team_logo_url ?? null,
    stats: Array.isArray(p.stats) ? p.stats : [],
  };
}

/**
 * Resolve a team logo URL by team ID using the already-normalized match slice.
 * @param {import('../../../types.js').GraphicSessionSnapshot} snapshot
 * @param {unknown} tid
 */
function teamLogoUrlForTeamId(snapshot, tid) {
  const t = toNum(tid);
  if (t == null) return null;
  const { match } = snapshot;
  if (match.homeTeamId != null && t === match.homeTeamId) return match.homeTeamLogoUrl;
  if (match.awayTeamId != null && t === match.awayTeamId) return match.awayTeamLogoUrl;
  return null;
}

/**
 * @param {import('../../../types.js').GraphicSessionSnapshot} snapshot
 * @param {Record<string, unknown>} p
 * @param {Record<string, unknown>} props
 */
function withResolvedTeamLogo(snapshot, p, props) {
  const fromCtx = teamLogoUrlForTeamId(snapshot, p.team_id);
  const url = props.playerTeamLogoUrl || fromCtx || null;
  return { ...props, playerTeamLogoUrl: url };
}

export function bowlingBallsFromOversDisplay(oversStr) {
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

export function buildDefaultBatsmanMatchStats({ runs, balls, dots = 0, ones = 0, twos = 0, threes = 0, fours = 0, sixes = 0 }) {
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

export function buildDefaultBowlerMatchStats({ runs, balls, dots = 0, wickets = 0, extras = 0, economyDisplay }) {
  const r = Number(runs) || 0;
  const b = Number(balls) || 0;
  const d = Number(dots) || 0;
  const w = Number(wickets) || 0;
  const e = Number(extras) || 0;
  const econ =
    economyDisplay != null && economyDisplay !== '' && economyDisplay !== '—'
      ? String(economyDisplay)
      : b > 0
        ? ((r / b) * 6).toFixed(2)
        : '—';
  return [
    { label: 'Overs', value: b > 0 ? (b / 6).toFixed(1) : '0.0' },
    { label: 'Wkts', value: w },
    { label: 'Runs', value: r },
    { label: 'Dots', value: d },
    { label: 'Extras', value: e },
    { label: 'Econ', value: econ },
  ];
}

/**
 * Merge player identity from the normalized snapshot when payload only has ids.
 *
 * @param {import('../../../types.js').GraphicSessionSnapshot} snapshot
 * @param {Record<string, unknown>} p
 * @param {Record<string, unknown>} [extra]
 */
function teamSideForTeamId(match, tid) {
  if (tid == null) return null;
  if (match.homeTeamId != null && tid === match.homeTeamId) return 'home';
  if (match.awayTeamId != null && tid === match.awayTeamId) return 'away';
  return null;
}

function teamShortOrNameForTid(match, tid) {
  if (tid == null) return '';
  if (match.homeTeamId != null && tid === match.homeTeamId) {
    return match.homeTeamShortCode || match.homeTeamName || '';
  }
  if (match.awayTeamId != null && tid === match.awayTeamId) {
    return match.awayTeamShortCode || match.awayTeamName || '';
  }
  return '';
}

function withTeamContext(snapshot, props, tid) {
  const teamCode = teamSideForTeamId(snapshot.match, tid);
  const playerTeam = teamShortOrNameForTid(snapshot.match, tid) || props.playerTeam;
  return {
    ...props,
    ...(teamCode ? { teamCode } : {}),
    ...(playerTeam ? { playerTeam } : {}),
  };
}

export function mergePlayerPropsFromSession(snapshot, p, extra = {}) {
  const base = { ...playerBase(p), ...extra };
  const tid = toNum(p.team_id);
  const withTeam = withTeamContext(snapshot, base, tid);

  if (String(withTeam.playerName ?? '').trim() !== '') {
    return withResolvedTeamLogo(snapshot, p, withTeam);
  }

  const uid = toNum(p.user_id);
  if (uid == null) {
    return withResolvedTeamLogo(snapshot, p, withTeam);
  }

  const { match, live } = snapshot;

  const batter = live.batters.find((b) => toNum(b.id) === uid);
  if (batter?.name) {
    return withResolvedTeamLogo(snapshot, p, {
      ...withTeam,
      playerName: batter.name,
      playerTeam: teamShortOrNameForTid(match, tid) || withTeam.playerTeam,
      playerImageUrl: withTeam.playerImageUrl ?? batter.imageUrl ?? null,
    });
  }

  const bow = live.bowler;
  const bowUid = toNum(bow?.userId);
  if (bow?.name && bowUid === uid) {
    return withResolvedTeamLogo(snapshot, p, {
      ...withTeam,
      playerName: bow.name,
      playerTeam: teamShortOrNameForTid(match, tid) || withTeam.playerTeam,
      playerImageUrl: withTeam.playerImageUrl ?? bow.imageUrl ?? null,
      playerTeamLogoUrl:
        withTeam.playerTeamLogoUrl ?? teamLogoUrlForTeamId(snapshot, tid) ?? teamLogoUrlForTeamId(snapshot, toNum(bow.teamId)),
    });
  }

  return withResolvedTeamLogo(snapshot, p, withTeam);
}

/**
 * @param {GraphicSessionSnapshot} snapshot
 */
export function buildBatsmanMatchProps(snapshot) {
  const p = snapshot.payload ?? {};
  const merged = mergePlayerPropsFromSession(snapshot, p);
  const uid = toNum(p.user_id);
  const row = uid != null ? snapshot.live.batters.find((b) => toNum(b.id) === uid) : null;
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

  return withMatchTeams(snapshot, {
    ...merged,
    tournamentLabel: tournamentLabelOnly(snapshot),
    runs,
    balls,
    isNotOut: p.is_not_out ?? inferredNotOut,
    stats,
  });
}
