'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import { loginUser } from '@/slices/auth/authAction';
import { closeModal, openModal } from '@/slices/common/commonSlice';
import { Input } from '@/ui/Input';
import { loginSchema } from '@/validations/login.validation';

export default function Login() {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { loginLoader } = useSelector((state) => state.auth);
  const [isVisible, setIsVisible] = useState(false);

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
      className={`fixed top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 transform rounded-[7px] border border-[#0F5045] bg-[#18181A] bg-[linear-gradient(90deg,rgba(24,24,26,0)_-16.56%,#18181A_48.8%,rgba(24,24,26,0)_113.29%)] text-white shadow-xl transition-all duration-300 ease-out md:h-[561px] md:w-[920px] ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}
    >
      {/* GRID CONTAINER */}
      <div className="grid h-full w-full grid-cols-1 overflow-hidden rounded-[5px] md:grid-cols-[1fr_420px]">
        {/* LEFT – FORM */}
        <div className="relative flex items-center justify-center p-5 lg:p-8">
          <div className="w-full max-w-[440px] px-2">
            <div className="mb-7 flex items-center justify-between">
              <h2 className="font-bring-race text-[25px] tracking-widest uppercase md:text-[40px]">
                {t('login')}
              </h2>

              <button
                onClick={handleCloseModal}
                aria-label={t('close')}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full transition-all hover:scale-110"
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
                    stroke="#CBBC91"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={t('enter_id')}
                    className="h-[50px] w-full rounded-[4px] border border-[#CBBC9133] bg-[#0F50451A] px-4 text-white placeholder:text-[#FFFFFFAA] focus:border-[#CBBC91]"
                    error={errors.username?.message}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    placeholder="Your Password"
                    className="h-[50px] w-full rounded-[4px] border border-[#FEA80326] bg-transparent px-4 text-white placeholder:text-[#FFFFFFAA] focus:border-[#CBBC91]"
                    error={errors.password?.message}
                  />
                )}
              />

              <button
                type="submit"
                disabled={loginLoader}
                className="template10-filled-button-hover w-full rounded-[50px] bg-[#CBBC91] py-3.5 text-[16px] text-white transition-all active:scale-95 disabled:opacity-50"
              >
                {loginLoader ? 'Processing...' : 'Login'}
              </button>

              <button
                type="button"
                onClick={handleOpenRegisterModal}
                className="template10-bordered-button-hover w-full rounded-[50px] border border-[#CBBC91] bg-[#0F5045] py-3.5 text-[16px] font-extrabold transition-all active:scale-95"
              >
                Don’t Have an Account? Register
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT – DESKTOP VISUAL */}
        <div className="relative hidden md:block">
          {/* Image */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/login-12.png"
            alt="Login Visual"
            className="absolute bottom-0 left-0 h-full w-full object-contain pt-5"
          />
        </div>
      </div>
    </div>
  );
}
