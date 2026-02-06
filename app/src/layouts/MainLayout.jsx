import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

/**
 * Main app layout - header, content area, sidebar drawer, bottom nav
 */
export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Some pages (like profile header) need content to start at top,
  // behind the fixed navbar (no top padding).
  const isNavbarOverlayPage = location.pathname === '/user-profile';

  return (
    <div className="min-h-screen bg-black">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={`pb-20 ${isNavbarOverlayPage ? 'pt-0' : 'pt-16'}`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
