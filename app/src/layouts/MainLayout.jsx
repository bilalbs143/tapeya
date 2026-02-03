import { Outlet } from 'react-router-dom';

/**
 * Main app layout - header, content area
 */
export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-10 bg-white shadow-sm dark:bg-slate-800">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Tapeya
          </h1>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
