import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';
import { toast } from '@/shared/ui/toast';

import type { InterestShowPayload } from '../model/schemas';
import { InterestForm } from './InterestForm';
import { useInterestForm } from './useInterestForm';

type InterestFormBodyProps = {
  slug: string;
  payload: InterestShowPayload;
};

/** ScreenBar + InterestForm + sticky submit — after campaign gates. */
export function InterestFormBody({ slug, payload }: InterestFormBodyProps) {
  const flow = useInterestForm(slug, payload);
  const {
    campaign,
    actions,
    values,
    onChange,
    avatarPreview,
    onAvatarFile,
    docName,
    docUrl,
    onDocFile,
    errors,
    needsAvatar,
    needsDoc,
    submitting,
    withdrawing,
    handleSubmit,
    handleWithdraw,
    goBack,
  } = flow;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title={campaign.tournamentName} subtitle="Register Your Interest" onBack={goBack} />

      <Form id="interest-form" density="compact" className="px-4 pt-3.5 pb-4" onSubmit={(e) => void handleSubmit(e)}>
        <InterestForm
          campaign={campaign}
          actions={actions}
          values={values}
          onChange={onChange}
          avatarPreview={avatarPreview}
          onAvatarFile={onAvatarFile}
          docName={docName}
          docUrl={docUrl}
          onDocFile={onDocFile}
          errors={errors}
          requiredAvatar={needsAvatar}
          requiredDoc={needsDoc}
          onWithdraw={actions.showWithdraw ? () => void handleWithdraw() : undefined}
          onToastError={(title, description) => toast({ title, description, tone: 'error' })}
        />
      </Form>

      {actions.showSubmit ? (
        <StickyActionBar>
          <Button
            type="submit"
            form="interest-form"
            size="lg"
            variant="positive"
            className="min-h-12 w-full"
            loading={submitting}
            disabled={actions.submitDisabled || withdrawing}
          >
            {submitting ? 'Submitting…' : actions.submitLabel}
          </Button>
        </StickyActionBar>
      ) : null}
    </div>
  );
}
