import { Outlet } from 'react-router-dom';

/**
 * Auth layout - black background so splash → login transition has no flash.
 */
export function AuthLayout() {
  return (
    <div className="bg-black">
      <div className="mx-auto flex min-h-[100dvh] w-full items-center">
        <Outlet />
      </div>
    </div>
  );
}
