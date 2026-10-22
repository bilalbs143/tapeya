import type { AdminSheetAction } from './adminActionSheetTypes';

export const ADMIN_ACTION_TITLES: Record<AdminSheetAction, [string, string | null]> = {
  change_keeper: [
    'Change Wicket Keeper',
    'Stumped and caught-behind dismissals will credit whoever is keeping from the next ball.',
  ],
  substitute: ['Substitute Player', null],
  additional_runs: ['Add Additional Runs', 'A correction, not an event — no ball, no batter, no bowler credited.'],
  add_break: ['Add a Break', "The clock pauses; the over count doesn't move."],
  match_notes: ['Match Notes', 'Timestamped, appended, visible to the organizer. Not part of the scorecard.'],
  match_rules: ['Match Rules', null],
};

export function adminRulesSubtitle(tournamentShort: string | null | undefined): string {
  return tournamentShort
    ? `Set by the ${tournamentShort} organizer. Locked once the toss is saved.`
    : 'Set when the match was created. Locked once the toss is saved.';
}

export function adminRulesRows(oversPerSide: number | null, playersPerSide: number | null): [string, string][] {
  const maxBowl = oversPerSide != null ? Math.max(1, Math.floor(oversPerSide / 5)) : null;
  return [
    ['Overs', oversPerSide != null ? String(oversPerSide) : '—'],
    ['Players Per Side', playersPerSide != null ? String(playersPerSide) : '—'],
    ['Max Per Bowler', maxBowl != null ? String(maxBowl) : '—'],
    ['Wide / no-ball', '1 run + re-bowl'],
    ['Free Hit After', 'No Ball'],
  ];
}

export function adminPrimaryLabel(action: AdminSheetAction): string {
  if (action === 'change_keeper') return 'Save Keeper';
  if (action === 'add_break') return 'Start Break';
  if (action === 'additional_runs') return 'Add Runs';
  if (action === 'substitute') return 'Confirm Sub';
  if (action === 'match_notes') return 'Add Note';
  return 'Close';
}

export function formatAdminNoteTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return iso;
  }
}

export function adminPlayerInitials(name = ''): string {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return (parts[0] ?? '').slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
}
