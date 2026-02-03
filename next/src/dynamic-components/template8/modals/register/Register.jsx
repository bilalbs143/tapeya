'use client';

import 'flatpickr/dist/flatpickr.min.css';

import { joiResolver } from '@hookform/resolvers/joi';
import Flatpickr from 'flatpickr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { useTranslations } from '@/hooks/useTranslations';
import { registerUser } from '@/slices/auth/authAction';
import { closeModal } from '@/slices/common/commonSlice';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Labels';
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';
import { registrationSchema } from '@/validations/registration.validation';
import { fetchAllBanks } from '@/website/websiteAction';

export default function Register(props) {
  const dispatch = useDispatch();
  const { t, currentLocale } = useTranslations();
  const { registerLoader } = useSelector((state) => state.auth);
  const { allBanksData } = useSelector((state) => state.website);

  const dateOfBirthRef = useRef(null);
  const flatpickrInstanceRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const getBankName = (bank) => {
    if (!bank) return '';
    if (bank.other_names && bank.other_names[currentLocale]) {
      return bank.other_names[currentLocale];
    }
    return bank.bank_name || '';
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: joiResolver(registrationSchema),
    defaultValues: {
      username: '',
      name: '',
      nickname: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      phone: '',
      referralCode: '',
      bank: '',
      accountHolder: '',
      accountNumber: '',
    },
    mode: 'onChange',
  });

  const splitIntoLetters = useCallback((text) => {
    return text.split('').map((char, index) => (
      <span key={index} className="font-bring-race inline-block">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, []);

  useEffect(() => {
    dispatch(fetchAllBanks());
  }, [dispatch]);

  useEffect(() => {
    if (props?.referralCode) setValue('referralCode', props.referralCode);
  }, [props?.referralCode, setValue]);

  useEffect(() => {
    if (flatpickrInstanceRef.current) {
      flatpickrInstanceRef.current.destroy();
      flatpickrInstanceRef.current = null;
    }
    if (dateOfBirthRef.current) {
      flatpickrInstanceRef.current = Flatpickr(dateOfBirthRef.current, {
        dateFormat: 'Y-m-d',
        maxDate: 'today',
        disableMobile: true,
        allowInput: false,
        onChange: (selectedDates, dateStr) => setValue('dateOfBirth', dateStr),
      });
    }
    return () => {
      if (flatpickrInstanceRef.current) {
        flatpickrInstanceRef.current.destroy();
        flatpickrInstanceRef.current = null;
      }
    };
  }, [setValue]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        username: data.username,
        name: data.name,
        nickname: data.nickname,
        password: data.password,
        password_confirmation: data.confirmPassword,
        dob: data.dateOfBirth,
        phone: data.phone,
        referal_code: data.referralCode,
        bank_id: data.bank,
        account_holder: data.accountHolder,
        account_number: data.accountNumber,
      };
      const result = await dispatch(registerUser(payload)).unwrap();
      if (result.data) {
        reset();
        setIsVisible(false);
        setTimeout(() => dispatch(closeModal('register')), 250);
        toast.success(t('registration_successful_wait_admin'));
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleCloseModal = () => {
    setIsVisible(false);
    setTimeout(() => dispatch(closeModal('register')), 250);
  };

  const handlePhoneChange = (e) => {
    setValue('phone', e.target.value.replace(/\D/g, ''));
  };

  const handleAccountNumberChange = (e) => {
    setValue('accountNumber', e.target.value.replace(/\D/g, ''));
  };

  return (
    <div
      className={`mx-auto w-full max-w-[700px] transform overflow-visible rounded-[4px] bg-[#0A1414] text-white shadow-xl transition-all duration-300 ease-out md:h-[600px] ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      }`}
    >
      <div className="flex w-full flex-col items-stretch overflow-visible rounded-[5px] border border-[#2DFA1A4D] md:h-[600px]">
        {/* RIGHT FORM (FULL WIDTH + CENTERED) */}
        <div className="flex w-full flex-col items-center p-6 lg:w-full lg:p-9">
          <div className="w-full max-w-[550px]">
            <div className="mt-3 mb-6 flex items-center justify-between">
              <h2 className="font-bring-race text-left text-[16px] tracking-widest text-white uppercase md:text-[22px]">
                {splitIntoLetters(t('create_new_account'))}
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
                    stroke="#2DFA1A"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>

            {/* FORM */}
            <form
              className="custom-scrollbar max-h-none space-y-4 overflow-y-visible pr-4 lg:max-h-[470px] lg:overflow-y-auto"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Top visible fields */}
              <div className="space-y-2">
                {[
                  {
                    name: 'name',
                    label: t('name'),
                    placeholder: t('enter_fullname'),
                  },
                  {
                    name: 'nickname',
                    label: t('nickname'),
                    placeholder: t('enter_nick_name'),
                  },
                  {
                    name: 'password',
                    label: t('password'),
                    placeholder: t('enter_new_password'),
                    type: 'password',
                  },
                  {
                    name: 'confirmPassword',
                    label: t('confirm_password'),
                    placeholder: t('confirm_password_placeholder'),
                    type: 'password',
                  },
                  {
                    name: 'dateOfBirth',
                    label: t('date_of_birth'),
                    placeholder: 'YYYY/MM/DD',
                    ref: dateOfBirthRef,
                  },
                ].map((field, idx) => (
                  <div key={idx} className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-white"
                    >
                      {field.label} *
                    </Label>
                    <Controller
                      name={field.name}
                      control={control}
                      render={({ field: ctrlField }) => (
                        <Input
                          {...ctrlField}
                          id={field.name}
                          type={field.type || 'text'}
                          placeholder={field.placeholder}
                          error={errors[field.name]?.message}
                          ref={field.ref || null}
                          readOnly={field.name === 'dateOfBirth'}
                          className="w-full rounded-[3px] border border-[#2DFA1A4D] bg-[#0A1414] px-4 py-3 text-white placeholder-gray-400 focus:border-[#2DFA1A4D] focus:bg-[#050C0C] focus:ring-1 focus:ring-[#2DFA1A4D]"
                        />
                      )}
                    />
                  </div>
                ))}
              </div>

              {/* Hidden fields */}
              <div className="space-y-2">
                {/* Username */}
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-white"
                  >
                    {t('username')} *
                  </Label>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="username"
                        placeholder={t('enter_username')}
                        error={errors.username?.message}
                        className="w-full rounded-[3px] border border-[#2DFA1A4D] bg-[#0A1414] px-4 py-3 text-white placeholder-gray-400 focus:border-[#2DFA1A4D] focus:bg-[#050C0C] focus:ring-1 focus:ring-[#2DFA1A4D]"
                      />
                    )}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-white"
                  >
                    {t('phone')} *
                  </Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="phone"
                        placeholder="09xxxxxxxxx"
                        error={errors.phone?.message}
                        onChange={handlePhoneChange}
                        className="w-full rounded-[3px] border border-[#2DFA1A4D] bg-[#0A1414] px-4 py-3 text-white placeholder-gray-400 focus:border-[#2DFA1A4D] focus:bg-[#050C0C] focus:ring-1 focus:ring-[#2DFA1A4D]"
                      />
                    )}
                  />
                </div>

                {/* Referral Code */}
                <div className="space-y-2">
                  <Label
                    htmlFor="referralCode"
                    className="text-sm font-medium text-white"
                  >
                    {t('referral_code')}
                  </Label>
                  <Controller
                    name="referralCode"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="referralCode"
                        placeholder={t('enter_referral_code')}
                        error={errors.referralCode?.message}
                        className="w-full rounded-[3px] border border-[#2DFA1A4D] bg-[#0A1414] px-4 py-3 text-white placeholder-gray-400 focus:border-[#2DFA1A4D] focus:bg-[#050C0C] focus:ring-1 focus:ring-[#2DFA1A4D]"
                      />
                    )}
                  />
                </div>

                {/* Bank */}
                <div className="space-y-2">
                  <Label
                    htmlFor="bank"
                    className="text-sm font-medium text-white"
                  >
                    {t('select_bank')}
                  </Label>
                  <Controller
                    name="bank"
                    control={control}
                    render={({ field }) => (
                      <UiSelect
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="rounded-[3px] border-[#2DFA1A4D] bg-[#0A1414] text-white">
                          <SelectValue placeholder={t('select_bank')} />
                        </SelectTrigger>
                        <SelectContent className="border-[#2DFA1A4D] bg-[#0F1B1B] text-white">
                          {allBanksData?.map((bank) => (
                            <SelectItem
                              key={bank.id}
                              value={bank.id.toString()}
                            >
                              {getBankName(bank)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </UiSelect>
                    )}
                  />
                </div>

                {/* Account Holder */}
                <div className="space-y-2">
                  <Label
                    htmlFor="accountHolder"
                    className="text-sm font-medium text-white"
                  >
                    {t('account_holder')}
                  </Label>
                  <Controller
                    name="accountHolder"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="accountHolder"
                        placeholder={t('enter_account_holder')}
                        error={errors.accountHolder?.message}
                        className="w-full rounded-[3px] border border-[#2DFA1A4D] bg-[#0A1414] px-4 py-3 text-white placeholder-gray-400 focus:border-[#2DFA1A4D] focus:bg-[#050C0C] focus:ring-1 focus:ring-[#2DFA1A4D]"
                      />
                    )}
                  />
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label
                    htmlFor="accountNumber"
                    className="text-sm font-medium text-white"
                  >
                    {t('account_number')}
                  </Label>
                  <Controller
                    name="accountNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="accountNumber"
                        placeholder={t('enter_account_number')}
                        error={errors.accountNumber?.message}
                        onChange={handleAccountNumberChange}
                        className="w-full rounded-[3px] border border-[#2DFA1A4D] bg-[#0A1414] px-4 py-3 text-white placeholder-gray-400 focus:border-[#2DFA1A4D] focus:bg-[#050C0C] focus:ring-1 focus:ring-[#2DFA1A4D]"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerLoader}
                className="template8-filled-button-hover flex w-full cursor-pointer items-center justify-center rounded-[4px] bg-[#2DFA1A] px-4 pt-4 pb-4 text-base text-[16px] font-semibold text-black transition-all duration-200 active:scale-95 disabled:opacity-50"
                data-hover={registerLoader ? 'Processing...' : 'Register'}
              >
                <span className="text-container">
                  <span className="text">
                    {registerLoader ? 'Processing...' : 'Register'}
                  </span>
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
