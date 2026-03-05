/**
 * Match configuration shape – used on Start Match page and passed to Scoring page.
 * Kept in one place so it stays aligned with future API (create match, get match).
 */

/** Normalize players to { id, name, role } for squad lists. */
export function toSquadWithRole(players, defaultRole = 'bench') {
  if (!players?.length) return [];
  return players.map((p) => ({
    id: p.id || String(p.name),
    name: p.name || '—',
    role: p.role ?? defaultRole,
  }));
}

/** Generate 11 mock players for a team (id + name). Replace with API data later. */
export function getMockPlayers(teamKey = '') {
  const prefix = teamKey ? `Player ` : 'Player ';
  return Array.from({ length: 11 }, (_, i) => ({
    id: `${teamKey}-${i + 1}`,
    name: `${prefix}${i + 1}`,
  }));
}

export const DEFAULT_MATCH_CONFIG = {
  teamA: { name: '', players: getMockPlayers('A') },
  teamB: { name: '', players: getMockPlayers('B') },
  venue: '',
  matchDate: '',
  matchTime: '',
  format: 'tournament',
  overs: '',
  playersPerSide: '',
  ballType: 'leather',
  toss: null, // { winner: 'A' | 'B', decision: 'bat' | 'bowl' }
};

/**
 * Build match config object from Start Match form state (for navigation state / API payload).
 * Adds mock 11 players per team when no squad from API.
 */
export function buildMatchConfig(form) {
  return {
    teamA: {
      name: (form.teamA?.name ?? '').trim(),
      players: form.teamA?.players?.length ? form.teamA.players : getMockPlayers('A'),
    },
    teamB: {
      name: (form.teamB?.name ?? '').trim(),
      players: form.teamB?.players?.length ? form.teamB.players : getMockPlayers('B'),
    },
    venue: (form.venue ?? '').trim(),
    matchDate: form.matchDate ?? '',
    matchTime: form.matchTime ?? '',
    format: form.format ?? 'tournament',
    overs: form.overs ?? '',
    playersPerSide: form.playersPerSide ?? '',
    ballType: form.ballType ?? 'leather',
    toss:
      form.tossWinner && form.tossDecision
        ? { winner: form.tossWinner, decision: form.tossDecision }
        : null,
  };
}
