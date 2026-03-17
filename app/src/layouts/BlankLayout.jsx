import { Outlet } from 'react-router-dom';

export function BlankLayout() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      <Outlet />
    </div>
  );
}
