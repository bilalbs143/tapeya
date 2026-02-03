import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import tapeyaLogo from '@/assets/images/logos/tapeya-logo-white.svg';

const SPLASH_DURATION_MS = 5000;
const SPLASH_FADE_OUT_MS = 350;

export function SplashScreen() {
  const [exiting, setExiting] = useState(false);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const startExit = setTimeout(() => setExiting(true), SPLASH_DURATION_MS);
    return () => clearTimeout(startExit);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const goToLogin = setTimeout(() => setRedirect(true), SPLASH_FADE_OUT_MS);
    return () => clearTimeout(goToLogin);
  }, [exiting]);

  if (redirect) return <Navigate to="/login" replace />;

  return (
    <div className="fixed inset-0 overflow-visible bg-black">
      <div
        className="pointer-events-none fixed top-[-115px] left-1/2 z-0 h-[302px] w-[622px] -translate-x-1/2 rounded-full bg-[#FF9700] opacity-30 blur-[200px]"
        aria-hidden
      />
      <div
        className={`relative z-10 flex min-h-full flex-col items-center justify-center gap-6 ${exiting ? 'motion-safe:animate-splash-fade-out' : ''}`}
      >
        <img
          src={tapeyaLogo}
          alt="Tapeya"
          className="motion-safe:animate-splash-slide-up h-auto w-[270px] opacity-0 motion-reduce:opacity-100"
        />
        <p
          className="motion-safe:animate-splash-slide-up-delayed max-w-[90vw] text-center text-[16px] text-white opacity-0 motion-reduce:opacity-100"
          style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
        >
          Live Cricket & Instant Updates, Anytime!
        </p>
      </div>
    </div>
  );
}
