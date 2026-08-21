import { lazy, Suspense } from 'react';

import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { ConsumerRouterEffects } from '@/components/ConsumerRouterEffects';
import DialogManager from '@/components/dialogs/DialogManager';
import { GoogleAnalyticsBoot } from '@/components/GoogleAnalyticsBoot';
import InterestCampaignDialogScheduler from '@/components/InterestCampaignDialogScheduler';
import ProgrammaticDialogPrompts from '@/components/ProgrammaticDialogPrompts';
import { RequireAuth } from '@/components/RequireAuth';
import { RequireBroadcastAccess } from '@/components/RequireBroadcastAccess';
import { RequireVendorAccess } from '@/components/RequireVendorAccess';
import { ScrollRestoration } from '@/components/ScrollRestoration';
import SplashScreen from '@/components/SplashScreen';
import { DialogProvider } from '@/context/DialogContext';
import { ToastProvider } from '@/context/ToastContext';
import { useReverbNotifications } from '@/hooks/useReverbNotifications';
import { isOverlayRoute } from '@/lib/isOverlayRoute';
import { RedirectShopLegacyBrandProduct, RedirectShopProductPrefix, RedirectShopVendorPrefix } from '@/pages/shop/ShopRedirects';
import { FullScreenLoader } from '@/ui/Loader';
import { Toaster } from '@/ui/Toast';
import { TooltipProvider } from '@/ui/Tooltip';

const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Otp = lazy(() => import('@/pages/auth/Otp'));

const Home = lazy(() => import('@/pages/Home'));
const Profile = lazy(() => import('@/pages/Profile'));
const StaticPage = lazy(() => import('@/pages/StaticPage'));
const Support = lazy(() => import('@/pages/Support'));
const NotificationCenter = lazy(() => import('@/pages/NotificationCenter'));
const TournamentRequest = lazy(() => import('@/pages/TournamentRequest'));
const TournamentRequestSuccess = lazy(() => import('@/pages/TournamentRequestSuccess'));

const DraftingHome = lazy(() => import('@/pages/drafting/DraftingHome'));
const TeamList = lazy(() => import('@/pages/drafting/TeamList'));
const TeamDetail = lazy(() => import('@/pages/drafting/TeamDetail'));

const ActivityFeedDetail = lazy(() => import('@/pages/feed/ActivityFeedDetail'));
const ComposePost = lazy(() => import('@/pages/feed/ComposePost'));

const Pricing = lazy(() => import('@/pages/pricing/Pricing'));
const PricingDetail = lazy(() => import('@/pages/pricing/PricingDetail'));

const Ranking = lazy(() => import('@/pages/ranking/Ranking'));
const RankingStatsTotal = lazy(() => import('@/pages/ranking/RankingStatsTotal'));

const Live = lazy(() => import('@/pages/live/Live'));
const LiveBroadcast = lazy(() => import('@/pages/live/LiveBroadcast'));
const GoLive = lazy(() => import('@/pages/live/GoLive'));
const LiveStreaming = lazy(() => import('@/pages/live/LiveStreaming'));
const LiveStreamingCreate = lazy(() => import('@/pages/live/LiveStreamingCreate'));
const LiveStreamingManage = lazy(() => import('@/pages/live/LiveStreamingManage'));

const Reels = lazy(() => import('@/pages/reels/Reels'));
const UploadReels = lazy(() => import('@/pages/reels/UploadReels'));
const CreatorReelsProfile = lazy(() => import('@/pages/reels/CreatorReelsProfile'));

const ScorecardHome = lazy(() => import('@/pages/scorecard/ScorecardHome'));
const ScorecardDetails = lazy(() => import('@/pages/scorecard/ScorecardDetails'));
const ScorecardStatusDetails = lazy(() => import('@/pages/scorecard/ScorecardStatusDetails'));
const StatsTotal = lazy(() => import('@/pages/scorecard/StatsTotal'));

const ShopHome = lazy(() => import('@/pages/shop/ShopHome'));
const ShopCart = lazy(() => import('@/pages/shop/ShopCart'));
const ShopCheckout = lazy(() => import('@/pages/shop/ShopCheckout'));
const ShopCategory = lazy(() => import('@/pages/shop/ShopCategory'));
const ShopFilter = lazy(() => import('@/pages/shop/ShopFilter'));
const ShopProductDetail = lazy(() => import('@/pages/shop/ShopProductDetail'));
const ShopSlugPage = lazy(() => import('@/pages/shop/ShopSlugPage'));
const MyOrders = lazy(() => import('@/pages/shop/MyOrders'));
const OrderDetail = lazy(() => import('@/pages/shop/OrderDetail'));
const OrderSuccess = lazy(() => import('@/pages/shop/OrderSuccess'));

