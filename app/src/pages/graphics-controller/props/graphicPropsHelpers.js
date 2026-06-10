/**
 * Shared helpers for graphic prop builders (see `buildGraphicProps.js`).
 */

export function normalizeTeam(raw = {}) {
  const rawId = raw.id;
  const id = rawId != null && rawId !== '' && Number.isFinite(Number(rawId)) ? Number(rawId) : null;
  return {
    id,
    name: raw.name ?? '',
    shortCode: raw.short_code ?? '',
    logoUrl: raw.logo_url ?? null,
  };
}

/** First non-empty trimmed string among arguments. */
export function coalesceTrim(...vals) {
  for (const v of vals) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s !== '') return s;
  }
  return '';
}

/** Coerce API / JSON numbers that may arrive as strings. */
export function toNum(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * API-shaped `home_team` / `away_team` objects merged with `context.match`.
 * Reverb often sends only `match`; this keeps names, codes, and logos aligned
 * everywhere we call {@link normalizeTeam} (scoreboard + match chrome).
 *
 * @param {Record<string, unknown>} ctx
 * @returns {{ home_team: Record<string, unknown>, away_team: Record<string, unknown> }}
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
  }));
}

export function buildMatchCtx(ctx = {}) {
  const { home_team, away_team } = resolveContextTeams(ctx);
  const homeTeam = normalizeTeam(home_team);
  const awayTeam = normalizeTeam(away_team);
  const matchNumber = ctx.match?.number ?? '';
  const tournamentName = ctx.tournament?.name ?? '';
  const matchLabel = tournamentName;
  return {
    homeTeam,
    awayTeam,
    matchNumber,
    venue: ctx.match?.venue ?? '',
    tournamentName,
    tournamentShort: ctx.tournament?.short ?? '',
    tournamentLogoUrl: ctx.tournament?.logo_url ?? null,
    matchLabel,
  };
}
