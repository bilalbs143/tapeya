/**
 * Midnight Neon Premium Theme — design token configuration.
 *
 * Single source of truth for visual design decisions in the `theme1` theme.
 * Every color, timing, spacing, and typography value lives here.
 * To create a second theme, copy this file under `themes/{slug}/` and modify values.
 */

// ── Color tokens ─────────────────────────────────────────────────────────────
export const colors = {
  // Text hierarchy
  text: '#eef2fb',
  muted: '#9aa7c2',
  faint: '#65718e',

  // Accent gradient pair (used on borders, glows, crest rings)
  accentA: '#5b7cff',
  accentB: '#9b5cff',

  // Panel background layers
  panelBase: 'rgba(22,28,42,0.88)',
  panelDeep: 'rgba(11,15,24,0.92)',

  // Preview stage background
  stageBg: 'radial-gradient(130% 100% at 50% -20%, #0e1424 0%, #070a12 55%, #05070d 100%)',

  // Score value highlights
  scoreColor: '#dbe8ff',
  scoreShadow: 'rgba(90,140,255,.85)',

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
  hundredUpTitleShadow: 'rgba(245,200,90,.9)',
  hundredUpSubtitle: '#ffe8a8',

  // Milestone flash — fifty (champagne gold)
  fiftyUpGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(210,185,110,.4), transparent 62%)',
  fiftyUpSparkInner: '#fff8e8',
  fiftyUpSparkOuter: '#d4b86a',
  fiftyUpSparkShadow: 'rgba(210,185,110,.9)',
  fiftyUpTitleGradient: 'linear-gradient(180deg, #f0e0a8 0%, #d4b86a 55%, #a88828 100%)',
  fiftyUpTitleShadow: 'rgba(210,185,110,.85)',
  fiftyUpSubtitle: '#f0e8cc',

  // Boundary flash — six (gold)
  sixGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(245,190,70,.4), transparent 62%)',
  sixSparkInner: '#ffe9a8',
  sixSparkOuter: '#f5b24a',
  sixSparkShadow: 'rgba(245,190,90,.9)',
  sixTitleGradient: 'linear-gradient(180deg, #ffe890 0%, #ffc830 55%, #e89800 100%)',
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
  replayTitleShadow: 'rgba(40,200,220,.85)',
  replaySubtitle: '#b8f4ff',

  // Decision-pending flash (orange)
  decisionPendingGlow: 'radial-gradient(60% 55% at 50% 48%, rgba(255,140,40,.42), transparent 62%)',
  decisionPendingSparkInner: '#ffe8cc',
  decisionPendingSparkOuter: '#ff9030',
  decisionPendingSparkShadow: 'rgba(255,140,40,.9)',
  decisionPendingTitleGradient: 'linear-gradient(180deg, #ffd0a0 0%, #ff9030 55%, #e06000 100%)',
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
  fontMono: "'JetBrains Mono', ui-monospace, monospace",
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
  height: 126,
  crestSize: 86,
  sidePaddingY: 20,
  edgePaddingX: 32,
  batsmenMinWidth: 360,
  previewGutter: 32,
  mobileBreakpoint: 720,
};

/** Typography sizes for LT families — px inside scaled HorizontalBar; rem allowed outside scaled surfaces */
export const ltTypography = {
  strapTitle: '88px',
  chipCompact: 24,

  // Zone A — score block
  teamName: 30,
  overs: 26,
  scoreTotal: 70,
  scoreSep: 42,
  scoreWkts: 50,

  // Zone B — batsmen pill
  batName: 25,
  batNameCompact: 22,
  batRuns: 34,
  batRunsCompact: 30,
  batBalls: 17,

  // Zone C — vertical side headings (AT THIS STAGE, WIN PREDICTION, CURRENT PARTNERSHIP, …)
  sideHeadingLine1: 17,
  sideHeadingLine2: 22,
  columnLabel: 19,
  columnLabelCompact: 19,
  teamCode: 32, // standalone Zone C column only (e.g. bowling team between dividers)
  teamCodeAsLabel: 20,
  teamNameSecondary: 20,
  metricValue: 40,
  metricValueCompact: 40,
  atStageSep: 22,
  atStageWkts: 26,
  winPredictionPercentSuffix: 24,
  kpiSuffix: 22,

  // Zone C — Last 30 / Last 12
  last30Label: 13,
  last30Value: 24,
  last30ColumnWidth: 80,
  last12Heading: 18,
  last12OverLabel: 11,
  last12TotalRuns: 26,
  last12TotalMinWidthExtra: 20,

  // Zone D
  bowlerName: 21,
  bowlerFigures: 21,
  ballChip: 28,
  ballChipCompact: 24,
  lastOverLabel: 16,
  lastOverRuns: 24,
  partnershipBalls: 22,

  // Spacing (px) — Zone C column rhythm
  columnPaddingX: 28,
  columnPaddingXCompact: 28,
  last30PaddingX: 6,
  columnGap: 11,
  kpiValueGap: 6,
};

/** Full-screen stat chip tokens — PlayerNameFSGraphic and shared StatTile. */
export const fsStatTile = {
  height: 126,
  width: 260,
  gap: 16,
  label: 22,
  value: 54,
  columnMaxHeight: 760,
  /** Compressed stack when natural height exceeds columnMaxHeight. */
  denseGap: 10,
  denseMinHeight: 72,
  denseLabel: 16,
  denseValue: 36,
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
  '--muted': colors.muted,
  '--faint': colors.faint,
  '--accentA': colors.accentA,
  '--accentB': colors.accentB,
  '--glow': '1',
  '--font-display': typography.fontDisplay,
  '--font-ui': typography.fontUI,
  '--font-mono': typography.fontMono,
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
};
