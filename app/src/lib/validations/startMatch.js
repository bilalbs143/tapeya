import { z } from 'zod';

/**
 * Start Match form schema. Aligns with API StoreTournamentMatchRequest.
 * All fields required; scoring is API-only (tournament + both teams).
 *
 * - tournament_id: required
 * - team_a_id, team_b_id: required, must differ
 * - venue: required, max 255
 * - match_date: required (Y-m-d or MM-DD-YYYY)
 * - match_time: required (HH:mm)
 * - players_per_side: required, 2–20
 * - overs: required, 5–50
 */
export const startMatchSchema = z
  .object({
    tournament_id: z.string().min(1, 'Select a tournament'),
    team_a_id: z.string().min(1, 'Select Team A'),
    team_b_id: z.string().min(1, 'Select Team B'),
    venue: z
      .string()
      .min(1, 'Venue is required')
      .max(255, 'Venue must be 255 characters or less')
      .transform((v) => (v ?? '').trim()),
    match_date: z
      .string()
      .min(1, 'Match date is required')
      .refine(
        (v) => {
          if (!v || typeof v !== 'string') return false;
          if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return true;
          const [month, day, year] = v.split(/[-/]/).map(Number);
          if (!month || !day || !year) return false;
          const d = new Date(year, month - 1, day);
          return !Number.isNaN(d.getTime());
        },
        { message: 'Please enter a valid date' },
      ),
    match_time: z
      .string()
      .min(1, 'Match time is required')
      .refine((v) => /^\d{1,2}:\d{2}$/.test((v ?? '').trim()), {
        message: 'Please enter a valid time (e.g. 14:30)',
      }),
    players_per_side: z
      .union([z.string().min(1, 'Players per side is required'), z.number().int().min(2).max(20)])
      .transform((v) => (typeof v === 'string' ? Number(v) : v))
      .refine((v) => Number.isInteger(v) && v >= 2 && v <= 20, {
        message: 'Select 2–20 players per side',
      }),
    overs: z
      .union([z.string().min(1, 'Overs is required'), z.number().int().min(5).max(50)])
      .transform((v) => (v === '' || v == null ? '' : typeof v === 'number' ? String(v) : String(v)))
      .refine((v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 5 && n <= 50;
      }, 'Select 5–50 overs'),
  })
  .refine((data) => data.team_a_id !== data.team_b_id, {
    message: 'Team A and Team B must be different',
    path: ['team_b_id'],
  });
