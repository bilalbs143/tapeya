import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';
import { toast } from '@/shared/ui/toast';

import { InterestForm } from './InterestForm';
import type { useInterestForm } from './useInterestForm';

type InterestFormFlow = ReturnType<typeof useInterestForm>;

const DEFAULT_FORM_ID = 'interest-form';

/** Submit control — shared by page sticky bar and dialog footer. */
export function InterestFormActions({
  flow,
  formId = DEFAULT_FORM_ID,
}: {
  flow: InterestFormFlow;
  formId?: string | undefined;
}) {
  const { actions, submitting } = flow;

  if (!actions.showSubmit) return null;

  return (
    <Button
      type="submit"
      form={formId}
      variant="positive"
      className="w-full font-bold"
      loading={submitting}
      disabled={actions.submitDisabled}
    >
      {submitting ? 'Submitting…' : actions.submitLabel}
    </Button>
  );
}

/** Sticky submit — page owns DockScreen. */
export function InterestFormFooter({
  flow,
  formId = DEFAULT_FORM_ID,
}: {
  flow: InterestFormFlow;
  formId?: string | undefined;
}) {
  if (!flow.actions.showSubmit) return null;

  return (
    <StickyActionBar>
      <InterestFormActions flow={flow} formId={formId} />
    </StickyActionBar>
  );
}

/** InterestForm fields — parent supplies padding; brand header owns the description. */
export function InterestFormBody({
  flow,
  formId = DEFAULT_FORM_ID,
  className,
}: {
  flow: InterestFormFlow;
  formId?: string | undefined;
  className?: string | undefined;
}) {
  const {
    campaign,
    actions,
    values,
    onChange,
    onCustomAnswerChange,
    avatarPreview,
    onAvatarFile,
    customFileMeta,
    onCustomFile,
    errors,
    needsAvatar,
    handleSubmit,
  } = flow;

  return (
    <Form id={formId} density="compact" className={className} onSubmit={(e) => void handleSubmit(e)}>
      <InterestForm
        campaign={campaign}
        closedBanner={actions.closedBanner}
        values={values}
        onChange={onChange}
        onCustomAnswerChange={onCustomAnswerChange}
        avatarPreview={avatarPreview}
        onAvatarFile={onAvatarFile}
        customFileMeta={customFileMeta}
        onCustomFile={onCustomFile}
        errors={errors}
        requiredAvatar={needsAvatar}
        onToastError={(title, description) => toast({ title, description, tone: 'error' })}
      />
    </Form>
  );
}
