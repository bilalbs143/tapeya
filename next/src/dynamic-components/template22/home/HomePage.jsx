'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import SimpleImageCaptcha, { generateCaptchaCode } from '@/components/SimpleImageCaptcha/SimpleImageCaptcha';
import Categories from '@/dynamic-components/template22/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template22/components/HeroSection/HeroSection';
import SubNavbar from '@/dynamic-components/template22/components/Navbar/SubNavbar';
import RegisterForm from '@/dynamic-components/template22/register/RegisterForm';
import { useTranslations } from '@/hooks/useTranslations';
import { loginUser } from '@/slices/auth/authAction';
import { loginSchema } from '@/validations/login.validation';

const inputClassName =
  'relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none placeholder:text-sm placeholder:text-[#FFFFFF66] focus:border-[#ec4d49] focus:ring-0 focus:ring-transparent focus:outline-none';

/* Mobile login: input with icon on the left */
const mobileInputWrapperClass =
  'flex h-[46px] w-full items-stretch overflow-hidden rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] focus-within:border-[#ec4d49]';
const mobileIconCellClass =
  'flex min-w-[48px] flex-shrink-0 items-center justify-center rounded-l-[5px] bg-[#353a41] text-white';
const mobileInputClass =
  'min-w-0 flex-1 rounded-r-[5px] rounded-l-none border-0 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-0 focus:outline-none focus:ring-0';
const mobileInputClassPassword =
  'min-w-0 flex-1 rounded-r-[5px] rounded-l-none border-0 bg-[#f0f4f8] px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-0 focus:outline-none focus:ring-0';

