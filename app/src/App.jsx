import { lazy, Suspense } from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import DialogManager from '@/components/dialogs/DialogManager';
import { ProfileStrengthReminderScheduler } from '@/components/ProfileStrengthReminderScheduler';
import { RequireAuth } from '@/components/RequireAuth';
// import { RequireOrganizerRole } from '@/components/RequireOrganizerRole';
import { ReverbNotificationListener } from '@/components/ReverbNotificationListener';
import { ScrollRestoration } from '@/components/ScrollRestoration';
import SplashScreen from '@/components/SplashScreen';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { Toaster } from '@/ui/Toast';
import { TooltipProvider } from '@/ui/Tooltip';

// ── Route-level code splitting ─────────────────────────────────────────────────
// Every page below is loaded only when its route is first visited.
// The main bundle ships only the shell: layouts, providers, and SplashScreen.

// Auth
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Otp = lazy(() => import('@/pages/auth/Otp'));

// Core
const Home = lazy(() => import('@/pages/Home'));
const Profile = lazy(() => import('@/pages/Profile'));
const StaticPage = lazy(() => import('@/pages/StaticPage'));
const Support = lazy(() => import('@/pages/Support'));
const NotificationCenter = lazy(() => import('@/pages/NotificationCenter'));
const TournamentRequest = lazy(() => import('@/pages/TournamentRequest'));
const TournamentRequestSuccess = lazy(
  () => import('@/pages/TournamentRequestSuccess'),
);

// Drafting
const DraftingHome = lazy(() => import('@/pages/drafting/DraftingHome'));
const AddTeam = lazy(() => import('@/pages/drafting/AddTeam'));
const TeamList = lazy(() => import('@/pages/drafting/TeamList'));
const TeamDetail = lazy(() => import('@/pages/drafting/TeamDetail'));

// Feed
const ActivityFeed = lazy(() => import('@/pages/feed/ActivityFeed'));
const ActivityFeedDetail = lazy(
  () => import('@/pages/feed/ActivityFeedDetail'),
);

// Pricing
const Pricing = lazy(() => import('@/pages/pricing/Pricing'));
const PricingDetail = lazy(() => import('@/pages/pricing/PricingDetail'));

// Ranking
const Ranking = lazy(() => import('@/pages/ranking/Ranking'));
const RankingStatsTotal = lazy(
  () => import('@/pages/ranking/RankingStatsTotal'),
);

// Reels
const Reels = lazy(() => import('@/pages/reels/Reels'));
const UploadReels = lazy(() => import('@/pages/reels/UploadReels'));

// Scorecard
const ScorecardHome = lazy(() => import('@/pages/scorecard/ScorecardHome'));
const ScorecardDetails = lazy(
  () => import('@/pages/scorecard/ScorecardDetails'),
);
const ScorecardStatusDetails = lazy(
  () => import('@/pages/scorecard/ScorecardStatusDetails'),
);
const StatsTotal = lazy(() => import('@/pages/scorecard/StatsTotal'));

// Shop
const ShopHome = lazy(() => import('@/pages/shop/ShopHome'));
const ShopCart = lazy(() => import('@/pages/shop/ShopCart'));
const ShopCheckout = lazy(() => import('@/pages/shop/ShopCheckout'));
const ShopCategory = lazy(() => import('@/pages/shop/ShopCategory'));
const ShopFilter = lazy(() => import('@/pages/shop/ShopFilter'));
const ShopProductDetail = lazy(() => import('@/pages/shop/ShopProductDetail'));
const MyOrders = lazy(() => import('@/pages/shop/MyOrders'));
const OrderDetail = lazy(() => import('@/pages/shop/OrderDetail'));
const OrderPayment = lazy(() => import('@/pages/shop/OrderPayment'));
const OrderSuccess = lazy(() => import('@/pages/shop/OrderSuccess'));

// Upcoming Tournaments
const UpcomingTournaments = lazy(
  () => import('@/pages/upcoming-tournaments/UpcomingTournaments'),
);
const UpcomingTournamentDetails = lazy(
  () => import('@/pages/upcoming-tournaments/UpcomingTournamentDetails'),
);

