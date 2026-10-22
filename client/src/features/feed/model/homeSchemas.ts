import { z } from 'zod';

function teamShort(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '—';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.charAt(0) ?? '';
    const b = parts[1]?.charAt(0) ?? '';
    return `${a}${b}`.toUpperCase();
  }
  return trimmed.slice(0, 3).toUpperCase();
}

export type HomeLiveMatch = {
  id: number;
  tournamentId: number | null;
  label: string;
  format: string | null;
  venue: string | null;
  home: { name: string; short: string };
  away: { name: string; short: string };
  homeScore: string | null;
  awayScore: string | null;
  homeOvers: string | null;
  awayOvers: string | null;
  /** Active batting side shorthand score. */
  score: string | null;
  overs: string | null;
  batting: 'home' | 'away' | null;
  chase: { target: number; runs: number; ballsLeft: number; rrr: string | null } | null;
  ballsLeftLabel: string | null;
  rr: string | null;
  over: (string | number)[];
  overNum: number | null;
  tournamentShort: string | null;
};

export type HomeStream = {
  id: number;
  matchId: number | null;
  title: string;
  meta: string;
  /** Broadcaster name (self-serve) or tournament label. */
  creator: string;
  cover: string | null;
  viewers: string | null;
  score: string | null;
};

export type HomeProduct = {
  id: number;
  slug: string | null;
  name: string;
  price: string;
  image: string | null;
  badge: string | null;
  brand: string | null;
  vendor: string | null;
  vendorSlug: string | null;
};

export type HomeHighlight = {
  id: number;
  poster: string | null;
  caption: string;
  videoUrl: string | null;
};

/** Home hero carousel — mapped from `GET /hero-sliders`. */
export type HomeHeroSlide = {
  id: string;
  image: string;
  alt: string;
  ctaType: 'none' | 'url' | 'dialog';
  ctaLabel: string | null;
  ctaUrl: string | null;
  ctaTargetBlank: boolean;
  ctaDialogKey: string | null;
  ctaDialogParam: string | null;
};

export type HomeNextMatch = {
  id: number;
  opponent: { name: string; short: string };
  date: string;
  time: string;
  venue: string;
};

