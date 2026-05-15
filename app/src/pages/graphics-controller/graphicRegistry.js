import { lazy } from 'react';

/**
 * Graphic component registry — theme-aware, demand-loaded.
 *
 * WHY this file exists
 * ─────────────────────
 * The backend `GraphicCommandKeyEnum` defines *which* commands exist
 * (the contract).  This file defines *how* the frontend renders each
 * command — i.e. which React component filename to use.
 *
 * Human-readable map: `COMMAND_COMPONENT_MAP.md`.
 *
 * Two things the backend can never know:
 *   1. Which component file to render for a given key.
 *   2. That several keys share one component (e.g. DRINKS / TEA_BREAK /
 *      RAIN all render TeaBreak.jsx).
 *
 * HOW themes work
 * ───────────────
 * KEY_TO_FILE maps command_key → component filename (no extension).
 * This map is theme-agnostic — every theme folder uses the SAME filenames.
 * `getGraphicComponent(key, theme)` dynamically imports `./{theme}/{file}.jsx`.
 *
 * To add a new theme: create a folder under `pages/graphics-controller/`
 * (e.g. `theme1`) with the same component filenames, then map API theme
 * slugs to that folder in THEME_SLUG_TO_FOLDER below.
 *
 * URL: /overlay/:matchId?theme=tapeya-basic  (defaults to tapeya-basic)
 */

// ── command_key → component filename ─────────────────────────────────────────
// null  = intentionally clear the overlay (LT_EMPTY).
// Every key from GraphicCommandKeyEnum should appear here; unknown keys also
// resolve to null (transparent overlay).

const KEY_TO_FILE = {
  // clear
  LT_EMPTY: null,

  // tournament / match context
  THIS_MATCH:       'TournamentStart',
  MATCH_INFO:       'TournamentStart',
  SCORECARD_FULL:   'TournamentStart',
  INTRO_LT:         'TournamentIntro',
  TOURNAMENT_NAME:  'TournamentOverview',
  SELECT_DRAW:      'TournamentOverview',
  POINT_TABLE:      'TournamentOverview',
  MATCH_SUMMARY_FS: 'TournamentOver',
  RESULT_LT:        'ResultIntro',
  TOSS_LT:          'Toss',

  // playing XI
  PLAYING_11:          'PlayingXI',
  PLAYING_ELEVEN_HOME: 'PlayingXI',
  PLAYING_ELEVEN_AWAY: 'PlayingXI',

  // lower-third transitions
  LT_FOUR:          'Four',
  LT_SIX:           'Six',
  LT_OUT:           'Out',
  LT_NOT_OUT:       'NotOut',
  LT_NO_BALL:       'NoBall',
  LT_WIDE:          'Wide',
  FIFTY_UP:         'FiftyRow',
  HUNDRED_UP:       'HundredRow',
  LT_REPLAY:        'ReplayRow',
  DECISION_PENDING: 'DecisionPending',

  // moment (full-screen) transitions
  FOUR:    'Four',
  SIX:     'Six',
  WICKET:  'WicketRow',
  FIFTY:   'Fifty',
  HUNDRED: 'Hundred',
  REPLAY:  'Replay',

  // full-screen transitions (FST_*)
  FST_FOUR:     'FourRow',
  FST_SIX:      'SixRow',
  FST_OUT:      'Out',
  FST_NOT_OUT:  'NotOutRow',
  FST_NO_BALL:  'NoBallRow',
  FST_WIDE:     'WideRow',
  FST_FIFTY:    'FiftyRow',
  FST_HUNDRED:  'HundredRow',
  FST_REPLAY:   'ReplayRow',
  FST_DECISION: 'DecisionPendingRow',

  // scoring lower-thirds
  LT_DEFAULT:             'StatsDefault',
  MINI_SCORECARD:         'MatchSummary',
  MATCH_SUMMARY:          'CricketMatchSummary',
  AT_STAGE:               'AtThisStage',
  RUN_RATE:               'RunRate',
  WIN_PREDICTION:         'WinPredictor',
  CURRENT_PARTNERSHIP:    'CurrentPartnership',
  CURRENT_PARTNERSHIP_FS: 'CurrentPartnership',
  LAST_12_BALLS:          'LastBalls',
  LAST_30_BALLS:          'LastBalls',
  THIS_OVER:              'LastBalls',
  PREVIOUS_OVER:          'PreviousOrder',
  NEED_TARGET:            'TargetNeeded',
  NEED_TARGET_FS:         'TargetNeeded',
  FDR:                    'TargetNeeded',
  LAST_WICKET:            'FallofWickets',
  LAST_WICKET_FS:         'FallofWickets',

  // breaks
  INNINGS_BREAK:     'InningsBreak',
  DRINKS:            'TeaBreak',
  TEA_BREAK:         'TeaBreak',
  LUNCH_BREAK:       'TeaBreak',
  RAIN:              'TeaBreak',
  RAIN_STOPPED:      'TeaBreak',
  STRATEGIC_TIMEOUT: 'TeaBreak',

  // charts
  WORM:           'ScoreComparison',
  RUN_RATE_CHART: 'RunRateChart',
  MANHATTAN:      'ScoreComparisonBar',

  // tournament leaderboards
  HIGHEST_RUNS:    'HighestRuns',
  HIGHEST_SIXES:   'HighestRuns',
  HIGHEST_FOURS:   'HighestRuns',
  TOP_BATTER:      'HighestRuns',
  HIGHEST_WICKETS: 'HighestWickets',
  TOP_BOWLER:      'HighestWickets',

  // player — batsman
  BATSMAN_NAME_LT:       'PlayerIntro',
  BATSMAN_NAME_FS:       'PlayerIntro',
  BATSMAN_MATCH_LT:      'BatsmanCurrentStats',
  BATSMAN_MATCH_FS:      'BatsmanCurrentStats',
  BATSMAN_TOURNAMENT_LT: 'BatsmanCareerStats',
  BATSMAN_TOURNAMENT_FS: 'BatsmanCareerStats',
  BATTING_SUMMARY:       'BatsmanInningsStats',
  BATTING_SQUAD:         'BatsmanInningsStats',

  // player — bowler
  BOWLER_NAME_LT:       'PlayerIntro',
  BOWLER_NAME_FS:       'PlayerIntro',
  BOWLER_MATCH_LT:      'BowlerCurrentStats',
  BOWLER_MATCH_FS:      'BowlerCurrentStats',
  BOWLER_TOURNAMENT_LT: 'BowlerCareerStats',
  BOWLER_TOURNAMENT_FS: 'BowlerCareerStats',
  BOWLING_SUMMARY:      'BowlerCareerStats',
  BOWLING_SQUAD:        'BowlerCareerStats',

  // tour milestones
  TOUR_FOURS:    'PlayerTournamentStats',
  TOUR_SIXES:    'PlayerTournamentStats',
  TOUR_FIFTIES:  'PlayerTournamentStats',
  TOUR_HUNDREDS: 'PlayerTournamentStats',
  TOUR_RUNS:     'PlayerTournamentStats',
  TOUR_WICKETS:  'PlayerTournamentStats',

  // full screen — stats & awards
  INNING_FIGURES:   'BatsmanInningsStats',
  PARTNERSHIP_LIST: 'CurrentPartnership',
  MOM:              'PlayerIntro',
  NEXT_MATCH:       'TournamentStart',

  // platform promo banners
  FOLLOW_PLATFORM:   'RowTextBanner',
  DOWNLOAD_PLATFORM: 'RowTextBanner',

  // captions — CUSTOM renders the saved caption text from the command payload;
  // ADD_CAPTION is a backoffice-only action (opens the caption dialog) and
  // never reaches the overlay, so it resolves to null (transparent).
  CUSTOM:      'GraphicTextCard',
  ADD_CAPTION: null,
};

