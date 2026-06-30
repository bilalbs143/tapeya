import { Outlet } from 'react-router-dom';

import { FacebookAnalyticsBoot } from '@/components/FacebookAnalyticsBoot';

export function AuthLayout() {
  return (
    <div className="bg-black">
      <FacebookAnalyticsBoot />
      <div className="mx-auto flex min-h-[100vh] w-full items-center lg:items-start">
        <Outlet />
      </div>
    </div>
  );
}
