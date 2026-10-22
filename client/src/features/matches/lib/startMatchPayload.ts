import { z } from 'zod';

/** Aligns with `StoreTournamentMatchRequest` + legacy `buildMatchPayload`. */

export type StartMatchDraft = {
  tournamentId: number;
  homeTeamId: number;
  awayTeamId: number;
  venue: string;
  matchDate: string;
  matchTime: string;
  overs: number;
  playersPerSide: number;
  groupIndex?: number | null | undefined;
};

export type StartMatchPayload = {
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  match_time: string;
  venue_name: string;
  players_per_side: number;
  overs: number;
  group_index?: number | undefined;
};

export const createdTournamentMatchSchema = z.object({
  id: z.number(),
});

export function startMatchReady(draft: Partial<StartMatchDraft>): boolean {
  return Boolean(
    draft.tournamentId &&
    draft.homeTeamId &&
    draft.awayTeamId &&
    draft.homeTeamId !== draft.awayTeamId &&
    (draft.venue ?? '').trim() &&
    draft.matchDate &&
    draft.matchTime &&
    (draft.overs ?? 0) >= 1 &&
    (draft.playersPerSide ?? 0) >= 2
  );
}

/** Normalize time to H:i for the API. */

export function formatMatchTimeForApi(time: string): string {
  const trimmed = time.trim();
  const match = /^(\d{1,2}):(\d{2})/.exec(trimmed);
  if (!match) return trimmed;
  const hour = String(Number(match[1])).padStart(2, '0');
  return `${hour}:${match[2]}`;
}

export function buildStartMatchPayload(draft: StartMatchDraft): StartMatchPayload {
  const payload: StartMatchPayload = {
    home_team_id: draft.homeTeamId,
    away_team_id: draft.awayTeamId,
    match_date: draft.matchDate,
    match_time: formatMatchTimeForApi(draft.matchTime),
    venue_name: draft.venue.trim(),
    players_per_side: draft.playersPerSide,
    overs: draft.overs,
  };
  if (draft.groupIndex != null && draft.groupIndex > 0) {
    payload.group_index = draft.groupIndex;
  }
  return payload;
}
