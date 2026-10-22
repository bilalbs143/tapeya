import { describe, expect, it } from 'vitest';

import {
  mapSupportApiFieldErrors,
  omitSupportErrorKey,
  supportApiErrorsFromUnknown,
  validateSupportForm,
} from './supportForm';

describe('omitSupportErrorKey', () => {
  it('removes one key without mutating others', () => {
    expect(omitSupportErrorKey({ name: 'x', message: 'y' }, 'name')).toEqual({ message: 'y' });
  });
});

describe('validateSupportForm', () => {
  it('requires name and message length', () => {
    expect(validateSupportForm('A', 'short')).toEqual({
      name: 'Tell us who to reply to.',
      message: 'A line or two more — we need enough to help.',
    });
    expect(validateSupportForm('Ali Khan', 'This is long enough.')).toEqual({});
  });
});

describe('mapSupportApiFieldErrors', () => {
  it('renames attachment to file', () => {
    expect(mapSupportApiFieldErrors({ attachment: ['Too big'], name: ['Required'] })).toEqual({
      file: 'Too big',
      name: 'Required',
    });
  });
});

describe('supportApiErrorsFromUnknown', () => {
  it('reads RTK error envelopes', () => {
    expect(supportApiErrorsFromUnknown({ data: { errors: { name: ['Required'] } } })).toEqual({
      name: ['Required'],
    });
    expect(supportApiErrorsFromUnknown(null)).toBeUndefined();
  });
});
