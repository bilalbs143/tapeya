import '@/graphics/shared/styles/tailwind.css';
import './graphicsSurface.css';

import React from 'react';

import ReactDOM from 'react-dom/client';

import { bootstrapCdnFromPublicSettings } from '@/lib/bootstrapCdn';

async function start() {
  await bootstrapCdnFromPublicSettings();

  const [{ GraphicsBootstrapError }, { default: SignedGraphicsBootstrap }, { GraphicsStoreProvider }, { parseGraphicsLocation }] =
    await Promise.all([
      import('@/graphics/bootstrap/GraphicsBootstrapError'),
      import('@/graphics/entry/SignedGraphicsBootstrap'),
      import('./GraphicsStoreProvider'),
      import('./parseGraphicsLocation'),
    ]);

  const parsed = parseGraphicsLocation(window.location);

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <GraphicsStoreProvider>
        {parsed?.error === 'expired' ? (
          <GraphicsBootstrapError
            reason="token-expired"
            message="Graphics access token has expired. Generate a new overlay URL from the admin panel."
            sessionId={parsed.sessionId}
          />
        ) : parsed ? (
          <SignedGraphicsBootstrap accessToken={parsed.accessToken} sessionId={parsed.sessionId} />
        ) : (
          <GraphicsBootstrapError
            reason="invalid-graphics-path"
            message="URL path must be /{sessionId}-{expires}-{signature} on graphics.tapeya.com."
          />
        )}
      </GraphicsStoreProvider>
    </React.StrictMode>,
  );
}

start();
