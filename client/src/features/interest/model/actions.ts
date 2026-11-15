import type { CampaignStatus, SubmissionStatus } from './schemas';

export type InterestBannerTone = 'info' | 'success' | 'warning';

export type InterestUiActions = {
  showSubmit: boolean;
  submitLabel: string;
  submitDisabled: boolean;
  showWithdraw: boolean;
  readOnlyAll: boolean;
  banner: {
    tone: InterestBannerTone;
    title: string;
    description: string;
  } | null;
};

export function interestActions(input: {
  campaignStatus: CampaignStatus;
  submissionStatus: SubmissionStatus | null;
}): InterestUiActions {
  const active = input.submissionStatus === 'pending';
  const confirmed = input.submissionStatus === 'confirmed';
  const closed = input.campaignStatus === 'closed';

  return {
    showSubmit: !confirmed,
    submitLabel: active ? 'Update My Details' : "I'm Interested",
    submitDisabled: closed,
    showWithdraw: active,
    readOnlyAll: confirmed,
    banner: closed
      ? {
          tone: 'warning',
          title: 'Interest form closed',
          description: 'New submissions are not accepted. Existing details stay on file.',
        }
      : confirmed
        ? {
            tone: 'success',
            title: 'Your spot is confirmed',
            description: 'Below are the details we have on file for this campaign.',
          }
        : active
          ? {
              tone: 'info',
              title: "You're on the interest list",
              description: 'Update your details below anytime, or withdraw if you change your mind.',
            }
          : null,
  };
}
