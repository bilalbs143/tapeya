import { z } from 'zod';

import { unwrapData } from '@/shared/api/unwrap';

const sideSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    code: z.string().nullable().optional(),
  })
  .nullable();

const analyticsSettingsWireSchema = z
  .object({
    wagon_wheel_enabled: z.boolean().optional(),
    umpires: z.string().nullable().optional(),
    scorers: z.string().nullable().optional(),
    commentators: z.string().nullable().optional(),
  })
  .optional();

export const scoringFixtureWireSchema = z.object({
  id: z.number(),
  status: z.string(),
  kind: z.string().nullable().optional(),
  tournament_id: z.number().nullable().optional(),
  overs: z.number().nullable().optional(),
  venue_name: z.string().nullable().optional(),
  players_per_side: z.number().nullable().optional(),
  can_operate: z.boolean().optional(),
  home_team_id: z.number().nullable().optional(),
  away_team_id: z.number().nullable().optional(),
  home_team: sideSchema.optional(),
  away_team: sideSchema.optional(),
  toss_winner_team_id: z.number().nullable().optional(),
  chose_to_bat_or_bowl: z.string().nullable().optional(),
  result_summary: z.string().nullable().optional(),
  analytics_settings: analyticsSettingsWireSchema,
  stream: z
    .object({
      id: z.number(),
      status: z.string().nullable().optional(),
      provider: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type ScoringFixtureWire = z.infer<typeof scoringFixtureWireSchema>;

export type ScoringSide = {
  id: number;
  name: string;
  short: string;
};

export type ScoringFixtureStream = {
  id: number;
  status: string | null;
};

/** Match settings — wagon wheel + officials (PATCH /analytics-settings). */

export type MatchAnalyticsSettings = {
  wagonWheelEnabled: boolean;
  umpires: string;
  scorers: string;
  commentators: string;
};

export type ScoringFixture = {
  id: number;
  status: string;
  /** Present for tournament fixtures — Declare XI is required before first ball. */
  tournamentId: number | null;
  kind: string | null;
  overs: number | null;
  venue: string | null;
  canOperate: boolean;
  playersPerSide: number | null;
  home: ScoringSide | null;
  away: ScoringSide | null;
  tossWinnerId: number | null;
  choseTo: 'bat' | 'bowl' | null;
  resultSummary: string | null;
  analytics: MatchAnalyticsSettings;
  /** Live / VOD stream linked to this match (`match_streams.id`). */
  stream: ScoringFixtureStream | null;
};

/** Side short code — prefer multi-word initials so generated codes do not collide. */

function shortCode(name: string, code: string | null | undefined): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const initials = words
      .map((w) => w[0] ?? '')
      .join('')
      .slice(0, 3)
      .toUpperCase();
    if (initials) return initials;
  }
  const trimmed = code?.trim();
  if (trimmed) return trimmed.slice(0, 3).toUpperCase();
  return name.trim().slice(0, 3).toUpperCase() || '—';
}

function toSide(wire: z.infer<typeof sideSchema> | undefined): ScoringSide | null {
  if (!wire) return null;
  return { id: wire.id, name: wire.name, short: shortCode(wire.name, wire.code) };
}

export function toAnalyticsSettings(
  wire: z.infer<typeof analyticsSettingsWireSchema> | undefined
): MatchAnalyticsSettings {
  return {
    wagonWheelEnabled: Boolean(wire?.wagon_wheel_enabled),
    umpires: wire?.umpires?.trim() ?? '',
    scorers: wire?.scorers?.trim() ?? '',
    commentators: wire?.commentators?.trim() ?? '',
  };
}

export function toScoringFixture(wire: ScoringFixtureWire): ScoringFixture {
  const chose =
    wire.chose_to_bat_or_bowl === 'bat' || wire.chose_to_bat_or_bowl === 'bowl' ? wire.chose_to_bat_or_bowl : null;
  return {
    id: wire.id,
    status: wire.status,
    tournamentId: wire.tournament_id ?? null,
    kind: wire.kind?.trim() || null,
    overs: wire.overs ?? null,
    venue: wire.venue_name?.trim() || null,
    canOperate: Boolean(wire.can_operate),
    playersPerSide: wire.players_per_side ?? null,
    home:
      toSide(wire.home_team) ??
      (wire.home_team_id != null ? { id: wire.home_team_id, name: 'Home', short: 'HOM' } : null),
    away:
      toSide(wire.away_team) ??
      (wire.away_team_id != null ? { id: wire.away_team_id, name: 'Away', short: 'AWY' } : null),
    tossWinnerId: wire.toss_winner_team_id ?? null,
    choseTo: chose,
    resultSummary: wire.result_summary?.trim() || null,
    analytics: toAnalyticsSettings(wire.analytics_settings),
    stream: wire.stream?.id != null ? { id: wire.stream.id, status: wire.stream.status?.trim() || null } : null,
  };
}

export function parseScoringFixture(raw: unknown): ScoringFixture {
  return toScoringFixture(unwrapData(scoringFixtureWireSchema)(raw));
}

export function tossRecorded(fixture: ScoringFixture): boolean {
  return fixture.tossWinnerId != null && fixture.choseTo != null;
}
