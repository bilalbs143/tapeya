import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { SplashScreen } from '@/components/SplashScreen';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import Login from '@/pages/auth/Login';
import Otp from '@/pages/auth/Otp';
import Register from '@/pages/auth/Register';
import Home from '@/pages/Home';
import MyOrders from '@/pages/MyOrders';
import OrderDetail from '@/pages/OrderDetail';
import OrderSuccess from '@/pages/OrderSuccess';
import ShopCart from '@/pages/ShopCart';
import ShopCategory from '@/pages/ShopCategory';
import ShopCheckout from '@/pages/ShopCheckout';
import ShopHome from '@/pages/ShopHome';
import ShopProductDetail from '@/pages/ShopProductDetail';
import UserProfile from '@/pages/UserProfile';
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
              <Route path="/shop" element={<ShopHome />} />
              <Route path="/shop/:brandId" element={<ShopCategory />} />
              <Route
                path="/shop/:brandId/product/:productId"
                element={<ShopProductDetail />}
              />
              <Route path="/shop-cart" element={<ShopCart />} />
              <Route path="/shop-checkout" element={<ShopCheckout />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/order-detail" element={<OrderDetail />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/user-profile" element={<UserProfile />} />
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
