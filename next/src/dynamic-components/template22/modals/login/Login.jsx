'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { t } = useTranslations();
  const { loginLoader } = useSelector((state) => state.auth);
  const modalProps = useSelector((state) => state.common.modalProps);
  const redirectUrl = modalProps?.redirectUrl || '/dashboard/home';
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
        setTimeout(() => {
          dispatch(closeModal('login'));
          // Navigate to redirectUrl (defaults to /dashboard/home)
          router.push(redirectUrl);
        }, 250);
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
    setTimeout(() => {
      dispatch(closeModal('login'));
      router.push('/register');
    }, 250);
  };

  return (
    <div
      className={`mx-auto w-full max-w-[500px] transform rounded-[12px] border-2 border-[#E8D25E4D] p-[1px] text-white shadow-xl transition-all duration-300 ease-out sm:max-w-[600px] lg:max-w-[700px] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
    >
      <div className="rounded-[12px] bg-black p-6 sm:p-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white uppercase sm:text-3xl">
              {t('login') || 'LOGIN'}
            </h2>
            <button
              onClick={handleCloseModal}
              aria-label={t('close')}
              className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md text-white transition-all duration-300 sm:h-[33px] sm:w-[33px]"
              style={{
                backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
              }}
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
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Username Field */}
            <div>
              <Label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-white uppercase"
              >
                {t('username') || 'USERNAME'}
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
                    placeholder={t('username') || 'USERNAME'}
                    className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none placeholder:text-sm placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none"
                    error={errors.username?.message}
                  />
                )}
              />
            </div>

            {/* Password Field */}
            <div>
              <Label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-white"
              >
                {t('password') || 'Password'}
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
                    placeholder={t('username') || 'USERNAME'}
                    className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none placeholder:text-sm placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none"
                    error={errors.password?.message}
                  />
                )}
              />
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loginLoader}
                className="flex w-full cursor-pointer items-center justify-center rounded-[5px] px-4 py-4 text-base font-bold text-white transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundImage: 'linear-gradient(#f17a77, #ee5f5b 60%, #ec4d49)',
                }}
              >
                {loginLoader
                  ? t('processing') || 'Processing...'
                  : t('login') || 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
