import { describe, expect, it } from 'vitest';

import { interestFormActions, interestStatusCopy } from './actions';
import {
  fieldEnabled,
  interestRenderableCustomFields,
  parseInterestDialog,
  parseInterestShow,
  seedFormValues,
  toSubmitWire,
} from './schemas';

describe('interestFormActions', () => {
  it('opens submit for new entrants and disables when closed', () => {
    const open = interestFormActions({ campaignStatus: 'open', hasSubmission: false });
    expect(open.showSubmit).toBe(true);
    expect(open.submitLabel).toBe("I'm Interested");
    expect(open.submitDisabled).toBe(false);
    expect(open.closedBanner).toBe(false);

    const closed = interestFormActions({ campaignStatus: 'closed', hasSubmission: false });
    expect(closed.submitDisabled).toBe(true);
    expect(closed.closedBanner).toBe(true);
  });

  it('hides submit once a submission exists', () => {
    const pending = interestFormActions({ campaignStatus: 'open', hasSubmission: true });
    expect(pending.showSubmit).toBe(false);
    expect(pending.submitDisabled).toBe(true);
  });
});

describe('interestStatusCopy', () => {
  it('describes pending and confirmed clearly', () => {
    const pending = interestStatusCopy('pending');
    expect(pending.title).toBe('Interest Submitted');
    expect(pending.badge).toBe('Under Review');

    const confirmed = interestStatusCopy('confirmed');
    expect(confirmed.title).toBe('Your Spot Is Confirmed');
    expect(confirmed.badgeVariant).toBe('positive');
  });
});

describe('parseInterestShow', () => {
  it('maps wire show payload into domain', () => {
    const payload = parseInterestShow({
      data: {
        campaign: {
          id: 1,
          tournament_name: 'Ramzan Cup',
          slug: 'ramzan-cup-2026',
          description: 'Hello',
          form_fields: ['name', 'email', 'city'],
          custom_fields: [
            {
              id: 'trial_venue',
              type: 'select',
              label: 'Trial Venue',
              required: true,
              options: ['Lahore', 'Islamabad'],
            },
          ],
          logo_url: null,
          status: 'open',
        },
        my_submission: null,
        profile_defaults: {
          name: 'Zain',
          nickname: 'z',
          email: 'z@x.com',
          phone: '1',
          country: 'Pakistan',
          city: 'Karachi',
          date_of_birth: '1998-01-01',
          avatar_url: null,
        },
      },
      type: 'SUCCESS',
    });

    expect(payload.campaign.tournamentName).toBe('Ramzan Cup');
    expect(payload.campaign.formFields).toEqual(['name', 'email', 'city']);
    expect(payload.campaign.customFields).toEqual([
      {
        id: 'trial_venue',
        type: 'select',
        label: 'Trial Venue',
        required: true,
        options: ['Lahore', 'Islamabad'],
      },
    ]);
    expect(payload.profileDefaults?.name).toBe('Zain');
    expect(fieldEnabled(payload.campaign.formFields, 'email')).toBe(true);
    expect(fieldEnabled(payload.campaign.formFields, 'phone')).toBe(false);
  });
});

describe('interestRenderableCustomFields', () => {
  it('injects CNIC when id_document is in form_fields and strips legacy custom CNIC', () => {
    const fields = interestRenderableCustomFields({
      id: 1,
      slug: 'x',
      tournamentName: 'T',
      description: null,
      formFields: ['name', 'id_document'],
      customFields: [
        { id: 'id_document', type: 'file', label: 'Old CNIC', required: true, options: [] },
        { id: 'trial_venue', type: 'select', label: 'Venue', required: true, options: ['A'] },
      ],
      logoUrl: null,
      status: 'open',
    });
    expect(fields.map((f) => f.id)).toEqual(['id_document', 'trial_venue']);
    expect(fields[0]?.label).toBe('CNIC / B-Form');
  });
});

describe('seedFormValues / toSubmitWire', () => {
  it('seeds defaults and only sends enabled fields', () => {
    const values = seedFormValues(
      null,
      {
        name: 'Zain',
        nickname: 'z',
        email: 'z@x.com',
        phone: '1',
        country: 'Pakistan',
        city: 'Karachi',
        dateOfBirth: '1998-01-01',
        avatarUrl: null,
      },
      [{ id: 'trial_venue', type: 'select', label: 'Venue', required: true, options: ['Lahore'] }]
    );
    expect(values.country).toBe('Pakistan');
    expect(values.customAnswers.trial_venue).toBe('');

    const wire = toSubmitWire(
      { ...values, city: 'Lahore', customAnswers: { trial_venue: 'Lahore' } },
      ['email', 'city', 'country'],
      [{ id: 'trial_venue', type: 'select', label: 'Venue', required: true, options: ['Lahore'] }]
    );
    expect(wire).toEqual({
      email: 'z@x.com',
      city: 'Lahore',
      country: 'Pakistan',
      custom_answers: { trial_venue: 'Lahore' },
    });
  });
});

describe('parseInterestDialog', () => {
  it('maps dialog campaign and submission status', () => {
    const payload = parseInterestDialog({
      data: {
        campaign: {
          slug: 'junior',
          tournament_name: 'Junior',
          my_submission_status: 'pending',
        },
      },
      type: 'SUCCESS',
    });
    expect(payload.campaign?.slug).toBe('junior');
    expect(payload.campaign?.mySubmissionStatus).toBe('pending');
  });
});
