'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import { useEffect } from 'react';
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
        <CommonLoader size="lg" border="border-[#D3AF37]" />
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
    <>
      {/* Left Section: PROFILE */}
      <div
        className="rounded-[10px] bg-[#111111] p-6"
        style={{ border: '1px solid #E8D25E4D' }}
      >
        <h3
          className="mb-6 border-b pb-4 text-lg font-bold uppercase md:text-xl"
          style={{ color: '#E8D25E', borderBottom: '1px solid #272727' }}
        >
          {t('profile')}
        </h3>

        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full sm:h-32 sm:w-32"
              style={{ backgroundColor: '#E8D25E' }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-800 sm:h-16 sm:w-16"
              >
                <path
                  d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                  fill="currentColor"
                />
                <path
                  d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1">
            {/* Only show the 8 actual profile fields (no duplicates, no extra email) */}
            <div className="space-y-4">
              {[
                {
                  label: t('username') || 'Username',
                  value: user?.username || '-',
                },
                { label: t('name') || 'Name', value: user?.name || '-' },
                {
                  label: t('nickname') || 'Nickname',
                  value: user?.nickname || '-',
                },
                {
                  label: t('date_of_birth') || 'Date of Birth',
                  value: user?.dob || '-',
                },
                {
                  label: t('phone_no') || 'Phone No',
                  value: user?.phone || '-',
                },
                {
                  label: t('select_bank') || 'Select Bank',
                  value: user?.bank_account?.bank_name || '-',
                },
                {
                  label: t('account_holder') || 'Account Holder',
                  value: user?.bank_account?.account_holder || '-',
                },
                {
                  label: t('account_number') || 'Account Number',
                  value: user?.bank_account?.account_number || '-',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-28 flex-shrink-0 sm:w-32 md:w-40">
                    <p className="text-sm text-white opacity-70">
                      {item.label}
                    </p>
                  </div>
                  <div
                    className="mt-[2px] h-6 w-px flex-shrink-0"
                    style={{ backgroundColor: '#E8D25E' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-base leading-snug font-bold break-words text-white">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: CHANGE PASSWORD */}
      <div
        className="rounded-[10px] bg-[#111111] p-6"
        style={{ border: '1px solid #E8D25E4D' }}
      >
        <h3
          className="mb-6 border-b pb-4 text-lg font-bold uppercase md:text-xl"
          style={{ color: '#E8D25E', borderBottom: '1px solid #272727' }}
        >
          {t('change_password')}
        </h3>

        <form
          onSubmit={handleSubmit(handlePasswordChange)}
          className="space-y-4"
        >
          {/* Current Password - Full Width */}
          <div>
            <Controller
              name="current_password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('current_password') || 'Current Password'}
                  className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-white bg-transparent px-3 py-3 text-sm text-white shadow-none placeholder:text-sm placeholder:text-white focus:border-white focus:ring-0 focus:ring-transparent focus:outline-none sm:h-[50px]"
                  error={errors.current_password?.message}
                />
              )}
            />
          </div>

          {/* New Password and Confirm Password - Side by Side */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder={t('new_password') || 'New Password'}
                    className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-white bg-transparent px-3 py-3 text-sm text-white shadow-none placeholder:text-sm placeholder:text-white focus:border-white focus:ring-0 focus:ring-transparent focus:outline-none sm:h-[50px]"
                    error={errors.password?.message}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="password_confirmation"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder={t('confirm_password') || 'Confirm Password'}
                    className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-white bg-transparent px-3 py-3 text-sm text-white shadow-none placeholder:text-sm placeholder:text-white focus:border-white focus:ring-0 focus:ring-transparent focus:outline-none sm:h-[50px]"
                    error={errors.password_confirmation?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Update Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={updatePasswordLoader}
              className="w-full rounded-lg bg-[#E8D25E] px-6 py-3 text-sm font-bold text-black uppercase transition-all duration-200 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              style={{
                boxShadow: 'inset 0 -4px 0 rgba(0, 0, 0, 0.2)',
              }}
            >
              {updatePasswordLoader ? t('processing') : t('update') || 'Update'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
