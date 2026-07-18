import { z } from 'zod';

/**
 * Build Go Live form schema using orientation values from GET /enums → stream_orientation.
 * Same pattern as createTournamentRequestSchema(groupModeValues).
 *
 * @param {string[]} orientationValues — enums.stream_orientation.map((o) => o.value)
 */
export function createGoLiveSchema(orientationValues = []) {
  const orientationField =
    Array.isArray(orientationValues) && orientationValues.length >= 1
      ? z.enum(orientationValues)
      : z.string().min(1, 'Orientation is required');

  return z.object({
    title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
    description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional().or(z.literal('')),
    orientation: orientationField,
  });
}
