import { inningsStatus, type ScorecardBallWire, type ScorecardInningsWire } from '../model/scorecardSchemas';
import {
  type BallLogKind,
  type EditableBallSnapshot,
  type EditBallExtra,
  getBallEditableExtra,
  getBallEditableRunsValue,
} from './editBallPayload';

export type BallLogEntry = {
  id: number;
  overNumber: number;
  ballInOver: number | null;
  token: string;
  chip: string | null;
  label: string;
  by: string | null;
  on: string | null;
  zone: string | null;
  detail: string | null;
  /** Wickets are not editable in the sheet — delete + re-score. */
  editable: boolean;
  runs: number;
  extra: EditBallExtra;
  kind: BallLogKind;
  snapshot: EditableBallSnapshot;
};

export type BallLogOver = {
  n: number;
  entries: BallLogEntry[];
  runs: number;
  wickets: number;
  bowler: string | null;
  inProgress: boolean;
};

export type BallLogInnings = {
  id: number;
  inningsNumber: number;
  status: string;
  battingTeamName: string | null;
  sideShort: string | null;
  overs: BallLogOver[];
  /** API + UX: only in-progress innings accept PATCH/DELETE. */
  canEdit: boolean;
};

function resolveKind(ball: ScorecardBallWire): BallLogKind {
  const isWicket = Boolean(ball.is_wicket);
  const isWide = Boolean(ball.is_wide);
  const isNoBall = Boolean(ball.is_no_ball);
  const isBye = Boolean(ball.is_bye);
  const isLegBye = Boolean(ball.is_leg_bye);
  const runs = Number(ball.runs ?? 0);
  const penaltyRuns = Number(ball.penalty_runs ?? 0);
  const additionalRuns = Number(ball.additional_runs ?? 0);
  const dismissal = ball.dismissal_type ?? null;

  if (isWicket) {
    if (dismissal === 'retired_hurt' || dismissal === 'retired' || dismissal === 'timed_out') {
      return 'retired';
    }
    return 'wicket';
  }

  const penaltyOnly = !isWide && !isNoBall && !isBye && !isLegBye && penaltyRuns > 0 && runs === 0;
  if (penaltyOnly) return 'penalty';

  const additionalOnly =
    !isWide && !isNoBall && !isBye && !isLegBye && additionalRuns > 0 && penaltyRuns === 0 && runs === 0;
  if (additionalOnly) return 'additional_runs';

  if (isWide) return 'wd';
  if (isNoBall) return 'nb';
  if (isBye) return 'bye';
  if (isLegBye) return 'lb';
  return 'runs';
}

function ballLabel(kind: BallLogKind, token: string, dismissalLabel: string | null | undefined): string {
  if (kind === 'wicket' || kind === 'retired') {
    return dismissalLabel?.trim() || (kind === 'retired' ? 'Retired' : 'Wicket');
  }
  if (kind === 'penalty') return 'Penalty';
  if (kind === 'additional_runs') return 'Additional runs';
  if (kind === 'wd') return token.includes('WD') ? token : 'Wide';
  if (kind === 'nb') return token.includes('NB') ? token : 'No ball';
  if (kind === 'bye') return 'Bye';
  if (kind === 'lb') return 'Leg-bye';
  if (token === '4') return 'Four';
  if (token === '6') return 'Six';
  if (token === '0') return 'Dot';
  return token;
}

function nameOf(id: number | null | undefined, nameById: Record<string, string>): string | null {
  if (id == null) return null;
  return nameById[String(id)] ?? null;
}

function shortName(name: string | null | undefined): string | null {
  if (!name?.trim()) return null;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0] ?? null;
  const first = parts[0]?.[0];
  const last = parts[parts.length - 1];
  return first && last ? `${first}. ${last}` : (last ?? null);
}

