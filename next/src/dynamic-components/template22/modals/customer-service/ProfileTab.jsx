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
        <CommonLoader size="lg" border="border-[#ee5f5b]" />
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
      {/* Left Section: CHANGE PASSWORD */}
      <div
        className="overflow-hidden rounded-[4px] border"
        style={{
          backgroundColor: '#2e3338',
          borderColor: 'rgba(0, 0, 0, 0.6)',
          boxShadow: '0px 3px 5px 0px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          className="px-4 py-2"
          style={{
            color: '#ffffff',
            backgroundColor: '#ee5f5b',
          }}
        >
          <h3 className="font-bold uppercase" style={{ fontSize: '16px' }}>
            {t('change_password')}
          </h3>
        </div>
        
        <div className="p-6">

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

            {/* New Password - Full Width */}
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

            {/* Confirm Password - Full Width */}
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

            {/* Update Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={updatePasswordLoader}
                className="w-full rounded-lg px-6 py-3 text-sm font-bold text-white uppercase transition-all duration-200 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                style={{
                  backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
                }}
              >
                {updatePasswordLoader ? t('processing') : t('update') || 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Section: MY ACCOUNT */}
      <div className="rounded-[10px] bg-transparent p-6">
        <div className="text-sm leading-relaxed md:text-base" style={{ color: '#c8c8c8' }}>
          <p>
            {t('password_responsibility_notice') || 'MPONUSA777 is not responsible for your negligence in keeping your password confidential. To reset your password, please contact our customer service by fulfilling the verification requirements such as cellphone number, EMAIL ADDRESS, or other things that will be asked when you want to reset your password.'}
          </p>
        </div>
      </div>
    </>
  );
}
