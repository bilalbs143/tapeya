import type { ScoringFixture } from '../model/scoringFixture';
import type { CreasePlayer, ScoringSession, XiPlayer } from '../model/scoringSession';
import { creaseReady, creaseSlot, xiForTeam } from '../model/scoringSession';
import type { ScoreTab } from './scoreTabs';

export type ScoringConnectionState = 'online' | 'reconnecting' | 'offline' | 'stale';
export type ScoringCreaseNeeds = 'openers' | 'batter' | 'bowler';

export type ScoringDeskSide = {
  id: number;
  name: string;
  short: string;
};

export type ScoringDeskLayout = {
  ready: boolean;
  batters: XiPlayer[];
  bowlers: XiPlayer[];
  batting: ScoringDeskSide | null;
  fielding: ScoringDeskSide | null;
  playersPerSide: number;
  needDeclareXi: boolean;
  settingFirstBall: boolean;
  creaseNeeds: ScoringCreaseNeeds;
  showCreaseDialog: boolean;
  battingSideKey: 'home' | 'away';
  stays: CreasePlayer | null;
  staysOnStrike: boolean;
  battersDone: boolean;
  lockNote: string;
  canUndo: boolean;
};

/** Pure layout flags for the live scoring desk (no React). */
export function deriveScoringDeskLayout(args: {
  session: ScoringSession;
  fixture: ScoringFixture;
  tab: ScoreTab;
  summaryOpen: boolean;
  declareOpen: boolean;
  creaseOpen: boolean;
  connectionState: ScoringConnectionState;
}): ScoringDeskLayout {
  const { session, fixture, tab, summaryOpen, declareOpen, creaseOpen, connectionState } = args;

  const slot = creaseSlot(session);
  const ready = creaseReady(session) && fixture.canOperate;
  const homeId = fixture.home?.id ?? null;
  const batters = xiForTeam(session, session.battingTeamId, homeId);
  const bowlers = xiForTeam(session, session.bowlingTeamId, homeId);
  const batting =
    session.battingTeamId != null && fixture.away?.id === session.battingTeamId ? fixture.away : fixture.home;
  const fielding =
    session.bowlingTeamId != null && fixture.away?.id === session.bowlingTeamId ? fixture.away : fixture.home;

  const noBallsYet =
    session.deliveries.length === 0 &&
    session.runs === 0 &&
    session.wickets === 0 &&
    session.overNumber <= 1 &&
    session.ballsInOver === 0;
  const playersPerSide = fixture.playersPerSide ?? 11;
  const needDeclareXi =
    fixture.canOperate &&
    noBallsYet &&
    (session.homeXi.length < playersPerSide || session.awayXi.length < playersPerSide);
  const settingFirstBall =
    fixture.canOperate && !session.inningsComplete && noBallsYet && (slot !== 'ready' || needDeclareXi);
  const creaseNeeds: ScoringCreaseNeeds = slot === 'bowler' ? 'bowler' : slot === 'openers' ? 'openers' : 'batter';
  const showCreaseDialog =
    fixture.canOperate &&
    slot !== 'ready' &&
    !session.inningsComplete &&
    !summaryOpen &&
    !declareOpen &&
    tab === 'pad' &&
    (settingFirstBall ? creaseOpen : true);
  const battingSideKey: 'home' | 'away' =
    fixture.tossWinnerId != null && fixture.home && fixture.away
      ? (fixture.tossWinnerId === fixture.home.id) === (fixture.choseTo === 'bat')
        ? 'home'
        : 'away'
      : 'home';

  const stays =
    creaseNeeds === 'batter' ? (session.vacantEnd === 'non_striker' ? session.striker : session.nonStriker) : null;
  const staysOnStrike = creaseNeeds === 'batter' && session.vacantEnd === 'non_striker';
  const battersDone = Boolean(session.striker && session.nonStriker);
  const lockNote =
    connectionState === 'stale'
      ? 'Pad stopped — resolve the sync conflict'
      : !fixture.canOperate
        ? 'View only — you are not scoring this match'
        : session.inningsComplete
          ? 'Innings Complete'
          : 'Pad unlocks once the crease is set';
  const canUndo = session.runs > 0 || session.wickets > 0 || session.deliveries.length > 0 || session.overNumber > 0;

  return {
    ready,
    batters,
    bowlers,
    batting,
    fielding,
    playersPerSide,
    needDeclareXi,
    settingFirstBall,
    creaseNeeds,
    showCreaseDialog,
    battingSideKey,
    stays,
    staysOnStrike,
    battersDone,
    lockNote,
    canUndo,
  };
}
