import { z } from 'zod';

import { unwrapList } from '@/shared/api/unwrap';

const teamBriefWireSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
});

/** Wire — `TournamentMatchResource` (fixtures list). */

export const tournamentMatchWireSchema = z.object({
  id: z.number(),
  match_date: z.string().nullable().optional(),
  match_time: z.string().nullable().optional(),
  venue_name: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  status_label: z.string().nullable().optional(),
  group_index: z.number().nullable().optional(),
  home_team: teamBriefWireSchema.nullable().optional(),
  away_team: teamBriefWireSchema.nullable().optional(),
  home_team_id: z.number().nullable().optional(),
  away_team_id: z.number().nullable().optional(),
});
export type TournamentMatchWire = z.infer<typeof tournamentMatchWireSchema>;

export type FixtureStatus = 'upcoming' | 'live' | 'result';

export type TournamentFixture = {
  id: number;
  matchDate: string | null;
  matchTime: string | null;
  venueName: string | null;
  status: FixtureStatus;
  statusLabel: string;
  groupIndex: number | null;
  homeName: string;
  awayName: string;
  title: string;
  meta: string;
};

function toFixtureStatus(raw: string | null | undefined): FixtureStatus {
  const s = (raw ?? '').toLowerCase();
  if (s === 'live' || s === 'in_progress' || s === 'innings_break') return 'live';
  if (s === 'completed' || s === 'result' || s === 'abandoned' || s === 'cancelled' || s === 'no_result') {
    return 'result';
  }
  return 'upcoming';
}

export function matchToFixture(wire: TournamentMatchWire): TournamentFixture {
  const homeName = wire.home_team?.name?.trim() || 'Home';
  const awayName = wire.away_team?.name?.trim() || 'Away';
  const status = toFixtureStatus(wire.status);
  const datePart = wire.match_date
    ? new Date(`${wire.match_date}T12:00:00`).toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : '';
  const timePart = wire.match_time ? String(wire.match_time).slice(0, 5) : '';
  const venue = wire.venue_name?.trim() || '';
  const meta = [datePart, timePart, venue].filter(Boolean).join(' · ');

  return {
    id: wire.id,
    matchDate: wire.match_date ?? null,
    matchTime: wire.match_time ?? null,
    venueName: wire.venue_name ?? null,
    status,
    statusLabel: wire.status_label?.trim() || status,
    groupIndex: wire.group_index ?? null,
    homeName,
    awayName,
    title: `${homeName} vs ${awayName}`,
    meta: meta || 'Schedule TBA',
  };
}

export function parseTournamentMatches(raw: unknown): TournamentFixture[] {
  return unwrapList(tournamentMatchWireSchema)(raw).map(matchToFixture);
}

export type ScorecardHubMatch = TournamentFixture & {
  tournamentId: number;
  tournamentName: string;
};

export type ScorecardHubTournament = {
  id: number;
  name: string;
};

export type ScorecardHub = {
  tournaments: ScorecardHubTournament[];
  matches: ScorecardHubMatch[];
};

const STATUS_ORDER: Record<FixtureStatus, number> = {
  live: 0,
  upcoming: 1,
  result: 2,
};

/** Flatten `GET /tournaments?all=1&with_matches=1` into a fan scorecard list. */

export function parseScorecardHub(
  tournaments: Array<{ id: number; name: string; matches?: TournamentMatchWire[] | undefined }>
): ScorecardHub {
  const hubTournaments: ScorecardHubTournament[] = [];
  const matches: ScorecardHubMatch[] = [];

  for (const t of tournaments) {
    const fixtures = t.matches ?? [];
    if (!fixtures.length) continue;
    hubTournaments.push({ id: t.id, name: t.name });
    for (const wire of fixtures) {
      matches.push({
        ...matchToFixture(wire),
        tournamentId: t.id,
        tournamentName: t.name,
      });
    }
  }

  matches.sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (byStatus !== 0) return byStatus;
    return String(b.matchDate ?? '').localeCompare(String(a.matchDate ?? ''));
  });

  return { tournaments: hubTournaments, matches };
}

export type TournamentReactionCounts = {
  likesCount: number;
  dislikesCount: number;
  sharesCount: number;
  myReaction: 'like' | 'dislike' | null;
};

export const reactionCountsWireSchema = z.object({
  likes_count: z.number(),
  dislikes_count: z.number(),
  shares_count: z.number(),
  my_reaction: z.enum(['like', 'dislike']).nullable().optional(),
});

export function parseReactionCounts(raw: unknown): TournamentReactionCounts {
  const body = typeof raw === 'object' && raw != null && 'data' in raw ? (raw as { data: unknown }).data : raw;
  const wire = reactionCountsWireSchema.parse(body);
  return {
    likesCount: wire.likes_count,
    dislikesCount: wire.dislikes_count,
    sharesCount: wire.shares_count,
    myReaction: wire.my_reaction ?? null,
  };
}
