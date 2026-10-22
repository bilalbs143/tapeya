import { z } from 'zod';

import { unwrapData, unwrapList } from '@/shared/api/unwrap';

const teamPlayerWireSchema = z
  .object({
    id: z.number(),
    name: z.string().nullable().optional(),
    nickname: z.string().nullable().optional(),
    playing_role: z.string().nullable().optional(),
    batting_style: z.string().nullable().optional(),
  })
  .passthrough();

export type TeamSquadPlayer = {
  id: number;
  name: string;
  role: string | null;
  hand: string | null;
};

export function parseTeamSquad(raw: unknown): TeamSquadPlayer[] {
  const rows = unwrapList(teamPlayerWireSchema)(raw);
  return rows.map((row) => ({
    id: row.id,
    name: row.name?.trim() || row.nickname?.trim() || 'Player',
    role: row.playing_role?.trim() || null,
    hand: row.batting_style?.trim() || null,
  }));
}

const matchSquadWireSchema = z
  .object({
    match_id: z.number().optional(),
    team_id: z.number().optional(),
    player_ids: z.array(z.number()).default([]),
    captain_id: z.number().nullable().optional(),
    wicket_keeper_id: z.number().nullable().optional(),
  })
  .passthrough();

export type MatchSquadDetail = {
  playerIds: number[];
  captainId: number | null;
  wicketKeeperId: number | null;
};

export function parseMatchSquad(raw: unknown): MatchSquadDetail {
  const wire = unwrapData(matchSquadWireSchema)(raw);
  return {
    playerIds: wire.player_ids ?? [],
    captainId: wire.captain_id ?? null,
    wicketKeeperId: wire.wicket_keeper_id ?? null,
  };
}

export type DeclareSquadPlayer = {
  id: number;
  name: string;
  role: string | null;
  hand: string | null;
  captain: boolean;
  keeper: boolean;
  playing: boolean;
};

export function blockerFor(roster: DeclareSquadPlayer[], playersPerSide: number): string | null {
  const playing = roster.filter((p) => p.playing).length;
  if (playing < playersPerSide) return `Needs ${playersPerSide - playing} more`;
  if (playing > playersPerSide) return `${playing - playersPerSide} too many — bench someone`;
  if (!roster.some((p) => p.captain)) return 'Pick a captain';
  if (!roster.some((p) => p.keeper)) return 'Pick a keeper';
  return null;
}

export function isValidXi(roster: DeclareSquadPlayer[], playersPerSide: number): boolean {
  return blockerFor(roster, playersPerSide) == null;
}

export function otherNeeds(roster: DeclareSquadPlayer[], playersPerSide: number): string {
  const parts: string[] = [];
  const playing = roster.filter((p) => p.playing).length;
  if (!roster.some((p) => p.keeper)) parts.push('a Wicket Keeper');
  if (playing < playersPerSide) {
    const n = playersPerSide - playing;
    parts.push(`${n === 1 ? 'one' : n === 2 ? 'two' : n} more in the XI`);
  } else if (!roster.some((p) => p.captain)) {
    parts.push('a Captain');
  }
  if (!parts.length) return 'finishing touches';
  if (parts.length === 1) return parts[0] ?? 'finishing touches';
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

export function statusLine(roster: DeclareSquadPlayer[], playersPerSide: number) {
  const count = roster.filter((p) => p.playing).length;
  const captainSet = roster.some((p) => p.captain);
  const keeperSet = roster.some((p) => p.keeper);
  const complete = count === playersPerSide && captainSet && keeperSet;
  const text = complete
    ? `${count} OF ${playersPerSide} · C SET · WK SET`
    : `${count} OF ${playersPerSide} · ${[!captainSet && 'C MISSING', !keeperSet && 'WK MISSING'].filter(Boolean).join(' · ') || 'INCOMPLETE'}`;
  return { count, captainSet, keeperSet, complete, text };
}
