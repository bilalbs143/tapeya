export type MotmCandidate = { id: number; name: string; detail?: string | null | undefined };

export type MatchOverInnings = {
  side: 'home' | 'away';
  short: string;
  runs: number;
  wickets: number;
  overs: string;
};

/** Dedupe home+away XI for MotM picker (legacy ManOfTheMatchDialog). */
export function buildMotmCandidates(
  homeXi: MotmCandidate[],
  awayXi: MotmCandidate[],
  homeShort: string,
  awayShort: string
): MotmCandidate[] {
  const seen = new Set<number>();
  const list: MotmCandidate[] = [];
  for (const player of [
    ...homeXi.map((p) => ({ ...p, detail: p.detail ?? homeShort })),
    ...awayXi.map((p) => ({ ...p, detail: p.detail ?? awayShort })),
  ]) {
    if (seen.has(player.id)) continue;
    seen.add(player.id);
    list.push(player);
  }
  return list;
}

export function matchOverShareTitle(
  resultSummary: string | null | undefined,
  homeShort: string,
  awayShort: string
): string {
  return resultSummary || `${homeShort} vs ${awayShort}`;
}
