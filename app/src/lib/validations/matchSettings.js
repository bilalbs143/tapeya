import { z } from 'zod';

const officialField = z.string().max(2000, 'Maximum 2000 characters.');

export const matchSettingsFormSchema = z.object({
  wagon_wheel_enabled: z.boolean(),
  umpires: officialField,
  scorers: officialField,
  commentators: officialField,
});
