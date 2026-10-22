/** XI not on crease, not dismissed (retired_hurt still allowed) — app substitute eligibility. */

export type EligibleAdminSubstituteBatter = {
  id: number;
  name: string;
  role?: string | undefined;
};

export type EligibleAdminSubstituteBattingStat = {
  id?: number | undefined;
  player_id?: number | undefined;
  dismissal_type?: string | null | undefined;
};

export function eligibleAdminSubstitutes(
  batters: EligibleAdminSubstituteBatter[],
  strikerId: number | null | undefined,
  nonStrikerId: number | null | undefined,
  battingStats: EligibleAdminSubstituteBattingStat[] | undefined
): EligibleAdminSubstituteBatter[] {
  const onCrease = new Set([strikerId, nonStrikerId].filter((id): id is number => id != null).map(String));
  return batters.filter((p) => {
    if (onCrease.has(String(p.id))) return false;
    const row = battingStats?.find((b) => String(b.player_id ?? b.id) === String(p.id));
    if (!row?.dismissal_type) return true;
    return row.dismissal_type === 'retired_hurt';
  });
}
