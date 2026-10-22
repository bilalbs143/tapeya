export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const DOC_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;

export function checkInterestUpload(file: File, kind: 'avatar' | 'doc'): string | null {
  const types = kind === 'avatar' ? AVATAR_TYPES : DOC_TYPES;
  const maxMb = kind === 'avatar' ? 5 : 10;
  if (!(types as readonly string[]).includes(file.type)) {
    return kind === 'avatar' ? 'Profile picture must be JPG, PNG or WebP.' : 'ID document must be an image or PDF.';
  }
  if (file.size > maxMb * 1024 * 1024) return `That file is over ${maxMb} MB.`;
  return null;
}
