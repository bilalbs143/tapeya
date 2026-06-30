import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="bg-black">
      <div className="mx-auto flex min-h-[100vh] w-full items-center lg:items-start">
        <Outlet />
      </div>
    </div>
  );
}
