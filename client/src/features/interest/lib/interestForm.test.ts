import { describe, expect, it } from 'vitest';

import type { InterestFormField, InterestFormValues } from '../model/schemas';
import { interestNeedsAvatar, validateInterestForm } from './interestForm';

const fields: InterestFormField[] = ['email', 'date_of_birth', 'city', 'country', 'profile_picture', 'id_document'];

const emptyValues: InterestFormValues = {
  name: '',
  nickname: '',
  phone: '',
  email: 'bad',
  dateOfBirth: '',
  city: '',
  country: '',
  customAnswers: { trial_venue: '' },
};

const goodValues: InterestFormValues = {
  name: 'A',
  nickname: 'a',
  phone: '+92',
  email: 'a@b.co',
  dateOfBirth: '2000-01-01',
  city: 'Lahore',
  country: 'PK',
  customAnswers: { trial_venue: 'Lahore' },
};

const customFields = [
  {
    id: 'trial_venue',
    type: 'select' as const,
    label: 'Trial Venue',
    required: true,
    options: ['Lahore', 'Islamabad'],
  },
];

describe('interestNeedsAvatar', () => {
  it('is true only when the campaign asks and nothing is on file', () => {
    expect(interestNeedsAvatar({ formFields: fields }, null, null)).toBe(true);
    expect(interestNeedsAvatar({ formFields: fields }, null, 'https://cdn/a.jpg')).toBe(false);
  });
});

describe('validateInterestForm', () => {
  it('flags required empty fields', () => {
    const errors = validateInterestForm({
      campaign: { formFields: fields, customFields },
      values: emptyValues,
      needsAvatar: true,
      avatarFile: null,
      avatarPreview: null,
      customFiles: {},
      customFileUrls: {},
      activeSubmission: null,
    });
    expect(errors.avatar).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.dateOfBirth).toBeTruthy();
    expect(errors.city).toBeTruthy();
    expect(errors.country).toBeTruthy();
    expect(errors.custom?.trial_venue).toBeTruthy();
    expect(errors.custom?.id_document).toBeTruthy();
  });

  it('accepts a complete payload', () => {
    const errors = validateInterestForm({
      campaign: { formFields: fields, customFields },
      values: goodValues,
      needsAvatar: false,
      avatarFile: null,
      avatarPreview: 'https://cdn/a.jpg',
      customFiles: { id_document: new File(['x'], 'cnic.pdf', { type: 'application/pdf' }) },
      customFileUrls: {},
      activeSubmission: null,
    });
    expect(errors).toEqual({});
  });
});
