import { useState } from 'react';

import { Outlet, useLocation } from 'react-router-dom';

import { BottomNav } from '@/components/BottomNav';
import { FacebookAnalyticsBoot } from '@/components/FacebookAnalyticsBoot';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { useMainLayoutChrome } from '@/hooks/useMainLayoutChrome';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { showNavbar, showBottomNav, mainPaddingTop, mainPaddingBottom, rootClassName } = useMainLayoutChrome(location.pathname);

  return (
    <div className={rootClassName}>
      <FacebookAnalyticsBoot />
      {showNavbar && <Navbar onMenuClick={() => setSidebarOpen(true)} />}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        className="lg:ml-[280px]"
        style={{
          paddingTop: mainPaddingTop,
          paddingBottom: mainPaddingBottom,
        }}
      >
        <Outlet />
      </main>
      {showBottomNav && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
