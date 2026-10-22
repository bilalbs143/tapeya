import { eligibleAdminSubstitutes } from '../lib/eligibleAdminSubstitutes';
import {
  declareResultMutation,
  endInningsMutation,
  endMatchMutation,
  reviseTargetMutation,
  saveCreaseMutation,
} from '../lib/scoringDeskMutations';
import type { ScoringFixture } from '../model/scoringFixture';
import type { CreasePlayer, ScoringSession, XiPlayer } from '../model/scoringSession';
import { AdminActionSheet, type AdminSheetAction } from './AdminActionSheet';
import { type CreaseNeeds, CreaseSetupSheet } from './CreaseSetupSheet';
import { DeclareResultSheet } from './DeclareResultSheet';
import { DeclareSquadScreen } from './DeclareSquadScreen';
import { EndMatchSheet } from './EndMatchSheet';
import { MatchActionMenu, type MatchAdminAction } from './MatchActionMenu';
import { type MatchStateAction, MatchStateSheet } from './MatchStateSheet';

type Side = { id: number; name: string; short: string };

type MutationTrigger<Arg> = (arg: Arg) => { unwrap: () => Promise<unknown> };

type ScoringDeskLifecycleSheetsProps = {
  matchId: number;
  fixture: ScoringFixture;
  session: ScoringSession;
  creaseNeeds: CreaseNeeds;
  showCreaseDialog: boolean;
  settingFirstBall: boolean;
  batters: XiPlayer[];
  bowlers: XiPlayer[];
  batting: Side | null;
  fielding: Side | null;
  stays: CreasePlayer | null;
  staysOnStrike: boolean;
  playersPerSide: number;
  battingSideKey: 'home' | 'away';
  battingStats:
    | { id?: number | undefined; player_id?: number | undefined; dismissal_type?: string | null | undefined }[]
    | undefined;

  creaseSaving: boolean;
  reviseSaving: boolean;
  endInningsSaving: boolean;
  declareResultSaving: boolean;
  endMatchSaving: boolean;

  declareOpen: boolean;
  setDeclareOpen: (open: boolean) => void;
  actionMenuOpen: boolean;
  setActionMenuOpen: (open: boolean) => void;
  stateSheet: MatchStateAction | null;
  setStateSheet: (action: MatchStateAction | null) => void;
  adminSheet: AdminSheetAction | null;
  setAdminSheet: (action: AdminSheetAction | null) => void;
  declareResultOpen: boolean;
  setDeclareResultOpen: (open: boolean) => void;
  endMatchOpen: boolean;
  setEndMatchOpen: (open: boolean) => void;
  setCreaseOpen: (open: boolean) => void;
  onAdminAction: (code: MatchAdminAction) => void;

  updateCrease: MutationTrigger<{
    matchId: number;
    nextBatterId?: number;
    nextNonStrikerId?: number;
    nextBowlerId?: number;
  }>;
  reviseTarget: MutationTrigger<{
    matchId: number;
    revisedTarget: number;
    action: 'continue' | 'end_innings';
  }>;
  endInnings: MutationTrigger<{
    matchId: number;
    inningsId: number;
    endReason: string;
    endComments?: string | null | undefined;
    pointsAwardedEach?: boolean | undefined;
  }>;
  declareResult: MutationTrigger<{
    matchId: number;
    declareResultType: 'award' | 'draw';
    winnerTeamId?: number | null | undefined;
    declareResultNote?: string | null | undefined;
  }>;
  endMatch: MutationTrigger<{
    matchId: number;
    cancelReason: string;
    cancelComments?: string | null | undefined;
    cancelPointsAwardedEach?: boolean | undefined;
  }>;
  onMatchCancelled: () => void;
};

