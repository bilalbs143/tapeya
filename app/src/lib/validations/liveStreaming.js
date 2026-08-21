import { z } from 'zod';

/**
 * Create / edit watch-URL live streams (YouTube, Facebook, HLS) — mirrors admin external provider.
 */
export const liveStreamingSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
  streaming_url: z
    .string()
    .trim()
    .min(1, 'Streaming URL is required')
    .url('Enter a valid URL')
    .refine((value) => value.startsWith('https://'), 'URL must start with https://')
    .max(2048, 'URL must be 2048 characters or fewer'),
});