function HomePage() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const { loginLoader } = useSelector((state) => state.auth);
  const [showRegister, setShowRegister] = useState(false);
  const scrollPositionRef = useRef(0);

  // Prevent auto-scroll when Register section expands
  useEffect(() => {
    if (showRegister) {
      // Immediately restore the saved scroll position
      window.scrollTo({ top: scrollPositionRef.current, behavior: 'auto' });
    }
  }, [showRegister]);

  const handleRegisterClick = useCallback(() => {
    // Save current scroll position before expanding
    scrollPositionRef.current = window.pageYOffset || window.scrollY || 0;
    setShowRegister(true);
  }, []);
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptchaCode());
  const [captchaInput, setCaptchaInput] = useState('');

  const {
    control,
    handleSubmit,
    reset,
  } = useForm({
    resolver: joiResolver(loginSchema),
    defaultValues: { username: '', password: '' },
    mode: 'onChange',
  });

  const handleLogin = useCallback(
    async (data) => {
      try {
        const result = await dispatch(loginUser(data)).unwrap();
        if (result.data?.user && result.data?.auth) {
          reset();
          setCaptchaInput('');
          setCaptchaCode(generateCaptchaCode());
          router.push('/dashboard/home');
        }
      } catch (error) {
        console.error('Login failed:', error);
        setCaptchaInput('');
        setCaptchaCode(generateCaptchaCode());
        if (error?.message) {
          toast.error(t(error.message) || error.message);
        }
      }
    },
    [dispatch, reset, router, t],
  );

  const handleLoginValidationErrors = useCallback(
    (formErrors) => {
      const errorKeys = Object.keys(formErrors);
      if (errorKeys.length > 0) {
        const firstError = errorKeys[0];
        const errorMessage = formErrors[firstError]?.message;
        if (errorMessage) {
          toast.error(t(errorMessage) || errorMessage);
        }
      }
    },
    [t],
  );

  const handleLoginSubmit = useCallback(
    async (data, formErrors) => {
      if (formErrors) {
        handleLoginValidationErrors(formErrors);
        return;
      }
      const userAnswer = String(captchaInput).trim().toUpperCase();
      if (userAnswer !== captchaCode) {
        toast.error(t('invalid_captcha') || 'Invalid captcha. Please try again.');
        setCaptchaInput('');
        setCaptchaCode(generateCaptchaCode());
        return;
      }
      setCaptchaInput('');
      setCaptchaCode(generateCaptchaCode());
      await handleLogin(data);
    },
    [captchaCode, captchaInput, handleLogin, handleLoginValidationErrors, t],
  );

  return (
    <div className="relative text-white">
      {/* Lines Pattern Background */}
      <div className="pointer-events-none absolute right-0 -bottom-[15%] left-0 -z-10">
        <img
          src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/lines-pattern.svg"
          alt={t('lines_pattern')}
          className="h-full w-full object-contain"
        />
      </div>
      <HeroSection />
      {/* SubNavbar - Only on home page, mobile only */}
      <div className="block md:hidden">
        <SubNavbar />
      </div>
      {/* Categories - Mobile only (desktop shows in layout after Navbar) */}
      <div className="block md:hidden">
        <Categories />
      </div>

      {/* Mobile only: Login and Register sections (when not authenticated) */}
      {!isAuth && (
        <div className="block md:hidden" style={{ overflowAnchor: 'none' }}>
          <div className="container mx-auto px-4 py-6" style={{ overflowAnchor: 'none' }}>
            {/* Login and Register Section */}
            <section className="p-4 space-y-6" style={{ overflowAnchor: 'none' }}>
              <h2 className="mb-4 text-lg font-bold text-white">
                {t('login')}
              </h2>
              <form
                onSubmit={handleSubmit(
                  (data) => handleLoginSubmit(data),
                  (formErrors) => handleLoginSubmit(undefined, formErrors),
                )}
                className="space-y-4"
              >
                <div className={mobileInputWrapperClass}>
                  <span className={mobileIconCellClass} aria-hidden>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                  </span>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        autoComplete="username"
                        placeholder={t('username')}
                        className={mobileInputClass}
                      />
                    )}
                  />
                </div>
                <div className={mobileInputWrapperClass}>
                  <span className={mobileIconCellClass} aria-hidden>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="password"
                        autoComplete="current-password"
                        placeholder={t('password')}
                        className={mobileInputClassPassword}
                      />
                    )}
                  />
                </div>
                {/* Captcha image: full-width row */}
                <SimpleImageCaptcha
                  code={captchaCode}
                  value={captchaInput}
                  onChange={setCaptchaInput}
                  stacked
                  imageOnly
                  width={60}
                  height={30}
                  imageClassName="rounded-[5px] border border-[#FFFFFF33]"
                />
                {/* Captcha input: same style as username (icon + input) */}
                <div className={mobileInputWrapperClass}>
                  <span className={mobileIconCellClass} aria-hidden>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    maxLength={2}
                    value={captchaInput}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
                      setCaptchaInput(v);
                    }}
                    placeholder={t('captcha') || 'Captcha'}
                    className={mobileInputClass}
                    aria-label="Captcha answer"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginLoader}
                  className="flex h-[36px] w-full cursor-pointer items-center justify-center rounded-[8px] px-4 text-sm font-bold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    backgroundImage:
                      'linear-gradient(#f17a77,#ee5f5b 60%,#ec4d49)',
                  }}
                >
                  {loginLoader
                    ? t('processing') || 'Processing...'
                    : t('login') || 'Login'}
                </button>
                {!showRegister && (
                  <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="flex h-[36px] w-full cursor-pointer items-center justify-center rounded-[8px] px-4 text-sm font-bold text-white transition-all duration-200"
                    style={{
                      backgroundImage:
                        'linear-gradient(#74cae3,#5bc0de 60%,#4ab9db)',
                    }}
                  >
                    {t('register_now') || 'Register Now'}
                  </button>
                )}
              </form>

              {/* Register Section - expands in place when "Register Now" is clicked */}
              <div
                className="grid will-change-[grid-template-rows]"
                style={{
                  gridTemplateRows: showRegister ? '1fr' : '0fr',
                  transition: 'grid-template-rows 300ms ease-in-out',
                  overflowAnchor: 'none',
                  contain: 'layout',
                }}
              >
                <div className="min-h-0 overflow-hidden" style={{ overflowAnchor: 'none' }}>
                  <div className="pt-2">
                    <h2 className="mb-4 text-lg font-bold text-white">
                      {t('create_new_account') || 'Create new account'}
                    </h2>
                    <RegisterForm
                      referralCodeFromQuery={searchParams?.get('ref') || ''}
                      singleColumn={true}
                      onSuccess={() => router.push('/')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegister(false)}
                      className="mt-4 flex h-[36px] w-full cursor-pointer items-center justify-center rounded-[8px] border-2 border-white/40 px-4 text-sm font-bold text-white transition-all duration-200 hover:bg-white/10"
                    >
                      {t('close') || 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Statistics Section */}
      {/* <Statistics /> */}
    </div>
  );
}

export default HomePage;
