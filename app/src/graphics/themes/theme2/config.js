/**
 * Theme 2 — wine / gold broadcast look (ported from tapeya-controller-3 theme3).
 *
 * Structure matches theme1 (commands, adapters, layouts). Visual tokens here
 * diverge: maroon panels, red bowler wash, gold accents (controller-3 LT look).
 * Zone A/B/C/D structure matches theme1; only paint / type scale differ.
 * Every color, timing, spacing, and typography value lives here.
 */

// ── Color tokens ─────────────────────────────────────────────────────────────
export const colors = {
  // Text on broadcast overlays — primary white only.
  text: '#ffffff',

  // Score numerals use primary white.
  scoreColor: '#ffffff',
  scoreShadow: 'rgba(156,0,40,.55)',

  // Accent pair — wine red (primary) + gold (secondary highlight)
  accentA: '#c40038',
  accentB: '#c9a227',

  // Panel background layers (controller-3: opaque maroon left/middle, black KPI, red bowler)
  panelBase: '#2e0a1a',
  panelDeep: '#2e0a1a',
  panelPlayer: '#2e0a1a',
  // FS content cards on silk fabric — darker than panelPlayer / stage mid so plates read
  fsCard: '#0e0509',
  panelStat: '#000000',
  panelBowler: 'linear-gradient(to right, #9c0028, #b80032, #c40038)',
  batsmenDivider: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.9), transparent)',
  zoneDivider: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.22), transparent)',

  // Preview stage — mid red between wine maroon and accent (readable under FS cards)
  stageBg: 'radial-gradient(120% 100% at 40% 15%, #9c2040 0%, #7a1832 45%, #4a1020 80%, #2e0a16 100%)',

  // Event bar sweep wash colors
  eventWash: {
    wicket: 'rgba(220,38,38,.4)',
    four: 'rgba(61,204,74,.45)',
    six: 'rgba(124,58,237,.45)',
  },

  // Four strap (green boundary — matches controller-3 broadcast.boundary)
  fourStrapAccent: '#3dcc4a',
  fourStrapSweep: 'rgba(61,204,74,.45)',
  fourStrapPanelGlow: 'rgba(61,204,74,.34)',
  fourStrapTitleShadow: 'rgba(61,204,74,.85)',

  // Boundary flash — four (green)
  fourGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(61,204,74,.38), transparent 62%)',
  fourSparkInner: '#d4ffe0',
  fourSparkOuter: '#3dcc4a',
  fourSparkShadow: 'rgba(61,204,74,.9)',
  fourTitleGradient: 'linear-gradient(180deg, #90f0a0 0%, #3dcc4a 55%, #1a9a30 100%)',
  fourTitleColor: '#3dcc4a',
  fourTitleShadow: 'rgba(61,204,74,.85)',
  fourSubtitle: '#b8f5c4',

  // Wide strap (amber)
  wideStrapAccent: '#fbbf24',
  wideStrapSweep: 'rgba(251,191,36,.45)',
  wideStrapPanelGlow: 'rgba(251,191,36,.34)',
  wideStrapTitleShadow: 'rgba(251,191,36,.85)',

  // Boundary flash — wide (amber)
  wideGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(251,191,36,.38), transparent 62%)',
  wideSparkInner: '#ffe8c8',
  wideSparkOuter: '#fbbf24',
  wideSparkShadow: 'rgba(251,191,36,.9)',
  wideTitleGradient: 'linear-gradient(180deg, #ffe090 0%, #fbbf24 55%, #d97706 100%)',
  wideTitleColor: '#fbbf24',
  wideTitleShadow: 'rgba(251,191,36,.85)',
  wideSubtitle: '#ffe4b8',

  // No-ball strap (amber-orange)
  noBallStrapAccent: '#f59e0b',
  noBallStrapSweep: 'rgba(245,158,11,.45)',
  noBallStrapPanelGlow: 'rgba(245,158,11,.34)',
  noBallStrapTitleShadow: 'rgba(245,158,11,.85)',

  // Six strap (violet — matches controller-3 broadcast.six)
  sixStrapAccent: '#7c3aed',
  sixStrapSweep: 'rgba(124,58,237,.45)',
  sixStrapPanelGlow: 'rgba(124,58,237,.34)',
  sixStrapTitleShadow: 'rgba(124,58,237,.85)',

  // Boundary flash — no-ball
  noBallGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(245,158,11,.38), transparent 62%)',
  noBallSparkInner: '#ffe8cc',
  noBallSparkOuter: '#f59e0b',
  noBallSparkShadow: 'rgba(245,158,11,.9)',
  noBallTitleGradient: 'linear-gradient(180deg, #ffd090 0%, #f59e0b 55%, #b45309 100%)',
  noBallTitleColor: '#f59e0b',
  noBallTitleShadow: 'rgba(245,158,11,.85)',
  noBallSubtitle: '#ffe0b8',

  // Fifty-up strap (gold)
  fiftyUpStrapAccent: '#eab308',
  fiftyUpStrapSweep: 'rgba(234,179,8,.45)',
  fiftyUpStrapPanelGlow: 'rgba(234,179,8,.34)',
  fiftyUpStrapTitleShadow: 'rgba(234,179,8,.85)',

  // Hundred-up strap (rich gold)
  hundredUpStrapAccent: '#facc15',
  hundredUpStrapSweep: 'rgba(250,204,21,.45)',
  hundredUpStrapPanelGlow: 'rgba(250,204,21,.34)',
  hundredUpStrapTitleShadow: 'rgba(250,204,21,.9)',

  // Milestone flash — hundred
  hundredUpGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(250,204,21,.45), transparent 62%)',
  hundredUpSparkInner: '#fff4d0',
  hundredUpSparkOuter: '#facc15',
  hundredUpSparkShadow: 'rgba(250,204,21,.95)',
  hundredUpTitleGradient: 'linear-gradient(180deg, #ffe890 0%, #facc15 55%, #ca8a04 100%)',
  hundredUpTitleColor: '#facc15',
  hundredUpTitleShadow: 'rgba(250,204,21,.9)',
  hundredUpSubtitle: '#ffe8a8',

  // Milestone flash — fifty
  fiftyUpGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(234,179,8,.4), transparent 62%)',
  fiftyUpSparkInner: '#fff8e8',
  fiftyUpSparkOuter: '#eab308',
  fiftyUpSparkShadow: 'rgba(234,179,8,.9)',
  fiftyUpTitleGradient: 'linear-gradient(180deg, #f0e0a8 0%, #eab308 55%, #a16207 100%)',
  fiftyUpTitleColor: '#eab308',
  fiftyUpTitleShadow: 'rgba(234,179,8,.85)',
  fiftyUpSubtitle: '#f0e8cc',

  // Boundary flash — six (violet)
  sixGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(124,58,237,.4), transparent 62%)',
  sixSparkInner: '#e9d5ff',
  sixSparkOuter: '#7c3aed',
  sixSparkShadow: 'rgba(124,58,237,.9)',
  sixTitleGradient: 'linear-gradient(180deg, #c4b5fd 0%, #7c3aed 55%, #5b21b6 100%)',
  sixTitleColor: '#7c3aed',
  sixTitleShadow: 'rgba(124,58,237,.85)',
  sixSubtitle: '#ddd6fe',

  // Out strap (red)
  outStrapAccent: '#dc2626',
  outStrapSweep: 'rgba(220,38,38,.45)',
  outStrapPanelGlow: 'rgba(220,38,38,.34)',
  outStrapTitleShadow: 'rgba(220,38,38,.9)',

  // Wicket flash (red)
  wicketGlow: 'radial-gradient(60% 50% at 50% 45%, rgba(220,38,38,.42), transparent 62%)',
  wicketTitleGradient: 'linear-gradient(180deg, #fca5a5 0%, #dc2626 55%, #991b1b 100%)',
  wicketTitleColor: '#dc2626',
  wicketTextShadow: 'rgba(220,38,38,.9)',

  // Replay strap (sky)
  replayStrapAccent: '#38bdf8',
  replayStrapSweep: 'rgba(56,189,248,.45)',
  replayStrapPanelGlow: 'rgba(56,189,248,.34)',
  replayStrapTitleShadow: 'rgba(56,189,248,.85)',

  // Decision-pending strap (orange)
  decisionPendingStrapAccent: '#fb923c',
  decisionPendingStrapSweep: 'rgba(251,146,60,.45)',
  decisionPendingStrapPanelGlow: 'rgba(251,146,60,.34)',
  decisionPendingStrapTitleShadow: 'rgba(251,146,60,.85)',

  // Replay flash (sky)
  replayGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(56,189,248,.38), transparent 62%)',
  replaySparkInner: '#d4f8ff',
  replaySparkOuter: '#38bdf8',
  replaySparkShadow: 'rgba(56,189,248,.9)',
  replayTitleGradient: 'linear-gradient(180deg, #7dd3fc 0%, #38bdf8 55%, #0284c7 100%)',
  replayTitleColor: '#38bdf8',
  replayTitleShadow: 'rgba(56,189,248,.85)',
  replaySubtitle: '#bae6fd',

  // Decision-pending flash (orange)
  decisionPendingGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(251,146,60,.42), transparent 62%)',
  decisionPendingSparkInner: '#ffe8cc',
  decisionPendingSparkOuter: '#fb923c',
  decisionPendingSparkShadow: 'rgba(251,146,60,.9)',
  decisionPendingTitleGradient: 'linear-gradient(180deg, #fdba74 0%, #fb923c 55%, #ea580c 100%)',
  decisionPendingTitleColor: '#fb923c',
  decisionPendingTitleShadow: 'rgba(251,146,60,.85)',
  decisionPendingSubtitle: '#fed7aa',

  // Not-out strap (green — same family as four)
  notOutStrapAccent: '#3dcc4a',
  notOutStrapSweep: 'rgba(61,204,74,.45)',
  notOutStrapPanelGlow: 'rgba(61,204,74,.34)',
  notOutStrapTitleShadow: 'rgba(61,204,74,.9)',

  // Not-out flash (green)
  notOutGlow: 'radial-gradient(60% 50% at 50% 45%, rgba(61,204,74,.42), transparent 62%)',
  notOutTitleGradient: 'linear-gradient(180deg, #86efac 0%, #3dcc4a 55%, #16a34a 100%)',
  notOutTitleColor: '#3dcc4a',
  notOutTextShadow: 'rgba(61,204,74,.9)',

  // GlowPanel ambient — wine wash
  ambientA: 'rgba(156, 0, 40, 0.06)',
  ambientB: 'rgba(196, 0, 56, 0.28)',
  ambientC: 'rgba(110, 0, 28, 0.40)',

  // Leaderboard / squad gold
  gold: '#c9a227',
  goldDark: '#8a6a12',

  // Text on gold rank chips and stat bands
  badgeText: '#1a0a14',

  // Wine accent tokens — borders, glows, panel lining (replaces neon navy)
  navyAccentRgb: '196, 0, 56',
  navyBorder: 'rgba(196, 0, 56, 0.32)',
  navyGlow: 'rgba(196, 0, 56, 0.18)',
  navyGlowStrong: 'rgba(201, 162, 39, 0.45)',
};