// Organizer
const Tournaments = lazy(
  () => import('@/pages/organizer/tournaments/Tournaments'),
);
const TournamentCreateTeamIntro = lazy(
  () => import('@/pages/organizer/tournaments/TournamentCreateTeamIntro'),
);
const TournamentAddTeam = lazy(
  () => import('@/pages/organizer/tournaments/TournamentAddTeam'),
);
const TournamentSavedTeams = lazy(
  () => import('@/pages/organizer/tournaments/TournamentSavedTeams'),
);
const TournamentAddSquad = lazy(
  () => import('@/pages/organizer/tournaments/TournamentAddSquad'),
);
const TournamentSquad = lazy(
  () => import('@/pages/organizer/tournaments/TournamentSquad'),
);
const StartMatch = lazy(() => import('@/pages/organizer/scoring/StartMatch'));
const ScoringMatch = lazy(
  () => import('@/pages/organizer/scoring/ScoringMatch'),
);

// Graphics controller — used only by operators; loaded as separate async chunks
const TournamentStart = lazy(
  () => import('@/pages/graphics-controller/theme01/TournamentStart'),
);
const PlayingXI = lazy(
  () => import('@/pages/graphics-controller/theme01/PlayingXI'),
);
const Four = lazy(() => import('@/pages/graphics-controller/theme01/Four'));
const FourRow = lazy(
  () => import('@/pages/graphics-controller/theme01/FourRow'),
);
const Six = lazy(() => import('@/pages/graphics-controller/theme01/Six'));
const SixRow = lazy(() => import('@/pages/graphics-controller/theme01/SixRow'));
const Out = lazy(() => import('@/pages/graphics-controller/theme01/Out'));
const NotOut = lazy(() => import('@/pages/graphics-controller/theme01/NotOut'));
const NotOutRow = lazy(
  () => import('@/pages/graphics-controller/theme01/NotOutRow'),
);
const NoBall = lazy(() => import('@/pages/graphics-controller/theme01/NoBall'));
const NoBallRow = lazy(
  () => import('@/pages/graphics-controller/theme01/NoBallRow'),
);
const Wide = lazy(() => import('@/pages/graphics-controller/theme01/Wide'));
const WideRow = lazy(
  () => import('@/pages/graphics-controller/theme01/WideRow'),
);
const Fifty = lazy(() => import('@/pages/graphics-controller/theme01/Fifty'));
const FiftyRow = lazy(
  () => import('@/pages/graphics-controller/theme01/FiftyRow'),
);
const Hundred = lazy(
  () => import('@/pages/graphics-controller/theme01/Hundred'),
);
const HundredRow = lazy(
  () => import('@/pages/graphics-controller/theme01/HundredRow'),
);
const WicketRow = lazy(
  () => import('@/pages/graphics-controller/theme01/WicketRow'),
);
const InningsBreak = lazy(
  () => import('@/pages/graphics-controller/theme01/InningsBreak'),
);
const TeaBreak = lazy(
  () => import('@/pages/graphics-controller/theme01/TeaBreak'),
);
const Toss = lazy(() => import('@/pages/graphics-controller/theme01/Toss'));
const TournamentIntro = lazy(
  () => import('@/pages/graphics-controller/theme01/TournamentIntro'),
);
const TournamentOverview = lazy(
  () => import('@/pages/graphics-controller/theme01/TournamentOverview'),
);
const TournamentOver = lazy(
  () => import('@/pages/graphics-controller/theme01/TournamentOver'),
);
const TargetNeeded = lazy(
  () => import('@/pages/graphics-controller/theme01/TargetNeeded'),
);
const StatsDefault = lazy(
  () => import('@/pages/graphics-controller/theme01/StatsDefault'),
);
const AtThisStage = lazy(
  () => import('@/pages/graphics-controller/theme01/AtThisStage'),
);
const RunRate = lazy(
  () => import('@/pages/graphics-controller/theme01/RunRate'),
);
const WinPredictor = lazy(
  () => import('@/pages/graphics-controller/theme01/WinPredictor'),
);
const CurrentPartnership = lazy(
  () => import('@/pages/graphics-controller/theme01/CurrentPartnership'),
);
const LastBalls = lazy(
  () => import('@/pages/graphics-controller/theme01/LastBalls'),
);
const PreviousOrder = lazy(
  () => import('@/pages/graphics-controller/theme01/PreviousOrder'),
);
const FallofWickets = lazy(
  () => import('@/pages/graphics-controller/theme01/FallofWickets'),
);
const Replay = lazy(() => import('@/pages/graphics-controller/theme01/Replay'));
const ReplayRow = lazy(
  () => import('@/pages/graphics-controller/theme01/ReplayRow'),
);
const DecisionPending = lazy(
  () => import('@/pages/graphics-controller/theme01/DecisionPending'),
);
const DecisionPendingRow = lazy(
  () => import('@/pages/graphics-controller/theme01/DecisionPendingRow'),
);
const ScoreComparison = lazy(
  () => import('@/pages/graphics-controller/theme01/ScoreComparison'),
);
const ScoreComparisonBar = lazy(
  () => import('@/pages/graphics-controller/theme01/ScoreComparisonBar'),
);
const HighestRuns = lazy(
  () => import('@/pages/graphics-controller/theme01/HighestRuns'),
);
const HighestWickets = lazy(
  () => import('@/pages/graphics-controller/theme01/HighestWickets'),
);
const PlayerIntro = lazy(
  () => import('@/pages/graphics-controller/theme01/PlayerIntro'),
);
const PlayerTournamentStats = lazy(
  () => import('@/pages/graphics-controller/theme01/PlayerTournamentStats'),
);
const PlayerCareerStats = lazy(
  () => import('@/pages/graphics-controller/theme01/PlayerCareerStats'),
);
const ResultIntro = lazy(
  () => import('@/pages/graphics-controller/theme01/ResultIntro'),
);
const BowlerCurrentStats = lazy(
  () => import('@/pages/graphics-controller/theme01/BowlerCurrentStats'),
);
const BowlerCareerStats = lazy(
  () => import('@/pages/graphics-controller/theme01/BowlerCareerStats'),
);
const BatsmanCurrentStats = lazy(
  () => import('@/pages/graphics-controller/theme01/BatsmanCurrentStats'),
);
const BatsmanCareerStats = lazy(
  () => import('@/pages/graphics-controller/theme01/BatsmanCareerStats'),
);
const BatsmanInningsStats = lazy(
  () => import('@/pages/graphics-controller/theme01/BatsmanInningsStats'),
);
const CricketMatchSummary = lazy(
  () => import('@/pages/graphics-controller/theme01/CricketMatchSummary'),
);
const MatchSummary = lazy(
  () => import('@/pages/graphics-controller/theme01/MatchSummary'),
);

