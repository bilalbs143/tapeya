import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';
import { toast } from '@/shared/ui/toast';

import { InterestForm } from './InterestForm';
import type { useInterestForm } from './useInterestForm';

type InterestFormFlow = ReturnType<typeof useInterestForm>;

/** Sticky submit — page owns DockScreen. */
export function InterestFormFooter({ flow }: { flow: InterestFormFlow }) {
  const { actions, submitting, withdrawing } = flow;

  if (!actions.showSubmit) return null;

  return (
    <StickyActionBar>
      <Button
        type="submit"
        form="interest-form"
        variant="positive"
        className="w-full"
        loading={submitting}
        disabled={actions.submitDisabled || withdrawing}
      >
        {submitting ? 'Submitting…' : actions.submitLabel}
      </Button>
    </StickyActionBar>
  );
}

/** InterestForm fields — page owns DockScreen. */
export function InterestFormBody({ flow }: { flow: InterestFormFlow }) {
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
    handleSubmit,
    handleWithdraw,
  } = flow;

  return (
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
  );
}