// ── Shared asset URLs ─────────────────────────────────────────────────────────
export const assets = {
  brandLogoWhite: 'https://d1nmw2vhka3zp0.cloudfront.net/app/images/logos/tapeya-logo-white.svg',
  playerPlaceholder: 'https://d1nmw2vhka3zp0.cloudfront.net/app/images/background/player-placeholder-theme1.png',
};

/**
 * Player avatar plate — benchmarked on Top Batter / Top Bowler featured portrait.
 * Use via PlayerAvatarImage (`plate` / `lining`); do not invent per-layout hatch fills.
 * Lining is always drawn under the photo (JPG, PNG, or placeholder).
 */
export const playerAvatar = {
  /** Solid wine plate behind contain-bottom / cover-top portraits. */
  plate: colors.panelPlayer,
  /**
   * Hatch lining over the plate (Top Bowler look) — always on for FS avatars.
   * Wine wash + subtle diagonal hatch — vMix-safe (no mix-blend).
   */
  lining:
    'linear-gradient(180deg, rgba(74,15,31,0.45), rgba(28,6,13,0.55)), repeating-linear-gradient(135deg, rgba(196,0,56,0.08) 0 12px, transparent 12px 24px)',
};

// ── Typography tokens ─────────────────────────────────────────────────────────
export const typography = {
  fontDisplay: "'Saira Condensed', system-ui, sans-serif",
  fontUI: "'Saira', system-ui, sans-serif",
};

