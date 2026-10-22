import { describe, expect, it } from 'vitest';

import type { InterestFormField, InterestFormValues } from '../model/schemas';
import { interestNeedsAvatar, interestNeedsDoc, validateInterestForm } from './interestForm';

const fields: InterestFormField[] = ['email', 'date_of_birth', 'city', 'country', 'profile_picture', 'id_document'];

const emptyValues: InterestFormValues = {
  name: '',
  nickname: '',
  phone: '',
  email: 'bad',
  dateOfBirth: '',
  city: '',
  country: '',
};

const goodValues: InterestFormValues = {
  name: 'A',
  nickname: 'a',
  phone: '+92',
  email: 'a@b.co',
  dateOfBirth: '2000-01-01',
  city: 'Lahore',
  country: 'PK',
};

describe('interestNeedsAvatar', () => {
  it('is true only when the campaign asks and nothing is on file', () => {
    expect(interestNeedsAvatar({ formFields: fields }, null, null)).toBe(true);
    expect(interestNeedsAvatar({ formFields: fields }, null, 'https://cdn/a.jpg')).toBe(false);
  });
});

describe('interestNeedsDoc', () => {
  it('is true when campaign asks and no id doc url', () => {
    expect(interestNeedsDoc({ formFields: fields }, null)).toBe(true);
    expect(interestNeedsDoc({ formFields: fields }, { idDocumentUrl: 'https://cdn/d.pdf' })).toBe(false);
  });
});

describe('validateInterestForm', () => {
  it('flags required empty fields', () => {
    const errors = validateInterestForm({
      campaign: { formFields: fields },
      values: emptyValues,
      needsAvatar: true,
      needsDoc: true,
      avatarFile: null,
      avatarPreview: null,
      docFile: null,
      docUrl: null,
    });
    expect(errors.avatar).toBeTruthy();
    expect(errors.doc).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.dateOfBirth).toBeTruthy();
    expect(errors.city).toBeTruthy();
    expect(errors.country).toBeTruthy();
  });

  it('accepts a complete payload', () => {
    const errors = validateInterestForm({
      campaign: { formFields: fields },
      values: goodValues,
      needsAvatar: false,
      needsDoc: false,
      avatarFile: null,
      avatarPreview: 'https://cdn/a.jpg',
      docFile: null,
      docUrl: 'https://cdn/d.pdf',
    });
    expect(errors).toEqual({});
  });
});
