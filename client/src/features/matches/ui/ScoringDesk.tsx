import { useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { IconButton } from '@/shared/ui/IconButton';
import { MoreIcon } from '@/shared/ui/icons';
import { ErrorState } from '@/shared/ui/states';
import { Tabs, TabsContent } from '@/shared/ui/Tabs';

import { deleteLoggedBall, saveEditedBall } from '../lib/ballLogMutations';
import { type EditBallFormPatch } from '../lib/editBallPayload';
import { isScoreTab, setScoreTab } from '../lib/scoreTabs';
import { deriveChaseView, deriveOverView } from '../lib/scoringDeskDerived';
import { deriveScoringDeskLayout } from '../lib/scoringDeskLayout';
import { useStoreBallSubmit } from '../lib/useStoreBallSubmit';
import { matchRoutes } from '../routes';
import { type MatchAdminAction } from './MatchActionMenu';
import { MatchMoreSheet } from './MatchMoreSheet';
import { MatchOverScreen } from './MatchOverScreen';
import { MatchScoreSkeleton } from './MatchScoreSkeleton';
import { ScoringDeskBallSheets } from './ScoringDeskBallSheets';
import { ScoringDeskChrome } from './ScoringDeskChrome';
import { ScoringDeskLifecycleSheets } from './ScoringDeskLifecycleSheets';
import { ScoringDeskSecondaryTabs } from './ScoringDeskSecondaryTabs';
import { ScoringDeskTabBar } from './ScoringDeskTabBar';
import { ScoringPadExtrasSheets } from './ScoringPadExtrasSheets';
import { ScoringPadTabContent } from './ScoringPadTabContent';
import { usePadExtrasFlow } from './usePadExtrasFlow';
import { useScoringDeskApi } from './useScoringDeskApi';
import { useScoringDeskConnection } from './useScoringDeskConnection';
import { useScoringDeskPanelData } from './useScoringDeskPanelData';
import { useScoringDeskSheetsState } from './useScoringDeskSheetsState';
import { useWicketFlow } from './useWicketFlow';

export function ScoringDesk({ matchId }: { matchId: number }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const savingRef = useRef(false);

  const api = useScoringDeskApi(matchId);
  const sheets = useScoringDeskSheetsState();
  const { wicketOpen, wicketFromExtra, openWicket, onWicketOpenChange, confirmWicket } = useWicketFlow();

  const tabParam = searchParams.get('tab');
  const tab = isScoreTab(tabParam) ? tabParam : 'pad';

  const fixture = api.fixtureQuery.data;
  const session = api.stateQuery.data;

  const panels = useScoringDeskPanelData({
    fixture,
    session,
    scorecard: api.scorecardQuery.data,
  });

  const { conn, queueConflict, enqueueBall } = useScoringDeskConnection({
    matchId,
    storeBall: api.storeBall,
    oversDisplay: session?.oversDisplay ?? null,
    runs: session?.runs ?? 0,
    wickets: session?.wickets ?? 0,
    setSearchParams,
    refetchState: () => void api.stateQuery.refetch(),
    refetchScorecard: () => void api.scorecardQuery.refetch(),
  });

  const lastBallInn = Math.max(0, panels.ballLogInnings.length - 1);
  const safeInnIndex = sheets.pickedBallInn == null ? lastBallInn : Math.min(sheets.pickedBallInn, lastBallInn);

  const submit = useStoreBallSubmit({
    matchId,
    session,
    fixture,
    queueConflict,
    savingRef,
    storeBall: api.storeBall,
    enqueueBall,
    onWicketSummary: sheets.onWicketSummary,
  });

  const extras = usePadExtrasFlow({
    submit,
    openWicket,
    wagonWheelEnabled: Boolean(session?.wagonWheelEnabled),
    strikerId: session?.striker?.id,
    noBallTypes: api.noBallTypes,
    noBallRunsTypes: api.noBallRunsTypes,
  });

  async function handleEditSave(patch: EditBallFormPatch) {
    if (!sheets.editing) return;
    await saveEditedBall({
      matchId,
      inningsId: sheets.editing.inningsId,
      entry: sheets.editing.entry,
      patch,
      updateBall: api.updateBall,
      onSuccess: () => sheets.setEditing(null),
    });
  }

  async function handleDelete(
    inningsId: number,
    entry: Parameters<typeof deleteLoggedBall>[0]['entry'],
    overNo: number
  ) {
    await deleteLoggedBall({
      matchId,
      inningsId,
      entry,
      overNo,
      deleteBall: api.deleteBall,
    });
  }

  if (api.stateQuery.isLoading || !fixture || !session) {
    return <MatchScoreSkeleton />;
  }

  if (api.stateQuery.isError) {
    return (
      <div className="px-4 py-8">
        <ErrorState title="Couldn't Load the Score" onRetry={() => void api.stateQuery.refetch()} />
      </div>
    );
  }

  if (session.matchComplete || fixture.status === 'completed') {
    const overInnings = panels.scorecardFaces
      .filter((face) => face.battingSide != null)
      .map((face) => ({
        side: face.battingSide as 'home' | 'away',
        short: face.sideShort ?? (face.battingSide === 'away' ? fixture.away?.short : fixture.home?.short) ?? '—',
        runs: face.runs,
        wickets: face.wickets,
        overs: face.overs,
      }));

    return (
      <MatchOverScreen
        matchId={matchId}
        resultSummary={session.resultSummary ?? fixture.resultSummary ?? api.resultQuery.data?.resultSummary ?? null}
        homeShort={fixture.home?.short ?? 'Home'}
        awayShort={fixture.away?.short ?? 'Away'}
        homeXi={session.homeXi}
        awayXi={session.awayXi}
        canOperate={fixture.canOperate}
        existingMotmName={api.resultQuery.data?.motmName}
        innings={overInnings}
        subtitle={fixture.overs != null ? `${fixture.overs} OVERS` : null}
      />
    );
  }

  const layout = deriveScoringDeskLayout({
    session,
    fixture,
    tab,
    summaryOpen: sheets.summaryOpen,
    declareOpen: sheets.declareOpen,
    creaseOpen: sheets.creaseOpen,
    connectionState: conn.state,
  });

  const { overBalls, overNum, legalBallsInOver, freeHitBall, lastSix } = deriveOverView(session);
  const chase = deriveChaseView(session);

  const onAdminAction = (code: MatchAdminAction) => {
    sheets.handleAdminAction(code, () => extras.setPenaltyOpen(true));
  };

  return (
    <div className="bg-surface flex h-full min-h-0 flex-col">
      <ScoringDeskChrome
        home={fixture.home}
        away={fixture.away}
        batting={layout.batting}
        inningsNumber={session.inningsNumber}
        runs={session.runs}
        wickets={session.wickets}
        oversDisplay={session.oversDisplay}
        oversPerSide={fixture.overs}
        venue={fixture.venue}
        currentRunRate={session.currentRunRate}
        overTokens={overBalls}
        chase={chase}
        connection={conn.state}
        lastSent={conn.lastSent}
        queued={conn.queued}
        crowdScore={conn.crowdScore}
        serverOvers={conn.serverOvers}
        localOvers={conn.localOvers ?? session.oversDisplay}
        conflictSince={conn.conflictSince}
        onBack={() => navigate(matchRoutes.list())}
        onDiscard={conn.onDiscard}
        onReview={conn.onReview}
        action={
          fixture.canOperate ? (
            <IconButton
              label="Action"
              size="lg"
              variant="ghost"
              onClick={() => sheets.setActionMenuOpen(true)}
              className="focus-visible:outline-ink text-body hover:text-ink -mr-2.5"
            >
              <MoreIcon size="lg" className="h-5 w-5" strokeWidth={2.6} />
            </IconButton>
          ) : null
        }
      />

      <Tabs
        value={tab}
        onValueChange={(next) => {
          setScoreTab(setSearchParams, isScoreTab(next) ? next : 'pad');
        }}
        className="mt-3 flex min-h-0 flex-1 flex-col"
      >
        <ScoringDeskTabBar onOpenMore={() => sheets.setMoreOpen(true)} />

        <TabsContent value="pad" className="mt-3 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
          <ScoringPadTabContent
            canOperate={fixture.canOperate}
            settingFirstBall={layout.settingFirstBall}
            needDeclareXi={layout.needDeclareXi}
            creaseNeeds={layout.creaseNeeds}
            battersDone={layout.battersDone}
            battersCount={layout.batters.length}
            playersPerSide={layout.playersPerSide}
            batting={layout.batting}
            fielding={layout.fielding}
            session={session}
            chase={chase}
            lastSix={lastSix}
            overNum={overNum}
            overBalls={overBalls}
            ready={layout.ready}
            lockNote={layout.lockNote}
            saving={api.saving}
            freeHitBall={freeHitBall}
            legalBallsInOver={legalBallsInOver}
            canUndo={layout.canUndo}
            connectionStale={conn.state === 'stale'}
            matchId={matchId}
            savingRef={savingRef}
            deleteLastBall={api.deleteLastBall}
            onDeclareXi={() => sheets.setDeclareOpen(true)}
            onOpenCrease={() => sheets.setCreaseOpen(true)}
            onRuns={extras.onRuns}
            onExtra={extras.onExtra}
            onWicket={() => openWicket(null)}
            onOverflowAction={extras.onOverflowAction}
          />
        </TabsContent>

        <ScoringDeskSecondaryTabs
          matchId={matchId}
          fixture={fixture}
          scorecardFaces={panels.scorecardFaces}
          ballLogInnings={panels.ballLogInnings}
          partnershipInnings={panels.partnershipInnings}
          statsInnings={panels.statsInnings}
          safeInnIndex={safeInnIndex}
          setPickedBallInn={sheets.setPickedBallInn}
          scorecardLoading={api.scorecardQuery.isLoading}
          scorecardError={api.scorecardQuery.isError}
          onRetryScorecard={() => void api.scorecardQuery.refetch()}
          onEditBall={(inningsId, entry, overNo) => sheets.setEditing({ inningsId, entry, overNo })}
          onDeleteBall={(inningsId, entry, overNo) => void handleDelete(inningsId, entry, overNo)}
        />
      </Tabs>

      <MatchMoreSheet
        open={sheets.moreOpen}
        onOpenChange={sheets.setMoreOpen}
        matchId={matchId}
        canOperate={fixture.canOperate}
        onSelectTab={(id) => setScoreTab(setSearchParams, id)}
      />

      <ScoringPadExtrasSheets extras={extras} submit={submit} strikerName={session.striker?.name ?? null} />

      <ScoringDeskBallSheets
        matchId={matchId}
        inningsId={session.inningsId}
        freeHit={session.freeHit}
        overNumber={session.overNumber}
        ballsInOver={session.ballsInOver}
        striker={session.striker}
        nonStriker={session.nonStriker}
        bowlerName={session.bowler?.name ?? null}
        fielders={layout.bowlers}
        wicketOpen={wicketOpen}
        wicketFromExtra={wicketFromExtra}
        onWicketOpenChange={onWicketOpenChange}
        confirmWicket={confirmWicket}
        submit={submit}
        summaryOpen={sheets.summaryOpen}
        summaryModel={sheets.summaryModel}
        undoing={api.undoState.isLoading}
        savingRef={savingRef}
        deleteLastBall={api.deleteLastBall}
        onSummaryClosed={sheets.closeSummary}
        onSummaryProceed={sheets.proceedAfterWicket}
        editing={sheets.editing}
        setEditing={sheets.setEditing}
        onEditSave={handleEditSave}
        editSaving={api.updateBallState.isLoading || api.deleteBallState.isLoading}
      />

      <ScoringDeskLifecycleSheets
        matchId={matchId}
        fixture={fixture}
        session={session}
        creaseNeeds={layout.creaseNeeds}
        showCreaseDialog={layout.showCreaseDialog}
        settingFirstBall={layout.settingFirstBall}
        batters={layout.batters}
        bowlers={layout.bowlers}
        batting={layout.batting}
        fielding={layout.fielding}
        stays={layout.stays}
        staysOnStrike={layout.staysOnStrike}
        playersPerSide={layout.playersPerSide}
        battingSideKey={layout.battingSideKey}
        battingStats={api.scorecardQuery.data?.innings.find((inn) => inn.id === session.inningsId)?.batting_stats}
        creaseSaving={api.creaseState.isLoading}
        reviseSaving={api.reviseTargetState.isLoading}
        endInningsSaving={api.endInningsState.isLoading}
        declareResultSaving={api.declareResultState.isLoading}
        endMatchSaving={api.endMatchState.isLoading}
        declareOpen={sheets.declareOpen}
        setDeclareOpen={sheets.setDeclareOpen}
        actionMenuOpen={sheets.actionMenuOpen}
        setActionMenuOpen={sheets.setActionMenuOpen}
        stateSheet={sheets.stateSheet}
        setStateSheet={sheets.setStateSheet}
        adminSheet={sheets.adminSheet}
        setAdminSheet={sheets.setAdminSheet}
        declareResultOpen={sheets.declareResultOpen}
        setDeclareResultOpen={sheets.setDeclareResultOpen}
        endMatchOpen={sheets.endMatchOpen}
        setEndMatchOpen={sheets.setEndMatchOpen}
        setCreaseOpen={sheets.setCreaseOpen}
        onAdminAction={onAdminAction}
        updateCrease={api.updateCrease}
        reviseTarget={api.reviseTarget}
        endInnings={api.endInnings}
        declareResult={api.declareResult}
        endMatch={api.endMatch}
        onMatchCancelled={() => navigate(matchRoutes.list())}
      />
    </div>
  );
}