// ── Spacing & geometry tokens ─────────────────────────────────────────────────
export const geometry = {
  /** Square corners — matches controller-3 full-bleed LT chrome. */
  barRadius: 0,
  barRadiusEdgeToEdge: 0,
};

/**
 * Lower-third layout tokens — single source for bar footprint.
 *
 * Default scoreboard LT is content-sized like theme1 (not a fixed CSS height):
 *   bar height ≈ crestSize + 2 × controllerBarPaddingY
 * `controllerBarPaddingY` is derived from `height` and `crestSize` so that identity holds.
 */
const LT_BAR_HEIGHT = 139;
const LT_CREST_SIZE = 86;

export const ltBar = {
  designWidth: 1920,
  height: LT_BAR_HEIGHT,
  crestSize: LT_CREST_SIZE,
  /** Zone B/D player photos when theme enableImages is on (controller-3 avatar-lg). */
  avatarWidth: 84,
  avatarGap: 26,
  /** Matches controller-3 BatterCard fallbackClassName ctrl-px-20. */
  avatarPadX: 20,
  /** Zone D bowler card end pad when avatars are on (breathing before crest). */
  avatarPadEnd: 20,
  sidePaddingY: 20,
  edgePaddingX: 25,
  batsmenMinWidth: 360,
  previewGutter: 32,
  mobileBreakpoint: 720,

  // Inset LT safe area — shared by every InsetLTBarSurface command (fixture, stats, officials, …).
  // At 1920×1080: 1920 − (210 × 2) = 1500px horizontal canvas (pairs with ltInfoBar.maxWidth).
  overlayInsetXLT: 210,
  overlayInsetBottomLT: 45,

  /** Zone A/D vertical inset — keeps crestSize + 2×pad = height. */
  controllerBarPaddingY: (LT_BAR_HEIGHT - LT_CREST_SIZE) / 2,

  /**
   * Scoreboard LT (ControllerBar) spacing ownership — do not reintroduce overlapping gutters:
   * - Bar edge inset: Zone A `paddingLeft` / Zone D `paddingRight` → `edgePaddingX`
   * - Gaps between zones A↔B, B↔C, C↔D: single CSS grid `columnGap` → `zoneGapX`
   * - Inner content only: `crestToContentGap`, `scoreBlockGap`, batsmen pill tokens below
   * Fall-of-wickets LT reuses the same edge / crest / score / zone tokens for family consistency.
   */
  zoneGapX: 0,
  /** Zone A — trailing pad after score stack (tighter than controller-3 ctrl-pr-48 to free bowler room). */
  zoneAPaddingRight: 28,
  /** Zone A — crest ↔ team code. */
  crestToCodeGap: 8,
  /** Zone A — team code ↔ score stack (controller-3 ctrl-ml-48). */
  teamCodeToScoreGap: 48,
  /** Zone A / D — breathing room between crest cluster and score / bowler block (legacy). */
  crestToContentGap: 32,
  /** Zone A — space between team+overs stack and total/wkts score (sole owner; no extra pr). */
  scoreBlockGap: 26,
  /** Horizontal space around the batsmen centre divider (each side). */
  batsmenDividerGapX: 12,
  /** Zone B — name ↔ runs gap without avatars (controller-3 ctrl-gap-64 → 80px). */
  batterNameScoreGap: 80,
  /**
   * Zone C internal air between PartialDividers and KPI columns/headings.
   * Applied on Zone C shell + PanelRoot so the leading `|` matches every inner `|`.
   */
  zoneCInnerGapX: 0,
  /** Zone D — name ↔ figures / figures ↔ overs micro-gap. */
  bowlerInlineGap: 6,
  /** Zone D — fixed wash width (room for avatar + name + full ball strip). */
  bowlerPanelWidthPercent: 42,
  bowlerPanelMaxWidth: 640,
  /** Zone D widen for Last 30 / Current Partnership / Win Prediction (controller-3 56% / 860). */
  last30BowlerPanelWidthPercent: 56,
  last30BowlerPanelMaxWidth: 860,
  /** Zone C — min width for KPI column (controller-3 col-stat). */
  statColMinWidth: 175,
  /** Column dividers — short centered line (controller-3 h-divider). */
  dividerSlotWidth: 12,
  dividerLineHeight: 81,
};
/** Default LT Zone C rotation — panel keys must match LT_DEFAULT_ZONE_C_PANELS in ltDefaultZoneC.js. */
export const ltDefaultZoneC = {
  dwellMs: 20000,
  firstInnings: ['crr', 'projectedScore', 'partnership'],
  secondInnings: ['rrr', 'crr', 'needTarget', 'partnership'],
};

