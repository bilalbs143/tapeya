// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { useReelUploadSession } from '@/features/reels/reelUploadSessionStore';

import { ReelUploadProgressDialog } from '../ReelUploadProgressDialog';

vi.mock('@/features/reels/reelUploadSessionStore', () => ({
  clearReelUploadSession: vi.fn(),
  useReelUploadSession: vi.fn(),
}));

function renderDialog() {
  return render(
    <MemoryRouter>
      <ReelUploadProgressDialog />
    </MemoryRouter>,
  );
}

describe('ReelUploadProgressDialog', () => {
  it('keeps Done visible but disabled while uploading', () => {
    useReelUploadSession.mockReturnValue({
      status: 'uploading',
      percent: 42,
      stage: 'uploading',
      previewUrl: null,
      error: null,
    });

    renderDialog();

    expect(screen.getByText('Uploading reel')).toBeTruthy();
    expect(screen.getByText('42%')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Done' }).disabled).toBe(true);
  });

  it('lets the user dismiss after a failure', () => {
    useReelUploadSession.mockReturnValue({
      status: 'error',
      percent: 40,
      stage: 'uploading',
      previewUrl: null,
      error: 'Disk full',
    });

    renderDialog();

    expect(screen.getByText('Upload failed')).toBeTruthy();
    expect(screen.getByText('Disk full')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeTruthy();
  });
});
