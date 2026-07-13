/**
 * Midnight Neon Premium Theme — design token configuration.
 *
 * Single source of truth for visual design decisions in the `theme1` theme.
 * Every color, timing, spacing, and typography value lives here.
 * To create a second theme, copy this file under `themes/{slug}/` and modify values.
 */

// ── Color tokens ─────────────────────────────────────────────────────────────
export const colors = {
  // Text on broadcast overlays — two-color system only (no grey).
  // Primary: pure white for heroes, active names, scores, titles.
  // Secondary: soft blue-white — readable on video/panel; harmonizes with accentA.
  text: '#ffffff',
  textSecondary: '#dbe8ff',

  // Score numerals use primary white (score-shadow supplies accent glow).
  scoreColor: '#ffffff',
  scoreShadow: 'rgba(90,140,255,.85)',

  // Accent gradient pair (used on borders, glows, crest rings)
  accentA: '#5b7cff',
  accentB: '#9b5cff',

  // Panel background layers
  panelBase: 'rgba(22,28,42,0.88)',
  panelDeep: 'rgba(11,15,24,0.92)',

  // Preview stage background
  stageBg: 'radial-gradient(130% 100% at 50% -20%, #0e1424 0%, #070a12 55%, #05070d 100%)',

  // Event bar sweep wash colors
  eventWash: {
    wicket: 'rgba(255,40,80,.4)',
    four: 'rgba(80,150,255,.45)',
    six: 'rgba(245,200,90,.45)',
  },

  // Four strap (blue lower-third graphic)
  fourStrapAccent: '#5aa0ff',
  fourStrapSweep: 'rgba(80,150,255,.45)',
  fourStrapPanelGlow: 'rgba(80,150,255,.34)',
  fourStrapTitleShadow: 'rgba(80,150,255,.85)',

  // Boundary flash — four (blue)
  fourGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(80,150,255,.38), transparent 62%)',
  fourSparkInner: '#d4e8ff',
  fourSparkOuter: '#5aa0ff',
  fourSparkShadow: 'rgba(80,150,255,.9)',
  fourTitleGradient: 'linear-gradient(180deg, #90c8ff 0%, #5090ff 55%, #2068e0 100%)',
  fourTitleColor: '#5090ff',
  fourTitleShadow: 'rgba(80,150,255,.85)',
  fourSubtitle: '#bcd6ff',

  // Wide strap (amber lower-third graphic)
  wideStrapAccent: '#ffaa44',
  wideStrapSweep: 'rgba(255,170,60,.45)',
  wideStrapPanelGlow: 'rgba(255,170,60,.34)',
  wideStrapTitleShadow: 'rgba(255,170,60,.85)',

  // Boundary flash — wide (amber)
  wideGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(255,170,60,.38), transparent 62%)',
  wideSparkInner: '#ffe8c8',
  wideSparkOuter: '#ffaa44',
  wideSparkShadow: 'rgba(255,170,60,.9)',
  wideTitleGradient: 'linear-gradient(180deg, #ffd0a0 0%, #ffaa44 55%, #e87800 100%)',
  wideTitleColor: '#ffaa44',
  wideTitleShadow: 'rgba(255,170,60,.85)',
  wideSubtitle: '#ffe4b8',

  // No-ball strap (red lower-third graphic)
  noBallStrapAccent: '#ff5a6e',
  noBallStrapSweep: 'rgba(255,70,100,.45)',
  noBallStrapPanelGlow: 'rgba(255,50,90,.34)',
  noBallStrapTitleShadow: 'rgba(255,50,90,.85)',

  // Six strap (gold lower-third graphic)
  sixStrapAccent: '#f5c85a',
  sixStrapSweep: 'rgba(245,200,90,.45)',
  sixStrapPanelGlow: 'rgba(245,190,70,.34)',
  sixStrapTitleShadow: 'rgba(245,200,90,.85)',

  // Boundary flash — no-ball (magenta)
  noBallGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(220,80,200,.38), transparent 62%)',
  noBallSparkInner: '#ffd4f8',
  noBallSparkOuter: '#e060d0',
  noBallSparkShadow: 'rgba(220,80,200,.9)',
  noBallTitleGradient: 'linear-gradient(180deg, #f0a0e8 0%, #e060d0 55%, #b030a8 100%)',
  noBallTitleColor: '#e060d0',
  noBallTitleShadow: 'rgba(220,80,200,.85)',
  noBallSubtitle: '#ffd0f4',

  // Fifty-up strap (champagne gold lower-third graphic)
  fiftyUpStrapAccent: '#d4b86a',
  fiftyUpStrapSweep: 'rgba(210,185,110,.45)',
  fiftyUpStrapPanelGlow: 'rgba(210,185,110,.34)',
  fiftyUpStrapTitleShadow: 'rgba(210,185,110,.85)',

  // Hundred-up strap (rich gold lower-third graphic)
  hundredUpStrapAccent: '#f0c050',
  hundredUpStrapSweep: 'rgba(245,200,90,.45)',
  hundredUpStrapPanelGlow: 'rgba(245,200,90,.34)',
  hundredUpStrapTitleShadow: 'rgba(245,200,90,.9)',

  // Milestone flash — hundred (rich gold)
  hundredUpGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(245,200,90,.45), transparent 62%)',
  hundredUpSparkInner: '#fff4d0',
  hundredUpSparkOuter: '#f0c050',
  hundredUpSparkShadow: 'rgba(245,200,90,.95)',
  hundredUpTitleGradient: 'linear-gradient(180deg, #ffe890 0%, #ffd050 55%, #d89010 100%)',
  hundredUpTitleColor: '#ffd050',
  hundredUpTitleShadow: 'rgba(245,200,90,.9)',
  hundredUpSubtitle: '#ffe8a8',

  // Milestone flash — fifty (champagne gold)
  fiftyUpGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(210,185,110,.4), transparent 62%)',
  fiftyUpSparkInner: '#fff8e8',
  fiftyUpSparkOuter: '#d4b86a',
  fiftyUpSparkShadow: 'rgba(210,185,110,.9)',
  fiftyUpTitleGradient: 'linear-gradient(180deg, #f0e0a8 0%, #d4b86a 55%, #a88828 100%)',
  fiftyUpTitleColor: '#d4b86a',
  fiftyUpTitleShadow: 'rgba(210,185,110,.85)',
  fiftyUpSubtitle: '#f0e8cc',

  // Boundary flash — six (gold)
  sixGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(245,190,70,.4), transparent 62%)',
  sixSparkInner: '#ffe9a8',
  sixSparkOuter: '#f5b24a',
  sixSparkShadow: 'rgba(245,190,90,.9)',
  sixTitleGradient: 'linear-gradient(180deg, #ffe890 0%, #ffc830 55%, #e89800 100%)',
  sixTitleColor: '#ffc830',
  sixTitleShadow: 'rgba(245,200,90,.85)',
  sixSubtitle: '#ffe6a8',

  // Out strap (red lower-third graphic)
  outStrapAccent: '#ff3050',
  outStrapSweep: 'rgba(255,40,80,.45)',
  outStrapPanelGlow: 'rgba(255,50,90,.34)',
  outStrapTitleShadow: 'rgba(255,50,90,.9)',

  // Wicket flash (red)
  wicketGlow: 'radial-gradient(60% 50% at 50% 45%, rgba(220,20,60,.42), transparent 62%)',
  wicketTitleGradient: 'linear-gradient(180deg, #ff90a8 0%, #ff3050 55%, #c01030 100%)',
  wicketTitleColor: '#ff3050',
  wicketTextShadow: 'rgba(255,50,90,.9)',

  // Replay strap (cyan lower-third graphic)
  replayStrapAccent: '#40c8e8',
  replayStrapSweep: 'rgba(40,200,220,.45)',
  replayStrapPanelGlow: 'rgba(40,200,220,.34)',
  replayStrapTitleShadow: 'rgba(40,200,220,.85)',

  // Decision-pending strap (orange lower-third graphic)
  decisionPendingStrapAccent: '#ff9030',
  decisionPendingStrapSweep: 'rgba(255,140,40,.45)',
  decisionPendingStrapPanelGlow: 'rgba(255,140,40,.34)',
  decisionPendingStrapTitleShadow: 'rgba(255,140,40,.85)',

  // Replay flash (cyan)
  replayGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(40,200,220,.38), transparent 62%)',
  replaySparkInner: '#d4f8ff',
  replaySparkOuter: '#40c8e8',
  replaySparkShadow: 'rgba(40,200,220,.9)',
  replayTitleGradient: 'linear-gradient(180deg, #90e8ff 0%, #40c8e8 55%, #0898c0 100%)',
  replayTitleColor: '#40c8e8',
  replayTitleShadow: 'rgba(40,200,220,.85)',
  replaySubtitle: '#b8f4ff',

  // Decision-pending flash (orange)
  decisionPendingGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(255,140,40,.42), transparent 62%)',
  decisionPendingSparkInner: '#ffe8cc',
  decisionPendingSparkOuter: '#ff9030',
  decisionPendingSparkShadow: 'rgba(255,140,40,.9)',
  decisionPendingTitleGradient: 'linear-gradient(180deg, #ffd0a0 0%, #ff9030 55%, #e06000 100%)',
  decisionPendingTitleColor: '#ff9030',
  decisionPendingTitleShadow: 'rgba(255,140,40,.85)',
  decisionPendingSubtitle: '#ffe0b8',

  // Not-out strap (green lower-third graphic)
  notOutStrapAccent: '#40d880',
  notOutStrapSweep: 'rgba(40,200,110,.45)',
  notOutStrapPanelGlow: 'rgba(40,200,110,.34)',
  notOutStrapTitleShadow: 'rgba(50,220,120,.9)',

  // Not-out flash (green)
  notOutGlow: 'radial-gradient(60% 50% at 50% 45%, rgba(40,200,110,.42), transparent 62%)',
  notOutTitleGradient: 'linear-gradient(180deg, #90ffc0 0%, #40d880 55%, #18a850 100%)',
  notOutTitleColor: '#40d880',
  notOutTextShadow: 'rgba(50,220,120,.9)',

  // GlowPanel ambient gradient sweep
  ambientA: 'rgba(255, 55, 110, 0.06)',
  ambientB: 'rgba(255, 70, 120, 0.34)',
  ambientC: 'rgba(220, 40, 90, 0.44)',

  // Leaderboard / squad gold accent (PSL reference)
  gold: '#f5c85a',
  goldDark: '#d9a93a',

  // Text on gold rank chips and stat bands
  badgeText: '#0a0e17',

  // Navy accent tokens — canonical RGB for borders, glows, and panel lining.
  // Use via CSS vars (--navy-border, etc.) in Tailwind or reference directly.
  navyAccentRgb: '120, 140, 255',
  navyBorder: 'rgba(120, 140, 255, 0.28)',
  navyGlow: 'rgba(120, 140, 255, 0.16)',
  navyGlowStrong: 'rgba(120, 140, 255, 0.45)',
};

