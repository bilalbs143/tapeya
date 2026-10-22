import type { UserSummary } from '@/entities/user';

import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { ChevronRightIcon, DocumentIcon, PlusIcon, WhatsAppIcon } from '@/shared/ui/icons';
import { Input, Textarea } from '@/shared/ui/Input';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import { ATTACH_TYPES, formatFileSize } from '../lib/supportContact';
import { useSupportForm } from './useSupportForm';

type SupportFormBodyProps = {
  me: UserSummary | null;
  supportPhone: string | null;
};

/** WhatsApp card, form fields, attachment, sticky send. */
export function SupportFormBody({ me, supportPhone }: SupportFormBodyProps) {
  const flow = useSupportForm({ me, supportPhone });
  const {
    waHref,
    fileInput,
    name,
    tel,
    setTel,
    message,
    file,
    setFile,
    errors,
    isLoading,
    clearNameError,
    clearMessageError,
    onPick,
    onSubmit,
    goHome,
  } = flow;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title="Contact Us" subtitle="Help and Feedback" onBack={goHome} />

      <Form id="support-form" density="compact" onSubmit={(ev) => void onSubmit(ev)} className="px-4 pt-3.5 pb-4">
        <p className="text-muted text-2xs leading-relaxed">
          {supportPhone
            ? 'Message us on WhatsApp for the quickest reply, or send the form below and the team will come back to you.'
            : 'Send us the details below and the team will get back to you — usually within one working day.'}
        </p>

        {supportPhone && waHref ? (
          <>
            <section className="flex flex-col gap-2">
              <span className="font-mono text-3xs font-bold tracking-eyebrow text-muted uppercase">WhatsApp</span>
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="border-positive/35 bg-positive/10 hover:border-positive/55 focus-visible:outline-brand flex items-center gap-3 rounded-card border p-3.5 focus-visible:outline-2"
              >
                <span className="bg-positive/18 text-positive-2 grid h-10 w-10 shrink-0 place-items-center rounded-panel">
                  <WhatsAppIcon size="sm" className="h-[19px] w-[19px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">Tap to Open Chat</span>
                  <span className="font-mono text-dim block text-3xs">{supportPhone}</span>
                </span>
                <ChevronRightIcon className="text-positive-2 h-3.5 w-3.5 shrink-0" />
              </a>
              <p className="text-dim px-1 text-3xs">Opens WhatsApp on your phone or web.</p>
            </section>

            <div className="flex items-center gap-3 py-0.5">
              <span className="bg-border-subtle h-px flex-1" />
              <span className="font-mono text-3xs font-bold tracking-eyebrow text-dim uppercase">Or Use the Form</span>
              <span className="bg-border-subtle h-px flex-1" />
            </div>
          </>
        ) : null}

        <Input
          label="Name"
          required
          value={name}
          onChange={(e) => clearNameError(e.target.value)}
          error={errors.name}
          placeholder="Your Full Name"
          autoComplete="name"
          className="h-12 rounded-panel"
        />

        <Input
          label="Phone"
          type="tel"
          inputMode="tel"
          value={tel}
          onChange={(e) => setTel(e.target.value)}
          error={errors.phone}
          placeholder="+92 3xx xxxxxxx"
          autoComplete="tel"
          className="h-12 rounded-panel"
        />

        <Textarea
          label="Message"
          required
          rows={6}
          value={message}
          onChange={(e) => clearMessageError(e.target.value)}
          error={errors.message}
          placeholder="Write Your Message Here..."
          className="rounded-panel p-3 text-body-sm"
        />

        <Field label="Attachment" error={errors.file} hint="JPG, PNG, GIF, WebP or PDF. Up to 5 MB.">
          {({ id }) => (
            <>
              {file ? (
                <div className="border-border-subtle bg-surface flex items-center gap-2.5 rounded-panel border p-2.5">
                  <span className="bg-surface-raised text-brand-text grid h-9 w-9 shrink-0 place-items-center rounded-panel">
                    <DocumentIcon size="sm" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-ink">{file.name}</span>
                    <span className="font-mono text-dim block text-3xs">{formatFileSize(file.size)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-dim hover:text-ink focus-visible:outline-brand shrink-0 px-1 text-2xs font-bold focus-visible:outline-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id={id}
                  onClick={() => fileInput.current?.click()}
                  className="border-border text-muted hover:text-ink hover:border-border-subtle focus-visible:outline-brand flex h-12 w-full items-center justify-center gap-2 rounded-panel border border-dashed bg-surface text-xs font-semibold focus-visible:outline-2"
                >
                  <PlusIcon className="h-4 w-4" strokeWidth={2} />
                  Add a file
                </button>
              )}

              <input ref={fileInput} type="file" accept={ATTACH_TYPES.join(',')} onChange={onPick} className="hidden" />
            </>
          )}
        </Field>
      </Form>

      <StickyActionBar>
        <Button
          type="submit"
          form="support-form"
          size="lg"
          variant="positive"
          className="min-h-12 w-full rounded-field text-body-sm font-bold"
          loading={isLoading}
        >
          {isLoading ? 'Sending…' : 'Send Message'}
        </Button>
      </StickyActionBar>
    </div>
  );
}
