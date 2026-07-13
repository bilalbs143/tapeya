import { coalesceTrim } from '../utils.js';
import { buildMatchContext, resolveVenueFields } from './_shared/matchContext';

/**
 * @returns {import('../types.js').GraphicProcessor}
 */
export function createBreakProcessor() {
  return (snapshot) => {
    const mc = buildMatchContext(snapshot);
    const p = snapshot.payload ?? {};
    const { venue, venueDisplayLine } = resolveVenueFields(snapshot);
    return {
      commandKey: snapshot.commandKey,
      homeTeam: mc.homeTeam,
      awayTeam: mc.awayTeam,
      caption: coalesceTrim(p.caption, p.label) || null,
      tournamentName: coalesceTrim(p.tournamentName, p.tournament_name, mc.tournamentName) || null,
      venue,
      venueDisplayLine,
    };
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export const processInningsBreak = createBreakProcessor();

/** @type {import('../types.js').GraphicProcessor} */
export const processTeaBreak = createBreakProcessor();

/** @type {import('../types.js').GraphicProcessor} */
export const processLunchBreak = createBreakProcessor();

/** @type {import('../types.js').GraphicProcessor} */
export const processRainStopped = createBreakProcessor();

/** @type {import('../types.js').GraphicProcessor} */
export const processStrategicTimeout = createBreakProcessor();