// ── Shared asset URLs ─────────────────────────────────────────────────────────
export const assets = {
  brandLogoWhite: 'https://d1nmw2vhka3zp0.cloudfront.net/app/images/logos/tapeya-logo-white.svg',
  playerPlaceholder: 'https://d1nmw2vhka3zp0.cloudfront.net/app/images/background/player-placeholder-theme1.png',
};

// ── Typography tokens ─────────────────────────────────────────────────────────
export const typography = {
  fontDisplay: "'Saira Condensed', system-ui, sans-serif",
  fontUI: "'Saira', system-ui, sans-serif",
};

// ── Spacing & geometry tokens ─────────────────────────────────────────────────
export const geometry = {
  barRadius: 20,
  barRadiusEdgeToEdge: 0,
};

/**
 * Lower-third layout tokens — single source for bar footprint (see lower-third-implementation-guide.md).
 * Height values are design-unit estimates; confirm in browser during Phase 1 baseline capture.
 */
export const ltBar = {
  designWidth: 1920,
  height: 139,
  crestSize: 86,
  sidePaddingY: 20,
  edgePaddingX: 32,
  batsmenMinWidth: 360,
  previewGutter: 32,
  mobileBreakpoint: 720,

  // Inset LT safe area — shared by every InsetLTBarSurface command (fixture, stats, officials, …).
  // At 1920×1080: 1920 − (210 × 2) = 1500px horizontal canvas (pairs with ltInfoBar.maxWidth).
  overlayInsetXLT: 210,
  overlayInsetBottomLT: 45,

  controllerBarPaddingY: 22,
};

