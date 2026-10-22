import { z } from 'zod';

export const GO_LIVE_THUMB_MAX_BYTES = 5 * 1024 * 1024;
export const GO_LIVE_TITLE_MAX = 100;
export const GO_LIVE_DESCRIPTION_MAX = 500;

export const GO_LIVE_TERMS = [
  'No spam, harassment or targeting individuals.',
  'No nudity, violence or otherwise inappropriate content.',
  'Tapeya staff may end a stream and revoke broadcast access.',
  'Broadcasts are capped at 2 hours.',
] as const;

export function isGoLiveThumbFile(file: File | null | undefined, maxBytes = GO_LIVE_THUMB_MAX_BYTES): boolean {
  return Boolean(file && file.size <= maxBytes);
}

/** Build Go Live form schema using orientation values from GET /enums → stream_orientation. */
export function createGoLiveSchema(orientationValues: string[] = []) {
  const orientationField =
    Array.isArray(orientationValues) && orientationValues.length >= 1
      ? z.enum(orientationValues as [string, ...string[]])
      : z.string().trim().min(1, 'Orientation is required');

  return z.object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(GO_LIVE_TITLE_MAX, `Title must be ${GO_LIVE_TITLE_MAX} characters or fewer`),
    description: z
      .string()
      .trim()
      .max(GO_LIVE_DESCRIPTION_MAX, `Description must be ${GO_LIVE_DESCRIPTION_MAX} characters or fewer`)
      .optional()
      .or(z.literal('')),
    orientation: orientationField,
  });
}

export type GoLiveFormValues = {
  title: string;
  description: string;
  orientation: string;
};

export type GoLiveFormValidation = { ok: true; values: GoLiveFormValues } | { ok: false; message: string };

export function validateGoLiveForm(
  input: { title: string; description: string; orientation: string },
  orientationValues: string[],
  busy: boolean
): GoLiveFormValidation {
  if (busy) return { ok: false, message: 'Please wait…' };

  const parsed = createGoLiveSchema(orientationValues).safeParse({
    title: input.title,
    description: input.description,
    orientation: input.orientation,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Check the form and try again.';
    return { ok: false, message };
  }

  return {
    ok: true,
    values: {
      title: parsed.data.title,
      description: typeof parsed.data.description === 'string' ? parsed.data.description : '',
      orientation: String(parsed.data.orientation),
    },
  };
}

export function canSubmitGoLive(title: string, busy: boolean, orientation: string, orientationReady: boolean): boolean {
  return Boolean(title.trim()) && Boolean(orientation.trim()) && orientationReady && !busy;
}