/** Canonical inline batter score — runs then (balls) in parentheses (controller-3). */
export const batterScore = {
  /** Near-zero so clusters read as `9(2)`, not `9 (2)`. */
  gap: 1,
  runs: 44,
  runsCompact: 38,
  balls: 28,
  /** Balls faced + companion secondary figures (bowler overs in stat headers). */
  ballsWeight: 500,
  /** Drop balls slightly below the runs baseline (default LT look). */
  ballsNudgeEm: 0.1,
  wrapBallsInParens: true,
};

/** Typography sizes for LT families — px inside scaled HorizontalBar; rem allowed outside scaled surfaces */
export const ltTypography = {
  strapTitle: '72px',
  chipCompact: 26,

  // Zone A — score block (controller-3 ctrl-t-* scale)
  teamName: 36,
  overs: 27,
  oversLimit: 20,
  /** Score total + wickets share one size (controller-3 ctrl-t-team-score). */
  scoreTotal: 60,
  scoreSep: 60,
  scoreWkts: 60,

  // Zone B — batsmen (sizes mirror batterScore — single source of truth)
  batName: 30,
  batNameCompact: 25,
  batRuns: batterScore.runs,
  batRunsCompact: batterScore.runsCompact,
  batBalls: batterScore.balls,

  // Zone C — Last 30 side-heading only (stat columns use last30* tokens below).
  sideHeadingLine1: 18,
  sideHeadingLine2: 26,

  // Zone C — KPI column rhythm (CRR, RRR, Need Target, team code, partnership, projected score, …)
  // Matches controller-3 StatItem (ctrl-px-8) + ctrl-t-stat-* type scale.
  kpiColumnPaddingX: 8,
  kpiColumnGap: 4,
  kpiValueGap: 5,
  kpiSideHeadingLine1: 17,
  kpiSideHeadingLine2: 24,
  kpiColumnLabel: 25,
  kpiTeamCode: 36,
  kpiTeamCodeAsLabel: 25,
  kpiTeamNameSecondary: 21,
  kpiMetricValue: 44,
  kpiAtStageSep: 23,
  kpiAtStageWkts: 27,
  kpiWinPredictionPercentSuffix: 27,
  kpiPartnershipSuffix: 23,

  // Zone C — Last 30 / Last 12
  last30Label: 15,
  last30Value: 28,
  last30ColumnWidth: 96,
  last12Heading: 20,
  last12TotalRuns: 30,
  last12TotalMinWidthExtra: 24,

  // Zone D
  bowlerName: 25,
  bowlerFigures: 30,
  ballChip: 32,
  ballChipCompact: 26,
  ballChipFontScale: 0.56,
  ballChipFontWeight: 800,
  /** Compound tokens (WD+W, 2NB+W) — scaled by chip size in resolveBallChipLayout. */
  ballChipCompoundFontScale: { len6: 0.35, len5: 0.37, len4: 0.4, default: 0.42 },
  lastOverLabel: 18,
  lastOverRuns: 28,

  // Spacing (px) — Last 30 heading + Zone B batsmen pill; KPI columns use kpiColumn* above.
  columnPaddingX: 28,
  columnPaddingXCompact: 28,
  last30PaddingX: 2,
  columnGap: 11,
};

/**
 * Player stat bar tokens — batsman/bowler match & tournament + last wicket LTs.
 */
