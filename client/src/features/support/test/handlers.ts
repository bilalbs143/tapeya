import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

export const supportHandlers = [
  http.get(`${env.VITE_API_URL}/system-settings`, () =>
    HttpResponse.json({
      data: [{ key: 'support_phone', value: '+923001234567' }],
      type: 'SUCCESS',
    })
  ),

  http.post(`${env.VITE_API_URL}/support/messages`, async ({ request }) => {
    const contentType = request.headers.get('content-type') ?? '';
    let name = '';
    let message = '';
    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData();
      name = String(fd.get('name') ?? '');
      message = String(fd.get('message') ?? '');
    } else {
      const body = (await request.json()) as { name?: string; message?: string };
      name = body.name ?? '';
      message = body.message ?? '';
    }
    if (name.trim().length < 2 || message.trim().length < 10) {
      return HttpResponse.json(
        {
          message: 'Validation failed.',
          type: 'VALIDATION_ERROR',
          errors: {
            ...(name.trim().length < 2 ? { name: ['Name is required.'] } : {}),
            ...(message.trim().length < 10 ? { message: ['Message should be at least 10 characters.'] } : {}),
          },
        },
        { status: 422 }
      );
    }
    return HttpResponse.json(
      {
        data: { id: 77 },
        message: 'Your message has been sent. We will get back to you soon.',
        type: 'CREATED',
      },
      { status: 201 }
    );
  }),
];
