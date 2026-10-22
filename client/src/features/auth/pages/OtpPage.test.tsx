import { Route, Routes } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { env } from '@/shared/config/env';
import { dialogStore } from '@/shared/dialogs';

import { renderWithProviders } from '@/test/renderWithProviders';
import { server } from '@/test/server';

import OtpPage from './OtpPage';

function renderOtp(phone = '+923001234567', state: { phone?: string; debugOtp?: string } = { phone }) {
  return renderWithProviders(
    <Routes>
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/" element={<div>Home</div>} />
    </Routes>,
    { initialEntries: [{ pathname: '/otp', state }] }
  );
}

describe('OtpPage', () => {
  it('shows a field error for a bad OTP and does not open session-expired', async () => {
    const user = userEvent.setup();
    // No debugOtp — manual entry path (auto-submit only runs when API returns OTP).
    renderOtp('+923001234567', { phone: '+923001234567' });

    await user.click(screen.getByLabelText('Digit 1'));
    await user.paste('0000');
    await user.click(screen.getByRole('button', { name: /verify/i }));

    expect(await screen.findByText(/incorrect otp|invalid otp/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(dialogStore.getSnapshot()).toHaveLength(0);
    });
  });

  it('navigates home after a successful OTP', async () => {
    const user = userEvent.setup();
    renderOtp('+923001234567', { phone: '+923001234567' });

    await user.click(screen.getByLabelText('Digit 1'));
    await user.paste('4821');
    // onComplete auto-submits when all cells are filled

    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(dialogStore.getSnapshot()).toHaveLength(0);
  });

  it('auto-submits debug OTP for non-test phones (same as app/)', async () => {
    renderOtp('+923001234567', { phone: '+923001234567', debugOtp: '4821' });

    expect(await screen.findByText('Home', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(dialogStore.getSnapshot()).toHaveLength(0);
  });

  it('shows the test-phone OTP banner without auto-submitting', async () => {
    server.use(
      http.get(`${env.VITE_API_URL}/system-settings`, () =>
        HttpResponse.json({
          data: [{ key: 'test_otp_phones', value: '+923001234567' }],
          type: 'SUCCESS',
        })
      )
    );

    renderOtp('+923001234567', { phone: '+923001234567', debugOtp: '4821' });

    expect(await screen.findByText(/use this otp below/i)).toBeInTheDocument();
    expect(screen.getByText('4821')).toBeInTheDocument();
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
  });
});
