/**
 * Best display role string for a player (playing_role, playing_role_enum, or role).
 *
 * @param {{ playing_role?: string, playing_role_enum?: string, role?: unknown } | null | undefined} player
 * @returns {string}
 */
export function playerDisplayRole(player) {
  return (
    player?.playing_role ??
    player?.playing_role_enum ??
    (player?.role != null ? String(player.role) : '—')
  );
}
