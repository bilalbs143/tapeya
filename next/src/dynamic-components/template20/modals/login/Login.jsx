'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import { Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

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
      className={`mx-auto max-h-[95vh] w-full transform overflow-y-auto rounded-[10px] !border border-[#FFDAB91A] md:border-none bg-[linear-gradient(90deg, rgba(0, 0, 0, 0.81) 27.63%, rgba(0, 0, 0, 0.49) 100%)] text-white shadow-xl transition-all duration-300 ease-out md:h-[561px] md:max-h-none md:w-[908px] md:overflow-hidden bg-left md:bg-bottom ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}
      style={{
        backgroundImage:
          "url('https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Sign+iN.png')",
        backgroundSize: 'cover',
      }}
    >
      {/* Container with relative for close button */}
      <div className="relative h-full w-full">
        {/* GRID CONTAINER */}
        <div className="grid h-full w-full grid-cols-1 md:grid-cols-[1.1fr_1fr]">
          {/* LEFT – FORM */}
          <div className="flex flex-col justify-center px-6 py-10 md:px-12 md:py-10">
            <div className="w-full max-w-[460px]">
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
                      stroke="#D00000"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                {/* User Email */}
                <div className="space-y-2">
                  <label className="text-sm font-bold">Enter Your Email</label>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Email Address"
                        className="h-[52px] w-full rounded-[4px] border border-[#D000004D] bg-[#000000] px-4 shadow-inner focus:border-[#D00000] focus:ring-0"
                        error={errors.username?.message}
                      />
                    )}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-bold">Password</label>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Your Password"
                          className="h-[52px] w-full rounded-[4px] border border-[#D000004D] bg-[#000000] px-4 pr-12 shadow-inner focus:border-[#D00000] focus:ring-0"
                          error={errors.password?.message}
                        />

                      </div>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 pt-4">
                  <button
                    type="submit"
                    disabled={loginLoader}
                    className="h-[55px] w-full rounded-[6px] bg-[#D00000] text-[18px] font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loginLoader ? 'Processing...' : 'Login'}
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenRegisterModal}
                    className="h-[55px] w-full rounded-[6px] bg-[#1a1a1a] text-[18px] font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                  >
                    Don’t Have an Account? Register
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT – EMPTY FOR BACKGROUND IMAGE */}
          <div className="hidden md:block" />
        </div>
      </div>
    </div>
  );
}
