import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { SplashScreen } from '@/components/SplashScreen';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import Login from '@/pages/auth/Login';
import Otp from '@/pages/auth/Otp';
import Register from '@/pages/auth/Register';
import Home from '@/pages/Home';
import MyOrders from '@/pages/shop/MyOrders';
import OrderDetail from '@/pages/shop/OrderDetail';
import OrderSuccess from '@/pages/shop/OrderSuccess';
import ShopCart from '@/pages/shop/ShopCart';
import ShopCategory from '@/pages/shop/ShopCategory';
import ShopCheckout from '@/pages/shop/ShopCheckout';
import ShopHome from '@/pages/shop/ShopHome';
import ShopProductDetail from '@/pages/shop/ShopProductDetail';
import UserProfile from '@/pages/UserProfile';
import { ScorecardHome } from '@/pages/scorecard';
import { Toaster, ToastViewportStyled } from '@/ui/Toast';
import { TooltipProvider } from '@/ui/Tooltip';

function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <Toaster>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route element={<MainLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/user-profile" element={<UserProfile />} />
              <Route path="/scorecard" element={<ScorecardHome />} />
              {/* Shop: all shop/ecommerce under /shop */}
              <Route path="/shop" element={<ShopHome />} />
              <Route path="/shop/cart" element={<ShopCart />} />
              <Route path="/shop/checkout" element={<ShopCheckout />} />
              <Route path="/shop/orders/:orderId" element={<OrderDetail />} />
              <Route path="/shop/orders" element={<MyOrders />} />
              <Route path="/shop/order-success" element={<OrderSuccess />} />
              <Route
                path="/shop/:brandId/product/:productSlug"
                element={<ShopProductDetail />}
              />
              <Route path="/shop/:brandId" element={<ShopCategory />} />
            </Route>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/otp" element={<Otp />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastViewportStyled />
      </Toaster>
    </TooltipProvider>
  );
}

export default App;
