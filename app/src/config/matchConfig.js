/**
 * Match configuration – API-only. No default config or mock data.
 * Match data comes from API (get match, scorecard, playing eleven).
 */

/** Normalize players to { id, name, role } for squad lists. Uses API data only. */
export function toSquadWithRole(players, defaultRole = 'bench') {
  if (!players?.length) return [];
  return players.map((p) => ({
    id: p.id ?? p.user_id ?? '',
    name: p.name ?? p.nickname ?? '',
    role: p.role ?? defaultRole,
  }));
}
