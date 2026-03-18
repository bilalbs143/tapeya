import { z } from 'zod';

/** Fallback when API group_mode enum is not yet loaded (must match API GroupModeEnum). */
const DEFAULT_GROUP_MODE_VALUES = ['open', 'group_wise'];

const phoneSchema = z
  .string()
  .min(1, 'Phone is required')
  .refine(
    (v) => /^\+[1-9]\d{6,}$/.test(v),
    'Enter a valid phone number (e.g. +923001234567)',
  );

/**
 * Parse date string (MM-DD-YYYY or YYYY-MM-DD) to Date without relying on browser's
 * new Date(string), which can fail on mobile Safari for non-ISO formats.
 */
function parseDateString(str) {
  if (!str || typeof str !== 'string') return null;
  const parts = str
    .trim()
    .split(/[-/]/)
    .map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [a, b, c] = parts;
  let year, month, day;
  if (a >= 1 && a <= 31 && c >= 1000) {
    month = a;
    day = b;
    year = c;
  } else if (c >= 1 && c <= 31 && a >= 1000) {
    year = a;
    month = b;
    day = c;
  } else {
    return null;
  }
  const d = new Date(year, month - 1, day);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Build tournament request form schema using group mode values (e.g. from API enums).
 * Pass enums.group_mode.map(o => o.value) or [] to use fallback ['open', 'group_wise'].
 * Keys match tournament_requests table columns for easy submit mapping.
 *
 * @param {string[]} groupModeValues - Allowed group_mode values from API (GET /enums → group_mode[].value)
 */
export function createTournamentRequestSchema(groupModeValues = []) {
  const groupModeEnum =
    Array.isArray(groupModeValues) && groupModeValues.length >= 2
      ? groupModeValues
      : DEFAULT_GROUP_MODE_VALUES;

  return z
    .object({
      contact_person_name: z
        .string()
        .min(1, 'Contact person name is required')
        .max(255),
      contact_phone: phoneSchema.max(30),
      tournament_name: z
        .string()
        .min(1, 'Tournament name is required')
        .max(255),
      tournament_type: z.string().min(1, 'Tournament type is required'),
      cricket_format: z.string().min(1, 'Cricket format is required'),
      venue_name: z.string().min(1, 'Venue name is required').max(255),
      start_date: z.string().min(1, 'Start date is required'),
      end_date: z.string().min(1, 'End date is required'),
      number_of_matches: z.coerce
        .number({ invalid_type_error: 'Enter a number' })
        .int('Must be a whole number')
        .min(1, 'At least 1 match')
        .max(1000),
      number_of_teams: z.coerce
        .number({ invalid_type_error: 'Enter a number' })
        .int('Must be a whole number')
        .min(1, 'At least 1 team')
        .max(500),
      expected_players_count: z.coerce
        .number({ invalid_type_error: 'Enter a number' })
        .int('Must be a whole number')
        .min(1, 'At least 1 player')
        .max(10000),
      country: z.string().min(1, 'Country is required').max(100),
      city: z.string().min(1, 'City is required').max(100),
      match_timings: z.string().min(1, 'Match timings is required'),
      prize: z.string().max(255).optional(),
      group_mode: z.enum(groupModeEnum, {
        required_error: 'Select Open Group or Group Wise',
      }),
      number_of_groups: z.coerce
        .number({ invalid_type_error: 'Enter a number' })
        .int('Must be a whole number')
        .min(2, 'At least 2 groups')
        .max(16, 'At most 16 groups')
        .optional(),
    })
    .refine(
      (data) => {
        const groupWiseValue = groupModeEnum.includes('group_wise')
          ? 'group_wise'
          : groupModeEnum[groupModeEnum.length - 1];
        if (data.group_mode !== groupWiseValue) return true;
        const n = data.number_of_groups;
        return n != null && Number(n) >= 2 && Number(n) <= 16;
      },
      {
        message:
          'Number of groups is required (2–16) when Group Wise is selected',
        path: ['number_of_groups'],
      },
    )
    .refine(
      (data) => {
        if (!data.start_date || !data.end_date) return true;
        const start = parseDateString(data.start_date);
        const end = parseDateString(data.end_date);
        if (!start || !end) return true;
        return end >= start;
      },
      {
        message: 'End date must be on or after start date',
        path: ['end_date'],
      },
    )
    .refine(
      (data) => {
        if (!data.start_date) return true;
        const start = parseDateString(data.start_date);
        if (!start) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startMidnight = new Date(start);
        startMidnight.setHours(0, 0, 0, 0);
        return startMidnight >= today;
      },
      { message: 'Start date must be today or later', path: ['start_date'] },
    );
}

/** Default schema using fallback group mode values (for when API is not used). */
export const tournamentRequestSchema = createTournamentRequestSchema();