const teamWireSchema = z
  .object({
    id: z.number().nullable().optional(),
    name: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const inningsWireSchema = z
  .object({
    innings_number: z.number().optional(),
    innings_status: z.string().optional(),
    batting_team_id: z.number().nullable().optional(),
    total_runs: z.number().optional(),
    total_wickets: z.number().optional(),
    overs_display: z.string().nullable().optional(),
    target: z.number().nullable().optional(),
    runs_to_win: z.number().nullable().optional(),
    balls_remaining: z.number().nullable().optional(),
    current_run_rate: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .passthrough();

export const liveScoreWireSchema = z
  .object({
    id: z.number(),
    tournament_id: z.number().nullable().optional(),
    match_label: z.string().nullable().optional(),
    overs_limit: z.number().nullable().optional(),
    home_team: teamWireSchema,
    away_team: teamWireSchema,
    tournament: z
      .object({
        id: z.number().optional(),
        name: z.string().nullable().optional(),
        short_name: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    innings: z.array(inningsWireSchema).optional(),
    active_innings: inningsWireSchema.nullable().optional(),
    commentary: z.string().nullable().optional(),
  })
  .passthrough();

export type LiveScoreWire = z.infer<typeof liveScoreWireSchema>;

export const liveStreamWireSchema = z
  .object({
    id: z.number(),
    match_id: z.number().nullable().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    viewer_count: z.number().nullable().optional(),
    thumbnail_url: z.string().nullable().optional(),
    broadcaster: z
      .object({
        name: z.string().nullable().optional(),
        nickname: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    tournament: z
      .object({
        short_name: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

export type LiveStreamWire = z.infer<typeof liveStreamWireSchema>;

export const shopProductWireSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    slug: z.string().nullable().optional(),
    price: z.union([z.number(), z.string()]),
    sale_price: z.union([z.number(), z.string()]).nullable().optional(),
    is_popular: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    is_special_offer: z.boolean().optional(),
    brand: z.object({ name: z.string().nullable().optional() }).nullable().optional(),
    vendor: z
      .object({
        store_name: z.string().nullable().optional(),
        slug: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    images: z
      .array(
        z
          .object({
            path: z.string().nullable().optional(),
            url: z.string().nullable().optional(),
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();

export type ShopProductWire = z.infer<typeof shopProductWireSchema>;

export const highlightWireSchema = z
  .object({
    id: z.number(),
    title: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    video_url: z.string().nullable().optional(),
  })
  .passthrough();

export type HighlightWire = z.infer<typeof highlightWireSchema>;

function formatPrice(value: number | string): string {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  return new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(n);
}

function plainScore(runs: number | undefined, wickets: number | undefined): string {
  return `${runs ?? 0}/${wickets ?? 0}`;
}

export function toHomeLiveMatch(row: LiveScoreWire): HomeLiveMatch | null {
  const homeName = row.home_team?.name?.trim() || 'Home';
  const awayName = row.away_team?.name?.trim() || 'Away';
  const homeId = row.home_team?.id != null ? Number(row.home_team.id) : null;
  const awayId = row.away_team?.id != null ? Number(row.away_team.id) : null;
  const innings = Array.isArray(row.innings) ? row.innings : [];
  const active = row.active_innings ?? null;
  const battingTeamId = active?.batting_team_id != null ? Number(active.batting_team_id) : null;

  const homeInn = innings.find((i) => Number(i.batting_team_id) === homeId) ?? null;
  const awayInn = innings.find((i) => Number(i.batting_team_id) === awayId) ?? null;

  let batting: 'home' | 'away' | null = null;
  if (battingTeamId != null && homeId != null && battingTeamId === homeId) batting = 'home';
  if (battingTeamId != null && awayId != null && battingTeamId === awayId) batting = 'away';

  const homeScore = homeInn ? plainScore(homeInn.total_runs, homeInn.total_wickets) : null;
  const awayScore = awayInn ? plainScore(awayInn.total_runs, awayInn.total_wickets) : null;
  const homeOvers = homeInn?.overs_display ?? null;
  const awayOvers = awayInn?.overs_display ?? null;

  const activeScore = batting === 'home' ? homeScore : batting === 'away' ? awayScore : (homeScore ?? awayScore);
  const activeOvers = batting === 'home' ? homeOvers : batting === 'away' ? awayOvers : (homeOvers ?? awayOvers);

  let chase: HomeLiveMatch['chase'] = null;
  if (active && Number(active.innings_number) === 2 && active.target != null && active.balls_remaining != null) {
    chase = {
      target: Number(active.target),
      runs: Number(active.total_runs) || 0,
      ballsLeft: Number(active.balls_remaining) || 0,
      rrr: null,
    };
  }

  const label = row.match_label?.trim() || row.tournament?.short_name?.trim() || row.tournament?.name?.trim() || 'Live';

  return {
    id: row.id,
    tournamentId: row.tournament_id ?? row.tournament?.id ?? null,
    label,
    format: null,
    venue: null,
    home: { name: homeName, short: teamShort(homeName) },
    away: { name: awayName, short: teamShort(awayName) },
    homeScore,
    awayScore,
    homeOvers,
    awayOvers,
    score: activeScore,
    overs: activeOvers,
    batting,
    chase,
    ballsLeftLabel: null,
    rr: active?.current_run_rate != null ? String(active.current_run_rate) : null,
    over: [],
    overNum: null,
    tournamentShort: row.tournament?.short_name ?? null,
  };
}

export function toHomeStream(row: LiveStreamWire): HomeStream {
  const viewers =
    row.viewer_count != null && row.viewer_count > 0
      ? new Intl.NumberFormat('en', { notation: 'compact' }).format(row.viewer_count)
      : null;
  const creator =
    row.broadcaster?.name?.trim() || row.tournament?.short_name?.trim() || row.tournament?.name?.trim() || 'Live';
  const meta = creator === 'Live' ? 'Live stream' : creator;

  return {
    id: row.id,
    matchId: row.match_id ?? null,
    title: row.title?.trim() || 'Live Stream',
    meta,
    creator,
    cover: row.thumbnail_url?.trim() || null,
    viewers,
    score: null,
  };
}

export function toHomeProduct(row: ShopProductWire): HomeProduct {
  const sale = row.sale_price != null ? Number(row.sale_price) : null;
  const price = sale != null && Number.isFinite(sale) ? sale : row.price;
  const firstImage = row.images?.[0];
  const image = firstImage?.path ?? firstImage?.url ?? null;
  let badge: string | null = null;
  if (row.is_special_offer) badge = 'OFFER';
  else if (row.is_featured) badge = 'NEW';

  return {
    id: row.id,
    slug: row.slug?.trim() || null,
    name: row.name,
    price: formatPrice(price),
    image,
    badge,
    brand: row.brand?.name ?? null,
    vendor: row.vendor?.store_name ?? null,
    vendorSlug: row.vendor?.slug?.trim() || null,
  };
}

export function toHomeHighlight(row: HighlightWire): HomeHighlight {
  return {
    id: row.id,
    poster: row.thumbnail ?? null,
    caption: row.title?.trim() || 'Match highlight',
    videoUrl: row.video_url ?? null,
  };
}

export const heroSliderWireSchema = z.object({
  id: z.number(),
  image_mobile: z.string().nullable().optional(),
  image_desktop: z.string().nullable().optional(),
  cta_type: z.enum(['none', 'url', 'dialog']).optional().default('none'),
  cta_label: z.string().nullable().optional(),
  cta_url: z.string().nullable().optional(),
  cta_target_blank: z.boolean().optional().default(true),
  cta_dialog_key: z.string().nullable().optional(),
  cta_dialog_param: z.string().nullable().optional(),
});

export type HeroSliderWire = z.infer<typeof heroSliderWireSchema>;

/** Desktop frame is `tab` (900px) — use desktop asset when that frame is active. */
function pickHeroImage(mobile: string, desktop: string | null): string {
  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches) {
    return desktop?.trim() || mobile;
  }
  return mobile;
}

export function toHomeHeroSlide(row: HeroSliderWire): HomeHeroSlide | null {
  const mobile = row.image_mobile?.trim() || '';
  if (!mobile) return null;
  const desktop = row.image_desktop?.trim() || null;
  const label = row.cta_label?.trim() || null;
  return {
    id: String(row.id),
    image: pickHeroImage(mobile, desktop),
    alt: label || 'Promotion',
    ctaType: row.cta_type ?? 'none',
    ctaLabel: label,
    ctaUrl: row.cta_url?.trim() || null,
    ctaTargetBlank: row.cta_target_blank ?? true,
    ctaDialogKey: row.cta_dialog_key?.trim() || null,
    ctaDialogParam: row.cta_dialog_param?.trim() || null,
  };
}
