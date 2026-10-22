import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

const openCampaign = {
  id: 1,
  tournament_id: 1,
  is_linked: true,
  tournament_name: 'Ramzan Cup',
  slug: 'ramzan-cup-2026',
  description: 'Sixteen sides, tape-ball, floodlit nights. Tell us you want in and our team will call.',
  form_fields: [
    'profile_picture',
    'name',
    'nickname',
    'phone',
    'email',
    'date_of_birth',
    'country',
    'city',
    'id_document',
  ],
  logo_url: null,
  show_in_sidebar: true,
  show_dialog: true,
  status: 'open',
  status_label: 'Open',
};

const profileDefaults = {
  name: 'Zain Karim',
  nickname: 'zkarim',
  email: 'zain@example.com',
  phone: '+923001234567',
  country: 'Pakistan',
  city: 'Karachi',
  date_of_birth: '1998-03-14',
  avatar_url: null,
};

export const interestHandlers = [
  http.get(`${env.VITE_API_URL}/interest-campaigns/:slug`, ({ params }) => {
    const slug = String(params.slug);
    if (slug === 'missing-campaign') {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    if (slug === 'floodlight-cup-closed') {
      return HttpResponse.json({
        data: {
          campaign: {
            ...openCampaign,
            id: 2,
            slug: 'floodlight-cup-closed',
            tournament_name: 'Floodlight Cup',
            status: 'closed',
            status_label: 'Closed',
            form_fields: ['name', 'nickname', 'phone', 'email'],
          },
          my_submission: null,
          profile_defaults: profileDefaults,
        },
        type: 'SUCCESS',
      });
    }
    return HttpResponse.json({
      data: {
        campaign: { ...openCampaign, slug },
        my_submission: null,
        profile_defaults: profileDefaults,
      },
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/interest-campaigns/:slug/submissions`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    return HttpResponse.json(
      {
        data: {
          id: 55,
          campaign_id: 1,
          name: profileDefaults.name,
          nickname: body.nickname ?? profileDefaults.nickname,
          email: body.email ?? profileDefaults.email,
          phone: profileDefaults.phone,
          country: body.country ?? profileDefaults.country,
          city: body.city ?? profileDefaults.city,
          date_of_birth: body.date_of_birth ?? profileDefaults.date_of_birth,
          profile_picture_url: null,
          id_document_url: null,
          status: 'pending',
          status_label: 'Pending',
        },
        message: 'Interest submitted.',
        type: 'CREATED',
      },
      { status: 201 }
    );
  }),

  http.delete(`${env.VITE_API_URL}/interest-campaigns/:slug/submissions/me`, () => {
    return HttpResponse.json({
      data: {
        id: 55,
        campaign_id: 1,
        name: profileDefaults.name,
        nickname: profileDefaults.nickname,
        email: profileDefaults.email,
        phone: profileDefaults.phone,
        country: profileDefaults.country,
        city: profileDefaults.city,
        date_of_birth: profileDefaults.date_of_birth,
        profile_picture_url: null,
        id_document_url: null,
        status: 'withdrawn',
        status_label: 'Withdrawn',
        withdrawn_at: new Date().toISOString(),
      },
      message: 'Interest withdrawn.',
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/media/:type/:id/:field`, () => {
    return HttpResponse.json({
      data: { url: 'https://cdn.example.com/interest/doc.pdf' },
      type: 'SUCCESS',
    });
  }),
];
