import { z } from 'zod';

/** Treat missing / empty Vite env strings as undefined. */
function emptyToUndefined(value: unknown): unknown {
  return value === '' || value === undefined ? undefined : value;
}

/** Fail fast at startup on bad/missing Vite env. §3 */
const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_URL: z.string().url(),
  VITE_CDN_BASE: z.string().url(),
  VITE_SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
  VITE_REVERB_APP_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  VITE_REVERB_HOST: z.preprocess(emptyToUndefined, z.string().optional()),
  VITE_REVERB_PORT: z.preprocess(emptyToUndefined, z.string().optional()),
  VITE_REVERB_SCHEME: z.preprocess(emptyToUndefined, z.enum(['http', 'https']).optional()),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
}

export const env = parsed.data;
