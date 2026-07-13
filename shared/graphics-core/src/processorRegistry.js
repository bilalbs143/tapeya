import { processAnimation, processClear, processFstAnimation } from './processors/animation.processor';
import {
  processInningsBreak,
  processLunchBreak,
  processRainStopped,
  processStrategicTimeout,
  processTeaBreak,
} from './processors/break.processors';
import { processCustom, processOfficialsBanner, processPlatformBanner } from './processors/caption.processors';
import {
  processBattingSquad,
  processBowlingSquad,
  processBowlingSummary,
  processManhattan,
  processNextMatch,
  processPlaying11,
  processRunRateChart,
  processWorm,
} from './processors/fullScreen.processors';
import {
  processAtStage,
  processFallOfWickets,
  processIntroLt,
  processLast12Balls,
  processLast30Balls,
  processMatchSummary,
  processNeedTarget,
  processPartnership,
  processPreviousOver,
  processResultLt,
  processRunRate,
  processThisOver,
  processTossLt,
  processWinPrediction,
} from './processors/lowerThird.processors';
import { processLtDefault } from './processors/LT_DEFAULT.processor';
import { processMiniScorecard } from './processors/MINI_SCORECARD.processor';
import {
  createLeaderboardProcessor,
  processBatsmanMatchFs,
  processBatsmanMatchLt,
  processBatsmanTournament,
  processBattingSummary,
  processBowlerMatch,
  processBowlerTournament,
  processInningFigures,
  processMom,
  processPlayerIntro,
  processTourStat,
} from './processors/player.processors';
import {
  processMatchIntro,
  processMatchSummaryFs,
  processPointTable,
  processTournamentName,
} from './processors/tournament.processors';
import { processBatsmanWagonWheel, processWagonWheel } from './processors/wagonWheel.processors';

/** @typedef {import('./types.js').GraphicProcessor} GraphicProcessor */

/**
 * Maps manifest `processorId` → processor implementation.
 * `processorMap.js` wires manifest command keys to these entries at runtime.
 *
 * @type {Record<string, GraphicProcessor>}
 */
export const PROCESSOR_REGISTRY = {
  LT_EMPTY: processClear,

  LT_DEFAULT: processLtDefault,
  MINI_SCORECARD: processMiniScorecard,
  MATCH_SUMMARY: processMatchSummary,
  INTRO_LT: processIntroLt,
  TOSS_LT: processTossLt,
  RESULT_LT: processResultLt,
  RUN_RATE: processRunRate,
  THIS_OVER: processThisOver,
  PREVIOUS_OVER: processPreviousOver,
  FOW: processFallOfWickets,
  LAST_WICKET: processFallOfWickets,
  LAST_WICKET_FS: processFallOfWickets,
  LAST_12_BALLS: processLast12Balls,
  LAST_30_BALLS: processLast30Balls,
  CURRENT_PARTNERSHIP: processPartnership,
  CURRENT_PARTNERSHIP_FS: processPartnership,
  PARTNERSHIP_LIST: processPartnership,
  NEED_TARGET: processNeedTarget,
  NEED_TARGET_FS: processNeedTarget,
  AT_STAGE: processAtStage,
  WIN_PREDICTION: processWinPrediction,

  INNINGS_BREAK: processInningsBreak,
  TEA_BREAK: processTeaBreak,
  LUNCH_BREAK: processLunchBreak,
  RAIN_STOPPED: processRainStopped,
  STRATEGIC_TIMEOUT: processStrategicTimeout,

  PLAYING_11: processPlaying11,
  WORM: processWorm,
  MANHATTAN: processManhattan,
  RUN_RATE_CHART: processRunRateChart,
  WAGON_WHEEL: processWagonWheel,
  BATSMAN_WAGON_WHEEL: processBatsmanWagonWheel,

  HIGHEST_RUNS: createLeaderboardProcessor('HIGHEST_RUNS'),
  HIGHEST_SIXES: createLeaderboardProcessor('HIGHEST_SIXES'),
  HIGHEST_FOURS: createLeaderboardProcessor('HIGHEST_FOURS'),
  TOP_BATTER: createLeaderboardProcessor('TOP_BATTER'),
  HIGHEST_WICKETS: createLeaderboardProcessor('HIGHEST_WICKETS'),
  TOP_BOWLER: createLeaderboardProcessor('TOP_BOWLER'),

  BATSMAN_MATCH_LT: processBatsmanMatchLt,
  BATSMAN_MATCH_FS: processBatsmanMatchFs,
  BATSMAN_NAME_LT: processPlayerIntro,
  BATSMAN_NAME_FS: processPlayerIntro,
  BATSMAN_TOURNAMENT_LT: processBatsmanTournament,
  BATSMAN_TOURNAMENT_FS: processBatsmanTournament,
  BATTING_SUMMARY: processBattingSummary,
  BATTING_SQUAD: processBattingSquad,
  INNING_FIGURES: processInningFigures,

  BOWLER_NAME_LT: processPlayerIntro,
  BOWLER_NAME_FS: processPlayerIntro,
  BOWLER_MATCH_LT: processBowlerMatch,
  BOWLER_MATCH_FS: processBowlerMatch,
  BOWLER_TOURNAMENT_LT: processBowlerTournament,
  BOWLER_TOURNAMENT_FS: processBowlerTournament,
  BOWLING_SUMMARY: processBowlingSummary,
  BOWLING_SQUAD: processBowlingSquad,
  MOM: processMom,

  TOUR_FOURS: processTourStat,
  TOUR_SIXES: processTourStat,
  TOUR_FIFTIES: processTourStat,
  TOUR_HUNDREDS: processTourStat,
  TOUR_RUNS: processTourStat,
  TOUR_WICKETS: processTourStat,

  THIS_MATCH: processMatchIntro,
  NEXT_MATCH: processNextMatch,
  TOURNAMENT_NAME: processTournamentName,
  POINT_TABLE: processPointTable,
  MATCH_SUMMARY_FS: processMatchSummaryFs,

  CUSTOM: processCustom,
  FOLLOW_PLATFORM: processPlatformBanner,
  DOWNLOAD_PLATFORM: processPlatformBanner,
  UMPIRES: processOfficialsBanner,
  SCORERS: processOfficialsBanner,
  COMMENTATORS: processOfficialsBanner,
};

export { processAnimation, processFstAnimation };
