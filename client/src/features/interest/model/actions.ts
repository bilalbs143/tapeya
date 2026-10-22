import type { CampaignStatus, SubmissionStatus } from './schemas';

export type InterestUiActions = {
  showSubmit: boolean;
  submitLabel: string;
  submitDisabled: boolean;
  showWithdraw: boolean;
  readOnlyAll: boolean;
  banner: { tone: 'muted' | 'brand' | 'positive'; text: string } | null;
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
          tone: 'muted',
          text: 'This interest form is closed. New submissions are not accepted.',
        }
      : confirmed
        ? {
            tone: 'positive',
            text: 'Your spot is confirmed. Below are the details we have on file.',
          }
        : active
          ? {
              tone: 'brand',
              text: "You're already on the interest list. Update your details below, or withdraw.",
            }
          : null,
  };
}
