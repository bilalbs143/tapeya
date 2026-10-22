import type { ScoringFixture } from '../model/scoringFixture';
import type { ScoringSession } from '../model/scoringSession';

/** Poll interval while the fan card is in a live phase. */
export const MATCH_CARD_LIVE_POLL_MS = 15_000;

export type MatchCardXiSide = {
  id: number;
  name: string;
  short: string;
  players: Array<{ id: number; name: string; role?: string | undefined }>;
};

/** Player id → display name from both XIs. */
export function matchCardNameById(session: ScoringSession | null | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  if (!session) return map;
  for (const p of [...session.homeXi, ...session.awayXi]) {
    map[String(p.id)] = p.name;
  }
  return map;
}

/** Home / away sides for PlayingElevenPanel. */
export function matchCardXiSides(
  fixture: ScoringFixture,
  session: ScoringSession | null | undefined
): MatchCardXiSide[] {
  return [
    {
      id: fixture.home?.id ?? 0,
      name: fixture.home?.name ?? 'Home',
      short: fixture.home?.short ?? 'HOM',
      players: (session?.homeXi ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        ...(p.role ? { role: p.role } : {}),
      })),
    },
    {
      id: fixture.away?.id ?? 1,
      name: fixture.away?.name ?? 'Away',
      short: fixture.away?.short ?? 'AWY',
      players: (session?.awayXi ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        ...(p.role ? { role: p.role } : {}),
      })),
    },
  ];
}

export function matchCardShareTitle(fixture: ScoringFixture): string {
  return `${fixture.home?.short ?? 'Home'} vs ${fixture.away?.short ?? 'Away'} — Tapeya`;
}

export function matchCardShowsLiveDock(
  streamId: number | null | undefined,
  notStarted: boolean,
  streamStatus: string
): boolean {
  const status = streamStatus.toLowerCase();
  return Boolean(streamId) && !notStarted && (status === 'live' || status === 'starting');
}
