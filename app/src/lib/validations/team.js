import { z } from 'zod';

/**
 * Team form schema. Sponsor + icon players are free-text (comma-separated when multiple).
 */
export const teamFormSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(255, 'Team name must be 255 characters or less'),
  code: z.string().min(1, 'Team code is required').max(20, 'Team code must be 20 characters or less'),
  country: z.string().min(1, 'Country is required').max(100),
  city: z.string().min(1, 'City is required').max(100),
  sponsor: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v == null || v.trim() === '' ? undefined : v.trim())),
  icon_players: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v == null || v.trim() === '' ? undefined : v.trim())),
});
