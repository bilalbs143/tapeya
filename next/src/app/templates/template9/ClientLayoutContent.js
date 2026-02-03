'use client';

import { memo, useEffect, useMemo } from 'react';

import AssetErrorHandler from '@/components/AssetErrorHandler';
import CacheManager from '@/components/CacheManager/CacheManager';
import LiveChat from '@/components/LiveChat/LiveChat';
import ModalManager from '@/components/ModalManager/ModalManager';
import Tracking from '@/components/Tracking/Tracking';
// Template specific components
import FloatingButtons from '@/dynamic-components/template9/components/FloatingButtons/FloatingButtons';
import Footer from '@/dynamic-components/template9/components/Footer/Footer';
import GlobalPageLoader from '@/dynamic-components/template9/components/GlobalPageLoader/GlobalPageLoader';
import LeftSidebar from '@/dynamic-components/template9/components/LeftSidebar/LeftSidebar';
import Navbar from '@/dynamic-components/template9/components/Navbar/Navbar';
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
    () => `flex-1 template9-main ${isMobilePlatform ? 'pb-safe-bottom' : ''}`,
    [isMobilePlatform],
  );

  return (
    <div
      className="template9-layout flex min-h-screen flex-col"
      style={{ backgroundColor: '#12001F' }}
    >
      {/* Navbar at the top - outside columns with proper spacing */}
      <div className="template9-header z-50 w-full">
        <Navbar />
      </div>

      {/* Content Area with Sidebars */}
      <div className="flex flex-1 overflow-x-hidden">
        {/* Left Sidebar - Full height, hidden on mobile, visible on desktop */}
        <LeftSidebar />

        {/* Main Content Area - Contains content and Footer */}
        <div
          className="relative flex w-full min-w-0 flex-1 flex-col overflow-x-hidden lg:w-auto"
          style={{
            backgroundImage:
              'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-page-bg-9.webp)',
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
          }}
        >
          {/* Main content with children */}
          <main
            className={`${mainClassName} w-full min-w-0 lg:w-auto lg:flex-1`}
          >
            {children}
          </main>

          {/* Footer inside main content */}
          <Footer />
        </div>
      </div>
    </div>
  );
});

const ClientLayoutContent = memo(function ClientLayoutContent({ children }) {
  return (
    <div
      className="template9-app antialiased"
      style={{ backgroundColor: '#12001F' }}
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
