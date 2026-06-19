/** Theme1 on-air copy — keep presentation strings out of core processors. */

/** @type {Record<string, string>} */
export const BREAK_CAPTIONS = {
  INNINGS_BREAK: 'INNINGS BREAK',
  TEA_BREAK: 'Tea Break',
  LUNCH_BREAK: 'Lunch Break',
  RAIN_STOPPED: 'Rain Stopped',
  STRATEGIC_TIMEOUT: 'Strategic Timeout',
};

/** @type {Record<string, { title: string, yLabel: string }>} */
export const CHART_LABELS = {
  WORM: { title: 'Worm', yLabel: 'Runs' },
  MANHATTAN: { title: 'MANHATTAN', yLabel: 'RUNS PER OVER' },
  RUN_RATE_CHART: { title: 'RUN RATE GRAPH', yLabel: 'Run Rate' },
};

/** @type {Record<string, string>} */
export const BALL_STRIP_LABELS = {
  THIS_OVER: 'This Over',
  LAST_12_BALLS: 'Last 12 Balls',
  LAST_30_BALLS: 'Last 30 Balls',
};

/** @type {Record<string, string>} */
export const LEADERBOARD_TITLES = {
  HIGHEST_RUNS: 'Highest Runs',
  TOP_BATTER: 'Top Batter',
  HIGHEST_FOURS: 'Highest Fours',
  HIGHEST_SIXES: 'Highest Sixes',
  HIGHEST_WICKETS: 'Highest Wickets',
  TOP_BOWLER: 'Top Bowler',
};

/** Short title shown in tour mini bar (command key → display word). */
/** @type {Record<string, string>} */
export const TOUR_STAT_TITLES = {
  TOUR_RUNS: 'RUNS',
  TOUR_FOURS: 'FOURS',
  TOUR_SIXES: 'SIXES',
  TOUR_FIFTIES: 'FIFTIES',
  TOUR_HUNDREDS: 'HUNDREDS',
  TOUR_WICKETS: 'WICKETS',
};

export const MATCH_SUMMARY_LT = {
  label: 'MATCH SUMMARY',
  vsLabel: 'VS',
};

export const POINT_TABLE_TITLE = 'POINTS TABLE';

/** @type {Record<string, string>} */
export const OFFICIALS_HEADINGS = {
  UMPIRES: 'Umpires',
  SCORERS: 'Scorers',
  COMMENTATORS: 'Commentators',
};

/**
 * @param {string|null|undefined} commandKey
 * @param {{ title?: string, yLabel?: string }} [fallback]
 */
export function chartLabelsForCommand(commandKey, fallback = {}) {
  const labels = commandKey ? CHART_LABELS[commandKey] : null;
  return {
    title: fallback.title ?? labels?.title ?? 'CHART',
    yLabel: fallback.yLabel ?? labels?.yLabel ?? 'RUNS',
  };
}

/**
 * @param {string|null|undefined} commandKey
 * @param {string|null|undefined} operatorCaption
 */
export function breakCaptionForCommand(commandKey, operatorCaption) {
  if (operatorCaption) return operatorCaption;
  return commandKey ? (BREAK_CAPTIONS[commandKey] ?? null) : null;
}

/**
 * @param {string|null|undefined} commandKey
 * @param {string|null|undefined} operatorLabel
 */
export function ballStripLabelForCommand(commandKey, operatorLabel) {
  if (operatorLabel) return operatorLabel;
  return commandKey ? (BALL_STRIP_LABELS[commandKey] ?? null) : null;
}

/**
 * @param {string|null|undefined} commandKey
 * @param {string|null|undefined} operatorTitle
 */
export function leaderboardTitleForCommand(commandKey, operatorTitle) {
  if (operatorTitle) return operatorTitle;
  return commandKey ? (LEADERBOARD_TITLES[commandKey] ?? 'Leaderboard') : 'Leaderboard';
}

/**
 * @param {string|null|undefined} commandKey
 */
export function tourStatTitleForCommand(commandKey) {
  return commandKey ? (TOUR_STAT_TITLES[commandKey] ?? 'STAT') : 'STAT';
}

/**
 * @param {string|null|undefined} commandKey
 * @param {string|null|undefined} operatorHeading
 */
export function officialsHeadingForCommand(commandKey, operatorHeading) {
  if (operatorHeading) return operatorHeading;
  return commandKey ? (OFFICIALS_HEADINGS[commandKey] ?? commandKey) : '';
}

/**
 * @param {string|null|undefined} winnerName
 * @param {'bat'|'bowl'|null|undefined} choice
 */
export function formatTossDecision(winnerName, choice) {
  const name = String(winnerName ?? '').trim();
  if (!name || (choice !== 'bat' && choice !== 'bowl')) return '';

  const elected = choice === 'bat' ? 'elected to bat first' : 'elected to bowl first';
  return `${name} won the toss and ${elected}`;
}

/**
 * @param {string|null|undefined} chasingAbbrev
 * @param {number|null|undefined} runsRequired
 * @param {number|null|undefined} wicketsRemaining
 * @param {number|null|undefined} ballsRemaining
 */
export function formatChaseAnnouncement(chasingAbbrev, runsRequired, wicketsRemaining, ballsRemaining) {
  const abbrev = String(chasingAbbrev ?? '').trim();
  const runs = Number(runsRequired ?? 0);
  if (!abbrev || runs <= 0) return '';

  const wickets = Number(wicketsRemaining ?? 10);
  const balls = Number(ballsRemaining ?? 0);

  return `${abbrev} REQUIRES ${runs} RUNS WITH ${wickets} WICKETS AND ${balls} BALLS`;
}
