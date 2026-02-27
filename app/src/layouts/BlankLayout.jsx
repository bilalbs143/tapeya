import { Outlet } from 'react-router-dom';

/**
 * Blank layout - no header/sidebar (auth, splash, etc.)
 */
export function BlankLayout() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      <Outlet />
    </div>
  );
}
