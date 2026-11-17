import { Avatar } from '@/shared/ui/Avatar';

import { interestStatusCopy } from '../model/actions';
import type { InterestCampaign, InterestSubmission } from '../model/schemas';

type InterestStatusViewProps = {
  campaign: InterestCampaign;
  submission: InterestSubmission;
  /** Dialog body is shorter — keep padding tighter. */
  compact?: boolean | undefined;
};

/** Post-submit status — title, support line, campaign name + full logo. */
export function InterestStatusView({ campaign, submission, compact = false }: InterestStatusViewProps) {
  const copy = interestStatusCopy(submission.status);

  return (
    <div
      className={
        compact
          ? 'flex flex-col items-center px-4 py-8 text-center'
          : 'flex min-h-full flex-col items-center justify-center gap-6 px-4 py-8 text-center'
      }
      role="status"
    >
      <div>
        <h1 className="text-title leading-snug font-extrabold tracking-tight text-ink">{copy.title}</h1>
        <p className="text-muted mx-auto mt-2.5 max-w-[33ch] text-xs leading-relaxed">{copy.description}</p>
      </div>

      <div
        className={compact ? 'mt-8 flex w-full flex-col items-center gap-3' : 'flex w-full flex-col items-center gap-3'}
      >
        <p className="text-body-sm font-extrabold tracking-tight text-ink">{campaign.tournamentName}</p>
        {campaign.logoUrl ? (
          <img src={campaign.logoUrl} alt="" className="h-24 w-24 object-contain" />
        ) : (
          <Avatar crest name={campaign.tournamentName} size="xl" className="h-24 w-24 text-sm font-extrabold" />
        )}
      </div>
    </div>
  );
}
