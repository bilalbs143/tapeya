export const SELLER_PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const SELLER_PRODUCT_IMAGE_MAX_MB = 5;

/** Validate picked image files; returns an error message or null. */
export function validateSellerProductImages(files: File[]): string | null {
  for (const file of files) {
    if (!(SELLER_PRODUCT_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return 'Images must be JPG, PNG or WebP.';
    }
    if (file.size > SELLER_PRODUCT_IMAGE_MAX_MB * 1024 * 1024) {
      return `Each image must be under ${SELLER_PRODUCT_IMAGE_MAX_MB} MB.`;
    }
  }
  return null;
}
