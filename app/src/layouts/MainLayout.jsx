import { useState } from 'react';

import { Outlet, useLocation } from 'react-router-dom';

import { BottomNav } from '@/components/BottomNav';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { isNavbarOverlayPath } from '@/lib/utils/routeUtils';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const noTopPadding = isNavbarOverlayPath(location.pathname);

  return (
    <div className="bg-black">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        className="lg:ml-[280px] lg:pb-0"
        style={{
          // Top: match navbar height + safe area. Hero pages opt out via isNavbarOverlayPath.
          paddingTop: noTopPadding ? 0 : 'calc(env(safe-area-inset-top) + 56px)',
          // Bottom: BottomNav is 70px tall. Add home-indicator clearance so the
          // last item is never clipped on iPhone/newer Android.
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 70px)',
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
