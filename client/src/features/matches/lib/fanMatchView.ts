import type { ScoringFixture } from '../model/scoringFixture';
import type { ScoringSession } from '../model/scoringSession';

export type FanPhase = 'upcoming' | 'live' | 'result';

export type FanTabId =
  'live' | 'scorecard' | 'commentary' | 'squads' | 'info' | 'partnership' | 'stats' | 'fixture' | 'table';

export type FanTabDef = { id: FanTabId; label: string };

export type FanTabOptions = {
  /** Show Table when the fixture belongs to a tournament. */
  hasTable?: boolean | undefined;
};

export type MatchBandModel = {
  status: string;
  live: boolean;
  battingName: string;
  battingShort: string;
  fieldingShort: string;
  inningsLabel: string;
  runs: number;
  wickets: number;
  overs: string;
  result: string | null;
  meta: string | null;
  venue: string | null;
  chase: { target: number; need: number; ballsLeft: number | null; rrr: string | null } | null;
  crr: string | null;
  firstInnings: { label: string; value: string } | null;
  overTokens: string[];
  overNum: number | null;
};

export function fanPhase(status: string): FanPhase {
  const s = status.trim().toLowerCase();
  if (s === 'in_progress' || s === 'live' || s === 'break' || s === 'toss_done') return 'live';
  if (s === 'completed' || s === 'finished' || s === 'result') return 'result';
  return 'upcoming';
}

export function isNotStarted(status: string): boolean {
  const s = status.trim().toLowerCase();
  return s === 'scheduled' || s === 'no_toss' || s === 'draft' || s === 'upcoming';
}

export function fanTabDefs(status: string, options: FanTabOptions = {}): FanTabDef[] {
  const tableTab: FanTabDef | null = options.hasTable ? { id: 'table', label: 'Table' } : null;

  if (isNotStarted(status)) {
    return [
      { id: 'info', label: 'Info' },
      { id: 'squads', label: 'Squads' },
      { id: 'fixture', label: 'Fixture' },
      ...(tableTab ? [tableTab] : []),
    ];
  }
  // Partnership + Stats on the live tab strip (not nested under Scorecard).
  return [
    { id: 'live', label: 'Live' },
    { id: 'scorecard', label: 'Scorecard' },
    { id: 'commentary', label: 'Overs' },
    { id: 'partnership', label: 'Partnership' },
    { id: 'stats', label: 'Stats' },
    { id: 'squads', label: 'Playing XI' },
    { id: 'info', label: 'Info' },
    ...(tableTab ? [tableTab] : []),
  ];
}

export function defaultFanTab(status: string): FanTabId {
  if (isNotStarted(status)) return 'info';
  return 'live';
}

export function resolveFanTab(requested: string | null, status: string, options: FanTabOptions = {}): FanTabId {
  const defs = fanTabDefs(status, options);
  if (requested && defs.some((d) => d.id === requested)) return requested as FanTabId;
  return defaultFanTab(status);
}

function srOf(runs: number, balls: number): string {
  if (!balls) return '0.0';
  return ((runs / balls) * 100).toFixed(1);
}

export type CreaseBatterView = {
  id: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: string;
  onStrike: boolean;
};

export function creaseBatters(session: ScoringSession | undefined): CreaseBatterView[] {
  if (!session) return [];
  const rows: CreaseBatterView[] = [];
  if (session.striker) {
    rows.push({
      id: session.striker.id,
      name: session.striker.name,
      runs: session.striker.runs,
      balls: session.striker.balls,
      fours: session.striker.fours,
      sixes: session.striker.sixes,
      sr: srOf(session.striker.runs, session.striker.balls),
      onStrike: true,
    });
  }
  if (session.nonStriker) {
    rows.push({
      id: session.nonStriker.id,
      name: session.nonStriker.name,
      runs: session.nonStriker.runs,
      balls: session.nonStriker.balls,
      fours: session.nonStriker.fours,
      sixes: session.nonStriker.sixes,
      sr: srOf(session.nonStriker.runs, session.nonStriker.balls),
      onStrike: false,
    });
  }
  return rows;
}

