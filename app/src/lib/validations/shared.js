import { isValidPhoneNumber } from 'libphonenumber-js/min';
import { z } from 'zod';

import { normalizePhoneE164 } from '@/lib/phoneCodes';

export const phoneSchema = z
  .string()
  .min(1, 'Phone is required')
  .transform((v) => normalizePhoneE164(v))
  .refine((v) => {
    try {
      return isValidPhoneNumber(v);
    } catch {
      return false;
    }
  }, 'Enter a valid phone number for the selected country');
