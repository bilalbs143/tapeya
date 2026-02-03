'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import { loginUser } from '@/slices/auth/authAction';
import { closeModal, openModal } from '@/slices/common/commonSlice';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Labels';
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
    defaultValues: {
      username: '',
      password: '',
    },
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
      className={`mx-auto w-full max-w-[400px] transform rounded-[24px] bg-[#312577] p-4 text-white shadow-xl transition-all duration-300 ease-out sm:max-w-[500px] sm:p-6 lg:max-w-[590px] lg:p-8 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#D9D9D9] sm:text-xl">
            {t('login_your_account')}
          </h2>
          <button
            onClick={handleCloseModal}
            aria-label={t('close')}
            className="btn-hover-outline group flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-sm border border-[#FC7E09] bg-transparent leading-none font-bold text-[2xl] text-white sm:h-7 sm:w-7"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form
          className="space-y-4 rounded-[3px] border-2 border-[#452FCD] p-4 sm:space-y-6 sm:p-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-0 space-y-4">
            <div className="mb-4 sm:mb-6">
              <Label
                htmlFor="username"
                className="mb-2 block text-[14px] font-bold text-white"
              >
                {t('id')}
              </Label>
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
                    className="relative block w-full appearance-none rounded-[12px] border border-[#5343B1] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#B3A6FF] autofill:bg-[#312577] autofill:shadow-[inset_0_0_0px_1000px_#312577] autofill:[-webkit-text-fill-color:white] focus:z-10 focus:border-[#FC7E09] focus:ring-1 focus:ring-[#FC7E09] focus:outline-none sm:text-sm md:placeholder:text-sm"
                    error={errors.username?.message}
                  />
                )}
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="mb-2 block text-[14px] font-bold text-white"
              >
                {t('password')}
              </Label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder={t('enter_your_password')}
                    className="relative block w-full appearance-none rounded-[12px] border border-[#5343B1] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#B3A6FF] autofill:bg-[#312577] autofill:shadow-[inset_0_0_0px_1000px_#312577] autofill:[-webkit-text-fill-color:white] focus:z-10 focus:border-[#FC7E09] focus:ring-1 focus:ring-[#FC7E09] focus:outline-none sm:text-sm md:placeholder:text-sm"
                    error={errors.password?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Primary login button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loginLoader}
              className="btn-hover-fill w-full cursor-pointer rounded-full px-4 py-3 text-sm font-normal text-white transition-all duration-150 active:scale-95 active:shadow-inner disabled:opacity-50"
              data-hover={loginLoader ? 'Processing...' : 'Login'}
            >
              {loginLoader ? 'Processing...' : 'Login'}
            </button>
          </div>

          {/* Outlined create account button */}
          <div>
            <button
              type="button"
              onClick={handleOpenRegisterModal}
              className="btn-hover-outline w-full cursor-pointer rounded-full border border-[#FC7E09] bg-transparent px-4 py-3 text-sm font-normal text-white transition-all duration-150 active:scale-95 active:shadow-inner"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
