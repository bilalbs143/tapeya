import { describe, expect, it } from 'vitest';

import { getApiErrorMessage, parseApiError } from '@/shared/api/errors';

describe('parseApiError', () => {
  it('maps Laravel validation envelopes', () => {
    const error = {
      status: 422,
      data: {
        message: 'The given data was invalid.',
        type: 'VALIDATION',
        errors: { phone: ['Phone is required.'] },
      },
    };

    expect(parseApiError(error)).toEqual({
      type: 'validation',
      fields: { phone: ['Phone is required.'] },
      message: 'The given data was invalid.',
    });
    expect(getApiErrorMessage(error, 'fallback')).toBe('Phone is required.');
  });

  it('maps 401 without a validation block as unauthorized', () => {
    expect(
      parseApiError({
        status: 401,
        data: { message: 'Invalid OTP.', type: 'UNAUTHORIZED' },
      })
    ).toEqual({ type: 'unauthorized', message: 'Invalid OTP.' });
  });

  it('maps fetch failures as network', () => {
    expect(parseApiError({ status: 'FETCH_ERROR', error: 'Failed to fetch' })).toEqual({
      type: 'network',
      message: 'Could not reach the server. Check your connection.',
    });
  });
});