export const ltPlayerStatBar = {
  /** Header row vs stats row height split — favour stats (fixture bars use 60/40). */
  headRowFlex: 36,
  statsRowFlex: 64,

  headPaddingY: 6,
  statsPaddingY: 12,
  headPaddingX: 22,
  statsPaddingX: 16,

  nameSize: 24,
  heroSize: 32,
  secondarySize: 20,
  secondaryWeight: batterScore.ballsWeight,
  scoreGap: batterScore.gap,

  statLabelSize: 16,
  statLabelWeight: 700,
  statValueSize: 30,
  statLabelValueGap: 4,
  /** Column gap in stats row (×4 → px, mirrors Tailwind gap scale). */
  statRowGap: 12,
  /** Tighter gap for 6+ column tournament rows. */
  statRowGapDense: 8,
};

/**
 * Match-fixture / matchup lower-third tokens — Intro / Toss / Result /
 * Tournament Name / Match Summary (controller-3 caption pill + split shell).
 */
export const ltFixtureBar = {
  /** Matchup crest (controller-3 crest-md) inside crestSlotWidth. */
  crestSize: 68,
  crestSlotWidth: 96,
  crestSlotPadding: 12,

  /** Black VS column width (controller-3 summary-vs-box). */
  vsBoxWidth: 128,
  /** Mid grid horizontal pad / column gap. */
  midPaddingX: 28,
  midColumnGap: 28,

  /** Caption pill above the bar (controller-3 match-summary-caption). */
  captionGap: 5,
  captionMinHeight: 48,
  captionPaddingY: 10,
  captionPaddingX: 36,
  captionFontSize: 22,
  captionLetterSpacing: 2,

  /** Tournament-name mid: title row + venue row. */
  tournamentVenueRowHeight: 56,
  tournamentTitleFontSize: 36,
  tournamentTitleLetterSpacing: 2,

  /** Team name in matchup mid. */
  teamNameFontSize: 30,
  teamNameLetterSpacing: 0.3,
  vsFontSize: 36,

  /** Match Summary score strip. */
  matchSummaryScoreTotal: 44,
  matchSummaryScoreSep: 44,
  matchSummaryScoreWkts: 44,
  matchSummaryOvers: 22,

  /** @deprecated legacy two-row fixture layout — kept for CustomCaption typography. */
  titleRowFlex: 60,
  detailRowFlex: 40,
  contentPaddingX: 32,
  crestPaddingX: 20,
  titleFont: '1.75rem',
  vsLabelFont: '1.375rem',
  detailFont: '1.25rem',
  detailTossFont: '1.375rem',
};

/**
 * Non-score inset lower-thirds — shared min width, fixed height, horizontal expansion.
 * See docs/THEME1_INFO_LT_SIZING_PROPOSAL.md
 */
export const ltInfoBar = {
  height: ltBar.height,
  /** Default footprint when content is short — bar stays at min, centered in max zone. */
  minWidth: 1360,
  /** Safe-area ceiling at 1920 (must match overlay: 1920 − side×2). Content above this gets ellipsis. */
  maxWidth: 1500,
  align: 'center',
};

/** Fixed-height shell applied to every info LT GlowPanel root. */
export const infoBarShellStyle = {
  height: ltInfoBar.height,
  minHeight: ltInfoBar.height,
  maxHeight: ltInfoBar.height,
};

/**
 * Height + width rules for inset LT GlowPanel — unconstrained when measuring, fills slot on air.
 * Horizontal width comes from InsetLTBarSurface, not the panel.
 * @param {boolean} [measuring]
 */
export function infoBarPanelStyle(measuring = false) {
  if (measuring) return infoBarShellStyle;
  return {
    ...infoBarShellStyle,
    width: '100%',
  };
}

/** @param {boolean} [measuring] */
export function infoBarPanelClass(measuring = false) {
  return measuring ? 'flex w-fit items-stretch overflow-hidden' : 'flex w-full items-stretch overflow-hidden';
}

/**
 * Player name LT — shares info overlay inset with fixture bars.
 */
export const ltNameBar = {
  firstNameSize: 24,
  lastNameSize: 50,
  roleSize: 22,
};

/**
 * Officials LT — shares wide overlay inset with match summary / promos.
 */
export const ltOfficialsBar = {
  /** Left label column — must fit longest heading (COMMENTATORS) at headingSize. */
  headingColumnWidth: 384,
  headingSize: '2rem',
  subtitleSize: '1.25rem',
  nameSize: '1.875rem',
  nameJoinedSize: '1.75rem',
};

/**
 * Platform promo LT — Follow / Download Tapeya (shared PlatformPromoLTBar).
 * Upper headline row 40%, lower URL row 60% (URL is the hero line).
 */
export const ltPromoBar = {
  headlineRowFlex: 40,
  urlRowFlex: 60,
  contentPaddingX: 32,

  headlineFont: '1.375rem',
  urlFont: '2rem',
  logoHeight: 72,
  logoPaddingX: 20,
};

/** Full-screen stat chip tokens — PlayerNameFSGraphic and shared StatTile. */
export const fsStatTile = {
  height: 126,
  width: 260,
  gap: 16,
  label: 24,
  value: 58,
  columnMaxHeight: 760,
  /** Internal chip padding and label/value spacing at default size. */
  tilePaddingY: 14,
  tileLabelGap: 8,
  /** Compressed stack when natural height exceeds available column height. */
  denseGap: 10,
  denseMinHeight: 68,
  minTileHeight: 48,
  denseLabel: 18,
  denseValue: 40,
  denseTilePaddingY: 10,
  denseTileLabelGap: 6,
};

