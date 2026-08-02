import '@/assets/css/style.scss';
import './index.css';

import React from 'react';

import ReactDOM from 'react-dom/client';

import { bootstrapCdnFromPublicSettings } from '@/lib/bootstrapCdn';

async function start() {
  await bootstrapCdnFromPublicSettings();

  const [{ StoreProvider }, { default: App }] = await Promise.all([import('@/providers/StoreProvider'), import('./App')]);

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <StoreProvider>
        <App />
      </StoreProvider>
    </React.StrictMode>,
  );
}

start();
