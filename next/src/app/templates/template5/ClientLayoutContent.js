'use client';

import { memo, useEffect, useMemo } from 'react';

import AssetErrorHandler from '@/components/AssetErrorHandler';
import CacheManager from '@/components/CacheManager/CacheManager';
import LiveChat from '@/components/LiveChat/LiveChat';
import ModalManager from '@/components/ModalManager/ModalManager';
import Tracking from '@/components/Tracking/Tracking';
// Template specific components
import FloatingButtons from '@/dynamic-components/template5/components/FloatingButtons/FloatingButtons';
import Footer from '@/dynamic-components/template5/components/Footer/Footer';
import GlobalPageLoader from '@/dynamic-components/template5/components/GlobalPageLoader/GlobalPageLoader';
import LeftSidebar from '@/dynamic-components/template5/components/LeftSidebar/LeftSidebar';
import Navbar from '@/dynamic-components/template5/components/Navbar/Navbar';
import RightSidebar from '@/dynamic-components/template5/components/RightSidebar/RightSidebar';
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

  // Memoize the main className to prevent recalculation
  const mainClassName = useMemo(
    () => `flex-1 template5-main ${isMobilePlatform ? 'pb-safe-bottom' : ''}`,
    [isMobilePlatform],
  );

  return (
    <div
      className="template5-layout flex min-h-screen flex-col"
      style={{ backgroundColor: '#001724' }}
    >
      <div className="template5-header z-50">
        <Navbar />
        {/* <SubNavbar /> */}
      </div>

      {/* Main content area with sidebars */}
      <div className="flex flex-1">
        {/* Left Sidebar - Hidden on mobile, visible on desktop */}
        <LeftSidebar />

        {/* Main Content - Full width on mobile, constrained on desktop */}
        <main className={`${mainClassName} w-full lg:w-auto lg:flex-1`}>
          {children}
        </main>

        {/* Right Sidebar - Hidden on mobile and screens <= 1250px */}
        <div className="hidden xl:block">
          <RightSidebar />
        </div>
      </div>

      <Footer />
    </div>
  );
});

const ClientLayoutContent = memo(function ClientLayoutContent({ children }) {
  return (
    <div
      className="template5-app antialiased"
      style={{ backgroundColor: '#001724' }}
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
                      <FloatingButtons />
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
