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
      className={`mx-auto w-full max-w-[400px] transform rounded-[5px] border-2 border-[#03C72C4D] bg-[#060D0D] text-white shadow-xl transition-all duration-300 ease-out sm:max-w-[500px] lg:max-w-[590px] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#D9D9D9] sm:text-xl">
              {t('login_your_account')}
            </h2>
            <button
              onClick={handleCloseModal}
              aria-label={t('close')}
              className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#55BC55] text-black transition-all duration-300 sm:h-[33px] sm:w-[33px]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="transition-all duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
              >
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="#0B0B0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <form
            className="space-y-4 rounded-[6px] border border-[#FFFFFF66] p-4 sm:space-y-6 sm:p-6"
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
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#054516] bg-transparent px-2 py-2 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#55BC55] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
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
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#054516] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#55BC55] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
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
                className="filled-hover-effect flex w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#55BC55] px-4 pt-3 pb-3 text-base font-semibold text-black transition-all duration-200 active:scale-95 disabled:opacity-50"
                data-hover={loginLoader ? 'Processing...' : 'Login'}
              >
                <span>{loginLoader ? 'Processing...' : 'Login'}</span>
              </button>
            </div>

            {/* Outlined create account button */}
            <div>
              <button
                type="button"
                onClick={handleOpenRegisterModal}
                className="outline-hover-effect w-full cursor-pointer rounded-[10px] bg-[#0A1818] px-4 py-3 text-base font-semibold text-white transition-all duration-200 active:scale-95"
              >
                <span>Register</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
