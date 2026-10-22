export function omitSupportErrorKey(errors: Record<string, string>, key: string): Record<string, string> {
  if (!(key in errors)) return errors;
  const next = { ...errors };
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- drop one field key
  delete next[key];
  return next;
}

export function validateSupportForm(name: string, message: string): Record<string, string> {
  const next: Record<string, string> = {};
  if (name.trim().length < 2) next.name = 'Tell us who to reply to.';
  if (message.trim().length < 10) next.message = 'A line or two more — we need enough to help.';
  return next;
}

/** Map Laravel field bags onto form keys (`attachment` → `file`). */
export function mapSupportApiFieldErrors(apiErrors: Record<string, string[]> | undefined): Record<string, string> {
  if (!apiErrors) return {};
  const fieldErrors: Record<string, string> = {};
  for (const field of ['name', 'message', 'phone', 'attachment'] as const) {
    const msg = apiErrors[field]?.[0];
    if (msg) fieldErrors[field === 'attachment' ? 'file' : field] = msg;
  }
  return fieldErrors;
}

export function supportApiErrorsFromUnknown(err: unknown): Record<string, string[]> | undefined {
  if (typeof err !== 'object' || err == null || !('data' in err)) return undefined;
  const data = (err as { data?: unknown }).data;
  if (typeof data !== 'object' || data == null || !('errors' in data)) return undefined;
  const errors = (data as { errors?: unknown }).errors;
  if (typeof errors !== 'object' || errors == null) return undefined;
  return errors as Record<string, string[]>;
}
