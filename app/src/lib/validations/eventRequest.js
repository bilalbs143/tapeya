import { z } from 'zod';

const phoneSchema = z
  .string()
  .min(1, 'Phone is required')
  .refine(
    (v) => /^\+[1-9]\d{6,}$/.test(v),
    'Enter a valid phone number (e.g. +923001234567)',
  );

/**
 * Event request form schema. Keys match event_requests table columns for easy submit mapping.
 * All fields required; enums validated by API.
 */
export const eventRequestSchema = z
  .object({
    contact_person_name: z
      .string()
      .min(1, 'Contact person name is required')
      .max(255),
    contact_phone: phoneSchema.max(30),
    event_name: z.string().min(1, 'Event name is required').max(255),
    event_type: z.string().min(1, 'Event type is required'),
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
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    { message: 'End date must be on or after start date', path: ['end_date'] },
  )
  .refine(
    (data) => {
      if (!data.start_date) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(data.start_date) >= today;
    },
    { message: 'Start date must be today or later', path: ['start_date'] },
  );
