import { scoreboardBase } from './_shared/scoreboardBase';

/** @type {import('../../types.js').GraphicProcessor} */
export function processAnimation() {
  return {};
}

/** Maps FST command keys to the event.kind full-screen flash overlays expect. */
const FST_EVENT_KIND = {
  FST_FOUR: 'four',
  FST_SIX: 'six',
  FST_OUT: 'wicket',
  FST_WIDE: 'wide',
  FST_NO_BALL: 'noBall',
  FST_NOT_OUT: 'notOut',
  FST_FIFTY: 'fiftyUp',
  FST_HUNDRED: 'hundredUp',
  FST_REPLAY: 'replay',
  FST_DECISION: 'decisionPending',
};

/**
 * Full-screen transition animations show the live scoreboard bar + a full-screen
 * flash overlay. They need scorecard data AND an event object so FstScoreBarTransition
 * can activate the correct flash header (event is not applied to the score bar).
 *
 * @type {import('../../types.js').GraphicProcessor}
 */
export function processFstAnimation(snapshot) {
  const base = scoreboardBase(snapshot);
  const kind = FST_EVENT_KIND[snapshot.commandKey] ?? 'event';
  return { ...base, event: { kind } };
}

/** @type {import('../../types.js').GraphicProcessor} */
export function processClear() {
  return {};
}
