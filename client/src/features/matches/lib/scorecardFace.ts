import { inningsStatus, type ScorecardInningsWire } from '../model/scorecardSchemas';

export type ScorecardBatter = {
  id: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: string;
  how: string;
  out: boolean;
  onStrike: boolean;
};

export type ScorecardBowler = {
  id: number;
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  econ: string;
  live: boolean;
};

export type ScorecardFace = {
  id: number;
  inningsNumber: number;
  sideName: string | null;
  sideShort: string | null;
  battingSide: 'home' | 'away' | null;
  live: boolean;
  runs: number;
  wickets: number;
  overs: string;
  need: string | null;
  crr: string | null;
  extras: number;
  extrasDetail: string | null;
  bat: ScorecardBatter[];
  bowl: ScorecardBowler[];
  fallOfWickets: string | null;
};

function rate(value: string | number | null | undefined): string | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(n)) return n.toFixed(2);
  return String(value);
}

function sr(value: string | number | null | undefined): string {
  if (value == null || value === '') return '0.0';
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(n)) return n.toFixed(1);
  return String(value);
}

function shortName(name: string | null | undefined): string | null {
  if (!name?.trim()) return null;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0] ?? null;
  const first = parts[0]?.[0];
  const last = parts[parts.length - 1];
  return first && last ? `${first}. ${last}` : (last ?? null);
}

/** Cricket scorecard dismissal line from API batting_stats row. */

export function formatBatterHow(row: {
  is_on_crease?: boolean | undefined;
  is_retired_hurt?: boolean | undefined;
  dismissal_type?: string | null | undefined;
  dismissal_label?: string | null | undefined;
  bowler_name?: string | null | undefined;
  fielder_name?: string | null | undefined;
}): string {
  if (row.is_on_crease && !row.dismissal_type) return 'not out';
  if (row.is_retired_hurt || row.dismissal_type === 'retired_hurt') return 'retired hurt';

  const type = row.dismissal_type ?? '';
  const label = (row.dismissal_label ?? type.replace(/_/g, ' ')).trim();
  if (!label) return 'out';

  const bowler = shortName(row.bowler_name);
  const fielder = shortName(row.fielder_name);

  if (type === 'caught' || type === 'caught_behind') {
    return [fielder ? `c ${fielder}` : label, bowler ? `b ${bowler}` : null].filter(Boolean).join(' ');
  }
  if (type === 'caught_and_bowled') {
    return bowler ? `c & b ${bowler}` : label;
  }
  if (type === 'stumped') {
    return [fielder ? `st ${fielder}` : label, bowler ? `b ${bowler}` : null].filter(Boolean).join(' ');
  }
  if (type === 'run_out') {
    return fielder ? `run out (${fielder})` : label;
  }
  if (type === 'bowled') {
    return bowler ? `b ${bowler}` : label;
  }
  if (type === 'lbw') {
    return bowler ? `lbw b ${bowler}` : label;
  }
  if (type === 'hit_wicket') {
    return bowler ? `hit wicket b ${bowler}` : label;
  }

  return label;
}

function extrasDetail(extras: ScorecardInningsWire['extras_breakdown']): string | null {
  if (!extras) return null;
  const parts: string[] = [];
  if (extras.wides) parts.push(`w ${extras.wides}`);
  if (extras.no_balls) parts.push(`nb ${extras.no_balls}`);
  if (extras.byes) parts.push(`b ${extras.byes}`);
  if (extras.leg_byes) parts.push(`lb ${extras.leg_byes}`);
  if (extras.penalty_runs) parts.push(`p ${extras.penalty_runs}`);
  return parts.length ? parts.join(', ') : null;
}

function fallLine(fow: ScorecardInningsWire['fall_of_wickets']): string | null {
  if (!fow?.length) return null;
  return fow
    .map((w) => {
      const num = w.wicket_number ?? '';
      const score = w.score ?? 0;
      const name = shortName(w.batsman_name) ?? w.batsman_name ?? '';
      const overs = w.overs ?? '';
      return `${num}-${score} (${name}${overs ? `, ${overs}` : ''})`;
    })
    .join(', ');
}

