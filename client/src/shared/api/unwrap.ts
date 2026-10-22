import { z } from 'zod';

import { wireCursorPageSchema, wirePaginatedSchema, wireSuccessSchema } from './envelope';
import type { CursorPage, MutationResult, Paginated } from './types';

/** Array in `success.data`, or a bare JSON array. */
function extractDataArray(raw: unknown): unknown[] {
  const body = wireSuccessSchema.safeParse(raw);
  if (body.success && Array.isArray(body.data.data)) {
    return body.data.data;
  }
  if (Array.isArray(raw)) {
    return raw;
  }
  return [];
}

/** Single resource in `success.data`. */
export function unwrapData<T>(itemSchema: z.ZodType<T>) {
  return (raw: unknown): T => {
    const body = wireSuccessSchema.parse(raw);
    if (body.data === undefined) {
      throw new Error('Expected success.data to be present.');
    }
    return itemSchema.parse(body.data);
  };
}

/** Plain array in `success.data`. */
export function unwrapList<T>(itemSchema: z.ZodType<T>) {
  return (raw: unknown): T[] => {
    const data = extractDataArray(raw);
    return z.array(itemSchema).parse(data);
  };
}

/** Page/per_page pagination; falls back to bare-array success envelopes. */
export function unwrapPaginated<T>(itemSchema: z.ZodType<T>) {
  return (raw: unknown): Paginated<T> => {
    const parsed = wirePaginatedSchema.safeParse(raw);
    if (parsed.success) {
      return {
        items: z.array(itemSchema).parse(parsed.data.data),
        meta: parsed.data.meta,
      };
    }
    const items = extractDataArray(raw);
    return { items: z.array(itemSchema).parse(items), meta: null };
  };
}

/** Cursor page in `success.data`; optional `mapItem` for wire → domain. */
export function unwrapCursorPage<TWire, TDomain = TWire>(
  itemSchema: z.ZodType<TWire>,
  mapItem?: (raw: TWire) => TDomain
) {
  return (raw: unknown): CursorPage<TDomain> => {
    const data = wireSuccessSchema.parse(raw).data;
    if (data === undefined) {
      throw new Error('Expected success.data to be present for a cursor page.');
    }
    const page = wireCursorPageSchema.parse(data);
    const parsedItems = z.array(itemSchema).parse(page.items);
    const items = mapItem ? parsedItems.map(mapItem) : (parsedItems as unknown as TDomain[]);
    return {
      items,
      nextCursor: page.next_cursor,
      prevCursor: page.prev_cursor ?? null,
      hasMore: page.has_more,
      perPage: page.per_page ?? items.length,
    };
  };
}

/** Default delete/bulk unwrap — HTTP 200 with message, no `data` (not 204). §7.8 */
export function unwrapMessage() {
  return (raw: unknown): string | undefined => wireSuccessSchema.parse(raw).message;
}

/** HTTP 204 empty body only — confirm the endpoint; consumer deletes use `unwrapMessage()`. */
export function unwrapVoid() {
  return (_raw: unknown): void => undefined;
}

/** Create/update envelope — entity, optional message, CREATED flag. */
export function unwrapMutation<T>(itemSchema: z.ZodType<T>) {
  return (raw: unknown): MutationResult<T> => {
    const body = wireSuccessSchema.parse(raw);
    return {
      data: body.data == null ? null : itemSchema.parse(body.data),
      message: body.message,
      created: body.type === 'CREATED',
    };
  };
}