// ── Route transition fallback ──────────────────────────────────────────────────
function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
    </div>
  );
}

function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <Toaster>
        <ToastProvider>
          <BrowserRouter
            future={{
              v7_relativeSplatPath: true,
              v7_startTransition: true,
            }}
          >
            <ScrollRestoration />
            <ReverbNotificationListener />
            <DialogManager />
            <ProfileStrengthReminderScheduler />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<SplashScreen />} />
                <Route path="/pages/:slug" element={<StaticPage />} />
                <Route element={<RequireAuth />}>
                  <Route element={<MainLayout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/drafting" element={<DraftingHome />} />
                    <Route path="/drafting/add-team" element={<AddTeam />} />
                    <Route path="/drafting/teams" element={<TeamList />} />
                    <Route
                      path="/drafting/teams/:teamId"
                      element={<TeamDetail />}
                    />
                    <Route
                      path="/upcoming-tournaments"
                      element={<UpcomingTournaments />}
                    />
                    <Route
                      path="/upcoming-tournaments/:tournamentId"
                      element={<UpcomingTournamentDetails />}
                    />
                    {/* <Route element={<RequireOrganizerRole />}> */}
                    <Route
                      path="/organizer/tournaments"
                      element={<Tournaments />}
                    />
                    <Route
                      path="/organizer/tournaments/:tournamentId/create-team-intro"
                      element={<TournamentCreateTeamIntro />}
                    />
                    <Route
                      path="/organizer/tournaments/:tournamentId/add-team"
                      element={<TournamentAddTeam />}
                    />
                    <Route
                      path="/organizer/tournaments/:tournamentId/saved-teams"
                      element={<TournamentSavedTeams />}
                    />
                    <Route
                      path="/organizer/tournaments/:tournamentId/add-squad"
                      element={<TournamentAddSquad />}
                    />
                    <Route
                      path="/organizer/tournaments/:tournamentId/squad"
                      element={<TournamentSquad />}
                    />
                    {/* </Route> */}
                    <Route
                      path="/organizer/scoring/start-match"
                      element={<StartMatch />}
                    />
                    <Route
                      path="/organizer/scoring/match/:matchId"
                      element={<ScoringMatch />}
                    />
                    <Route path="/scorecard" element={<ScorecardHome />} />
                    <Route
                      path="/scorecard/:tournamentId"
                      element={<ScorecardDetails />}
                    />
                    <Route
                      path="/scorecard/:tournamentId/match/:matchId"
                      element={<ScorecardStatusDetails />}
                    />
                    <Route
                      path="/scorecard/:tournamentId/stats-total/:statType"
                      element={<StatsTotal />}
                    />
                    {/* Shop */}
                    <Route path="/shop" element={<ShopHome />} />
                    <Route path="/shop/cart" element={<ShopCart />} />
                    <Route path="/shop/checkout" element={<ShopCheckout />} />
                    <Route
                      path="/shop/order-payment/:orderId"
                      element={<OrderPayment />}
                    />
                    <Route
                      path="/shop/orders/:orderId"
                      element={<OrderDetail />}
                    />
                    <Route path="/shop/orders" element={<MyOrders />} />
                    <Route
                      path="/shop/order-success"
                      element={<OrderSuccess />}
                    />
                    <Route
                      path="/shop/:brandId/product/:productSlug"
                      element={<ShopProductDetail />}
                    />
                    <Route
                      path="/shop/filter/:filterKey"
                      element={<ShopFilter />}
                    />
                    <Route path="/shop/:brandId" element={<ShopCategory />} />
                    <Route
                      path="/tournament-request"
                      element={<TournamentRequest />}
                    />
                    <Route
                      path="/tournament-request/success"
                      element={<TournamentRequestSuccess />}
                    />
                    <Route path="/ranking" element={<Ranking />} />
                    <Route
                      path="/ranking/stats-total/:statType"
                      element={<RankingStatsTotal />}
                    />
                    <Route
                      path="/notification-center"
                      element={<NotificationCenter />}
                    />
                    <Route path="/support" element={<Support />} />
                    <Route path="/reels" element={<Reels />} />
                    <Route path="/reels/upload" element={<UploadReels />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route
                      path="/pricing/:planId"
                      element={<PricingDetail />}
                    />
                    <Route path="/feed" element={<ActivityFeed />} />
                    <Route
                      path="/feed/:postId"
                      element={<ActivityFeedDetail />}
                    />
                  </Route>
                </Route>
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/otp" element={<Otp />} />
                </Route>
                <Route
                  path="/graphics-controller/tournament-start"
                  element={<TournamentStart />}
                />
                <Route
                  path="/graphics-controller/playing-xi"
                  element={<PlayingXI />}
                />
                <Route path="/graphics-controller/four" element={<Four />} />
                <Route path="/graphics-controller/six" element={<Six />} />
                <Route path="/graphics-controller/out" element={<Out />} />
                <Route
                  path="/graphics-controller/not-out"
                  element={<NotOut />}
                />
                <Route
                  path="/graphics-controller/no-ball"
                  element={<NoBall />}
                />
                <Route path="/graphics-controller/wide" element={<Wide />} />
                <Route path="/graphics-controller/fifty" element={<Fifty />} />
                <Route
                  path="/graphics-controller/highest-runs"
                  element={<HighestRuns />}
                />
                <Route
                  path="/graphics-controller/highest-wickets"
                  element={<HighestWickets />}
                />
                <Route
                  path="/graphics-controller/hundred"
                  element={<Hundred />}
                />
                <Route
                  path="/graphics-controller/innings-break"
                  element={<InningsBreak />}
                />
                <Route
                  path="/graphics-controller/tea-break"
                  element={<TeaBreak />}
                />
                <Route path="/graphics-controller/toss" element={<Toss />} />
                <Route
                  path="/graphics-controller/tournament-intro"
                  element={<TournamentIntro />}
                />
                <Route
                  path="/graphics-controller/tournament-overview"
                  element={<TournamentOverview />}
                />
                <Route
                  path="/graphics-controller/tournament-over"
                  element={<TournamentOver />}
                />
                <Route
                  path="/graphics-controller/target-needed"
                  element={<TargetNeeded />}
                />
                <Route
                  path="/graphics-controller/stats-default"
                  element={<StatsDefault />}
                />
                <Route
                  path="/graphics-controller/at-this-stage"
                  element={<AtThisStage />}
                />
                <Route
                  path="/graphics-controller/run-rate"
                  element={<RunRate />}
                />
                <Route
                  path="/graphics-controller/win-predictor"
                  element={<WinPredictor />}
                />
                <Route
                  path="/graphics-controller/current-partnership"
                  element={<CurrentPartnership />}
                />
                <Route
                  path="/graphics-controller/last-balls"
                  element={<LastBalls />}
                />
                <Route
                  path="/graphics-controller/previous-order"
                  element={<PreviousOrder />}
                />
                <Route
                  path="/graphics-controller/fall-of-wickets"
                  element={<FallofWickets />}
                />
                <Route
                  path="/graphics-controller/four-row"
                  element={<FourRow />}
                />
                <Route
                  path="/graphics-controller/six-row"
                  element={<SixRow />}
                />
                <Route
                  path="/graphics-controller/wide-row"
                  element={<WideRow />}
                />
                <Route
                  path="/graphics-controller/no-ball-row"
                  element={<NoBallRow />}
                />
                <Route
                  path="/graphics-controller/not-out-row"
                  element={<NotOutRow />}
                />
                <Route
                  path="/graphics-controller/fifty-row"
                  element={<FiftyRow />}
                />
                <Route
                  path="/graphics-controller/hundred-row"
                  element={<HundredRow />}
                />
                <Route
                  path="/graphics-controller/wicket-row"
                  element={<WicketRow />}
                />
                <Route
                  path="/graphics-controller/replay-row"
                  element={<ReplayRow />}
                />
                <Route
                  path="/graphics-controller/decision-pending-row"
                  element={<DecisionPendingRow />}
                />
                <Route
                  path="/graphics-controller/replay"
                  element={<Replay />}
                />
                <Route
                  path="/graphics-controller/score-comparison"
                  element={<ScoreComparison />}
                />
                <Route
                  path="/graphics-controller/score-comparison-bar"
                  element={<ScoreComparisonBar />}
                />
                <Route
                  path="/graphics-controller/player-intro"
                  element={<PlayerIntro />}
                />
                <Route
                  path="/graphics-controller/player-tournament-stats"
                  element={<PlayerTournamentStats />}
                />
                <Route
                  path="/graphics-controller/result-intro"
                  element={<ResultIntro />}
                />
                <Route
                  path="/graphics-controller/player-career-stats"
                  element={<PlayerCareerStats />}
                />
                <Route
                  path="/graphics-controller/bowler-current-stats"
                  element={<BowlerCurrentStats />}
                />
                <Route
                  path="/graphics-controller/batsman-current-stats"
                  element={<BatsmanCurrentStats />}
                />
                <Route
                  path="/graphics-controller/batsman-career-stats"
                  element={<BatsmanCareerStats />}
                />
                <Route
                  path="/graphics-controller/batsman-innings-stats"
                  element={<BatsmanInningsStats />}
                />
                <Route
                  path="/graphics-controller/bowler-career-stats"
                  element={<BowlerCareerStats />}
                />
                <Route
                  path="/graphics-controller/cricket-match-summary"
                  element={<CricketMatchSummary />}
                />
                <Route
                  path="/graphics-controller/match-summary"
                  element={<MatchSummary />}
                />
                <Route
                  path="/graphics-controller/decision-pending"
                  element={<DecisionPending />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </Toaster>
    </TooltipProvider>
  );
}

export default App;
