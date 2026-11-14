import { describe, expect, it } from 'vitest';

import { interestActions } from './actions';
import {
  fieldEnabled,
  interestRenderableCustomFields,
  parseInterestDialog,
  parseInterestShow,
  seedFormValues,
  toSubmitWire,
} from './schemas';

describe('interestActions', () => {
  it('opens submit for new entrants and disables when closed', () => {
    const open = interestActions({ campaignStatus: 'open', submissionStatus: null });
    expect(open.showSubmit).toBe(true);
    expect(open.submitLabel).toBe("I'm Interested");
    expect(open.submitDisabled).toBe(false);
    expect(open.showWithdraw).toBe(false);

    const closed = interestActions({ campaignStatus: 'closed', submissionStatus: null });
    expect(closed.submitDisabled).toBe(true);
    expect(closed.banner?.tone).toBe('muted');
  });

  it('lets pending entrants update or withdraw; confirmed is read-only', () => {
    const pending = interestActions({
      campaignStatus: 'open',
      submissionStatus: 'pending',
    });
    expect(pending.submitLabel).toBe('Update My Details');
    expect(pending.showWithdraw).toBe(true);

    const confirmed = interestActions({
      campaignStatus: 'open',
      submissionStatus: 'confirmed',
    });
    expect(confirmed.showSubmit).toBe(false);
    expect(confirmed.readOnlyAll).toBe(true);
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

describe('parseInterestDialog', () => {
  it('maps featured dialog campaign and null payload', () => {
    expect(
      parseInterestDialog({
        data: {
          campaign: {
            slug: 'dialog-cup',
            tournament_name: 'Dialog Cup',
            logo_url: 'https://cdn.test/logo.png',
            my_submission_status: 'pending',
          },
        },
        type: 'SUCCESS',
      })
    ).toEqual({
      campaign: {
        slug: 'dialog-cup',
        tournamentName: 'Dialog Cup',
        logoUrl: 'https://cdn.test/logo.png',
        mySubmissionStatus: 'pending',
      },
    });

    expect(parseInterestDialog({ data: { campaign: null }, type: 'SUCCESS' })).toEqual({ campaign: null });
  });
});

describe('interestRenderableCustomFields', () => {
  it('injects CNIC when id_document is in form_fields and strips legacy custom CNIC', () => {
    expect(
      interestRenderableCustomFields({
        formFields: ['name', 'id_document'],
        customFields: [
          {
            id: 'trial_venue',
            type: 'select',
            label: 'Trial Venue',
            required: true,
            options: ['Lahore'],
          },
        ],
      }).map((f) => f.id)
    ).toEqual(['id_document', 'trial_venue']);

    expect(
      interestRenderableCustomFields({
        formFields: ['name'],
        customFields: [
          {
            id: 'extra_doc',
            type: 'file',
            label: 'Extra Doc',
            required: false,
            options: [],
          },
        ],
      }).map((f) => f.id)
    ).toEqual(['extra_doc']);
  });
});

describe('seedFormValues / toSubmitWire', () => {
  it('prefers submission over profile defaults and builds wire body', () => {
    const customFields = [
      {
        id: 'trial_venue',
        type: 'select' as const,
        label: 'Trial Venue',
        required: true,
        options: ['Lahore', 'Islamabad'],
      },
    ];
    const values = seedFormValues(
      {
        id: 9,
        name: 'Sub Name',
        nickname: 'sub',
        email: 'sub@x.com',
        phone: '99',
        country: 'Pakistan',
        city: 'Lahore',
        customAnswers: { trial_venue: 'Islamabad' },
        dateOfBirth: '2000-02-02',
        profilePictureUrl: null,
        idDocumentUrl: null,
        status: 'pending',
      },
      {
        name: 'Def',
        nickname: 'def',
        email: 'def@x.com',
        phone: '1',
        country: 'Pakistan',
        city: 'Karachi',
        dateOfBirth: '1990-01-01',
        avatarUrl: null,
      },
      customFields
    );
    expect(values.city).toBe('Lahore');
    expect(values.customAnswers.trial_venue).toBe('Islamabad');
    expect(toSubmitWire(values, ['email', 'city', 'date_of_birth'], customFields)).toEqual({
      email: 'sub@x.com',
      city: 'Lahore',
      date_of_birth: '2000-02-02',
      custom_answers: { trial_venue: 'Islamabad' },
    });
  });
});
