import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

/**
 * Main app layout - header, content area, sidebar drawer, bottom nav
 */
export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