/** Default LT Zone C rotation — panel keys must match LT_DEFAULT_ZONE_C_PANELS in ltDefaultZoneC.js. */
export const ltDefaultZoneC = {
  dwellMs: 20000,
  firstInnings: ['crr', 'projectedScore', 'partnership'],
  secondInnings: ['rrr', 'crr', 'needTarget', 'partnership'],
};

/** Canonical inline batter score — runs then balls, no parentheses. */
export const batterScore = {
  gap: 6,
  runs: 38,
  runsCompact: 34,
  balls: 22,
  /** Balls faced + companion secondary figures (bowler overs in stat headers). */
  ballsWeight: 600,
};

/** Typography sizes for LT families — px inside scaled HorizontalBar; rem allowed outside scaled surfaces */
export const ltTypography = {
  strapTitle: '96px',
  chipCompact: 26,

  // Zone A — score block
  teamName: 34,
  overs: 28,
  scoreTotal: 76,
  scoreSep: 46,
  scoreWkts: 56,

  // Zone B — batsmen pill (sizes mirror batterScore — single source of truth)
  batName: 27,
  batNameCompact: 23,
  batRuns: batterScore.runs,
  batRunsCompact: batterScore.runsCompact,
  batBalls: batterScore.balls,

  // Zone C — Last 30 side-heading only (stat columns use last30* tokens below).
  sideHeadingLine1: 18,
  sideHeadingLine2: 26,

  // Zone C — KPI column rhythm (CRR, RRR, Need Target, team code, partnership, projected score, …)
  // Tuned between original (22/48/34, 28px pad) and compact pass — readable at 1920 broadcast scale.
  kpiColumnPaddingX: 22,
  kpiColumnGap: 9,
  kpiValueGap: 5,
  kpiSideHeadingLine1: 17,
  kpiSideHeadingLine2: 24,
  kpiColumnLabel: 21,
  kpiTeamCode: 35,
  kpiTeamCodeAsLabel: 23,
  kpiTeamNameSecondary: 21,
  kpiMetricValue: 47,
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
  bowlerName: 23,
  bowlerFigures: 23,
  ballChip: 32,
  ballChipCompact: 26,
  ballChipFontScale: 0.5,
  ballChipFontWeight: 800,
  /** Compound tokens (WD+W, 2NB+W) — scaled by chip size in resolveBallChipLayout. */
  ballChipCompoundFontScale: { len6: 0.35, len5: 0.37, len4: 0.4, default: 0.42 },
  lastOverLabel: 18,
  lastOverRuns: 28,

  // Spacing (px) — Last 30 heading + Zone B batsmen pill; KPI columns use kpiColumn* above.
  columnPaddingX: 28,
  columnPaddingXCompact: 28,
  last30PaddingX: 6,
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
 * Match-fixture lower-third tokens — Intro / Toss / Result / Tournament Name,
 * Custom Caption, and Match Summary (two-row title + detail layout).
 */
export const ltFixtureBar = {
  /** Upper / lower row height split inside the center column (flex-grow ratio). */
  titleRowFlex: 60,
  detailRowFlex: 40,
  contentPaddingX: 32,

  crestPaddingX: 20,

  titleFont: '1.75rem',
  vsLabelFont: '1.375rem',
  detailFont: '1.25rem',
  detailTossFont: '1.375rem',

  /** Match Summary upper-row score strip (scales with title row). */
  matchSummaryScoreTotal: '3rem',
  matchSummaryScoreSep: '2rem',
  matchSummaryScoreWkts: '2.25rem',
  matchSummaryOvers: '0.9375rem',
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
  title: 56,
  sub: 36,
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
  playerName: 28,
  subLabel: 20,
  captainBadge: 24,
  roleBadgeSm: 16,
  panelTeamName: 48,
  playerListName: 34,
  playerNumberBand: 38,
  goldBand: 38,
};

/** VS break and strategic timeout overlays. */
export const fsBreak = {
  titleLg: 56,
  titleSm: 44,
  timeoutHero: 78,
};

/** FS pill captions (PlayerNameFS topLabel, MoM, etc.). */
export const fsPill = {
  label: 30,
  caption: 36,
};

/**
 * Full-screen stage fabric backdrop (FSDiagonal) — colors, motion, and layer tokens.
 * Animation classes live in styles/controller.scss; tune here without editing JSX/SCSS curves.
 */
export const fsStageFabric = {
  fadeInMs: 450,
  fabricEasing: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
  bottomGlowCycleS: 18,
  grainDriftCycleS: 120,
  bandBlurPx: 8,
  bandWidth: 2640,
  bandHeight: 320,
  bandLeft: -300,
  stageBase: 'radial-gradient(120% 100% at 50% -10%, #101a2e 0%, #0a0f1c 52%, #06080f 100%)',
  baseWash: 'linear-gradient(160deg, rgba(40,65,185,0.10) 0%, rgba(72,50,200,0.09) 50%, rgba(155,92,255,0.07) 100%)',
  bottomGlow: 'radial-gradient(82% 62% at 50% 108%, rgba(91,124,255,0.24), transparent 68%)',
  /** Full-width bottom tint — fills gap below the lowest band. */
  bottomFill: 'linear-gradient(to top, rgba(52,84,196,0.14) 0%, rgba(72,50,200,0.06) 38%, transparent 72%)',
  /** Bottom-right corner — static fill where rotated bands leave a dead zone. */
  cornerFill: 'radial-gradient(85% 70% at 100% 100%, rgba(118,72,228,0.18) 0%, rgba(91,124,255,0.10) 32%, transparent 58%)',
  vignette: 'linear-gradient(to right, rgba(6,8,15,0.38), transparent 18%, transparent 82%, rgba(6,8,15,0.38))',
  grainColor: 'rgba(120,140,255,0.02)',
  /** Bands with top >= lowerBandTopPx use transform-origin anchor (see controller.scss). */
  lowerBandTopPx: 452,
  /** curve: A | B | C → fsFabricA/B/C keyframes in animations.scss */
  bands: [
    { id: 'b0', top: -428, color: 'rgba(40,68,180,0.14)', curve: 'B', durationS: 13, delayS: -9 },
    { id: 'b1', top: -208, color: 'rgba(52,84,196,0.18)', curve: 'A', durationS: 11, delayS: 0 },
    { id: 'b2', top: 12, color: 'rgba(91,124,255,0.20)', curve: 'B', durationS: 14, delayS: -4 },
    { id: 'b3', top: 232, color: 'rgba(72,102,242,0.15)', curve: 'A', durationS: 10, delayS: -6 },
    { id: 'b4', top: 452, color: 'rgba(118,72,228,0.14)', curve: 'B', durationS: 12, delayS: -2 },
    { id: 'b5', top: 620, color: 'rgba(155,92,255,0.13)', curve: 'C', durationS: 10.5, delayS: -7 },
    { id: 'b6', top: 800, color: 'rgba(91,124,255,0.11)', curve: 'A', durationS: 11.5, delayS: -5 },
  ],
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

  /** LT GlowPanel ambient gradient sweep */
  ambientPulse: true,

  /** Crest / team-logo ring halo + pulse animation */
  crest: {
    halo: true,
    pulse: true,
  },

  /** FS stage bottom radial ambient pulse */
  fsStageAmbient: true,

  /** Full-screen event flash radial background wash */
  flashBackground: true,

  /** Drop-shadow on FOUR / SIX / strap flash titles */
  flashTextGlow: false,

  /** Worm / Manhattan / wagon-wheel decorative halos */
  chartGlow: true,

  /** Panel, gold-band, score-strip box-shadow halos (not typography) */
  decorativeBoxGlow: true,

  /** Tour Hits short-code badge outer pulse */
  tourCodeBadgeGlow: true,
};

// ── Animation timing tokens ───────────────────────────────────────────────────
export const animation = {
  // Event reveal: delay before post-frame fires
  revealDelayMs: {
    boundary: 800,
  },

  // Flash overlay auto-dismiss
  flashDismissMs: {
    boundary: 2800,
    wicket: 2600,
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
  '--text-secondary': colors.textSecondary,
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
};
