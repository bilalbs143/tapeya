import { lazy, Suspense } from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import DialogManager from '@/components/dialogs/DialogManager';
import { ProfileStrengthReminderScheduler } from '@/components/ProfileStrengthReminderScheduler';
import { RequireAuth } from '@/components/RequireAuth';
// import { RequireOrganizerRole } from '@/components/RequireOrganizerRole';
import { useReverbNotifications } from '@/hooks/useReverbNotifications';
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

const InterestForm = lazy(() => import('@/pages/interest/InterestForm'));

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

// Graphic overlay — transparent browser-source page driven by the admin session API.
// Individual graphics theme/* components are loaded on demand by the registry, not here.
const GraphicOverlay = lazy(
  () => import('@/pages/graphics-controller/GraphicOverlay'),
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
  useReverbNotifications();

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
            <DialogManager />
            <ProfileStrengthReminderScheduler />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<SplashScreen />} />
                <Route path="/pages/:slug" element={<StaticPage />} />

                {/* Graphic overlay — OBS/vMix browser source. Outside auth layout.
                    Use a signed URL from backoffice (?expires=&signature=) or a
                    logged-in app session for the initial HTTP load. */}
                <Route
                  path="/overlay/:matchId"
                  element={<GraphicOverlay />}
                />

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
                    <Route
                      path="/interest/:slug"
                      element={<InterestForm />}
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
