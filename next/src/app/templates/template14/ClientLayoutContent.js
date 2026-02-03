'use client';

import { memo, useEffect, useMemo } from 'react';

import AssetErrorHandler from '@/components/AssetErrorHandler';
import CacheManager from '@/components/CacheManager/CacheManager';
import LiveChat from '@/components/LiveChat/LiveChat';
import ModalManager from '@/components/ModalManager/ModalManager';
import Tracking from '@/components/Tracking/Tracking';
// Template specific components
import FloatingButtons from '@/dynamic-components/template14/components/FloatingButtons/FloatingButtons';
import Footer from '@/dynamic-components/template14/components/Footer/Footer';
import GlobalPageLoader from '@/dynamic-components/template14/components/GlobalPageLoader/GlobalPageLoader';
import LeftSidebar from '@/dynamic-components/template14/components/LeftSidebar/LeftSidebar';
import Navbar from '@/dynamic-components/template14/components/Navbar/Navbar';
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
    () => `flex-1 template14-main ${isMobilePlatform ? 'pb-safe-bottom' : ''}`,
    [isMobilePlatform],
  );

  return (
    <div
      className="template14-layout flex min-h-screen"
      style={{ backgroundColor: '#0D1028' }}
    >
      {/* Left Sidebar - Full height from top, hidden on mobile, visible on desktop */}
      <LeftSidebar />

      {/* Main Content Area - Contains Navbar, content, and Footer */}
      <div
        className="relative flex w-full min-w-0 flex-1 flex-col overflow-x-hidden lg:w-auto"
        style={{
          backgroundImage:
            'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-bg-7.webp)',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
      >
        {/* Navbar inside main content area */}
        <div className="template14-header z-50 w-full">
          <Navbar />
          {/* <SubNavbar /> */}
        </div>

        {/* Main content with children */}
        <main className={`${mainClassName} w-full min-w-0 lg:w-auto lg:flex-1`}>
          {children}
        </main>

        {/* Footer inside main content */}
        <Footer />
      </div>
    </div>
  );
});

const ClientLayoutContent = memo(function ClientLayoutContent({ children }) {
  // Fix margin-right issue when scroll is locked (Radix UI scroll lock)
  useEffect(() => {
    const fixBodyMargin = () => {
      const body = document.body;
      // Always ensure margin-right is 0, regardless of scroll lock state
      body.style.setProperty('margin-right', '0', 'important');
      body.style.setProperty('padding-right', '0', 'important');
    };

    // Create observer to watch for data-scroll-locked attribute changes
    const observer = new MutationObserver(() => {
      fixBodyMargin();
    });

    // Observe body for attribute changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked'],
    });

    // Also check immediately
    fixBodyMargin();

    // Also check periodically to catch any late-applied styles (safety net)
    const interval = setInterval(fixBodyMargin, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="template14-app antialiased"
      style={{ backgroundColor: '#0D1028' }}
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
