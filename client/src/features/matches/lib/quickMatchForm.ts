import type { QuickMatchGate } from './quickMatchPayload';

export type QuickMatchSide = 'home' | 'away';
export type QuickMatchAddMode = 'find' | 'new';

export const QUICK_MATCH_DEFAULT_OVERS = 5;
export const QUICK_MATCH_DEFAULT_PLAYERS = 11;
export const QUICK_MATCH_OVERS_MIN = 1;
export const QUICK_MATCH_OVERS_MAX = 255;
export const QUICK_MATCH_PLAYERS_MIN = 2;
export const QUICK_MATCH_PLAYERS_MAX = 20;
export const QUICK_MATCH_DEFAULT_BALL = 'tape_ball';

export type QuickMatchSetupStatus = { alert: boolean; text: string };

/** Sticky-bar copy from gate + roster counts. */
export function quickMatchSetupStatus(
  gate: QuickMatchGate,
  homeName: string,
  awayName: string,
  homeCount: number,
  awayCount: number,
  playersPerSide: number
): QuickMatchSetupStatus {
  const total = homeCount + awayCount;
  const need = playersPerSide * 2;
  if (gate.canToss) {
    return { alert: false, text: `${total} of ${need} players added — both sides are ready.` };
  }
  if (gate.note?.includes('short of')) {
    const homeShort = playersPerSide - homeCount;
    const awayShort = playersPerSide - awayCount;
    const side = awayShort >= homeShort ? awayName.trim() || 'Side B' : homeName.trim() || 'Side A';
    const missing = Math.max(homeShort, awayShort);
    return {
      alert: false,
      text: `${total} of ${need} players added — ${side} needs ${missing} more.`,
    };
  }
  return { alert: true, text: gate.note ?? 'Name both sides, then add players.' };
}

export function quickMatchInitials(name: string, fallback: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const second = parts[1];
  if (!first) return fallback;
  if (!second) return first.slice(0, 2).toUpperCase();
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase();
}
