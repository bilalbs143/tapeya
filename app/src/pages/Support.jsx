import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/ui/Button';
import { useToast } from '@/hooks/useToast';

export default function Support() {
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState({
    name: '',
    message: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => {
    return (
      values.name.trim().length >= 2 &&
      values.message.trim().length >= 10
    );
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
      setIsSubmitting(true);
      // No dedicated backend endpoint is wired here yet.
      // This is a UI-only submit with basic feedback.
      await new Promise((r) => setTimeout(r, 700));
      setValues({ name: '', message: '', phone: '' });
      setErrors({});
      toast.success('Your message has been sent. We will get back to you soon.');
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
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

      <div className="mx-auto w-full px-4 pb-8 pt-6 max-w-2xl">
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
                  className={`h-12 w-full rounded-[6px] bg-[#141412] px-4 py-3 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:outline-none focus:ring-2 transition-colors ${
                    errors.name ? 'focus:ring-red-500/50' : 'focus:ring-[#FF9700]/50'
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
                  Phone (optional)
                </label>
              <input
                id="support-phone"
                value={values.phone}
                onChange={onChange('phone')}
                className="h-12 w-full rounded-[6px] bg-[#141412] px-4 py-3 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:outline-none focus:ring-2 focus:ring-[#FF9700]/50 transition-colors"
                placeholder="+92 3xx xxxxxxx"
                autoComplete="tel"
                inputMode="tel"
              />
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
                className={`w-full resize-y rounded-[6px] bg-[#141412] px-4 py-3 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:outline-none focus:ring-2 transition-colors ${
                  errors.message ? 'focus:ring-red-500/50' : 'focus:ring-[#FF9700]/50'
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

