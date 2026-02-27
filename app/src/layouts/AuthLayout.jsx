import { Outlet } from 'react-router-dom';

/**
 * Auth layout - black background so splash → login transition has no flash.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <Outlet />
    </div>
  );
}