export type ScorecardFaceOptions = {
  homeTeamId?: number | null | undefined;
  awayTeamId?: number | null | undefined;
  homeShort?: string | null | undefined;
  awayShort?: string | null | undefined;
  activeBowlerId?: number | null | undefined;
  runsToWin?: number | null | undefined;
  ballsRemaining?: number | null | undefined;
};

/** Map GET /matches/:id/scorecard innings → Scorecard face shape. */

export function toScorecardFace(inn: ScorecardInningsWire, options: ScorecardFaceOptions = {}): ScorecardFace {
  const status = inningsStatus(inn);
  const live = status !== 'completed';
  const battingTeamId = inn.batting_team_id ?? null;
  let battingSide: 'home' | 'away' | null = null;
  if (battingTeamId != null && options.homeTeamId != null && battingTeamId === options.homeTeamId) {
    battingSide = 'home';
  } else if (battingTeamId != null && options.awayTeamId != null && battingTeamId === options.awayTeamId) {
    battingSide = 'away';
  }

  const sideShort =
    battingSide === 'away'
      ? (options.awayShort ?? shortName(inn.batting_team?.name))
      : battingSide === 'home'
        ? (options.homeShort ?? shortName(inn.batting_team?.name))
        : shortName(inn.batting_team?.name);

  const strikerId = inn.current_striker_id ?? null;
  const bat: ScorecardBatter[] = (inn.batting_stats ?? []).map((row) => {
    const id = row.id ?? row.player_id ?? 0;
    const onCrease = Boolean(row.is_on_crease);
    return {
      id,
      name: row.name?.trim() || 'Player',
      runs: row.runs ?? 0,
      balls: row.balls ?? 0,
      fours: row.fours ?? 0,
      sixes: row.sixes ?? 0,
      sr: sr(row.strike_rate),
      how: formatBatterHow(row),
      out: !onCrease,
      onStrike: live && strikerId != null && id === strikerId,
    };
  });

  const bowl: ScorecardBowler[] = (inn.bowling_stats ?? []).map((row) => {
    const id = row.id ?? row.player_id ?? 0;
    return {
      id,
      name: row.name?.trim() || 'Bowler',
      overs: String(row.overs ?? '0.0'),
      maidens: row.maidens ?? 0,
      runs: row.runs ?? 0,
      wickets: row.wickets ?? 0,
      econ: rate(row.economy) ?? '0.00',
      live: live && options.activeBowlerId != null && id === options.activeBowlerId,
    };
  });

  const extras =
    inn.total_extras ??
    inn.extras_breakdown?.total ??
    (inn.extras_breakdown
      ? (inn.extras_breakdown.wides ?? 0) +
        (inn.extras_breakdown.no_balls ?? 0) +
        (inn.extras_breakdown.byes ?? 0) +
        (inn.extras_breakdown.leg_byes ?? 0) +
        (inn.extras_breakdown.penalty_runs ?? 0)
      : 0);

  let need: string | null = null;
  if (live && inn.innings_number >= 2 && options.runsToWin != null) {
    need =
      options.ballsRemaining != null
        ? `need ${options.runsToWin} off ${options.ballsRemaining}`
        : `need ${options.runsToWin}`;
  }

  return {
    id: inn.id,
    inningsNumber: inn.innings_number,
    sideName: inn.batting_team?.name ?? null,
    sideShort,
    battingSide,
    live,
    runs: inn.total_runs ?? 0,
    wickets: inn.total_wickets ?? 0,
    overs: inn.overs_display ?? '0.0',
    need,
    crr: rate(inn.run_rate),
    extras,
    extrasDetail: extrasDetail(inn.extras_breakdown),
    bat,
    bowl,
    fallOfWickets: fallLine(inn.fall_of_wickets),
  };
}

export function toScorecardFaces(innings: ScorecardInningsWire[], options: ScorecardFaceOptions = {}): ScorecardFace[] {
  return innings.map((inn) => toScorecardFace(inn, options));
}
