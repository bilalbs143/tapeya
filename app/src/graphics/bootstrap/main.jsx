import '@/graphics/shared/styles/tailwind.css';
import './graphicsSurface.css';

import React from 'react';

import ReactDOM from 'react-dom/client';

import { GraphicsBootstrapError } from '@/graphics/bootstrap/GraphicsBootstrapError';
import SignedGraphicsBootstrap from '@/graphics/entry/SignedGraphicsBootstrap';

import { GraphicsStoreProvider } from './GraphicsStoreProvider';
import { parseGraphicsLocation } from './parseGraphicsLocation';

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
