import { Outlet } from 'react-router-dom';

/**
 * Auth layout - black background so splash → login transition has no flash.
 */
export function AuthLayout() {
  return (
    <div className="fixed inset-0 overflow-visible bg-black">
      <Outlet />
    </div>
  );
}
