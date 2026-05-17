import { useState } from 'react';

import { Outlet, useLocation } from 'react-router-dom';

import { BottomNav } from '@/components/BottomNav';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Some pages (like profile header) need content to start at top,
  // behind the fixed navbar (no top padding).
  const isNavbarOverlayPage = location.pathname === '/profile';
  const isTournamentDetails = /^\/upcoming-tournaments\/[^/]+$/.test(location.pathname);
  const noTopPadding = isNavbarOverlayPage || isTournamentDetails;

  return (
    <div className="bg-black">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        className="lg:ml-[280px] lg:pb-0"
        style={{
          // Top: match navbar's real rendered height (64px content + status-bar inset).
          // Pages that need content behind the navbar (profile, tournament details)
          // opt out via noTopPadding.
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
      <FloatingCartButton />
    </div>
  );
}
