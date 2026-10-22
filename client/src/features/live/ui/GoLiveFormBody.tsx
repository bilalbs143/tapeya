import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { Input, Textarea } from '@/shared/ui/Input';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import { GO_LIVE_TERMS } from '../lib/goLiveForm';
import type { useGoLiveForm } from './useGoLiveForm';

type GoLiveFlow = ReturnType<typeof useGoLiveForm>;

type GoLiveFormBodyProps = {
  flow: GoLiveFlow;
};

function OrientationTile({
  active,
  label,
  onClick,
  shape,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  shape: 'portrait' | 'landscape';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-16 flex-1 flex-col items-center justify-center gap-1.5 rounded-field border',
        active ? 'border-brand border-[1.5px] bg-brand/10' : 'border-border bg-surface'
      )}
    >
      <span
        className={cn(
          'rounded-sm border-[1.5px]',
          shape === 'portrait' ? 'h-[22px] w-[15px]' : 'h-[15px] w-6',
          active ? 'border-brand-text' : 'border-dim'
        )}
      />
      <span className={cn('text-3xs', active ? 'font-bold text-ink' : 'text-muted font-semibold')}>{label}</span>
    </button>
  );
}

/** Title, orientation, thumbnail, sticky Go Live, and terms dialog. */
export function GoLiveFormBody({ flow }: GoLiveFormBodyProps) {
  const {
    fileRef,
    title,
    setTitle,
    description,
    setDescription,
    orientation,
    setOrientationDraft,
    orientationOptions,
    enumsLoading,
    thumbPreview,
    termsOk,
    acceptState,
    createState,
    canSubmit,
    onAcceptTerms,
    pickThumb,
    go,
  } = flow;

  return (
    <>
      <Form
        id="go-live-form"
        density="compact"
        className="flex flex-1 flex-col px-4 pt-3.5 pb-4"
        onSubmit={(e) => void go(e)}
      >
        <Input
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sunday Cup — Semi 1"
          maxLength={100}
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ground, teams, anything viewers should know."
          maxLength={500}
        />

        <Field label="Orientation" required hint="Locked once you are live — viewers can't be re-framed mid-stream.">
          {() => (
            <div className="flex gap-2.5">
              {enumsLoading || orientationOptions.length === 0 ? (
                <p className="text-dim text-3xs">Loading Orientation Options…</p>
              ) : (
                orientationOptions.map((opt) => (
                  <OrientationTile
                    key={opt.value}
                    active={orientation === opt.value}
                    label={opt.label}
                    shape={opt.value === 'landscape' ? 'landscape' : 'portrait'}
                    onClick={() => setOrientationDraft(opt.value)}
                  />
                ))
              )}
            </div>
          )}
        </Field>

        <Field label="Stream Thumbnail" hint="JPG, PNG or WebP, max 5 MB.">
          {({ id }) => (
            <>
              <button
                type="button"
                id={id}
                onClick={() => fileRef.current?.click()}
                className="border-border text-muted flex h-12 w-full items-center justify-center gap-2 rounded-field border border-dashed text-xs font-semibold"
              >
                {thumbPreview ? (
                  <img src={thumbPreview} alt="" className="h-8 w-14 rounded object-cover" />
                ) : (
                  <span aria-hidden>+</span>
                )}
                {thumbPreview ? 'Replace Thumbnail' : 'Add Thumbnail'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={pickThumb}
              />
            </>
          )}
        </Field>
      </Form>

      <StickyActionBar>
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="go-live-form"
            variant="positive"
            className="min-h-12 w-full"
            disabled={!canSubmit}
            loading={createState.isLoading}
          >
            Go Live
          </Button>
          <p className="text-dim text-center text-3xs leading-relaxed">
            Your stream will appear on the Live hub within about a minute.
          </p>
        </div>
      </StickyActionBar>

      <BaseDialog open={!termsOk} onOpenChange={() => {}} showClose={false} dismissible={false}>
        <DialogHeader>
          <DialogTitle>Before You Go Live</DialogTitle>
          <DialogDescription>Broadcasting on Tapeya carries a few rules. They apply to every stream.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <ol className="flex flex-col">
            {GO_LIVE_TERMS.map((text, i) => (
              <li key={text} className={cn('flex gap-2.5 py-3', i < 3 ? 'border-border-subtle border-b' : null)}>
                <span className="bg-surface-raised text-muted font-mono grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-4xs font-bold">
                  {i + 1}
                </span>
                <span className="text-body flex-1 text-2xs leading-relaxed">{text}</span>
              </li>
            ))}
          </ol>
        </DialogBody>
        <DialogFooter>
          <Button size="md" loading={acceptState.isLoading} onClick={() => void onAcceptTerms()}>
            I Agree, Continue
          </Button>
        </DialogFooter>
      </BaseDialog>
    </>
  );
}