function toEntry(ball: ScorecardBallWire, nameById: Record<string, string>): BallLogEntry {
  const kind = resolveKind(ball);
  const presentation = ball.presentation;
  const token = presentation?.display_token ?? String(ball.runs ?? 0);
  const chip = presentation?.chip_type ?? null;
  const overNumber = ball.over ?? 0;
  const ballInOver = ball.ball_in_over ?? null;
  const by = shortName(nameOf(ball.bowler_id, nameById));
  const on = shortName(nameOf(ball.striker_id, nameById));
  const zone = ball.shot_position ?? null;
  const snapshot: EditableBallSnapshot = {
    kind,
    runsOffBat: Number(ball.runs_off_bat ?? 0),
    runs: Number(ball.runs ?? 0),
    penaltyRuns: Number(ball.penalty_runs ?? 0),
    additionalRuns: Number(ball.additional_runs ?? 0),
    noBallType: ball.no_ball_type ?? null,
    noBallRunsType: ball.no_ball_runs_type ?? null,
  };

  const detailParts = [by ? `${by}${on ? ` to ${on}` : ''}` : on, zone ? zone.replace(/_/g, ' ') : null].filter(
    Boolean
  );

  return {
    id: ball.id,
    overNumber,
    ballInOver,
    token,
    chip,
    label: ballLabel(kind, token, ball.dismissal_type_label),
    by,
    on,
    zone,
    detail: detailParts.length ? detailParts.join(' · ') : null,
    editable: kind !== 'wicket' && kind !== 'retired',
    runs: getBallEditableRunsValue(snapshot),
    extra: getBallEditableExtra(kind),
    kind,
    snapshot,
  };
}

function groupOvers(entries: BallLogEntry[], inningsComplete: boolean): BallLogOver[] {
  const byOver = new Map<number, BallLogEntry[]>();
  for (const entry of entries) {
    const list = byOver.get(entry.overNumber) ?? [];
    list.push(entry);
    byOver.set(entry.overNumber, list);
  }

  const maxOver = Math.max(...byOver.keys());
  const overs = [...byOver.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([overIdx, overEntries]) => {
      const runs = overEntries.reduce(
        (sum, e) => sum + (e.snapshot.runs || 0) + (e.snapshot.penaltyRuns || 0) + (e.snapshot.additionalRuns || 0),
        0
      );
      const wickets = overEntries.filter((e) => e.kind === 'wicket').length;
      const lastBowler = [...overEntries].reverse().find((e) => e.by)?.by ?? null;

      return {
        n: overIdx + 1,
        entries: overEntries,
        runs,
        wickets,
        bowler: lastBowler,
        inProgress: !inningsComplete && overIdx === maxOver,
      };
    });

  return overs;
}

function collectNames(innings: ScorecardInningsWire, extra: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = { ...extra };
  for (const row of innings.batting_stats ?? []) {
    const id = row.id ?? row.player_id;
    if (id != null && row.name) map[String(id)] = row.name;
  }
  for (const row of innings.bowling_stats ?? []) {
    const id = row.id ?? row.player_id;
    if (id != null && row.name) map[String(id)] = row.name;
  }
  return map;
}

export function scorecardToBallLog(
  inningsList: ScorecardInningsWire[],
  nameById: Record<string, string> = {},
  options?: { matchComplete?: boolean | undefined }
): BallLogInnings[] {
  const matchComplete = Boolean(options?.matchComplete);

  return inningsList.map((inn) => {
    const status = inningsStatus(inn);
    const names = collectNames(inn, nameById);
    const entries = (inn.balls ?? []).map((b) => toEntry(b, names));
    const completed = status === 'completed' || matchComplete;
    const battingName = inn.batting_team?.name ?? null;

    return {
      id: inn.id,
      inningsNumber: inn.innings_number,
      status,
      battingTeamName: battingName,
      sideShort: shortName(battingName)?.split(' ').pop() ?? battingName,
      overs: groupOvers(entries, completed),
      canEdit: !matchComplete && status !== 'completed',
    };
  });
}

export type { ScorecardBallWire };
