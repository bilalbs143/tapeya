import { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useSupportWhatsAppContact } from '@/hooks/useSupportWhatsAppContact';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { EMPTY_FILE_UPLOAD } from '@/lib/utils/fileUploadUtils';
import { useGetMeQuery } from '@/store/api/authApi';
import { useSubmitSupportMessageMutation } from '@/store/api/supportApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { Textarea } from '@/ui/Textarea';

export default function Support() {
  const toast = useToast();
  const { hasWhatsApp, whatsAppDisplay, whatsAppHref } = useSupportWhatsAppContact();

  const userFromStore = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const me = meResponse?.data ?? userFromStore;

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: { name: '', phone: '', message: '' },
    mode: 'onChange',
  });

  const [attachment, setAttachment] = useState(EMPTY_FILE_UPLOAD);

  const [submitSupport, { isLoading: isSubmitting }] = useSubmitSupportMessageMutation();

  useEffect(() => {
    if (!me?.id) return;
    const name = getValues('name');
    const phone = getValues('phone');
    reset({
      name: name?.trim() ? name : me.name?.trim() || me.nickname?.trim() || '',
      phone: phone?.trim() ? phone : me.phone?.trim() || '',
      message: getValues('message'),
    });
  }, [me?.id]);

  const onSubmit = async (data) => {
    try {
      const file = attachment.files[0] ?? null;
      const result = await submitSupport({
        name: data.name.trim(),
        phone: data.phone.trim() || undefined,
        message: data.message.trim(),
        ...(file ? { attachment: file } : {}),
      }).unwrap();

      toast.success(result?.message ?? 'Your message has been sent. We will get back to you soon.');
      clearErrors();
      setAttachment(EMPTY_FILE_UPLOAD);
      reset({
        name: me?.name?.trim() || me?.nickname?.trim() || '',
        phone: me?.phone?.trim() || '',
        message: '',
      });
    } catch (err) {
      const apiErrors = err?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        for (const field of ['name', 'message', 'phone', 'attachment']) {
          if (apiErrors[field]?.[0]) {
            setError(field, { message: apiErrors[field][0] });
          }
        }
      }
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader sticky title="CONTACT US" />

      <Container className="pb-8">
        <p className="text-muted mb-4 text-[13px] leading-snug md:text-[14px]">
          {hasWhatsApp ? (
            <>
              Have a question or need help? Message us on <span className="font-semibold text-white">WhatsApp</span> for a quick
              reply, or use the form below and our team will get back to you.
            </>
          ) : (
            'Have a question or need help? Use the form below and our team will get back to you.'
          )}
        </p>

        {hasWhatsApp ? (
          <>
            <div className="bg-surface mb-6 rounded-[6px] border border-[#FF9700]/45 p-4 shadow-[0_0_0_1px_rgba(255,151,0,0.12)]">
              <p className="text-muted text-[12px] font-bold tracking-wide">WhatsApp</p>
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-between gap-3 rounded-[6px] bg-black/35 px-3 py-3 transition-colors hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-[#FF9700]/50 focus-visible:outline-none"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-muted text-[11px] font-medium">Tap to open chat</span>
                  <span className="truncate text-[18px] font-bold tracking-wide text-[#FF9700] tabular-nums">
                    {whatsAppDisplay}
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
              <p className="text-muted/90 mt-3 text-[12px] leading-snug">Opens WhatsApp on your phone or web.</p>
            </div>

            <div aria-hidden="true" className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[linear-gradient(to_right,transparent,#FFFFFF33,transparent)]" />
              <span className="text-muted shrink-0 text-[11px] font-bold tracking-wider uppercase">Or use the form</span>
              <div className="h-px flex-1 bg-[linear-gradient(to_right,transparent,#FFFFFF33,transparent)]" />
            </div>
          </>
        ) : null}

        <FormStack as="form" density="default" onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Name" htmlFor="support-name">
            <Input
              id="support-name"
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name', {
                validate: (v) => String(v ?? '').trim().length >= 2 || 'Name is required.',
              })}
            />
          </FormField>

          <FormField label="Phone" htmlFor="support-phone">
            <Input
              id="support-phone"
              type="text"
              placeholder="+92 3xx xxxxxxx"
              autoComplete="tel"
              inputMode="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </FormField>

          <FormField label="Message" htmlFor="support-message">
            <Textarea
              id="support-message"
              rows={6}
              placeholder="Write your message here..."
              error={errors.message?.message}
              {...register('message', {
                validate: (v) => String(v ?? '').trim().length >= 10 || 'Message should be at least 10 characters.',
              })}
            />
          </FormField>

          <FileUploadField
            label={
              <>
                Attachment <span className="text-muted/70 font-normal">(optional)</span>
              </>
            }
            value={attachment}
            onChange={setAttachment}
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            acceptLabel="JPG, PNG, GIF, WebP, PDF"
            maxSizeMb={5}
            error={errors.attachment?.message}
            name="attachment"
            disabled={isSubmitting}
          />

          <FormActions align="between">
            <p className="text-muted text-[12px]">We will only use your details to respond to your request.</p>
            <Button
              type="submit"
              variant="orangeDialogWhite"
              size="dialog"
              className="sm:w-[180px]"
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </Button>
          </FormActions>
        </FormStack>
      </Container>
    </div>
  );
}
