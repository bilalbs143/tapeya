import { useEffect, useMemo, useRef, useState } from 'react';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useGetMeQuery } from '@/store/api/authApi';
import { useSubmitSupportMessageMutation } from '@/store/api/supportApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { Label } from '@/ui/Label';
import { formFieldLabelCheckoutClass } from '@/ui/FormField';

const SUPPORT_WHATSAPP_DISPLAY = '+971 552 780 065';
const SUPPORT_WHATSAPP_HREF = 'https://wa.me/971552780065';

const inputClass = (hasError) =>
  `w-full rounded-[6px] bg-[#141412] px-4 py-3 text-white transition-colors placeholder:text-base placeholder:text-[#A2A6AB78] focus:ring-2 focus:outline-none ${
    hasError ? 'focus:ring-red-500/50' : 'focus:ring-[#FF9700]/50'
  }`;

export default function Support() {
  const toast = useToast();
  const userFromStore = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const me = meResponse?.data ?? userFromStore;

  const defaultValues = useMemo(
    () => ({
      name: me?.name?.trim() || me?.nickname?.trim() || '',
      message: '',
      phone: me?.phone?.trim() || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [me?.id],
  );

  const [values, setValues] = useState({ name: '', message: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [attachment, setAttachment] = useState(null);
  const attachmentInputRef = useRef(null);

  const [submitSupport, { isLoading: isSubmitting }] = useSubmitSupportMessageMutation();

  // Pre-populate fields from user profile without overwriting any edits already made.
  useEffect(() => {
    if (!me) return;
    setValues((prev) => ({
      ...prev,
      name: prev.name || me.name?.trim() || me.nickname?.trim() || '',
      phone: prev.phone || me.phone?.trim() || '',
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  const isValid =
    values.name.trim().length >= 2 && values.message.trim().length >= 10;

  const onChange = (key) => (e) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, attachment: 'File must be under 5 MB.' }));
      setAttachment(null);
      e.target.value = '';
      return;
    }
    setAttachment(file);
    setErrors((prev) => ({ ...prev, attachment: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      const nextErrors = {};
      if (values.name.trim().length < 2) nextErrors.name = 'Name is required.';
      if (values.message.trim().length < 10)
        nextErrors.message = 'Message should be at least 10 characters.';
      setErrors(nextErrors);
      toast.error('Please fix the highlighted fields.', 'Invalid form');
      return;
    }

    try {
      const result = await submitSupport({
        name: values.name.trim(),
        phone: values.phone.trim() || undefined,
        message: values.message.trim(),
        ...(attachment ? { attachment } : {}),
      }).unwrap();

      toast.success(
        result?.message ?? 'Your message has been sent. We will get back to you soon.',
      );
      setErrors({});
      setAttachment(null);
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
      setValues(defaultValues);
    } catch (err) {
      const apiErrors = err?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const next = {};
        for (const field of ['name', 'message', 'phone', 'attachment']) {
          if (apiErrors[field]?.[0]) next[field] = apiErrors[field][0];
        }
        if (Object.keys(next).length) setErrors(next);
      }
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader sticky title="CONTACT US" />

      <Container className="pb-8">
        <p className="mb-4 text-[13px] leading-snug text-[#A2A6AB] md:text-[14px]">
          Have a question or need help? Message us on{' '}
          <span className="font-semibold text-white">WhatsApp</span> for a quick reply, or
          use the form below and our team will get back to you.
        </p>

        <div className="mb-6 rounded-[6px] border border-[#FF9700]/45 bg-[#141412] p-4 shadow-[0_0_0_1px_rgba(255,151,0,0.12)]">
          <p className="text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
            WhatsApp
          </p>
          <a
            href={SUPPORT_WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-between gap-3 rounded-[6px] bg-black/35 px-3 py-3 transition-colors hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-[#FF9700]/50 focus-visible:outline-none"
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[11px] font-medium text-[#A2A6AB]">
                Tap to open chat
              </span>
              <span className="truncate text-[18px] font-bold tracking-wide text-[#FF9700] tabular-nums">
                {SUPPORT_WHATSAPP_DISPLAY}
              </span>
            </span>
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/20 text-[#25D366]"
              aria-hidden
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </span>
          </a>
          <p className="mt-3 text-[12px] leading-snug text-[#A2A6AB]/90">
            Opens WhatsApp on your phone or web.
          </p>
        </div>

        <div aria-hidden="true" className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[linear-gradient(to_right,transparent,#FFFFFF33,transparent)]" />
          <span className="shrink-0 text-[11px] font-bold tracking-wider text-[#A2A6AB] uppercase">
            Or use the form
          </span>
          <div className="h-px flex-1 bg-[linear-gradient(to_right,transparent,#FFFFFF33,transparent)]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="support-name" className={formFieldLabelCheckoutClass}>
              Name
            </Label>
            <input
              id="support-name"
              value={values.name}
              onChange={onChange('name')}
              className={`${inputClass(!!errors.name)} h-12`}
              placeholder="Your full name"
              autoComplete="name"
            />
            {errors.name && (
              <p className="text-sm text-red-200" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="support-phone" className={formFieldLabelCheckoutClass}>
              Phone
            </Label>
            <input
              id="support-phone"
              value={values.phone}
              onChange={onChange('phone')}
              className={`${inputClass(!!errors.phone)} h-12`}
              placeholder="+92 3xx xxxxxxx"
              autoComplete="tel"
              inputMode="tel"
            />
            {errors.phone && (
              <p className="text-sm text-red-200" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="support-message" className={formFieldLabelCheckoutClass}>
              Message
            </Label>
            <textarea
              id="support-message"
              value={values.message}
              onChange={onChange('message')}
              rows={6}
              className={`${inputClass(!!errors.message)} resize-y`}
              placeholder="Write your message here..."
            />
            {errors.message && (
              <p className="text-sm text-red-200" role="alert">
                {errors.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="support-attachment" className={formFieldLabelCheckoutClass}>
              Attachment{' '}
              <span className="font-normal">(optional)</span>
            </Label>
            <input
              ref={attachmentInputRef}
              id="support-attachment"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              onChange={handleAttachmentChange}
              className={`block w-full text-[13px] text-[#A2A6AB] file:mr-3 file:rounded-[6px] file:border-0 file:bg-[#141412] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#1a1a18] ${
                errors.attachment ? 'rounded-[6px] ring-2 ring-red-500/40' : ''
              }`}
            />
            <p className="text-[11px] leading-snug text-[#A2A6AB]/80">
              JPG, PNG, GIF, WebP, or PDF. Max 5&nbsp;MB.
            </p>
            {errors.attachment && (
              <p className="text-sm text-red-200" role="alert">
                {errors.attachment}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-[#A2A6AB]">
              We will only use your details to respond to your request.
            </p>
            <Button
              type="submit"
              variant="orangeDialogWhite"
              size="dialog"
              className="sm:w-[180px] sm:uppercase"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
}