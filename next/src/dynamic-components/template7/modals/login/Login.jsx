'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import { loginUser } from '@/slices/auth/authAction';
import { closeModal, openModal } from '@/slices/common/commonSlice';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Labels.jsx';
import { loginSchema } from '@/validations/login.validation';

export default function Login() {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { loginLoader } = useSelector((state) => state.auth);
  const [isVisible, setIsVisible] = useState(false);

  const splitIntoLetters = useCallback((text) => {
    return text.split('').map((char, index) => (
      <span key={index} style={{ display: 'inline-block' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: joiResolver(loginSchema),
    defaultValues: { username: '', password: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();
      if (result.data?.user && result.data?.auth) {
        reset();
        setIsVisible(false);
        setTimeout(() => dispatch(closeModal('login')), 250);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleCloseModal = () => {
    setIsVisible(false);
    setTimeout(() => dispatch(closeModal('login')), 250);
  };

  const handleOpenRegisterModal = (e) => {
    e.preventDefault();
    setIsVisible(false);
    setTimeout(() => dispatch(openModal('register')), 250);
  };

  return (
    <div
      className={`mx-auto w-full max-w-[1100px] transform overflow-visible rounded-[5px] bg-[linear-gradient(90deg,rgba(41,18,135,0.40)_0.48%,rgba(87,61,193,0.40)_49.87%,rgba(41,18,135,0.40)_96.31%)] text-white shadow-xl transition-all duration-300 ease-out md:h-[550px] ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      }`}
    >
      {/* Main container */}
      <div className="flex w-full flex-col items-stretch overflow-visible rounded-[5px] border border-[#3E1D88] md:h-[550px] lg:flex-row">
        {/* Left side image — hidden on mobile */}
        <div className="relative z-20 ml-3 hidden w-full items-center justify-center overflow-visible p-6 lg:flex lg:w-[45%]">
          <div className="relative flex h-full w-full items-center justify-center overflow-visible">
            <img
              src="/icons/Group 3790.webp"
              alt="Login Character"
              className="absolute -top-[100px] h-auto w-[115%] object-contain md:h-[650px]"
            />
          </div>
        </div>

        {/* Right side form */}
        <div className="relative flex w-full items-center justify-center p-6 lg:w-[55%] lg:p-8">
          <div className="w-full max-w-[600px]">
            {/* Login title + Close button inline */}
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-bring-race text-left text-[25px] tracking-widest text-white uppercase md:text-[40px]">
                {t('login')}
              </h2>

              <button
                onClick={handleCloseModal}
                aria-label={t('close')}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-transparent transition-all hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 43 43"
                  fill="none"
                >
                  <path
                    d="M1.41406 32.2714L12.8426 20.8428L2.55692 10.5571L11.6998 1.41422L21.9855 11.6999L32.2712 1.41422L41.4141 10.5571L31.1283 20.8428L41.4141 31.1285L32.2712 40.2714L21.9855 29.9856L10.5569 41.4142L1.41406 32.2714Z"
                    stroke="#7351FF"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>

            {/* Form starts */}
            <form
              className="space-y-5 rounded-[8px]"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Label
                htmlFor="username"
                className="mb-2 block text-[14px] font-bold text-white"
              >
                {t('id')}
              </Label>
              {/* Email */}
              <div className="relative">
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder={t('enter_id')}
                      className="block h-[50px] w-full rounded-[3px] border border-[#3E1D88] bg-[#3E1D88] px-4 text-white shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFFAA] focus:border-[#661BB5] focus:ring-0"
                      error={errors.username?.message}
                    />
                  )}
                />
              </div>

              {/* Password */}
              <Label
                htmlFor="password"
                className="mb-2 block text-[14px] font-bold text-white"
              >
                {t('password')}
              </Label>
              <div className="relative">
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="Your Password"
                      className="block h-[50px] w-full rounded-[3px] border border-[#3E1D88] bg-[#3E1D88] px-4 text-white shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFFAA] focus:border-[#661BB5] focus:ring-0"
                      error={errors.password?.message}
                    />
                  )}
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loginLoader}
                className="angled-button angled-button-pinks mt-8 ml-0.5 h-[35px] w-full font-bold tracking-wide text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                data-hover={loginLoader ? 'Processing...' : 'LOGIN'}
              >
                <div className="angled-button-inner">
                  <span className="angled-button-text">
                    {loginLoader ? 'Processing...' : 'LOGIN'}
                  </span>
                </div>
              </button>

              {/* Register Button */}
              <button
                type="button"
                onClick={handleOpenRegisterModal}
                className="angled-button angled-button-blue mt-2 ml-0.5 h-[35px] w-full text-[14px] font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                data-hover="Don't Have an Account? Register"
              >
                <div className="angled-button-inner">
                  <span className="angled-button-text">
                    Don't Have an Account? Register
                  </span>
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