const SellerHub = lazy(() => import('@/pages/vendor/SellerHub'));
const SellerApply = lazy(() => import('@/pages/vendor/SellerApply'));
const SellerOrders = lazy(() => import('@/pages/vendor/SellerOrders'));
const SellerOrderDetail = lazy(() => import('@/pages/vendor/SellerOrderDetail'));
const SellerProducts = lazy(() => import('@/pages/vendor/SellerProducts'));
const SellerProductForm = lazy(() => import('@/pages/vendor/SellerProductForm'));
const SellerStore = lazy(() => import('@/pages/vendor/SellerStore'));
const SellerBrands = lazy(() => import('@/pages/vendor/SellerBrands'));
const SellerCategories = lazy(() => import('@/pages/vendor/SellerCategories'));

const UpcomingTournaments = lazy(() => import('@/pages/upcoming-tournaments/UpcomingTournaments'));
const UpcomingTournamentDetails = lazy(() => import('@/pages/upcoming-tournaments/UpcomingTournamentDetails'));

const Highlights = lazy(() => import('@/pages/highlights/Highlights'));
const HighlightDetails = lazy(() => import('@/pages/highlights/HighlightDetails'));

const InterestForm = lazy(() => import('@/pages/interest/InterestForm'));

const MainLayout = lazy(() => import('@/layouts/MainLayout').then((m) => ({ default: m.MainLayout })));
const AuthLayout = lazy(() => import('@/layouts/AuthLayout').then((m) => ({ default: m.AuthLayout })));

const Tournaments = lazy(() => import('@/pages/organizer/tournaments/Tournaments'));
const TournamentCreateTeamIntro = lazy(() => import('@/pages/organizer/tournaments/TournamentCreateTeamIntro'));
const TournamentSavedTeams = lazy(() => import('@/pages/organizer/tournaments/TournamentSavedTeams'));
const TournamentAddSquad = lazy(() => import('@/pages/organizer/tournaments/TournamentAddSquad'));
const TournamentSquad = lazy(() => import('@/pages/organizer/tournaments/TournamentSquad'));
const StartMatch = lazy(() => import('@/pages/organizer/scoring/StartMatch'));
const ScoringMatch = lazy(() => import('@/pages/organizer/scoring/ScoringMatch'));
const QuickMatchWizard = lazy(() => import('@/pages/quick-match/QuickMatchWizard'));
const MyMatches = lazy(() => import('@/pages/quick-match/MyMatches'));

function PageFallback() {
  return <FullScreenLoader label="Loading page" />;
}

/** Consumer-only side effects (skipped on /overlay/*). */
function RouterEffects() {
  const { pathname } = useLocation();
  if (isOverlayRoute(pathname)) return null;
  return <ConsumerRouterEffects />;
}

