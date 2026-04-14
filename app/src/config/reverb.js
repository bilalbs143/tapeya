/**
 * Laravel Reverb client defaults for Echo (aligned with `api/.env.example` REVERB_*).
 * Edit these values for non-local deploys.
 */
const DEFAULTS = {
  enabled: true,
  appKey: 'local-reverb-key',
  host: 'localhost',
  port: 8080,
  scheme: 'http',
};

/**
 * @returns {{ enabled: boolean, appKey: string, host: string, port: number, scheme: string }}
 */
export function getReverbClientConfig() {
  return { ...DEFAULTS };
}
