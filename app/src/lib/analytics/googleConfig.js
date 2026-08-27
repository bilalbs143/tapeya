/** GA4 Measurement ID (Admin → Data streams → Web). */
export const GA_MEASUREMENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID?.trim()) || 'G-MR83CQDG6Z';
