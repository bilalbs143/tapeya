'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchUserProfile, updateUserPassword } from '@/slices/auth/authAction';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Labels';
import { changePasswordSchema } from '@/validations/changePassword.validation';

export default function ProfileTab() {
  const dispatch = useDispatch();
  const { user, updatePasswordLoader, userLoader } = useSelector(
    (state) => state.auth,
  );
  const { t } = useTranslations();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: joiResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  const handlePasswordChange = async (data) => {
    try {
      await dispatch(
        updateUserPassword({
          current_password: data.current_password,
          password: data.password,
          password_confirmation: data.password_confirmation,
        }),
      ).unwrap();

      // Reset form after successful password change
      reset();

      // Show success message (you can use toast or any notification system)
      console.log('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  // Fetch user profile and reset form when component mounts
  useEffect(() => {
    dispatch(fetchUserProfile());
    reset();
  }, [dispatch, reset]);

  // Show loading state while fetching user data
  if (userLoader) {
    return (
      <div className="flex items-center justify-center py-8">
        <CommonLoader size="lg" border="border-[#2DFA1A]" />
      </div>
    );
  }

  // Show message if no user data
  if (!user || Object.keys(user).length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-white">
          {t('no_user_profile_data_available')}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Detail Section */}
      <div className="rounded-[3px] border border-[#2DFA1A4D] bg-[#0F1B1B] px-4 py-3 shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] md:px-8 md:py-10">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {/* First Row */}
            <div>
              <Label
                htmlFor="username"
                className="mb-2 block text-[14px] font-normal text-white"
              >
                {t('id')}
              </Label>
              <input
                id="username"
                value={user?.username || ''}
                disabled
                type="text"
                className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#252D2D] px-3 py-3 text-[12px] text-[#FFFFFF80] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
              />
            </div>

            <div>
              <Label
                htmlFor="name"
                className="mb-2 block text-[14px] font-normal text-white"
              >
                {t('name')}
              </Label>
              <input
                id="name"
                value={user?.name || ''}
                disabled
                type="text"
                className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#252D2D] px-3 py-3 text-[12px] text-[#FFFFFF80] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
              />
            </div>

            <div>
              <Label
                htmlFor="nickname"
                className="mb-2 block text-[14px] font-normal text-white"
              >
                {t('nickname')}
              </Label>
              <input
                id="nickname"
                value={user?.nickname || ''}
                disabled
                type="text"
                className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#252D2D] px-3 py-3 text-[12px] text-[#FFFFFF80] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
              />
            </div>

            <div>
              <Label
                htmlFor="dob"
                className="mb-2 block text-[14px] font-normal text-white"
              >
                {t('date_of_birth')}
              </Label>
              <input
                id="dob"
                value={user?.dob || ''}
                disabled
                type="text"
                className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#252D2D] px-3 py-3 text-[12px] text-[#FFFFFF80] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
              />
            </div>

            {/* Second Row */}
            <div>
              <Label
                htmlFor="phone"
                className="mb-2 block text-[14px] font-normal text-white"
              >
                {t('phone_no')}
              </Label>
              <input
                id="phone"
                value={user?.phone || ''}
                disabled
                type="text"
                className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#252D2D] px-3 py-3 text-[12px] text-[#FFFFFF80] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
              />
            </div>

            <div>
              <Label
                htmlFor="bank"
                className="mb-2 block text-[14px] font-normal text-white"
              >
                {t('select_bank')}
              </Label>
              <input
                id="bank"
                value={user?.bank_account?.bank_name || ''}
                disabled
                type="text"
                className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#252D2D] px-3 py-3 text-[12px] text-[#FFFFFF80] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
              />
            </div>

            <div>
              <Label
                htmlFor="accountHolder"
                className="mb-2 block text-[14px] font-normal text-white"
              >
                {t('account_holder')}
              </Label>
              <input
                id="accountHolder"
                value={user?.bank_account?.account_holder || ''}
                disabled
                type="text"
                className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#252D2D] px-3 py-3 text-[12px] text-[#FFFFFF80] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
              />
            </div>

            <div>
              <Label
                htmlFor="accountNumber"
                className="mb-2 block text-[14px] font-normal text-white"
              >
                {t('account_number')}
              </Label>
              <input
                id="accountNumber"
                value={user?.bank_account?.account_number || ''}
                disabled
                type="text"
                className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#252D2D] px-3 py-3 text-[12px] text-[#FFFFFF80] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="space-y-6">
        <div className="rounded-[3px] border border-[#2DFA1A4D] bg-[#050C0C] px-4 py-3 shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] md:px-6 md:py-6">
          <h4 className="mb-6 text-[15px] font-normal text-white md:text-[19px]">
            {t('change_password')}
          </h4>
          <form onSubmit={handleSubmit(handlePasswordChange)}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
              <div>
                <Label
                  htmlFor="currentPassword"
                  className="mb-2 block text-[14px] font-normal text-white"
                >
                  {t('current_password')}
                </Label>
                <Controller
                  name="current_password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      placeholder={t('current_password')}
                      className="relative block h-[46px] w-full appearance-none rounded-[3px] border border-[#2DFA1A4D] px-3 py-3 text-white shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#661BB5] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                      error={errors.current_password?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label
                  htmlFor="newPassword"
                  className="mb-2 block text-[14px] font-normal text-white"
                >
                  {t('new_password')}
                </Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder={t('new_password')}
                      className="relative block h-[46px] w-full appearance-none rounded-[3px] border border-[#2DFA1A4D] px-3 py-3 text-white shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#661BB5] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                      error={errors.password?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-[14px] font-normal text-white"
                >
                  {t('confirm_password')}
                </Label>
                <Controller
                  name="password_confirmation"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder={t('confirm_password')}
                      className="relative block h-[46px] w-full appearance-none rounded-[3px] border border-[#2DFA1A4D] px-3 py-3 text-white shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#661BB5] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                      error={errors.password_confirmation?.message}
                    />
                  )}
                />
              </div>
            </div>

            {/* Primary submit button */}
            <div className="mt-6 flex justify-end">
              {/* Desktop version */}
              <button
                type="submit"
                disabled={updatePasswordLoader}
                className="filled-hover-effect hidden cursor-pointer items-center justify-center rounded-[4px] bg-[#2DFA1A] px-7 pt-4 pb-4 text-[14px] font-extrabold text-black transition-all duration-200 hover:bg-[#2DFA1A] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
                data-hover={
                  updatePasswordLoader ? t('processing') : t('change_password')
                }
              >
                <span>
                  {updatePasswordLoader
                    ? t('processing')
                    : t('change_password')}
                </span>
              </button>
              <button
                type="submit"
                disabled={updatePasswordLoader}
                className="filled-hover-effect mx-auto flex w-[98%] cursor-pointer items-center justify-center rounded-[4px] bg-[#2DFA1A] pt-3 pb-3 text-[14px] font-extrabold text-black transition-all duration-200 hover:bg-[#2DFA1A] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:hidden"
                data-hover={
                  updatePasswordLoader ? t('processing') : t('change_password')
                }
              >
                <span>
                  {updatePasswordLoader
                    ? t('processing')
                    : t('change_password')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