/** Crease / squad / admin menu / match-state / result / cancel sheets. */
export function ScoringDeskLifecycleSheets({
  matchId,
  fixture,
  session,
  creaseNeeds,
  showCreaseDialog,
  settingFirstBall,
  batters,
  bowlers,
  batting,
  fielding,
  stays,
  staysOnStrike,
  playersPerSide,
  battingSideKey,
  battingStats,
  creaseSaving,
  reviseSaving,
  endInningsSaving,
  declareResultSaving,
  endMatchSaving,
  declareOpen,
  setDeclareOpen,
  actionMenuOpen,
  setActionMenuOpen,
  stateSheet,
  setStateSheet,
  adminSheet,
  setAdminSheet,
  declareResultOpen,
  setDeclareResultOpen,
  endMatchOpen,
  setEndMatchOpen,
  setCreaseOpen,
  onAdminAction,
  updateCrease,
  reviseTarget,
  endInnings,
  declareResult,
  endMatch,
  onMatchCancelled,
}: ScoringDeskLifecycleSheetsProps) {
  return (
    <>
      <CreaseSetupSheet
        key={`${creaseNeeds}-${showCreaseDialog ? 'open' : 'closed'}`}
        open={showCreaseDialog}
        needs={creaseNeeds}
        batters={batters}
        bowlers={bowlers}
        battingShort={batting?.short ?? 'BAT'}
        bowlingShort={fielding?.short ?? 'BWL'}
        oversPerSide={fixture.overs}
        stays={stays}
        staysOnStrike={staysOnStrike}
        dismissible={settingFirstBall || creaseNeeds === 'batter'}
        saving={creaseSaving}
        onDismiss={() => setCreaseOpen(false)}
        onSave={(patch) => {
          void saveCreaseMutation({
            updateCrease,
            matchId,
            patch,
            onSuccess: () => setCreaseOpen(false),
          });
        }}
      />

      {fixture.home && fixture.away ? (
        <DeclareSquadScreen
          open={declareOpen}
          onOpenChange={setDeclareOpen}
          matchId={matchId}
          tournamentId={fixture.tournamentId}
          playersPerSide={playersPerSide}
          home={{ id: fixture.home.id, short: fixture.home.short }}
          away={{ id: fixture.away.id, short: fixture.away.short }}
          battingSide={battingSideKey}
          homeXi={session.homeXi}
          awayXi={session.awayXi}
        />
      ) : null}

      {fixture.canOperate && fixture.home && fixture.away ? (
        <MatchActionMenu
          open={actionMenuOpen}
          onOpenChange={setActionMenuOpen}
          homeShort={fixture.home.short}
          awayShort={fixture.away.short}
          scoreLine={`${session.runs}-${session.wickets}`}
          oversDisplay={session.oversDisplay}
          locked={session.matchComplete}
          secondInnings={session.inningsNumber >= 2}
          hasSquad={session.homeXi.length > 0 && session.awayXi.length > 0}
          onAction={onAdminAction}
        />
      ) : null}

      <MatchStateSheet
        action={stateSheet}
        onOpenChange={(open) => {
          if (!open) setStateSheet(null);
        }}
        battingShort={batting?.short ?? 'BAT'}
        scoreLine={`${session.runs}/${session.wickets}`}
        oversDisplay={session.oversDisplay}
        oversPerSide={fixture.overs}
        currentTarget={session.target}
        runsNow={session.runs}
        ballsLeft={session.ballsRemaining}
        saving={reviseSaving || endInningsSaving}
        onReviseTarget={({ target, then }) => {
          void reviseTargetMutation({
            reviseTarget,
            matchId,
            target,
            then,
            onSuccess: () => setStateSheet(null),
          });
        }}
        onEndInnings={({ reason, comments, pointsAwardedEach }) => {
          void endInningsMutation({
            endInnings,
            matchId,
            inningsId: session.inningsId,
            reason,
            comments,
            pointsAwardedEach,
            onSuccess: () => setStateSheet(null),
          });
        }}
      />

      {fixture.home && fixture.away ? (
        <DeclareResultSheet
          open={declareResultOpen}
          onOpenChange={setDeclareResultOpen}
          home={{ id: fixture.home.id, short: fixture.home.short, name: fixture.home.name }}
          away={{ id: fixture.away.id, short: fixture.away.short, name: fixture.away.name }}
          saving={declareResultSaving}
          onConfirm={({ declareResultType, winnerTeamId, declareResultNote }) => {
            void declareResultMutation({
              declareResult,
              matchId,
              declareResultType,
              winnerTeamId,
              declareResultNote,
              onSuccess: () => setDeclareResultOpen(false),
            });
          }}
        />
      ) : null}

      <AdminActionSheet
        action={adminSheet}
        onOpenChange={(next) => {
          if (!next) setAdminSheet(null);
        }}
        matchId={matchId}
        inningsId={session.inningsId}
        bowlingTeamId={session.bowlingTeamId}
        battingShort={batting?.short ?? 'BAT'}
        fieldingPlayers={bowlers}
        currentBowlerId={session.bowler?.id ?? null}
        batsmenOnCrease={[session.striker, session.nonStriker]
          .filter((b): b is NonNullable<typeof b> => b != null)
          .map((b) => ({ id: b.id, name: b.name }))}
        eligibleSubstitutes={eligibleAdminSubstitutes(
          batters,
          session.striker?.id,
          session.nonStriker?.id,
          battingStats
        )}
        oversPerSide={fixture.overs}
        playersPerSide={fixture.playersPerSide}
      />

      <EndMatchSheet
        open={endMatchOpen}
        onOpenChange={setEndMatchOpen}
        oversDisplay={session.oversDisplay}
        saving={endMatchSaving}
        onConfirm={({ cancelReason, cancelComments, cancelPointsAwardedEach }) => {
          void endMatchMutation({
            endMatch,
            matchId,
            cancelReason,
            cancelComments,
            cancelPointsAwardedEach,
            onSuccess: () => {
              setEndMatchOpen(false);
              onMatchCancelled();
            },
          });
        }}
      />
    </>
  );
}
