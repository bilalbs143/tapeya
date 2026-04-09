import { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useGetMeQuery } from '@/store/api/authApi';
import { useSubmitSupportMessageMutation } from '@/store/api/supportApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { Button } from '@/ui/Button';

export default function Support() {
  const navigate = useNavigate();
  const toast = useToast();
  const userFromStore = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const me = meResponse?.data ?? userFromStore;

  const [values, setValues] = useState({
    name: '',
    message: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [submitSupport, { isLoading: isSubmitting }] =
    useSubmitSupportMessageMutation();

  useEffect(() => {
    if (!me) return;
    setValues((prev) => ({
      ...prev,
      name: prev.name || me.name?.trim() || me.nickname?.trim() || '',
      phone: prev.phone || me.phone?.trim() || '',
    }));
  }, [me]);

  const isValid = useMemo(() => {
    return values.name.trim().length >= 2 && values.message.trim().length >= 10;
  }, [values.message, values.name]);

  const onChange = (key) => (e) => {
    const next = e.target.value;
    setValues((prev) => ({ ...prev, [key]: next }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
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
      }).unwrap();
      setErrors({});
      toast.success(
        result?.message ??
          'Your message has been sent. We will get back to you soon.',
      );
      if (me) {
        setValues({
          name: me.name?.trim() || me.nickname?.trim() || '',
          message: '',
          phone: me.phone?.trim() || '',
        });
      } else {
        setValues({ name: '', message: '', phone: '' });
      }
    } catch (err) {
      const data = err?.data;
      if (data?.errors && typeof data.errors === 'object') {
        const next = {};
        if (data.errors.name?.[0]) next.name = data.errors.name[0];
        if (data.errors.message?.[0]) next.message = data.errors.message[0];
        if (data.errors.phone?.[0]) next.phone = data.errors.phone[0];
        if (Object.keys(next).length) setErrors(next);
      }
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="bg-black">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-black px-4 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
          aria-label="Back"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 pr-9 text-center text-[16px] font-bold tracking-wide text-white uppercase">
          CONTACT US
        </h1>
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-8">
        <div>
          <p className="mb-4 text-[13px] leading-snug text-[#A2A6AB] md:text-[14px]">
            Have a question or need help? Send us your details and message and
            our team will reach out as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="support-name"
                  className="text-[12px] font-bold text-[#A2A6AB] uppercase"
                >
                  Name
                </label>
                <input
                  id="support-name"
                  value={values.name}
                  onChange={onChange('name')}
                  className={`h-12 w-full rounded-[6px] bg-[#141412] px-4 py-3 text-white transition-colors placeholder:text-base placeholder:text-[#A2A6AB78] focus:ring-2 focus:outline-none ${
                    errors.name
                      ? 'focus:ring-red-500/50'
                      : 'focus:ring-[#FF9700]/50'
                  }`}
                  placeholder="Your full name"
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="text-sm text-red-200" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="support-phone"
                className="text-[12px] font-bold text-[#A2A6AB] uppercase"
              >
                Phone
              </label>
              <input
                id="support-phone"
                value={values.phone}
                onChange={onChange('phone')}
                className={`h-12 w-full rounded-[6px] bg-[#141412] px-4 py-3 text-white transition-colors placeholder:text-base placeholder:text-[#A2A6AB78] focus:ring-2 focus:outline-none ${
                  errors.phone
                    ? 'focus:ring-red-500/50'
                    : 'focus:ring-[#FF9700]/50'
                }`}
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
              <label
                htmlFor="support-message"
                className="text-[12px] font-bold text-[#A2A6AB] uppercase"
              >
                Message
              </label>
              <textarea
                id="support-message"
                value={values.message}
                onChange={onChange('message')}
                rows={6}
                className={`w-full resize-y rounded-[6px] bg-[#141412] px-4 py-3 text-white transition-colors placeholder:text-base placeholder:text-[#A2A6AB78] focus:ring-2 focus:outline-none ${
                  errors.message
                    ? 'focus:ring-red-500/50'
                    : 'focus:ring-[#FF9700]/50'
                }`}
                placeholder="Write your message here..."
              />
              {errors.message && (
                <p className="text-sm text-red-200" role="alert">
                  {errors.message}
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
        </div>
      </div>
    </div>
  );
}
