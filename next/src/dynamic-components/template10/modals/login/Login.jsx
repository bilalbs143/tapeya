'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import React, { useCallback, useEffect, useState } from 'react';
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
      className={`fixed top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 transform overflow-visible rounded-[5px] bg-[#246A734D] text-white shadow-xl transition-all duration-300 ease-out md:h-[440px] md:w-[540px] ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}
    >
      <div className="flex h-full w-full flex-col items-stretch overflow-visible rounded-[5px] lg:flex-row">
        <div className="relative flex w-full items-center justify-center p-5 lg:p-8">
          <div className="w-full max-w-[440px]">
            <div className="mb-7 flex items-center justify-between">
              <h2 className="font-bring-race text-left text-[25px] tracking-widest text-white uppercase md:text-[40px]">
                {t('login')}
              </h2>

              <button
                onClick={handleCloseModal}
                aria-label={t('close')}
                className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-[#E33A2480] text-black transition-all duration-300 sm:h-[36px] sm:w-[36px]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="transition-all duration-300 group-hover:rotate-180 sm:h-6 sm:w-6"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="#E33A24"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <form
              className="space-y-5 rounded-[8px]"
              onSubmit={handleSubmit(onSubmit)}
            >
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
                      className="block h-[50px] w-full rounded-[5px] border border-[#E33A2480] bg-[#1D4647] px-4 text-white shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFFAA] focus:border-[#E33A2480] focus:bg-[#172F31CC] focus:ring-0"
                      error={errors.username?.message}
                    />
                  )}
                />
              </div>

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
                      className="block h-[50px] w-full rounded-[5px] border border-[#E33A2480] bg-[#1D4647] px-4 text-white shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFFAA] focus:border-[#E33A2480] focus:bg-[#172F31CC] focus:ring-0"
                      error={errors.password?.message}
                    />
                  )}
                />
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loginLoader}
                  className="template10-filled-button-hover flex w-full cursor-pointer items-center justify-center rounded-[5px] bg-[#E33A24] px-4 pt-3 pb-3 text-base text-[16px] font-extrabold text-white transition-all duration-200 active:scale-95 disabled:opacity-50"
                  data-hover={loginLoader ? 'Processing...' : 'Login'}
                >
                  <span className="text-container">
                    <span className="text">
                      {loginLoader ? 'Processing...' : 'Login'}
                    </span>
                  </span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleOpenRegisterModal}
                  className="template10-bordered-button-hover w-full cursor-pointer rounded-[5px] border border-[#E33A2480] bg-transparent px-4 py-3 pt-3 pb-3 text-base text-[16px] font-extrabold text-white transition-all duration-200 active:scale-95"
                >
                  <span className="text-container">
                    <span className="text">Register</span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
