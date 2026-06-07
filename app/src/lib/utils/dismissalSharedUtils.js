/**
 * @param {{ id: number|string, name?: string }[]} players
 * @param {number|string|null} id
 */
export function playerNameById(players, id) {
  if (id == null) return null;
  return players.find((p) => String(p.id) === String(id))?.name ?? null;
}
