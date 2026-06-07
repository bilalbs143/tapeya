import { useState } from 'react';

import { Outlet, useLocation } from 'react-router-dom';

import { BottomNav } from '@/components/BottomNav';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LG_MEDIA_QUERY } from '@/lib/constants/layout';
import { isNavbarOverlayPath } from '@/lib/utils/routeUtils';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const noTopPadding = isNavbarOverlayPath(location.pathname, isDesktop);

  return (
    <div className="bg-black">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        className="lg:ml-[280px]"
        style={{
          paddingTop: noTopPadding ? 0 : 'calc(env(safe-area-inset-top) + 56px)',
          // Desktop has no BottomNav — inline style must handle this since it overrides Tailwind classes.
          paddingBottom: isDesktop ? 0 : 'calc(env(safe-area-inset-bottom) + 70px)',
        }}
      >
        <Outlet />
      </main>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
