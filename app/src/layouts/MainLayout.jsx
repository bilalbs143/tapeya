import { useState } from 'react';

import { Outlet, useLocation } from 'react-router-dom';

import { BottomNav } from '@/components/BottomNav';
import { FacebookAnalyticsBoot } from '@/components/FacebookAnalyticsBoot';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LG_MEDIA_QUERY } from '@/lib/constants/layout';
import { isGoLiveBroadcastPath, isLiveStreamImmersivePath, isNavbarOverlayPath } from '@/lib/utils/routeUtils';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const immersiveLive = isLiveStreamImmersivePath(location.pathname);
  const goLiveCamera = isGoLiveBroadcastPath(location.pathname);
  const noTopPadding = isNavbarOverlayPath(location.pathname, isDesktop);

  return (
    <div className={goLiveCamera ? 'bg-transparent' : 'bg-black'}>
      <FacebookAnalyticsBoot />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        className="lg:ml-[280px]"
        style={{
          paddingTop: noTopPadding ? 0 : 'calc(env(safe-area-inset-top) + 56px)',
          paddingBottom: isDesktop || immersiveLive ? 0 : 'calc(env(safe-area-inset-bottom) + 70px)',
        }}
      >
        <Outlet />
      </main>
      {!immersiveLive && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
