import { z } from 'zod';

/** Pre-broadcast form — POST /live/broadcasts (title/description limits mirror the API). */
export const goLiveSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional().or(z.literal('')),
});
