import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { RequireAuth } from '@/components/RequireAuth';
import { ScrollRestoration } from '@/components/ScrollRestoration';
import { SplashScreen } from '@/components/SplashScreen';
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
import Home from '@/pages/Home';
import NotificationCenter from '@/pages/NotificationCenter';
import TournamentAddSquad from '@/pages/organizer/tournaments/TournamentAddSquad';
import TournamentAddTeam from '@/pages/organizer/tournaments/TournamentAddTeam';
import TournamentCreateTeamIntro from '@/pages/organizer/tournaments/TournamentCreateTeamIntro';
import TournamentEditSquad from '@/pages/organizer/tournaments/TournamentEditSquad';
import TournamentFinalSquad from '@/pages/organizer/tournaments/TournamentFinalSquad';
import Tournaments from '@/pages/organizer/tournaments/Tournaments';
import TournamentSavedTeams from '@/pages/organizer/tournaments/TournamentSavedTeams';
import Pricing from '@/pages/pricing/Pricing';
import PricingDetail from '@/pages/pricing/PricingDetail';
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
import TournamentRequest from '@/pages/TournamentRequest';
import UpcomingTournamentDetails from '@/pages/upcoming-tournaments/UpcomingTournamentDetails';
import UpcomingTournaments from '@/pages/upcoming-tournaments/UpcomingTournaments';
import UserProfile from '@/pages/UserProfile';
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
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route element={<RequireAuth />}>
                <Route element={<MainLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/user-profile" element={<UserProfile />} />
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
                    path="/organizer/tournaments/:tournamentId/edit-squad"
                    element={<TournamentEditSquad />}
                  />
                  <Route
                    path="/organizer/tournaments/:tournamentId/final-squad/:teamId"
                    element={<TournamentFinalSquad />}
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
                  <Route path="/ranking" element={<Ranking />} />
                  <Route
                    path="/ranking/stats-total/:statType"
                    element={<RankingStatsTotal />}
                  />
                  <Route
                    path="/notification-center"
                    element={<NotificationCenter />}
                  />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </Toaster>
    </TooltipProvider>
  );
}

export default App;
