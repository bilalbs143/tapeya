import type { PartnershipWire, ScorecardInningsWire } from '../model/scorecardSchemas';
import { type ScorecardFace, toScorecardFace } from './scorecardFace';

export type PartnershipBatter = {
  name: string;
  runs: number;
  balls: number;
  onStrike?: boolean | undefined;
};

export type PartnershipStand = {
  id: string;
  complete: boolean;
  wicketNo: number | null;
  label: string;
  runs: number;
  balls: number;
  batters: [PartnershipBatter, PartnershipBatter | null];
};

export type PartnershipInnings = {
  id: number;
  sideShort: string | null;
  sideName: string | null;
  ordinal: string;
  stands: PartnershipStand[];
};

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

function nameOf(
  id: number | null | undefined,
  nameById: Record<string, string>,
  battingStats: ScorecardInningsWire['batting_stats']
): string {
  if (id == null) return '—';
  const fromMap = nameById[String(id)];
  if (fromMap) return fromMap;
  const fromStats = battingStats?.find((s) => (s.id ?? s.player_id) === id)?.name;
  return fromStats?.trim() || `Player ${id}`;
}

/** Map API partnerships → PartnershipTab stand shape. `wicket_number === null` is the open (current) stand. */

export function toPartnershipStands(
  partnerships: PartnershipWire[] | undefined,
  battingStats: ScorecardInningsWire['batting_stats'],
  nameById: Record<string, string>,
  currentStrikerId?: number | null
): PartnershipStand[] {
  const list = partnerships ?? [];
  const stands: PartnershipStand[] = [];

  list.forEach((p, i) => {
    const complete = p.wicket_number != null;
    const wicketNo = p.wicket_number ?? null;
    const a: PartnershipBatter = {
      name: nameOf(p.player_1_id, nameById, battingStats),
      runs: p.player_1_runs ?? 0,
      balls: p.player_1_balls ?? 0,
      onStrike: !complete && currentStrikerId != null && p.player_1_id === currentStrikerId,
    };
    const bId = p.player_2_id;
    const b: PartnershipBatter | null =
      bId != null
        ? {
            name: nameOf(bId, nameById, battingStats),
            runs: p.player_2_runs ?? 0,
            balls: p.player_2_balls ?? 0,
            onStrike: !complete && currentStrikerId != null && bId === currentStrikerId,
          }
        : null;

    stands.push({
      id: `p-${i}-${p.player_1_id ?? 0}-${p.player_2_id ?? 0}`,
      complete,
      wicketNo,
      label: wicketNo != null ? `${ordinal(wicketNo)} wicket` : 'Partnership',
      runs: p.runs ?? 0,
      balls: p.balls ?? 0,
      batters: [a, b],
    });
  });

  return stands;
}

export function toPartnershipInnings(
  innings: ScorecardInningsWire[],
  options: {
    nameById?: Record<string, string> | undefined;
    homeTeamId?: number | null | undefined;
    awayTeamId?: number | null | undefined;
    homeShort?: string | null | undefined;
    awayShort?: string | null | undefined;
  } = {}
): PartnershipInnings[] {
  const nameById = options.nameById ?? {};
  return innings.map((inn, index) => {
    const face: ScorecardFace = toScorecardFace(inn, {
      homeTeamId: options.homeTeamId,
      awayTeamId: options.awayTeamId,
      homeShort: options.homeShort,
      awayShort: options.awayShort,
    });
    return {
      id: inn.id,
      sideShort: face.sideShort,
      sideName: face.sideName,
      ordinal: index === 0 ? '1st' : '2nd',
      stands: toPartnershipStands(inn.partnerships, inn.batting_stats, nameById, inn.current_striker_id),
    };
  });
}