/**
 * Player hero card — PlayerNameFS, LastWicketFS (≈2× ltNameBar scale).
 */
export const fsPlayerCard = {
  firstName: 50,
  lastName: 100,
  role: 42,
  roleSm: 34,
  teamCode: 26,
  careerLabel: 26,
  dismissalHero: 30,
};

/**
 * Page headers, summary panels, score strips, and hero metrics.
 */
export const fsSummaryPanel = {
  /** Tournament / match sub-heading under FS page titles. */
  headerSub: 36,
  pageTitleLg: 68,
  pageTitleMd: 56,
  sectionTitle: 38,
  matchPageTitle: 70,
  panelTitle: 50,
  panelSub: 34,
  scoreStripLabel: 24,
  scoreStripValue: 42,
  scoreStripHero: 64,
  rowName: 40,
  rowNameMd: 34,
  rowNameSm: 32,
  dismissal: 24,
  rowRuns: 42,
  rowBalls: 26,
  columnLabel: 26,
  columnLabelSm: 22,
  bowlerName: 42,
  statCell: 38,
  fowBand: 32,
  statLabelBox: 24,
  goldBand: 32,
  heroMetricXl: 238,
  heroMetricLg: 194,
  heroMetricMd: 130,
};

/** Match summary innings / bowler figure columns. */
export const fsMatchSummary = {
  inningsShortName: 44,
  inningsOvers: 26,
  inningsTotal: 50,
  bowlerFigures: 32,
};

/** Partnership full-screen graphics (Current Partnership + Partnership List). */
export const fsPartnership = {
  /** Center label — "Current Partnership". */
  label: 60,
  /** Hero partnership runs total. */
  runs: 220,
  /** Meta row — "Runs • N Balls". */
  meta: 40,
  batterFirstName: 24,
  batterLastName: 46,
  batterRuns: 56,
  batterRunsMd: 38,
  batterBalls: 26,
  batterName: 44,
  batterNameCompact: 28,
  batterRunsCompact: 30,
  batterBallsCompact: 20,
  contributionLabel: 22,
  contributionValue: 28,
  total: 30,
  totalBalls: 20,
};

/** Leaderboard and point-table rows. */
export const fsTable = {
  name: 42,
  nameSecondary: 24,
  featuredName: 44,
  featuredValue: 66,
  featuredValueSm: 36,
  statValue: 38,
  rankBadge: 56,
  rankHero: 72,
};

/** Full-screen chart graphics — worm, Manhattan, wagon wheel. */
export const fsChart = {
  title: 48,
  sub: 18,
  axisTick: 30,
  axisLabel: 18,
  xLabel: 32,
  wagonSectionLabel: 26,
  wagonPlayerName: 56,
  wagonPlayerNameDense: 48,
  wagonPlayerMeta: 26,
  wagonStatLabel: 24,
  wagonStatValue: 58,
  wagonStatLabelDense: 22,
  wagonStatValueDense: 50,
  wagonLegend: 22,
  wagonZoneLabel: 20,
  wagonZoneValue: 28,
  wagonZoneLabelDense: 18,
  wagonZoneValueDense: 24,
  /** Vertical gap between zone rows (px). */
  wagonZoneRowGap: 4,
  wagonZoneRowGapDense: 3,
};

/** Squad list and playing XI. */
export const fsSquad = {
  playerName: 22,
  subLabel: 20,
  captainBadge: 24,
  roleBadgeSm: 16,
  panelTeamName: 48,
  playerListName: 34,
  playerNumberBand: 38,
  goldBand: 38,
};

/** VS break and strategic timeout overlays (theme3 Breaks type scale). */
export const fsBreak = {
  /** Theme1 type scale on theme3 break chrome. */
  titleLg: 56,
  titleSm: 44,
  /** FitText max for team name under square tile (min 22 in vsBreak). */
  teamName: 46,
  teamCode: 48,
  /** Theme3 circular badge type (must fit 88 / 148 circles). */
  vsLabel: 36,
  status: 36,
  /** Theme1 strategic-timeout hero digits. */
  timeoutHero: 78,
  /** Strategic timeout countdown start (theme3: 5:00). */
  defaultTimerSeconds: 300,
};

/** FS pill captions (PlayerNameFS topLabel, MoM, etc.). */
export const fsPill = {
  label: 30,
  caption: 36,
};

/**
 * Full-screen stage fabric — theme1 band billow elevated for theme2 mid-red.
 * Alternating crest/valley bands + soft sheen; Chrome 86 / vMix safe.
 */
