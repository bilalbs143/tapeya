import { useRoutes } from 'react-router-dom';

import { AppProviders } from './AppProviders';
import { routes } from './routes';

function AppRoutes() {
  return useRoutes(routes);
}

export function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
