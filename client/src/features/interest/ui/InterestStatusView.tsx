import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';

import { interestStatusCopy } from '../model/actions';
import type { InterestCampaign, InterestSubmission } from '../model/schemas';

type InterestStatusViewProps = {
  campaign: InterestCampaign;
  submission: InterestSubmission;
  onDone: () => void;
  /** Dialog uses a quieter Done; page uses full-width sticky feel via parent. */
  doneLabel?: string | undefined;
};

/** Post-submit status — logo, title, status. No form fields. */
export function InterestStatusView({ campaign, submission, onDone, doneLabel = 'Done' }: InterestStatusViewProps) {
  const copy = interestStatusCopy(submission.status);

  return (
    <div className="flex flex-col items-center px-4 pt-10 pb-8 text-center" role="status">
      {campaign.logoUrl ? (
        <img src={campaign.logoUrl} alt="" className="h-24 w-24 object-contain" />
      ) : (
        <Avatar crest name={campaign.tournamentName} size="xl" className="h-24 w-24 text-sm font-extrabold" />
      )}

      <h1 className="mt-5 text-title-sm font-extrabold tracking-tight text-ink">{campaign.tournamentName}</h1>

      <Badge variant={copy.badgeVariant} className="mt-3.5 h-6 px-2.5 text-2xs">
        {copy.badge}
      </Badge>

      <p className="mt-4 text-body-sm font-extrabold tracking-tight text-ink">{copy.title}</p>
      <p className="text-muted mt-1.5 max-w-xs text-2xs leading-relaxed">{copy.description}</p>

      <Button type="button" variant="secondary" className="mt-8 w-full max-w-xs font-bold" onClick={onDone}>
        {doneLabel}
      </Button>
    </div>
  );
}
