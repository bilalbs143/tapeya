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
import Login from '@/pages/auth/Login';
import Otp from '@/pages/auth/Otp';
import Register from '@/pages/auth/Register';
import AddTeam from '@/pages/drafting/AddTeam';
import DraftingHome from '@/pages/drafting/DraftingHome';
import TeamDetail from '@/pages/drafting/TeamDetail';
import TeamList from '@/pages/drafting/TeamList';
import ActivityFeed from '@/pages/feed/ActivityFeed';
import ActivityFeedDetail from '@/pages/feed/ActivityFeedDetail';
import AtThisStage from '@/pages/graphics-controller/theme01/AtThisStage';
import BatsmanCareerStats from '@/pages/graphics-controller/theme01/BatsmanCareerStats';
import BatsmanInningsStats from '@/pages/graphics-controller/theme01/BatsmanInningsStats';
import BatsmanCurrentStats from '@/pages/graphics-controller/theme01/BatsmanCurrentStats';
import BowlerCareerStats from '@/pages/graphics-controller/theme01/BowlerCareerStats';
import BowlerCurrentStats from '@/pages/graphics-controller/theme01/BowlerCurrentStats';
import CricketMatchSummary from '@/pages/graphics-controller/theme01/CricketMatchSummary';
import DecisionPending from '@/pages/graphics-controller/theme01/DecisionPending';
import DecisionPendingRow from '@/pages/graphics-controller/theme01/DecisionPendingRow';
import FallofWickets from '@/pages/graphics-controller/theme01/FallofWickets';
import Four from '@/pages/graphics-controller/theme01/Four';
import FourRow from '@/pages/graphics-controller/theme01/FourRow';
import Fifty from '@/pages/graphics-controller/theme01/Fifty';
import FiftyRow from '@/pages/graphics-controller/theme01/FiftyRow';
import HundredRow from '@/pages/graphics-controller/theme01/HundredRow';
import HighestRuns from '@/pages/graphics-controller/theme01/HighestRuns';
import HighestWickets from '@/pages/graphics-controller/theme01/HighestWickets';
import Hundred from '@/pages/graphics-controller/theme01/Hundred';
import InningsBreak from '@/pages/graphics-controller/theme01/InningsBreak';
import StatsDefault from '@/pages/graphics-controller/theme01/StatsDefault';
import TargetNeeded from '@/pages/graphics-controller/theme01/TargetNeeded';
import NoBall from '@/pages/graphics-controller/theme01/NoBall';
import NoBallRow from '@/pages/graphics-controller/theme01/NoBallRow';
import NotOut from '@/pages/graphics-controller/theme01/NotOut';
import NotOutRow from '@/pages/graphics-controller/theme01/NotOutRow';
import Out from '@/pages/graphics-controller/theme01/Out';
import MatchSummary from '@/pages/graphics-controller/theme01/MatchSummary';
import PlayerCareerStats from '@/pages/graphics-controller/theme01/PlayerCareerStats';
import PlayingXI from '@/pages/graphics-controller/theme01/PlayingXI';
import PlayerIntro from '@/pages/graphics-controller/theme01/PlayerIntro';
import PlayerTournamentStats from '@/pages/graphics-controller/theme01/PlayerTournamentStats';
import PreviousOrder from '@/pages/graphics-controller/theme01/PreviousOrder';
import ResultIntro from '@/pages/graphics-controller/theme01/ResultIntro';
import Replay from '@/pages/graphics-controller/theme01/Replay';
import ReplayRow from '@/pages/graphics-controller/theme01/ReplayRow';
import RunRate from '@/pages/graphics-controller/theme01/RunRate';
import ScoreComparison from '@/pages/graphics-controller/theme01/ScoreComparison';
import ScoreComparisonBar from '@/pages/graphics-controller/theme01/ScoreComparisonBar';
import Six from '@/pages/graphics-controller/theme01/Six';
import SixRow from '@/pages/graphics-controller/theme01/SixRow';
import TeaBreak from '@/pages/graphics-controller/theme01/TeaBreak';
import Toss from '@/pages/graphics-controller/theme01/Toss';
import TournamentIntro from '@/pages/graphics-controller/theme01/TournamentIntro';
import TournamentOverview from '@/pages/graphics-controller/theme01/TournamentOverview';
import TournamentOver from '@/pages/graphics-controller/theme01/TournamentOver';
import TournamentStart from '@/pages/graphics-controller/theme01/TournamentStart';
import Wide from '@/pages/graphics-controller/theme01/Wide';
import WideRow from '@/pages/graphics-controller/theme01/WideRow';
import WicketRow from '@/pages/graphics-controller/theme01/WicketRow';
import Home from '@/pages/Home';
import NotificationCenter from '@/pages/NotificationCenter';
import ScoringMatch from '@/pages/organizer/scoring/ScoringMatch';
import StartMatch from '@/pages/organizer/scoring/StartMatch';
import TournamentAddSquad from '@/pages/organizer/tournaments/TournamentAddSquad';
import TournamentAddTeam from '@/pages/organizer/tournaments/TournamentAddTeam';
import TournamentCreateTeamIntro from '@/pages/organizer/tournaments/TournamentCreateTeamIntro';
import Tournaments from '@/pages/organizer/tournaments/Tournaments';
import TournamentSavedTeams from '@/pages/organizer/tournaments/TournamentSavedTeams';
import TournamentSquad from '@/pages/organizer/tournaments/TournamentSquad';
import Pricing from '@/pages/pricing/Pricing';
import PricingDetail from '@/pages/pricing/PricingDetail';
import Profile from '@/pages/Profile';
import Ranking from '@/pages/ranking/Ranking';
import RankingStatsTotal from '@/pages/ranking/RankingStatsTotal';
import Reels from '@/pages/reels/Reels';
import UploadReels from '@/pages/reels/UploadReels';
import {
  ScorecardDetails,
  ScorecardHome,
  ScorecardStatusDetails,
  StatsTotal,
} from '@/pages/scorecard';
import MyOrders from '@/pages/shop/MyOrders';
import OrderDetail from '@/pages/shop/OrderDetail';
import OrderPayment from '@/pages/shop/OrderPayment';
import OrderSuccess from '@/pages/shop/OrderSuccess';
import ShopCart from '@/pages/shop/ShopCart';
import ShopCategory from '@/pages/shop/ShopCategory';
import ShopCheckout from '@/pages/shop/ShopCheckout';
import ShopFilter from '@/pages/shop/ShopFilter';
import ShopHome from '@/pages/shop/ShopHome';
import ShopProductDetail from '@/pages/shop/ShopProductDetail';
import StaticPage from '@/pages/StaticPage';
import Support from '@/pages/Support';
import TournamentRequest from '@/pages/TournamentRequest';
import TournamentRequestSuccess from '@/pages/TournamentRequestSuccess';
import UpcomingTournamentDetails from '@/pages/upcoming-tournaments/UpcomingTournamentDetails';
import UpcomingTournaments from '@/pages/upcoming-tournaments/UpcomingTournaments';
import { Toaster } from '@/ui/Toast';
import { TooltipProvider } from '@/ui/Tooltip';

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
                  {/* Shop: all shop/ecommerce under /shop */}
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
                  <Route path="/pricing/:planId" element={<PricingDetail />} />
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
              <Route path="/graphics-controller/not-out" element={<NotOut />} />
              <Route path="/graphics-controller/no-ball" element={<NoBall />} />
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
              <Route path="/graphics-controller/hundred" element={<Hundred />} />
              <Route
                path="/graphics-controller/innings-break"
                element={<InningsBreak />}
              />
              <Route path="/graphics-controller/tea-break" element={<TeaBreak />} />
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
              <Route path="/graphics-controller/run-rate" element={<RunRate />} />
              <Route
                path="/graphics-controller/previous-order"
                element={<PreviousOrder />}
              />
              <Route
                path="/graphics-controller/fall-of-wickets"
                element={<FallofWickets />}
              />
              <Route path="/graphics-controller/four-row" element={<FourRow />} />
              <Route path="/graphics-controller/six-row" element={<SixRow />} />
              <Route path="/graphics-controller/wide-row" element={<WideRow />} />
              <Route path="/graphics-controller/no-ball-row" element={<NoBallRow />} />
              <Route path="/graphics-controller/not-out-row" element={<NotOutRow />} />
              <Route path="/graphics-controller/fifty-row" element={<FiftyRow />} />
              <Route path="/graphics-controller/hundred-row" element={<HundredRow />} />
              <Route path="/graphics-controller/wicket-row" element={<WicketRow />} />
              <Route path="/graphics-controller/replay-row" element={<ReplayRow />} />
              <Route
                path="/graphics-controller/decision-pending-row"
                element={<DecisionPendingRow />}
              />
              <Route path="/graphics-controller/replay" element={<Replay />} />
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
          </BrowserRouter>
        </ToastProvider>
      </Toaster>
    </TooltipProvider>
  );
}

export default App;
