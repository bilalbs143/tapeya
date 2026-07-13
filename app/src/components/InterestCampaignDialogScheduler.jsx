import { useEffect, useMemo } from 'react';

import { useLocation } from 'react-router-dom';

import { useDialog } from '@/context/DialogContext';
import {
  isInterestCampaignDialogAutoShown,
  isInterestCampaignDialogDismissed,
  markInterestCampaignDialogAutoShown,
  markInterestCampaignDialogDismissed,
} from '@/lib/interestCampaignDialog';
import { isInterestCampaignDialogBlockedPath } from '@/lib/utils/routeUtils';
import { useGetDialogInterestCampaignQuery, useGetInterestCampaignQuery } from '@/store/api/tournamentInterestApi';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/selectors';

/**
 * Auto-popup at most once per browser session. Dismissing (X / backdrop) suppresses
 * any further auto-popups that session. Submitting stops auto-popup via API status.
 */
export function InterestCampaignDialogScheduler() {
  const location = useLocation();
  const { closeDialog, dialogKey, openDialog } = useDialog();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const { data: dialogPayload } = useGetDialogInterestCampaignQuery(undefined, {
    skip: !isAuthenticated,
  });
  const dialogCampaign = dialogPayload?.campaign ?? null;
  const slug = dialogCampaign?.slug ?? null;

  const isEligible = useMemo(() => {
    if (!isAuthenticated || !slug) return false;
    if (isInterestCampaignDialogBlockedPath(location.pathname)) return false;
    if (dialogCampaign?.my_submission_status && dialogCampaign.my_submission_status !== 'withdrawn') return false;
    if (isInterestCampaignDialogDismissed(user?.id, slug)) return false;
    if (isInterestCampaignDialogAutoShown(user?.id, slug)) return false;
    return true;
  }, [isAuthenticated, slug, location.pathname, dialogCampaign?.my_submission_status, user?.id]);

  const { isSuccess, isError } = useGetInterestCampaignQuery({ slug: slug ?? '' }, { skip: !isEligible || !slug || !!dialogKey });

  useEffect(() => {
    if (dialogKey === 'interestCampaign' && isInterestCampaignDialogBlockedPath(location.pathname)) {
      closeDialog();
    }
  }, [location.pathname, dialogKey, closeDialog]);

  useEffect(() => {
    if (!isEligible || !slug || dialogKey || !isSuccess || isError) return;
    if (isInterestCampaignDialogBlockedPath(location.pathname)) return;
    if (isInterestCampaignDialogDismissed(user?.id, slug)) return;
    if (isInterestCampaignDialogAutoShown(user?.id, slug)) return;

    if (user?.id) {
      markInterestCampaignDialogAutoShown(user.id, slug);
    }

    openDialog('interestCampaign', {
      slug,
      tournamentName: dialogCampaign?.tournament_name,
      onDismiss: () => {
        if (user?.id) {
          markInterestCampaignDialogDismissed(user.id, slug);
        }
      },
    });
  }, [isEligible, slug, dialogKey, isSuccess, isError, location.pathname, user?.id, dialogCampaign?.tournament_name, openDialog]);

  return null;
}

export default InterestCampaignDialogScheduler;