export const fsStageFabric = {
  /** Mount fade disabled — fabric appears with bands already in motion. */
  fadeInMs: 0,
  /** Fallback only — band keyframes carry per-stop timing for organic billow. */
  fabricEasing: 'cubic-bezier(0.37, 0.04, 0.22, 1)',
  bottomGlowCycleS: 24,
  grainDriftCycleS: 140,
  sheenCycleS: 14.5,
  /** Soft feather — enough to melt hard band edges, not mushy. */
  bandBlurPx: 2,
  /** Mid red field — between wine (#2e0a1a) and accent (#c40038). */
  stageBase: 'radial-gradient(120% 100% at 40% 15%, #9c2040 0%, #7a1832 45%, #4a1020 80%, #2e0a16 100%)',
  baseWash: 'linear-gradient(155deg, rgba(196,40,75,0.22) 0%, rgba(140,24,52,0.12) 48%, rgba(90,16,36,0.08) 100%)',
  bottomGlow: 'radial-gradient(90% 70% at 62% 108%, rgba(180,30,60,0.3), transparent 70%)',
  bottomFill: 'linear-gradient(to top, rgba(60,12,28,0.28) 0%, rgba(120,28,52,0.1) 42%, transparent 78%)',
  cornerFill: 'radial-gradient(95% 80% at 100% 100%, rgba(210,70,110,0.3) 0%, rgba(140,35,65,0.16) 36%, transparent 62%)',
  vignette: 'linear-gradient(to right, rgba(32,8,16,0.28), transparent 16%, transparent 84%, rgba(32,8,16,0.28))',
  grainColor: 'rgba(220,140,160,0.025)',
  sheen:
    'linear-gradient(115deg, transparent 8%, rgba(220,140,165,0.12) 22%, transparent 36%, transparent 50%, rgba(200,90,120,0.1) 66%, transparent 82%)',
  /** Soft ambient occlusion / volume shade under the fold plane. */
  depthShade: 'radial-gradient(120% 90% at 48% 48%, transparent 22%, rgba(20,4,10,0.14) 60%, rgba(12,2,6,0.3) 100%)',
  /** Animated fold pillow for the bottom-right dead zone. */
  cornerCrest: 'radial-gradient(ellipse at 70% 65%, rgba(200,70,110,0.34) 0%, rgba(140,35,65,0.18) 42%, transparent 72%)',
  lowerBandTopPx: 420,
  bandWidth: 2900,
  bandHeight: 380,
  bandLeft: -280,
  /**
   * Crest/valley bands — soft alpha blend into stage; A/B mirrored, C lagging.
   */
  bands: [
    { id: 'b0', top: -420, role: 'valley', color: 'rgba(50,8,20,0.36)', curve: 'B', durationS: 13.4, delayS: -7.6 },
    { id: 'b1', top: -200, role: 'crest', color: 'rgba(220,85,125,0.36)', curve: 'A', durationS: 11.2, delayS: 0 },
    { id: 'b2', top: 40, role: 'valley', color: 'rgba(70,14,32,0.32)', curve: 'C', durationS: 14.5, delayS: -4.1 },
    { id: 'b3', top: 260, role: 'crest', color: 'rgba(230,95,135,0.34)', curve: 'B', durationS: 11.6, delayS: -2 },
    { id: 'b4', top: 460, role: 'valley', color: 'rgba(40,6,16,0.3)', curve: 'A', durationS: 13, delayS: -6.2 },
    { id: 'b5', top: 640, role: 'crest', color: 'rgba(200,70,110,0.34)', curve: 'C', durationS: 12.1, delayS: -0.8 },
    { id: 'b6', top: 800, role: 'valley', color: 'rgba(80,16,34,0.3)', curve: 'B', durationS: 13.7, delayS: -6.9 },
    { id: 'b7', top: 940, role: 'crest', color: 'rgba(215,80,120,0.32)', curve: 'A', durationS: 12.4, delayS: -3 },
    { id: 'b8', top: 1060, role: 'valley', color: 'rgba(60,10,26,0.28)', curve: 'C', durationS: 14, delayS: -5.3 },
  ],
};

/**
 * Full-screen UI chrome — wine/gold panel borders, washes, score strips (theme3).
 * Use these instead of leftover theme1 blue rgba(120,140,255) / #5b7cff literals.
 */
export const fsChrome = {
  /** Fallback when a team accent is missing. */
  accentFallback: colors.accentA,

  panelBorder: 'rgba(196, 0, 56, 0.28)',
  panelBorderStrong: 'rgba(196, 0, 56, 0.32)',
  panelBorderFocus: 'rgba(196, 0, 56, 0.4)',

  panelHalo: 'rgba(196, 0, 56, 0.18)',
  panelHaloStrong: 'rgba(196, 0, 56, 0.25)',
  panelHaloFocus: 'rgba(196, 0, 56, 0.3)',

  washSoft: 'rgba(196, 0, 56, 0.12)',
  washMid: 'rgba(196, 0, 56, 0.16)',
  washLine: 'rgba(196, 0, 56, 0.2)',

  /** Cool-navy replacements — maroon deep fills. */
  deepFill: 'rgba(26, 6, 16, 0.7)',
  deepFillSoft: 'rgba(18, 8, 14, 0)',
  rowWashEnd: 'rgba(26, 6, 16, 0.7)',

  stripFill: 'linear-gradient(180deg, rgba(46, 10, 26, 0.96), rgba(26, 6, 16, 0.98))',
  stripBorder: 'rgba(196, 0, 56, 0.28)',
  stripHalo: 'rgba(196, 0, 56, 0.13)',
  stripAccentWash: 'rgba(196, 0, 56, 0.16)',

  vsRadial: 'rgba(196, 0, 56, 0.35)',
  vsStroke: 'rgba(201, 162, 39, 0.55)',

  pillFill: 'linear-gradient(180deg, rgba(46, 10, 26, 0.92), rgba(26, 6, 16, 0.95))',
  divider: 'linear-gradient(90deg, rgba(196, 0, 56, 0.55), transparent)',

  /** Decorative panel depth halo (replaces theme1 blue in panelDepthShadow). */
  depthHalo: 'rgba(196, 0, 56, 0.22)',
};

