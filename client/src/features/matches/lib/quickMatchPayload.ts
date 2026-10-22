import { z } from 'zod';

/** StoreQuickMatchRequest body. Existing players are user ids; walk-ups are name + E.164. */

export const QUICK_MATCH_NAME = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
export const QUICK_MATCH_PHONE = /^\+[1-9]\d{6,14}$/;

/** Cricket format value from `GET /enums` → `cricket_format`. */

export type BallTypeId = string;

/** Chip on a side. `userId` is a Tapeya account; otherwise a walk-up. */

export type QuickMatchPlayer = {
  name: string;
  userId?: number | undefined;
  phone?: string | undefined;
};

export type QuickMatchDraft = {
  cricketFormat: BallTypeId;
  overs: number;
  playersPerSide: number;
  homeName: string;
  awayName: string;
  homePlayers: QuickMatchPlayer[];
  awayPlayers: QuickMatchPlayer[];
};

export type QuickMatchPlayerWire = { user_id: number } | { name: string; phone: string };

export type QuickMatchPayload = {
  cricket_format: BallTypeId;
  overs: number;
  players_per_side: number;
  home: { name: string; players: QuickMatchPlayerWire[] };
  away: { name: string; players: QuickMatchPlayerWire[] };
};

export type QuickMatchGate = {
  canSave: boolean;
  /** Exact XI on both sides — required before toss (`promoteSquadToPlayingEleven`). */
  canToss: boolean;
  note: string | null;
};

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];

function word(n: number): string {
  return WORDS[n] ?? String(n);
}

export function playerError(player: { name: string; phone: string }): string | null {
  const name = player.name.trim();
  const phone = player.phone.trim();
  if (!name) return 'Name is required.';
  if (!QUICK_MATCH_NAME.test(name)) return 'Name may only contain letters and spaces.';
  if (!QUICK_MATCH_PHONE.test(phone)) return 'Phone must include country code (e.g. +923001234567).';
  return null;
}

function sharedPlayer(draft: QuickMatchDraft): boolean {
  const homeIds = new Set(draft.homePlayers.flatMap((p) => (p.userId != null ? [p.userId] : [])));
  const homePhones = new Set(draft.homePlayers.flatMap((p) => (p.phone ? [p.phone] : [])));
  return draft.awayPlayers.some(
    (p) => (p.userId != null && homeIds.has(p.userId)) || (p.phone != null && homePhones.has(p.phone))
  );
}

export function quickMatchGate(draft: QuickMatchDraft): QuickMatchGate {
  const home = draft.homeName.trim();
  const away = draft.awayName.trim();
  const pps = draft.playersPerSide;
  if (!home || !away) {
    return { canSave: false, canToss: false, note: 'Name both sides, then add players.' };
  }
  if (home.toLowerCase() === away.toLowerCase()) {
    return { canSave: false, canToss: false, note: 'The two sides need different names.' };
  }
  if (sharedPlayer(draft)) {
    return { canSave: false, canToss: false, note: 'A player cannot appear on both sides.' };
  }
  if (draft.homePlayers.length > pps || draft.awayPlayers.length > pps) {
    return { canSave: false, canToss: false, note: `At most ${pps} players per side.` };
  }

  const canSave = draft.homePlayers.length >= 1 && draft.awayPlayers.length >= 1;
  const canToss = draft.homePlayers.length === pps && draft.awayPlayers.length === pps;
  if (canToss) return { canSave: true, canToss: true, note: null };

  const homeShort = pps - draft.homePlayers.length;
  const awayShort = pps - draft.awayPlayers.length;
  const short = awayShort > 0 && awayShort >= homeShort ? { name: away, n: awayShort } : { name: home, n: homeShort };

  return {
    canSave,
    canToss: false,
    note: `${short.name} is ${word(short.n)} short of ${word(pps)}. Toss needs a full side — save now and add the rest before you start.`,
  };
}

function toWire(player: QuickMatchPlayer): QuickMatchPlayerWire {
  if (player.userId != null) return { user_id: player.userId };
  return { name: player.name.trim(), phone: player.phone?.trim() ?? '' };
}

export function buildQuickMatchPayload(draft: QuickMatchDraft): QuickMatchPayload {
  return {
    cricket_format: draft.cricketFormat,
    overs: draft.overs,
    players_per_side: draft.playersPerSide,
    home: { name: draft.homeName.trim(), players: draft.homePlayers.map(toWire) },
    away: { name: draft.awayName.trim(), players: draft.awayPlayers.map(toWire) },
  };
}

export const createdQuickMatchSchema = z.object({ id: z.number() });
