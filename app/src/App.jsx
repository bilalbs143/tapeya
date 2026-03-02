import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ScrollRestoration } from '@/components/ScrollRestoration';
import { SplashScreen } from '@/components/SplashScreen';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import Login from '@/pages/auth/Login';
import Otp from '@/pages/auth/Otp';
import Register from '@/pages/auth/Register';
import AddTeam from '@/pages/drafting/AddTeam';
import DraftingHome from '@/pages/drafting/DraftingHome';
import TeamDetail from '@/pages/drafting/TeamDetail';
import TeamList from '@/pages/drafting/TeamList';
import AddTeamOrganizer from '@/pages/organizer-tournament/AddTeam';
import Organizer from '@/pages/organizer-tournament/Organizer';
import OrgTournamentList from '@/pages/organizer-tournament/OrgTournamentList';
import AddSquad from '@/pages/organizer-tournament/AddSquad';
import EditSquad from '@/pages/organizer-tournament/EditSquad';
import SavedItems from '@/pages/organizer-tournament/SavedItems';
import EventRequest from '@/pages/EventRequest';
import Home from '@/pages/Home';
import NotificationCenter from '@/pages/NotificationCenter';
import Ranking from '@/pages/ranking/Ranking';
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
import UserProfile from '@/pages/UserProfile';
import { Toaster } from '@/ui/Toast';
import { ToastProvider } from '@/ui/ToastContext';
import { TooltipProvider } from '@/ui/Tooltip';

function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <Toaster>
        <ToastProvider>
          <BrowserRouter>
            <ScrollRestoration />
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route element={<MainLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/user-profile" element={<UserProfile />} />
                <Route path="/drafting" element={<DraftingHome />} />
                <Route path="/drafting/add-team" element={<AddTeam />} />
                <Route path="/drafting/teams" element={<TeamList />} />
                <Route path="/drafting/teams/:teamId" element={<TeamDetail />} />
                <Route path="/organizer-tournament" element={<Organizer />} />
                <Route path="/organizer-tournament/list" element={<OrgTournamentList />} />
                <Route path="/organizer-tournament/add-team" element={<AddTeamOrganizer />} />
                <Route path="/organizer-tournament/saved-items" element={<SavedItems />} />
                <Route path="/organizer-tournament/add-squad" element={<AddSquad />} />
                <Route path="/organizer-tournament/edit-squad" element={<EditSquad />} />
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
                <Route path="/shop/orders/:orderId" element={<OrderDetail />} />
                <Route path="/shop/orders" element={<MyOrders />} />
                <Route path="/shop/order-success" element={<OrderSuccess />} />
                <Route
                  path="/shop/:brandId/product/:productSlug"
                  element={<ShopProductDetail />}
                />
                <Route
                  path="/shop/filter/:filterKey"
                  element={<ShopFilter />}
                />
                <Route path="/shop/:brandId" element={<ShopCategory />} />
                <Route path="/event-request" element={<EventRequest />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route
                  path="/ranking/stats-total/:statType"
                  element={<StatsTotal />}
                />
                <Route path="/notification-center" element={<NotificationCenter />} />
                <Route path="/reels" element={<Reels />} />
                <Route path="/reels/upload" element={<UploadReels />} />
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
