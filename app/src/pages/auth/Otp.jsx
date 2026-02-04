import { useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import tapeyaLogo from '@/assets/images/logos/tapeya-logo-white.svg';
import { otp5Schema } from '@/lib/validations/auth';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';

const LENGTH = 5;

function formatPhone(phone) {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length < 10) return phone || '+92 315 711 8511';
  return `+${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 12)}`;
}

export default function Otp() {
  const navigate = useNavigate();
  const phone = formatPhone(useLocation().state?.phone || '+923157118511');
  const [error, setError] = useState(null);
  const refs = useRef([]);

  const { setValue, watch, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(otp5Schema),
    defaultValues: { code: '' },
    mode: 'onSubmit',
  });

  const code = watch('code') || '';

  const setDigit = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(0, 1);
    const next = code.split('');
    next[i] = digit;
    setValue('code', next.join('').slice(0, LENGTH));
    if (digit && i < LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    setValue('code', pasted);
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  };

  const onSubmit = async ({ code: otp }) => {
    setError(null);
    try {
      // TODO: verify OTP via API
      console.log('OTP', otp);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err?.data?.message ?? err?.message ?? 'Verification failed.');
    }
  };

  return (
    <>
      <div className="pointer-events-none fixed top-[-115px] left-1/2 z-0 h-[302px] w-[622px] -translate-x-1/2 rounded-full bg-[#FF9700] opacity-50 blur-[200px]" aria-hidden />
      <div className="relative z-10 flex min-h-full flex-col items-center justify-center px-6">
        <img src={tapeyaLogo} alt="Tapeya" className="motion-safe:animate-splash-slide-up h-auto w-[270px] opacity-0 motion-reduce:opacity-100" />
        <p className="motion-safe:animate-splash-slide-up-delayed mt-6 max-w-[90vw] text-center text-base text-white opacity-0 motion-reduce:opacity-100">
          Live Cricket & Instant Updates, Anytime!
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-12 w-full max-w-[358px] space-y-6">
          <p className="text-center text-base text-white">
            Enter OTP sent to <span className="text-[#DA9811]">{phone}</span>
          </p>

          <div className="flex justify-between" role="group" aria-label="OTP digits">
            {[...Array(LENGTH)].map((_, i) => (
              <div key={i} className="h-[55px] w-[55px] shrink-0">
                <Input
                  ref={(el) => (refs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i ? 'off' : 'one-time-code'}
                  maxLength={1}
                  value={code[i] ?? ''}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  onPaste={i ? undefined : onPaste}
                  className="!h-[55px] !max-w-full rounded-full text-center text-lg tabular-nums"
                  aria-label={`Digit ${i + 1}`}
                />
              </div>
            ))}
          </div>

          {(errors.code?.message || error) && (
            <p className="text-center text-sm text-red-200" role="alert">
              {errors.code?.message ?? error}
            </p>
          )}

          <p className="text-center text-base text-white">
            Didn&apos;t receive? <Link to="/login" className="text-[#DA9811] underline">Resend</Link>
          </p>

          <Button type="submit" disabled={isSubmitting} variant="auth" className="mt-4">
            {isSubmitting ? 'Verifying...' : 'Next'}
          </Button>
        </form>
      </div>
    </>
  );
}
