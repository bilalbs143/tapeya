import type { CampaignStatus, SubmissionStatus } from './schemas';

export type InterestFormActions = {
  showSubmit: boolean;
  submitLabel: string;
  submitDisabled: boolean;
  /** Closed campaign with no submission yet. */
  closedBanner: boolean;
};

/** Submit-once form chrome — no update / withdraw. */
export function interestFormActions(input: {
  campaignStatus: CampaignStatus;
  hasSubmission: boolean;
}): InterestFormActions {
  const closed = input.campaignStatus === 'closed';
  return {
    showSubmit: !input.hasSubmission,
    submitLabel: "I'm Interested",
    submitDisabled: closed || input.hasSubmission,
    closedBanner: closed && !input.hasSubmission,
  };
}

export type InterestStatusCopy = {
  title: string;
  description: string;
};

/** Status page copy after a submission exists. */
export function interestStatusCopy(status: SubmissionStatus): InterestStatusCopy {
  if (status === 'confirmed') {
    return {
      title: 'Your Spot Is Confirmed',
      description: 'Our team has accepted your interest. We will update you soon.',
    };
  }

  return {
    title: 'Request Submitted',
    description: 'Your request is submitted and under review. We will update you soon.',
  };
}
