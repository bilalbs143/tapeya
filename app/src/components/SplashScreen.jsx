import { useEffect, useState } from 'react';

import { Navigate } from 'react-router-dom';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { isReturningUser } from '@/lib/returningUser';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/selectors';


const tapeyaLogo = `${CLOUDFRONT_APP_BASE}/images/logos/tapeya-logo-white.svg`;

const SPLASH_DURATION_MS = 3000;
const SPLASH_FADE_OUT_MS = 350;

export default function SplashScreen() {
  const [exiting, setExiting] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Step 1: start the fade-out after the full splash duration.
  useEffect(() => {
    const startExit = setTimeout(() => setExiting(true), SPLASH_DURATION_MS);
    return () => clearTimeout(startExit);
  }, []);

  // Step 2: trigger navigation once the fade-out animation has finished.
  // Total time before redirect: SPLASH_DURATION_MS + SPLASH_FADE_OUT_MS.
  useEffect(() => {
    if (!exiting) return;
    const go = setTimeout(() => setRedirect(true), SPLASH_FADE_OUT_MS);
    return () => clearTimeout(go);
  }, [exiting]);

  if (redirect) {
    if (isAuthenticated) {
      return <Navigate to="/home" replace />;
    }
    if (isReturningUser()) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="fixed inset-0 bg-black">
      <div
        className="pointer-events-none fixed top-[-115px] left-1/2 z-0 h-[302px] w-[622px] -translate-x-1/2 rounded-full bg-[#FF9700] opacity-30 blur-[200px]"
        aria-hidden
      />

      <div
        className={`relative z-10 flex min-h-full flex-col items-center justify-center gap-6 ${
          exiting ? 'motion-safe:animate-splash-fade-out' : ''
        }`}
      >
        <img
          src={tapeyaLogo}
          alt="Tapeya"
          className="motion-safe:animate-splash-slide-up h-auto w-[270px] opacity-0 motion-reduce:opacity-100"
        />
        <p className="motion-safe:animate-splash-slide-up-delayed max-w-[90vw] text-center font-sans text-[16px] text-white opacity-0 motion-reduce:opacity-100">
          Live Cricket &amp; Instant Updates, Anytime!
        </p>
      </div>
    </div>
  );
}
