import { useState } from 'react';

import { Outlet, useLocation } from 'react-router-dom';

import { BottomNav } from '@/components/BottomNav';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Some pages (like profile header) need content to start at top,
  // behind the fixed navbar (no top padding).
  const isNavbarOverlayPage = location.pathname === '/profile';
  const isTournamentDetails = /^\/upcoming-tournaments\/[^/]+$/.test(
    location.pathname,
  );
  const noTopPadding = isNavbarOverlayPage || isTournamentDetails;

  return (
    <div className="bg-black">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        className={`pb-20 lg:ml-[280px] lg:pb-0 ${noTopPadding ? 'pt-0' : 'pt-16'}`}
      >
        <Outlet />
      </main>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
