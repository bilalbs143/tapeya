import { SQUAD_XI } from '../model/squadSchemas';

export type SquadEditorSaveState = 'saved' | 'saving' | 'error';

export function squadEditorFillPct(squadLength: number, xi = SQUAD_XI): number {
  return Math.min(100, Math.round((squadLength / xi) * 100));
}

export function squadEditorShortCount(squadLength: number, xi = SQUAD_XI): number {
  return Math.max(0, xi - squadLength);
}

/** ScreenBar subtitle for the selected team / tournament readiness. */
export function squadEditorSubtitle(opts: {
  emptySquad: boolean;
  teamName: string;
  tournamentName: string;
  readyCount: number;
  teamsCount: number;
}): string {
  if (opts.emptySquad) return `${opts.teamName} · No players yet`;
  return `${opts.tournamentName} · ${opts.readyCount} of ${opts.teamsCount} ready`;
}
