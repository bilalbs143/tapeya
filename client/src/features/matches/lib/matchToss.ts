export const FALLBACK_TOSS = [
  { value: 'bat', label: 'Bat' },
  { value: 'bowl', label: 'Bowl' },
] as const;

export type TossWinnerSide = 'home' | 'away';

export type TossDecisionOption = { value: string; label: string };

export function resolveTossDecisions(options: TossDecisionOption[]): TossDecisionOption[] {
  return options.length > 0 ? options : [...FALLBACK_TOSS];
}

export function resolveTossChoseTo(decision: string): 'bat' | 'bowl' | null {
  return decision === 'bat' || decision === 'bowl' ? decision : null;
}

export function matchTossSubtitle(
  homeShort: string,
  awayShort: string,
  overs: number | string | null | undefined,
  venue: string | null | undefined
): string {
  return [`${homeShort} vs ${awayShort}`, overs ? `${overs} overs` : null, venue].filter(Boolean).join(' · ');
}

export function tossSummaryLine(winnerShort: string, decisionLabel: string): string {
  return `${winnerShort} won the toss and elected to ${decisionLabel.toLowerCase()}.`;
}
