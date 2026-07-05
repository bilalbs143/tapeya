import { toNum } from '../utils';

/**
 * Merge raw API context `home_team` / `away_team` with fields on `context.match`
 * so names, codes, and logos are available even when Reverb sends only `match`.
 * @param {Record<string, any>} ctx
 * @returns {{ home_team: Record<string, any>, away_team: Record<string, any> }}
 */
export function resolveContextTeams(ctx = {}) {
  const m = ctx.match ?? {};
  const h = ctx.home_team && typeof ctx.home_team === 'object' ? { ...ctx.home_team } : {};
  const a = ctx.away_team && typeof ctx.away_team === 'object' ? { ...ctx.away_team } : {};
  return {
    home_team: {
      ...h,
      id: h.id ?? m.home_team_id,
      name: h.name ?? m.home_team_name ?? '',
      short_code: h.short_code ?? m.home_team_short_code ?? '',
      logo_url: h.logo_url ?? m.home_team_logo_url ?? null,
    },
    away_team: {
      ...a,
      id: a.id ?? m.away_team_id,
      name: a.name ?? m.away_team_name ?? '',
      short_code: a.short_code ?? m.away_team_short_code ?? '',
      logo_url: a.logo_url ?? m.away_team_logo_url ?? null,
    },
  };
}

/** @param {Record<string, any>} raw */
export function normalizeTeam(raw = {}) {
  return {
    id: toNum(raw.id),
    name: raw.name ?? '',
    shortCode: raw.short_code ?? raw.shortCode ?? '',
    abbrevDisplay: raw.abbrev_display ?? raw.abbrevDisplay ?? raw.short_code ?? raw.shortCode ?? '',
    logoUrl: raw.logo_url ?? raw.logoUrl ?? null,
  };
}

/** @param {unknown} raw */
export function normalizeBatters(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((b) => ({
    id: b.id ?? b.user_id ?? b.userId ?? null,
    name: b.name ?? '',
    runs: b.runs ?? 0,
    balls: b.balls ?? 0,
    fours: b.fours ?? 0,
    sixes: b.sixes ?? 0,
    ones: b.ones ?? 0,
    twos: b.twos ?? 0,
    threes: b.threes ?? 0,
    dots: b.dots ?? 0,
    onStrike: !!(b.on_strike ?? b.onStrike),
    isDismissed: !!(b.is_dismissed ?? b.isDismissed),
    imageUrl: b.avatar_url ?? b.avatarUrl ?? b.image_url ?? b.imageUrl ?? null,
  }));
}
