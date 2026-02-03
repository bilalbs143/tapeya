import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { SplashScreen } from '@/components/SplashScreen';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import Login from '@/pages/auth/Login';
import Otp from '@/pages/auth/Otp';
import Register from '@/pages/auth/Register';
import Home from '@/pages/Home';
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
