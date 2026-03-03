import { z } from 'zod';

/**
 * Team form schema (create team). Aligns with API StoreTeamRequest.
 * - name, code, country, city required; sponsor_user_id (owner) optional; logo optional (file, not in schema).
 * - code uniqueness is enforced by API.
 */
export const teamFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(255, 'Team name must be 255 characters or less'),
  code: z
    .string()
    .min(1, 'Team code is required')
    .max(20, 'Team code must be 20 characters or less'),
  sponsor_user_id: z
    .string()
    .optional()
    .transform((v) => (v === '' || v == null ? undefined : Number(v))),
  country: z.string().min(1, 'Country is required').max(100),
  city: z.string().min(1, 'City is required').max(100),
  icon_player_ids: z.array(z.number().int().positive()).optional().default([]),
});
