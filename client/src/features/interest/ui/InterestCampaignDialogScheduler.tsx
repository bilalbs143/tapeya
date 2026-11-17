import { useEffect, useEffectEvent } from 'react';
import { useLocation } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { dialogStore } from '@/shared/dialogs';
import { useDialogStack } from '@/shared/dialogs/useDialog';
import { selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

import { useGetDialogInterestCampaignQuery, useGetInterestCampaignQuery } from '../api/interestApi';
import {
  isInterestCampaignDialogAutoShown,
  isInterestCampaignDialogBlockedPath,
  isInterestCampaignDialogDismissed,
  markInterestCampaignDialogAutoShown,
  markInterestCampaignDialogDismissed,
} from '../lib/interestCampaignDialog';

const DIALOG_KEY = 'interestCampaign' as const;

function closeInterestCampaignDialogs(): void {
  for (const entry of dialogStore.getSnapshot()) {
    if (entry.key === DIALOG_KEY) dialogStore.close(entry.id);
  }
}

/**
 * Prefetch the full campaign, then open once — no skeleton flash in the sheet.
 * Auto-open at most once per session; dismiss suppresses further opens.
 */
export function InterestCampaignDialogScheduler() {
  const { pathname } = useLocation();
  const stack = useDialogStack();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: me } = useMeQuery(undefined, { skip: !isAuthenticated });
  const userId = me?.id;

  const { data: dialogPayload } = useGetDialogInterestCampaignQuery(undefined, {
    skip: !isAuthenticated,
  });
  const campaign = dialogPayload?.campaign ?? null;
  const slug = campaign?.slug ?? null;
  const hasActiveSubmission = campaign?.mySubmissionStatus != null;
  const sessionBlocked =
    userId != null &&
    slug != null &&
    (isInterestCampaignDialogDismissed(userId, slug) || isInterestCampaignDialogAutoShown(userId, slug));

  const eligible =
    Boolean(isAuthenticated && userId && slug && campaign) &&
    !hasActiveSubmission &&
    !sessionBlocked &&
    !isInterestCampaignDialogBlockedPath(pathname);

  const { isSuccess, isError } = useGetInterestCampaignQuery(slug ?? '', {
    skip: !eligible || !slug || stack.length > 0,
  });

  const tryOpen = useEffectEvent(() => {
    if (!eligible || !userId || !slug || !campaign || stack.length > 0 || !isSuccess || isError) return;

    markInterestCampaignDialogAutoShown(userId, slug);
    dialogStore.open(DIALOG_KEY, {
      slug,
      tournamentName: campaign.tournamentName,
      onDismiss: () => markInterestCampaignDialogDismissed(userId, slug),
    });
  });

  useEffect(() => {
    if (!isAuthenticated) {
      closeInterestCampaignDialogs();
      return;
    }
    tryOpen();
  }, [isAuthenticated, eligible, isSuccess, isError, stack.length, pathname]);

  useEffect(() => {
    const open = stack.some((entry) => entry.key === DIALOG_KEY);
    if (open && isInterestCampaignDialogBlockedPath(pathname)) {
      closeInterestCampaignDialogs();
    }
  }, [pathname, stack]);

  return null;
}
