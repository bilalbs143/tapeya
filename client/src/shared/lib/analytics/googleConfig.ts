import { env } from '@/shared/config/env';

/** GA4 Measurement ID (Admin → Data streams → Web). */
export const GA_MEASUREMENT_ID = env.VITE_GA_MEASUREMENT_ID?.trim() || 'G-MR83CQDG6Z';
