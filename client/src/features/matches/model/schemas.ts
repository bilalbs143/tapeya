import { z } from 'zod';

/** Wire shape — faithful to `QuickMatchResource`. UI never consumes this type; `toDomain` is the only bridge (§7.7). */

export const matchSideWireSchema = z.object({
  id: z.number(),
  name: z.string(),
  user_id: z.number().nullable().optional(),
  logo: z.string().nullable().optional(),
  players: z.array(z.unknown()).optional(),
});

export const matchApiStatusSchema = z.enum(['scheduled', 'toss_done', 'in_progress', 'completed', 'cancelled']);
export type MatchApiStatus = z.infer<typeof matchApiStatusSchema>;

export const quickMatchWireSchema = z.object({
  id: z.number(),
  kind: z.string().nullable().optional(),
  status: matchApiStatusSchema,
  status_label: z.string().nullable().optional(),
  cricket_format: z.string().nullable().optional(),
  cricket_format_label: z.string().nullable().optional(),
  overs: z.number().nullable().optional(),
  players_per_side: z.number().nullable().optional(),
  venue_name: z.string().nullable().optional(),
  match_date: z.string().nullable().optional(),
  match_time: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  created_by: z
    .object({
      id: z.number(),
      name: z.string().nullable(),
    })
    .nullable()
    .optional(),
  tournament: z
    .object({
      id: z.number().optional(),
      name: z.string().nullable().optional(),
      short_name: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  home_team: matchSideWireSchema.nullable(),
  away_team: matchSideWireSchema.nullable(),
  toss_winner_team_id: z.number().nullable().optional(),
  chose_to_bat_or_bowl: z.string().nullable().optional(),
  can_operate: z.boolean().optional(),
  is_owner: z.boolean().optional(),
});
export type QuickMatchWire = z.infer<typeof quickMatchWireSchema>;

export type MatchSection = 'live' | 'toss' | 'scheduled' | 'done';

/** API statuses map here once in `toDomain`. */

export type MatchUiStatus = 'live' | 'no_toss' | 'scheduled' | 'completed' | 'cancelled';

export type MatchSide = {
  id: number;
  name: string;
  short: string;
  logoUrl: string | null;
};

export type Match = {
  id: number;
  status: MatchApiStatus;
  uiStatus: MatchUiStatus;
  /** `null` when the match should not appear in any list section (e.g. cancelled). */
  section: MatchSection | null;
  statusLabel: string | null;
  format: string | null;
  formatLabel: string | null;
  overs: number | null;
  venueName: string | null;
  matchDate: string | null;
  matchTime: string | null;
  createdAt: string | null;
  tournamentShort: string | null;
  home: MatchSide | null;
  away: MatchSide | null;
  tossWinnerTeamId: number | null;
  canOperate: boolean;
  isOwner: boolean;
};

/** Short code for crests / vs lines — first letters of words, else first 3 chars. */

export function teamShort(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '—';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.charAt(0) ?? '';
    const b = parts[1]?.charAt(0) ?? '';
    return `${a}${b}`.toUpperCase();
  }
  return trimmed.slice(0, 3).toUpperCase();
}

export function matchSection(status: MatchApiStatus, tossWinnerTeamId: number | null): MatchSection | null {
  switch (status) {
    case 'in_progress':
      return 'live';
    case 'scheduled':
      return tossWinnerTeamId == null ? 'toss' : 'scheduled';
    case 'toss_done':
      return 'scheduled';
    case 'completed':
      return 'done';
    case 'cancelled':
      return null;
  }
}

export function toUiStatus(status: MatchApiStatus, tossWinnerTeamId: number | null): MatchUiStatus {
  if (status === 'in_progress') return 'live';
  if (status === 'scheduled' && tossWinnerTeamId == null) return 'no_toss';
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';
  return 'scheduled';
}

function toSide(wire: z.infer<typeof matchSideWireSchema> | null): MatchSide | null {
  if (!wire) return null;
  return {
    id: wire.id,
    name: wire.name,
    short: teamShort(wire.name),
    logoUrl: wire.logo ?? null,
  };
}

export function toDomain(wire: QuickMatchWire): Match {
  const tossWinnerTeamId = wire.toss_winner_team_id ?? null;
  return {
    id: wire.id,
    status: wire.status,
    uiStatus: toUiStatus(wire.status, tossWinnerTeamId),
    section: matchSection(wire.status, tossWinnerTeamId),
    statusLabel: wire.status_label ?? null,
    format: wire.cricket_format ?? null,
    formatLabel: wire.cricket_format_label ?? null,
    overs: wire.overs ?? null,
    venueName: wire.venue_name ?? null,
    matchDate: wire.match_date ?? null,
    matchTime: wire.match_time ?? null,
    createdAt: wire.created_at ?? null,
    tournamentShort: wire.tournament?.short_name ?? wire.tournament?.name ?? null,
    home: toSide(wire.home_team),
    away: toSide(wire.away_team),
    tossWinnerTeamId,
    canOperate: wire.can_operate ?? false,
    isOwner: wire.is_owner ?? false,
  };
}

export const MATCH_SECTIONS: { key: MatchSection; label: string }[] = [
  { key: 'live', label: 'Scoring now' },
  { key: 'toss', label: 'Starts soon · toss owed' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'done', label: 'Done' },
];