/**
 * Visual effect toggles — tune broadcast polish without hunting scattered classes.
 *
 * textGlow: keep false for on-air readability (no neon halos on scores / names).
 * intensity: scales --glow (0–1) for decorative halos when re-enabled.
 */
export const visualEffects = {
  /** Global decorative multiplier → CSS `--glow` (0 = flat, 1 = full) */
  intensity: 1,

  /** Neon text-shadow on scores, hero numbers, player surnames */
  textGlow: false,

  /** LT panel ambient gradient sweep — off (controller-3 has no GlowPanel). */
  ambientPulse: false,

  /** Crest / team-logo ring halo + pulse — off (controller-3 logos are bare). */
  crest: {
    halo: false,
    pulse: false,
  },

  /** FS stage bottom radial ambient pulse */
  fsStageAmbient: true,

  /** Full-screen event flash radial background wash */
  flashBackground: true,

  /** Drop-shadow on FOUR / SIX / strap flash titles */
  flashTextGlow: false,

  /** Worm / Manhattan / wagon-wheel decorative halos — off (theme3 charts are flat). */
  chartGlow: false,

  /** Panel, gold-band, score-strip box-shadow halos (not typography) — off for flat look. */
  decorativeBoxGlow: false,

  /** Tour Hits short-code badge outer pulse — off (theme3 badges are flat). */
  tourCodeBadgeGlow: false,
};

// ── Animation timing tokens ───────────────────────────────────────────────────
export const animation = {
  // Event reveal: delay before post-frame fires
  revealDelayMs: {
    boundary: 800,
  },

  // Flash overlay auto-dismiss — matches theme3 fst-action 2.8s impact cycle
  flashDismissMs: {
    boundary: 2800,
    wicket: 2800,
  },

  /**
   * Full-screen transition action overlay (theme3 ActionMessageOverlay recipe).
   * Optical pad clears the default scorecard so the word sits in live picture.
   */
  fstAction: {
    cycleS: 2.8,
    /** No scorebar under theme2 FST — center the action in the full picture. */
    opticalPadY: 0,
    glowSize: 1100,
    glowBlur: 48,
    ringSize: 280,
    titleSize: 120,
    titleSizeCompact: 72,
    letterSpacing: 6,
    letterSpacingCompact: 3,
    compactLabelMinLength: 9,
  },

  // Event strap title loop (enter + hold) — shared by NoBall, Six, …
  strapTextEnterS: 0.55,
  strapTextLoopS: 4.1,

  // Ambient sequence: left crest → gradient sweep → right crest (single cycle)
  ambientSequenceCycleS: 30,

  // Spark particles
  sparkCount: 14,
};

// ── CSS custom properties (inline on broadcast roots + :root for SCSS) ───────
export const CSS_VARS = {
  '--text': colors.text,
  '--accentA': colors.accentA,
  '--accentB': colors.accentB,
  '--glow': String(visualEffects.intensity),
  '--font-display': typography.fontDisplay,
  '--font-ui': typography.fontUI,
  '--gold': colors.gold,
  '--badge-text': colors.badgeText,
};

/** :root tokens generated into styles/_tokens.css — used by theme SCSS. */
export const ROOT_CSS_VARS = {
  ...CSS_VARS,
  '--stage-bg': colors.stageBg,
  '--ambient-sequence-cycle': `${animation.ambientSequenceCycleS}s`,
  '--strap-text-loop': `${animation.strapTextLoopS}s`,
  '--strap-text-enter': `${animation.strapTextEnterS}s`,
  '--ambient-color-a': colors.ambientA,
  '--ambient-color-b': colors.ambientB,
  '--ambient-color-c': colors.ambientC,
  '--panel-base': colors.panelBase,
  '--panel-deep': colors.panelDeep,
  '--panel-stat': colors.panelStat,
  '--panel-bowler': colors.panelBowler,
  '--navy-border': colors.navyBorder,
  '--navy-glow': colors.navyGlow,
  '--score-color': colors.scoreColor,
  '--score-shadow': colors.scoreShadow,
  '--fs-stage-fade-in': `${fsStageFabric.fadeInMs}ms`,
  '--fs-stage-glow-cycle': `${fsStageFabric.bottomGlowCycleS}s`,
  '--fs-stage-grain-cycle': `${fsStageFabric.grainDriftCycleS}s`,
  '--fs-fabric-easing': fsStageFabric.fabricEasing,
  '--fs-fabric-blur': `${fsStageFabric.bandBlurPx}px`,
  '--fs-fabric-band-width': `${fsStageFabric.bandWidth}px`,
  '--fs-fabric-band-height': `${fsStageFabric.bandHeight}px`,
  '--fs-fabric-band-left': `${fsStageFabric.bandLeft}px`,
  '--fs-stage-sheen-cycle': `${fsStageFabric.sheenCycleS}s`,
};