function App() {
  useReverbNotifications();

  return (
    <DialogProvider>
      <TooltipProvider delayDuration={300}>
        <Toaster>
          <ToastProvider>
            <BrowserRouter
              future={{
                v7_relativeSplatPath: true,
                v7_startTransition: true,
              }}
            >
              <RouterEffects />
              <GoogleAnalyticsBoot />
              <ScrollRestoration />
              <DialogManager />
              <ProgrammaticDialogPrompts />
              <InterestCampaignDialogScheduler />
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<SplashScreen />} />
                  <Route path="/pages/:slug" element={<StaticPage />} />

                  <Route element={<MainLayout />}>
                    {/* Public shop catalog (unauthenticated GETs) */}
                    <Route path="/shop" element={<ShopHome />} />
                    <Route path="/shop/filter/:filterKey" element={<ShopFilter />} />
                    <Route path="/shop/brands/:brandSlug" element={<ShopCategory />} />
                    <Route path="/shop/vendors/:vendorSlug" element={<RedirectShopVendorPrefix />} />
                    <Route path="/shop/product/:vendorSlug/:productSlug" element={<RedirectShopProductPrefix />} />
                    <Route path="/shop/:brandId/product/:productSlug" element={<RedirectShopLegacyBrandProduct />} />
                    <Route path="/shop/:vendorSlug/:productSlug" element={<ShopProductDetail />} />
                    <Route path="/shop/:slug" element={<ShopSlugPage />} />

                    <Route element={<RequireAuth />}>
                      <Route path="/home" element={<Home />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/drafting" element={<DraftingHome />} />
                      <Route path="/drafting/teams" element={<TeamList />} />
                      <Route path="/drafting/teams/:teamId" element={<TeamDetail />} />
                      <Route path="/upcoming-tournaments" element={<UpcomingTournaments />} />
                      <Route path="/upcoming-tournaments/:tournamentId" element={<UpcomingTournamentDetails />} />
                      <Route path="/interest/:slug" element={<InterestForm />} />
                      <Route path="/organizer/tournaments" element={<Tournaments />} />
                      <Route
                        path="/organizer/tournaments/:tournamentId/create-team-intro"
                        element={<TournamentCreateTeamIntro />}
                      />
                      <Route path="/organizer/tournaments/:tournamentId/saved-teams" element={<TournamentSavedTeams />} />
                      <Route path="/organizer/tournaments/:tournamentId/add-squad" element={<TournamentAddSquad />} />
                      <Route path="/organizer/tournaments/:tournamentId/squad" element={<TournamentSquad />} />
                      <Route path="/organizer/scoring/start-match" element={<StartMatch />} />
                      <Route path="/organizer/scoring/match/:matchId" element={<ScoringMatch />} />
                      <Route path="/quick-match" element={<QuickMatchWizard />} />
                      <Route path="/quick-match/:matchId" element={<QuickMatchWizard />} />
                      <Route path="/matches" element={<MyMatches />} />
                      <Route path="/scorecard" element={<ScorecardHome />} />
                      <Route path="/scorecard/match/:matchId" element={<ScorecardStatusDetails />} />
                      <Route path="/scorecard/:tournamentId" element={<ScorecardDetails />} />
                      <Route path="/scorecard/:tournamentId/match/:matchId" element={<ScorecardStatusDetails />} />
                      <Route path="/scorecard/:tournamentId/stats-total/:statType" element={<StatsTotal />} />
                      {/* Shop — auth-only */}
                      <Route path="/shop/cart" element={<ShopCart />} />
                      <Route path="/shop/checkout" element={<ShopCheckout />} />
                      <Route path="/shop/orders/:orderId" element={<OrderDetail />} />
                      <Route path="/shop/orders" element={<MyOrders />} />
                      <Route path="/shop/order-success" element={<OrderSuccess />} />
                      <Route path="/seller/apply" element={<SellerApply />} />
                      <Route element={<RequireVendorAccess />}>
                        <Route path="/seller" element={<SellerHub />} />
                        <Route path="/seller/orders" element={<SellerOrders />} />
                        <Route path="/seller/orders/:id" element={<SellerOrderDetail />} />
                        <Route path="/seller/products" element={<SellerProducts />} />
                        <Route path="/seller/products/new" element={<SellerProductForm />} />
                        <Route path="/seller/products/:id/edit" element={<SellerProductForm />} />
                        <Route path="/seller/store" element={<SellerStore />} />
                        <Route path="/seller/brands" element={<SellerBrands />} />
                        <Route path="/seller/categories" element={<SellerCategories />} />
                      </Route>
                      <Route path="/tournament-request" element={<TournamentRequest />} />
                      <Route path="/tournament-request/success" element={<TournamentRequestSuccess />} />
                      <Route path="/ranking" element={<Ranking />} />
                      <Route path="/ranking/stats-total/:statType" element={<RankingStatsTotal />} />
                      <Route path="/live" element={<Live />} />
                      <Route path="/live/broadcast/:streamId" element={<LiveBroadcast />} />
                      <Route path="/live/streaming" element={<LiveStreaming />} />
                      <Route path="/live/streaming/create" element={<LiveStreamingCreate />} />
                      <Route path="/live/streaming/:streamId" element={<LiveStreamingManage />} />
                      <Route element={<RequireBroadcastAccess />}>
                        <Route path="/live/go-live" element={<GoLive />} />
                        <Route path="/live/go-live/:streamId" element={<GoLive />} />
                      </Route>
                      <Route path="/highlights" element={<Highlights />} />
                      <Route path="/highlights/:highlightId" element={<HighlightDetails />} />
                      <Route path="/notification-center" element={<NotificationCenter />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/reels/u/:userId" element={<CreatorReelsProfile />} />
                      <Route path="/reels/upload" element={<UploadReels />} />
                      <Route path="/reels/:reelId" element={<Reels />} />
                      <Route path="/reels" element={<Reels />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/pricing/:planId" element={<PricingDetail />} />
                      <Route path="/feed" element={<Navigate to="/" replace />} />
                      <Route path="/feed/compose" element={<ComposePost />} />
                      <Route path="/feed/:postId" element={<ActivityFeedDetail />} />
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
    </DialogProvider>
  );
}

export default App;
