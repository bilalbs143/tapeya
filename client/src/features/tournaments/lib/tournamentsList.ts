import type { Tournament } from '../model/schemas';

export function partitionTournamentHub(items: Tournament[]): {
  needsYou: Tournament[];
  previous: Tournament[];
} {
  return {
    needsYou: items.filter((t) => t.hubSection === 'needsYou'),
    previous: items.filter((t) => t.hubSection === 'previous'),
  };
}

export function tournamentsHubSubtitle(opts: {
  isEmpty: boolean;
  isLoading: boolean;
  needsYouCount: number;
  previousCount: number;
}): string | undefined {
  if (opts.isEmpty) return 'Host, Seed Teams and Score Match Day';
  if (opts.isLoading) return undefined;
  return [
    opts.needsYouCount ? `${opts.needsYouCount} active` : null,
    opts.previousCount ? `${opts.previousCount} previous` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}
