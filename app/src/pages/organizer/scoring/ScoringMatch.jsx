/**
 * ScoringMatch – live scoring page (backend-first).
 *
 * Data fetching:  useScoringMatchData  (RTK Query + derived config)
 * Lifecycle:      useInningsLifecycle  (toss, innings-end, MOTM, crease sync)
 * Tab routing:    URL ?tab= param → active view component
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { ScoringMatchHeader } from '@/components/scoring/ScoringMatchHeader';
import { WagonWheelIcon } from '@/components/scoring/WagonWheelIcon';
import { useDialog } from '@/context/DialogContext';
import { ScoringMatchContext } from '@/context/ScoringMatchContext';
import { useInningsLifecycle } from '@/hooks/useInningsLifecycle';
import { useMatchScoringChannel } from '@/hooks/useMatchScoringChannel';
import { useScoringMatchData } from '@/hooks/useScoringMatchData';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { NAVBAR_HEIGHT, STICKY_TABS_Z } from '@/lib/constants/layout';
import { computeMatchResultSummary } from '@/lib/utils/scoringUtils';
import { useUpdateMatchAnalyticsSettingsMutation } from '@/store/api/matchApi';
import { Container } from '@/ui/Container';
import { scorecardListClass, scorecardTriggerClass, Tabs, TabsList, TabsTrigger } from '@/ui/Tabs';

import { BallsTab, InfoTab, PartnershipTab, ScorecardTab, ScoringTab, StatsTab } from './scoring-tabs';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCORING_TABS = [
  { value: 'scoring', label: 'Scoring' },
  { value: 'scorecard', label: 'Scorecard' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'stats', label: 'Stats' },
  { value: 'balls', label: 'Balls' },
  { value: 'info', label: 'Info' },
];
const VALID_TABS = SCORING_TABS.map((t) => t.value);
const TAB_VIEWS = {
  balls: BallsTab,
  info: InfoTab,
  partnership: PartnershipTab,
  scorecard: ScorecardTab,
  scoring: ScoringTab,
  stats: StatsTab,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScoringMatch() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const { dialogKey, openDialog } = useDialog();
  const toast = useToast();
  const [updateAnalyticsSettings] = useUpdateMatchAnalyticsSettingsMutation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'scoring';
  const [tabsFixedVisible, setTabsFixedVisible] = useState(false);
  const tabsSentinelRef = useRef(null);
  const openActionMenuRef = useRef(null);
  const pendingOpenActionMenuRef = useRef(false);

  // ── Server data ────────────────────────────────────────────────────────────

  const {
    apiMatch,
    matchLoading,
    matchError,
    scorecard,
    matchState,
    match,
    homeTeamId,
    awayTeamId,
    wagonWheelEnabled,
    innings1Id,
    innings2Id,
    matchComplete,
  } = useScoringMatchData(matchId);

  // ── Innings lifecycle ──────────────────────────────────────────────────────

  const { currentInnings, isInnings2, requestInningsEndUI, onMatchEnded, onMatchDeclared, onTargetRevisionEnded } =
    useInningsLifecycle({
      matchId,
      apiMatch,
      match,
      matchState,
      scorecard,
      dialogKey,
      openDialog,
      homeTeamId,
      awayTeamId,
      navigate,
    });

  useMatchScoringChannel(matchId);

  useEffect(() => {
    const sentinel = tabsSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setTabsFixedVisible(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: `-${NAVBAR_HEIGHT}px 0px 0px 0px`,
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // ── Header actions ─────────────────────────────────────────────────────────

  const handleWagonWheelToggle = useCallback(() => {
    if (!matchId) return;

    const enabling = !wagonWheelEnabled;
    openDialog('confirm', {
      title: enabling ? 'Enable Wagon Wheel?' : 'Disable Wagon Wheel?',
      message: enabling
        ? 'You will be prompted to pick shot direction after scoring runs.'
        : 'Shot direction prompts will no longer appear during scoring.',
      confirmLabel: enabling ? 'Enable' : 'Disable',
      onConfirm: async () => {
        try {
          await updateAnalyticsSettings({ matchId, wagon_wheel_enabled: enabling }).unwrap();
        } catch (err) {
          toast.error(getApiErrorMessage(err, 'Could not update wagon wheel setting. Please try again.'));
          throw err;
        }
      },
    });
  }, [matchId, wagonWheelEnabled, openDialog, updateAnalyticsSettings, toast]);

  const registerOpenActionMenu = useCallback((openFn) => {
    openActionMenuRef.current = openFn ?? null;
    if (openFn && pendingOpenActionMenuRef.current) {
      pendingOpenActionMenuRef.current = false;
      openFn();
    }
  }, []);

  const handleOpenActionMenu = useCallback(() => {
    if (activeTab !== 'scoring') {
      pendingOpenActionMenuRef.current = true;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('tab', 'scoring');
          return next;
        },
        { replace: true },
      );
      return;
    }
    openActionMenuRef.current?.();
  }, [activeTab, setSearchParams]);

  const headerTrailingActions = useMemo(() => {
    if (!matchId || matchLoading || matchError) return null;
    return (
      <>
        <button
          type="button"
          onClick={handleWagonWheelToggle}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-80 ${
            wagonWheelEnabled ? 'bg-brand text-[#1A1A18]' : 'bg-white text-[#1A1A18]'
          }`}
          aria-label={wagonWheelEnabled ? 'Wagon wheel enabled' : 'Enable wagon wheel'}
          aria-pressed={wagonWheelEnabled}
        >
          <WagonWheelIcon size={16} />
        </button>
        <button
          type="button"
          onClick={handleOpenActionMenu}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#1A1A18] transition-opacity active:opacity-80"
          aria-label="Open scoring actions"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="7" cy="7" r="1.75" />
            <circle cx="12" cy="7" r="1.75" />
            <circle cx="17" cy="7" r="1.75" />
            <circle cx="7" cy="12" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="17" cy="12" r="1.75" />
            <circle cx="7" cy="17" r="1.75" />
            <circle cx="12" cy="17" r="1.75" />
            <circle cx="17" cy="17" r="1.75" />
          </svg>
        </button>
      </>
    );
  }, [matchId, matchLoading, matchError, handleOpenActionMenu, handleWagonWheelToggle, wagonWheelEnabled]);

  const ActiveView = TAB_VIEWS[activeTab];

  const onNavigateToTab = useCallback(
    (tab) => {
      if (!VALID_TABS.includes(tab)) return;
      setSearchParams(
        (prev) => {
          const n = new URLSearchParams(prev);
          n.set('tab', tab);
          return n;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const scorecardLiveScore = useMemo(() => {
    const inn = (idx) => scorecard?.innings?.[idx];
    const extrasTotal = (e) =>
      (e?.wides ?? 0) + (e?.no_balls ?? 0) + (e?.byes ?? 0) + (e?.leg_byes ?? 0) + (e?.penalty_runs ?? 0);
    return {
      innings1: inn(0)
        ? { totalRuns: inn(0).total_runs ?? 0, totalWickets: inn(0).total_wickets ?? 0, extras: extrasTotal(inn(0).extras) }
        : null,
      innings2: inn(1)
        ? { totalRuns: inn(1).total_runs ?? 0, totalWickets: inn(1).total_wickets ?? 0, extras: extrasTotal(inn(1).extras) }
        : null,
    };
  }, [scorecard?.innings]);

  // ── Context value ─────────────────────────────────────────────────────────

  const scoringMatchContextValue = useMemo(
    () => ({
      matchId,
      match,
      matchComplete,
      wagonWheelEnabled,
      innings1Id,
      innings2Id,
    }),
    [matchId, match, matchComplete, wagonWheelEnabled, innings1Id, innings2Id],
  );

  // ── Scoring tab props ──────────────────────────────────────────────────────

  const scoringProps = useMemo(() => {
    const battingTeamId = isInnings2
      ? (scorecard?.innings?.[1]?.batting_team_id ?? match?.teamB?.id ?? awayTeamId)
      : (scorecard?.innings?.[0]?.batting_team_id ?? match?.teamA?.id ?? homeTeamId);
    const bowlingTeamId = isInnings2
      ? (scorecard?.innings?.[1]?.bowling_team_id ?? match?.teamA?.id ?? homeTeamId)
      : (scorecard?.innings?.[0]?.bowling_team_id ?? match?.teamB?.id ?? awayTeamId);
    return {
      inningsNumber: currentInnings,
      battingTeamName: isInnings2 ? match?.teamB?.name || '' : match?.teamA?.name || '',
      battingTeamLogo: isInnings2 ? (match?.teamB?.logo ?? null) : (match?.teamA?.logo ?? null),
      bowlingTeamName: isInnings2 ? match?.teamA?.name || '' : match?.teamB?.name || '',
      bowlingTeamLogo: isInnings2 ? (match?.teamA?.logo ?? null) : (match?.teamB?.logo ?? null),
      battingTeamId,
      bowlingTeamId,
      onInningsComplete: requestInningsEndUI,
      onMatchEnded,
      onMatchDeclared,
      onTargetRevisionEnded,
      registerOpenActionMenu,
    };
  }, [
    currentInnings,
    isInnings2,
    match,
    scorecard,
    homeTeamId,
    awayTeamId,
    requestInningsEndUI,
    onMatchEnded,
    onMatchDeclared,
    onTargetRevisionEnded,
    registerOpenActionMenu,
  ]);

  const tabViewProps = activeTab === 'scoring' ? scoringProps : {};

  const tabsContent = (
    <TabsList className={`${scorecardListClass} lg:justify-center lg:overflow-x-visible`}>
      {SCORING_TABS.map(({ value, label }) => (
        <TabsTrigger key={value} value={value} className={scorecardTriggerClass}>
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ScoringMatchContext.Provider value={scoringMatchContextValue}>
      <div className="bg-black">
        <ScoringMatchHeader onBack={() => navigate(-1)} trailing={headerTrailingActions} />

        <Container className="!px-4 !py-0">
          <Tabs value={activeTab} onValueChange={onNavigateToTab} className="w-full">
            <div className="flex flex-col">
              <div ref={tabsSentinelRef} className="h-px w-full" aria-hidden />
              <div className="-mx-4 bg-black px-4 pt-0.5 pb-2">{tabsContent}</div>
            </div>

            {tabsFixedVisible ? (
              <div
                className="fixed right-0 left-0 bg-black pt-1 pb-2 lg:left-[280px]"
                style={{ top: NAVBAR_HEIGHT, zIndex: STICKY_TABS_Z }}
              >
                <div className="mx-auto w-full max-w-2xl min-w-0 px-4 lg:mx-0 lg:max-w-none">{tabsContent}</div>
              </div>
            ) : null}

            <div className="-mx-4 bg-black px-4 pb-2">
              {matchLoading && (
                <div className="text-muted flex min-h-[200px] items-center justify-center py-8 text-[14px]">Loading match…</div>
              )}
              {matchError && (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-8 text-center">
                  <p className="text-[14px] text-red-400">Failed to load match.</p>
                  <button type="button" onClick={() => navigate(-1)} className="text-brand text-[14px] font-medium underline">
                    Go back
                  </button>
                </div>
              )}
              {matchComplete && !matchLoading && !matchError && (
                <MatchResultBanner
                  match={match}
                  liveScore1={scorecardLiveScore.innings1}
                  liveScore2={scorecardLiveScore.innings2}
                  playerOfMatch={apiMatch?.player_of_match ?? null}
                  serverResultSummary={apiMatch?.result_summary ?? null}
                />
              )}
              {!matchLoading && !matchError && <ActiveView {...tabViewProps} />}
            </div>
          </Tabs>
        </Container>
      </div>
    </ScoringMatchContext.Provider>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MatchResultBanner({ match, liveScore1, liveScore2, playerOfMatch, serverResultSummary }) {
  const s = serverResultSummary
    ? {
        tie: /^tie$/i.test(String(serverResultSummary).trim()),
        titleLine: serverResultSummary,
        marginLine: null,
        detailLine: null,
      }
    : computeMatchResultSummary(match, liveScore1, liveScore2);

  return (
    <div className="bg-surface mb-6 rounded-[17px] p-8 text-center">
      <p className="text-brand text-[12px] font-bold tracking-wide uppercase">Match Complete</p>
      <p className="mt-3 text-[18px] font-bold text-white capitalize">
        {s.tie ? s.titleLine : `${s.titleLine} ${s.marginLine ?? ''}`}
      </p>
      {s.tie && s.detailLine ? <p className="text-muted mt-2 text-[13px]">{s.detailLine}</p> : null}
      {playerOfMatch?.name ? (
        <>
          <p className="text-brand mt-6 text-[12px] font-bold tracking-wide uppercase">Man of the match</p>
          <p className="mt-3 text-[16px] font-bold text-white capitalize">{playerOfMatch.name}</p>
        </>
      ) : null}
    </div>
  );
}