/** API / URL theme slug → on-disk folder name under graphics-controller/ */
const THEME_SLUG_TO_FOLDER = {
  'tapeya-basic': 'theme1',
};

const DEFAULT_THEME_SLUG = 'tapeya-basic';

function resolveThemeFolder(themeSlug) {
  if (!themeSlug) return THEME_SLUG_TO_FOLDER[DEFAULT_THEME_SLUG];
  return THEME_SLUG_TO_FOLDER[themeSlug] ?? themeSlug;
}

// ── Lazy component cache ──────────────────────────────────────────────────────
// Prevents creating multiple React.lazy wrappers for the same theme+filename.

const componentCache = new Map();

function loadComponent(themeFolder, filename) {
  const cacheKey = `${themeFolder}/${filename}`;
  if (!componentCache.has(cacheKey)) {
    // Vite statically analyses this pattern and includes all matching files
    // as separate lazy chunks — one per component file per theme folder.
    componentCache.set(
      cacheKey,
      lazy(() => import(`./${themeFolder}/${filename}.jsx`)),
    );
  }
  return componentCache.get(cacheKey);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the lazy React component for the given command_key and theme slug,
 * or null when the overlay should be fully transparent.
 *
 * Falls back gracefully: unknown theme → still tries the import (Vite will
 * 404 it in dev; null is returned if the key itself isn't in KEY_TO_FILE).
 */
export function getGraphicComponent(commandKey, themeSlug = DEFAULT_THEME_SLUG) {
  if (!commandKey) return null;

  // Key not in our map at all → unknown command, stay transparent.
  if (!(commandKey in KEY_TO_FILE)) return null;

  const filename = KEY_TO_FILE[commandKey];

  // Explicit null → LT_EMPTY or intentional clear.
  if (!filename) return null;

  const folder = resolveThemeFolder(themeSlug);
  return loadComponent(folder, filename);
}
