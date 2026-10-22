import type { BallLogEntry, BallLogInnings } from './ballLog';

export type CommentaryItem = {
  id: string;
  ball: string;
  chip: string;
  text: string;
  score?: string | null | undefined;
};

function commentaryText(entry: BallLogEntry): string {
  if (entry.kind === 'wicket' || entry.kind === 'retired') {
    const who = [entry.by, entry.on].filter(Boolean).join(' to ');
    return who ? `${who} — ${entry.label}` : entry.label;
  }
  if (entry.detail) {
    const action =
      entry.kind === 'runs' && entry.token === '4'
        ? 'four'
        : entry.kind === 'runs' && entry.token === '6'
          ? 'six'
          : entry.kind === 'runs' && entry.token === '0'
            ? 'dot'
            : entry.label.toLowerCase();
    if (entry.zone) return `${entry.detail}, ${action}`;
    if (entry.kind === 'runs') return `${entry.detail}, ${action}`;
    return `${entry.detail} — ${entry.label}`;
  }
  return entry.label;
}

/** Flatten ball-log overs → 15b commentary rows (same balls, forward/back presentation). */

export function ballLogToCommentary(innings: BallLogInnings[]): CommentaryItem[] {
  const items: CommentaryItem[] = [];
  for (const inn of innings) {
    for (const over of inn.overs) {
      for (const entry of over.entries) {
        const ball = entry.ballInOver != null ? `${entry.overNumber}.${entry.ballInOver}` : `${entry.overNumber}`;
        items.push({
          id: `${inn.id}-${entry.id}`,
          ball,
          chip: entry.token === '0' ? '·' : entry.token,
          text: commentaryText(entry),
        });
      }
    }
  }
  return items;
}