export function chaseCommentary(session: ScoringSession | undefined): string | null {
  if (!session || session.matchComplete) return null;
  if (session.runsToWin != null && session.ballsRemaining != null) {
    return `Need ${session.runsToWin} runs from ${session.ballsRemaining} balls`;
  }
  if (session.currentRunRate) {
    return `CRR ${session.currentRunRate}${session.requiredRunRate ? ` · RRR ${session.requiredRunRate}` : ''}`;
  }
  return null;
}

type FaceScore = {
  runs: number;
  wickets: number;
  overs: string;
  battingSide: 'home' | 'away' | null;
};

/** Score band model from fixture + live session (+ optional completed innings faces). */

export function toMatchBandModel(
  fixture: ScoringFixture,
  session: ScoringSession | undefined,
  faces: FaceScore[] = []
): MatchBandModel {
  const live = fanPhase(fixture.status) === 'live' && !session?.matchComplete;
  const battingId = session?.battingTeamId ?? null;
  const battingIsAway = battingId != null && fixture.away?.id === battingId;
  const battingSide: 'home' | 'away' | null = battingId == null ? null : battingIsAway ? 'away' : 'home';
  const batting = battingIsAway ? fixture.away : fixture.home;
  const fielding = battingIsAway ? fixture.home : fixture.away;

  const completedOther = faces.find(
    (f) => f.battingSide != null && battingSide != null && f.battingSide !== battingSide
  );
  const firstInnings =
    completedOther && batting
      ? {
          label: `${
            completedOther.battingSide === 'home' ? (fixture.home?.short ?? 'Home') : (fixture.away?.short ?? 'Away')
          } 1st inn`,
          value: `${completedOther.runs}/${completedOther.wickets}${
            completedOther.overs ? ` (${completedOther.overs.replace(/\.0$/, '')})` : ''
          }`,
        }
      : null;

  const chase =
    session?.target != null && session.runsToWin != null
      ? {
          target: session.target,
          need: session.runsToWin,
          ballsLeft: session.ballsRemaining,
          rrr: session.requiredRunRate,
        }
      : null;

  const meta = [fixture.venue].filter(Boolean).join(' · ') || null;

  return {
    status: fixture.status,
    live,
    battingName: batting?.name ?? 'Batting',
    battingShort: batting?.short ?? 'BAT',
    fieldingShort: fielding?.short ?? 'FLD',
    inningsLabel: session?.inningsNumber === 2 || chase ? '2nd inn' : '1st inn',
    runs: session?.runs ?? 0,
    wickets: session?.wickets ?? 0,
    overs: session?.oversDisplay ?? '—',
    result: session?.resultSummary ?? fixture.resultSummary,
    meta,
    venue: fixture.venue,
    chase,
    crr: session?.currentRunRate ?? null,
    firstInnings,
    overTokens: (session?.deliveries ?? []).map((d) => d.token),
    overNum: session?.overNumber ? session.overNumber : null,
  };
}

export function faceChrome(tab: FanTabId, fixture: ScoringFixture): { title: string; subtitle: string } {
  const vs = `${fixture.home?.short ?? 'HOME'} vs ${fixture.away?.short ?? 'AWAY'}`;
  const venueLine = [fixture.venue].filter(Boolean).join(' · ');
  if (tab === 'scorecard') {
    return { title: 'Scorecard', subtitle: [vs, fixture.venue].filter(Boolean).join(' · ') };
  }
  if (tab === 'partnership') {
    return { title: 'Partnership', subtitle: vs };
  }
  if (tab === 'stats') {
    return { title: 'Stats', subtitle: vs };
  }
  if (tab === 'info') {
    return {
      title: 'Match info',
      subtitle: [fixture.venue, fixture.overs != null ? `${fixture.overs} overs` : null].filter(Boolean).join(' · '),
    };
  }
  if (tab === 'commentary') return { title: 'Overs', subtitle: vs };
  if (tab === 'squads') return { title: 'Playing XI', subtitle: vs };
  if (tab === 'fixture') return { title: 'Fixture', subtitle: vs };
  if (tab === 'table') return { title: 'Table', subtitle: vs };
  // Live default: "Home vs Away" title, venue in subtitle.
  return { title: vs, subtitle: venueLine };
}
