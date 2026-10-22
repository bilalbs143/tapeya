import { z } from 'zod';

/** Laravel success envelope — `data` is absent when null (MacroServiceProvider), not null-valued. §7.8 */
export const wireSuccessSchema = z.object({
  data: z.unknown().optional(),
  message: z.string().optional(),
  type: z.enum(['SUCCESS', 'CREATED']).optional(),
});

export const paginationMetaSchema = z.object({
  current_page: z.number(),
  last_page: z.number(),
  per_page: z.number(),
  total: z.number(),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
});

export const wirePaginatedSchema = z.object({
  data: z.array(z.unknown()),
  meta: paginationMetaSchema,
  links: z.record(z.string(), z.string().nullable()).optional(),
});

export const wireCursorPageSchema = z.object({
  items: z.array(z.unknown()),
  next_cursor: z.string().nullable(),
  prev_cursor: z.string().nullable().optional(),
  has_more: z.boolean(),
  per_page: z.number().optional(),
});

/** Backend `type` is an open string — `parseApiError` branches on `errors`, not this field. */
export const wireFailureSchema = z.object({
  message: z.string().optional(),
  type: z.string(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});
