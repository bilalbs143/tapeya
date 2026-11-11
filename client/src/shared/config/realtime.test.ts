import { describe, expect, it } from 'vitest';

import { DEFAULT_REVERB_APP_KEY, deriveReverbEndpointFromApiUrl, resolveReverbConfig } from './realtime';

describe('deriveReverbEndpointFromApiUrl', () => {
  it('uses Reverb :8080 for local HTTP API hosts', () => {
    expect(deriveReverbEndpointFromApiUrl('http://127.0.0.1:8000/api/v1')).toEqual({
      host: '127.0.0.1',
      port: 8080,
      scheme: 'http',
    });
    expect(deriveReverbEndpointFromApiUrl('http://localhost:8000/api/v1')).toEqual({
      host: 'localhost',
      port: 8080,
      scheme: 'http',
    });
  });

  it('uses wss :443 for HTTPS API hosts', () => {
    expect(deriveReverbEndpointFromApiUrl('https://tapeya.com/api/v1')).toEqual({
      host: 'tapeya.com',
      port: 443,
      scheme: 'https',
    });
  });

  it('returns null for invalid URLs', () => {
    expect(deriveReverbEndpointFromApiUrl('not-a-url')).toBeNull();
  });
});

describe('resolveReverbConfig', () => {
  it('defaults app key and derives host when VITE_REVERB_* overrides are empty', () => {
    expect(
      resolveReverbConfig({
        apiUrl: 'http://127.0.0.1:8000/api/v1',
        appKey: undefined,
        host: undefined,
        port: undefined,
        scheme: undefined,
      })
    ).toEqual({
      appKey: DEFAULT_REVERB_APP_KEY,
      host: '127.0.0.1',
      port: 8080,
      scheme: 'http',
    });
  });

  it('honors explicit VITE_REVERB_* overrides', () => {
    expect(
      resolveReverbConfig({
        apiUrl: 'https://tapeya.com/api/v1',
        appKey: 'prod-key',
        host: 'ws.tapeya.com',
        port: '8443',
        scheme: 'https',
      })
    ).toEqual({
      appKey: 'prod-key',
      host: 'ws.tapeya.com',
      port: 8443,
      scheme: 'https',
    });
  });
});
