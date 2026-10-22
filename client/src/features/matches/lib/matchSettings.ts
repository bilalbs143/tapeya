export const OFFICIAL_FIELDS = [
  ['umpires', 'Umpires'],
  ['scorers', 'Scorers'],
  ['commentators', 'Commentators'],
] as const;

export type OfficialKey = (typeof OFFICIAL_FIELDS)[number][0];

export function linesOf(text: string): string[] {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function officialsNameHint(count: number): string {
  return count ? `${count} name${count === 1 ? '' : 's'}` : 'None yet';
}

export function wagonWheelStatusHint(enabled: boolean): string {
  return enabled ? 'On · adds one tap per scoring shot' : 'Off · Stats tab stays empty';
}

export function matchSettingsBarSubtitle(homeShort: string, awayShort: string): string {
  return `${homeShort} vs ${awayShort} · Saves as you go`;
}

export function matchSettingsFooterNote(readOnly: boolean): string {
  return readOnly
    ? "View-only — you can see settings but can't change them."
    : "View-only users see this screen but can't change anything on it.";
}
