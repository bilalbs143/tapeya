export function parseTournamentIdParam(raw: string | undefined): number | null {
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** Organizers stay on workspace; everyone else goes to the public page. */
export function tournamentDetailShouldRedirectPublic(canManage: boolean | undefined): boolean {
  return !canManage;
}
