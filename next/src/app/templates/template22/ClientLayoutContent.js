'use client';

import { usePathname } from 'next/navigation';
import { memo, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import AssetErrorHandler from '@/components/AssetErrorHandler';
import CacheManager from '@/components/CacheManager/CacheManager';
import LiveChat from '@/components/LiveChat/LiveChat';
import ModalManager from '@/components/ModalManager/ModalManager';
import Tracking from '@/components/Tracking/Tracking';
// Template specific components
import AuthFooter from '@/dynamic-components/template22/components/AuthFooter/AuthFooter';
import AuthNavbar from '@/dynamic-components/template22/components/AuthNavbar/AuthNavbar';
import Categories from '@/dynamic-components/template22/components/Categories/Categories';
import Footer from '@/dynamic-components/template22/components/Footer/Footer';
import GlobalPageLoader from '@/dynamic-components/template22/components/GlobalPageLoader/GlobalPageLoader';
import MobileLeftSidebar from '@/dynamic-components/template22/components/MobileLeftSidebar/MobileLeftSidebar';
import Navbar from '@/dynamic-components/template22/components/Navbar/Navbar';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';
import AudioNotificationProvider from '@/providers/AudioNotificationProvider';
import { LanguageProvider } from '@/providers/LanguageProvider';
import PusherProvider from '@/providers/PusherProvider';
import { ReduxProvider } from '@/providers/ReduxProvider';
import ScrollToTopProvider from '@/providers/ScrollToTopProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';

function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  }, []);

  return null;
}

const LayoutContent = memo(function LayoutContent({ children }) {
  const { isMobilePlatform } = useMobilePlatform();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  // Check if current path is a dashboard route
  const isDashboardRoute = pathname?.startsWith('/dashboard');

  // Memoize the main className to prevent recalculation
  const mainClassName = useMemo(
    () => `flex-1 template22-main ${isMobilePlatform ? 'pb-safe-bottom' : ''}`,
    [isMobilePlatform],
  );

  return (
    <div
      className="template22-layout flex flex-col"
      style={{ backgroundColor: '#000000' }}
    >
      <div className="template22-header z-50">
        {isDashboardRoute ? <AuthNavbar /> : <Navbar />}
      </div>
      {/* Categories - Show on all pages after Navbar (hidden on homepage mobile and dashboard routes) */}
      <div className={isHomePage || isDashboardRoute ? 'hidden md:block' : ''}>
        {!isDashboardRoute && <Categories />}
      </div>
      <main className={mainClassName}>{children}</main>
      {isDashboardRoute ? <AuthFooter /> : <Footer />}
    </div>
  );
});

const ClientLayoutContent = memo(function ClientLayoutContent({ children }) {
  return (
    <div
      className="template22-app antialiased"
      style={{ backgroundColor: '#000000' }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={true}
        disableTransitionOnChange
      >
        <ReduxProvider>
          <LanguageProvider>
            <AudioNotificationProvider>
              <PusherProvider>
                <ToastProvider>
                  <ScrollToTopProvider>
                    <LayoutContent>
                      <AssetErrorHandler />
                      <GlobalPageLoader />
                      {children}
                      <MobileLeftSidebar />
                      <LiveChat />
                      <Tracking />
                      <ModalManager />
                      <RegisterSW />
                      <CacheManager />
                    </LayoutContent>
                  </ScrollToTopProvider>
                </ToastProvider>
              </PusherProvider>
            </AudioNotificationProvider>
          </LanguageProvider>
        </ReduxProvider>
      </ThemeProvider>
    </div>
  );
});

export default ClientLayoutContent;
