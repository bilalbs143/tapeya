'use client';

import 'flatpickr/dist/flatpickr.min.css';

import { joiResolver } from '@hookform/resolvers/joi';
import Flatpickr from 'flatpickr';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { useTranslations } from '@/hooks/useTranslations';
import { registerUser } from '@/slices/auth/authAction';
import { closeModal, openModal } from '@/slices/common/commonSlice';
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
        username: data.nickname || data.name,
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

  const handleOpenLoginModal = (e) => {
    e.preventDefault();
    setIsVisible(false);
    setTimeout(() => dispatch(openModal('login')), 250);
  };

  const handlePhoneChange = (e) => {
    setValue('phone', e.target.value.replace(/\D/g, ''));
  };

  const handleAccountNumberChange = (e) => {
    setValue('accountNumber', e.target.value.replace(/\D/g, ''));
  };

  return (
    <div
      className={`mx-auto max-h-[90vh] w-full transform overflow-y-auto rounded-[10px] shadow-xl transition-all duration-300 ease-out md:h-[679px] md:max-h-none md:w-[1041px] md:overflow-hidden ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}
      style={{
        background:
          "url('https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Register+Background.png') lightgray 50% / cover no-repeat",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="flex h-full flex-col justify-center p-6 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-[940px]">
          {/* HEADER */}
          <div className="mt-2 mb-8 flex items-center justify-between">
            <h2 className="font-bring-race text-[25px] tracking-widest uppercase md:text-[40px]">
              {splitIntoLetters(t('create_new_account'))}
            </h2>

            <button
              onClick={handleCloseModal}
              aria-label={t('close')}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-transparent transition-all hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
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

          {/* FORM START */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* ---------- ROW 1 (desktop 4 columns) ---------- */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-x-5">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="mb-2 block text-sm font-bold">
                  {t('name')} *
                </Label>

                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="name"
                      placeholder={t('enter_fullname')}
                      error={errors.name?.message}
                      className="h-[52px] w-full rounded-[4px] border border-[#D000004D] bg-black px-4 shadow-inner focus:border-[#D00000] focus:ring-0"
                    />
                  )}
                />
              </div>

              {/* Email Address (Nickname mapping) */}
              <div>
                <Label
                  htmlFor="nickname"
                  className="mb-2 block text-sm font-bold"
                >
                  Email Address
                </Label>
                <Controller
                  name="nickname"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="nickname"
                      placeholder={t('enter_nick_name')}
                      error={errors.nickname?.message}
                      className="h-[52px] w-full rounded-[4px] border border-[#D000004D] bg-black px-4 shadow-inner focus:border-[#D00000] focus:ring-0"
                    />
                  )}
                />
              </div>

              {/* Password */}
              <div>
                <Label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold"
                >
                  {t('password')} *
                </Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="password"
                      id="password"
                      placeholder={t('enter_new_password')}
                      error={errors.password?.message}
                      className="h-[52px] w-full rounded-[4px] border border-[#D000004D] bg-black px-4 shadow-inner focus:border-[#D00000] focus:ring-0"
                    />
                  )}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-bold"
                >
                  {t('confirm_password')} *
                </Label>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="password"
                      id="confirmPassword"
                      placeholder={t('confirm_password_placeholder')}
                      error={errors.confirmPassword?.message}
                      className="h-[52px] w-full rounded-[4px] border border-[#D000004D] bg-black px-4 shadow-inner focus:border-[#D00000] focus:ring-0"
                    />
                  )}
                />
              </div>
            </div>

            {/* ---------- ROW 2 (desktop 3 columns) ---------- */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-x-8">
              {/* Date of Birth */}
              <div>
                <Label
                  htmlFor="dateOfBirth"
                  className="mb-2 block text-sm font-bold"
                >
                  {t('date_of_birth')} *
                </Label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="dateOfBirth"
                      readOnly
                      ref={dateOfBirthRef}
                      placeholder="YYYY-MM-DD"
                      error={errors.dateOfBirth?.message}
                      className="h-[52px] w-full rounded-[4px] border border-[#D000004D] bg-black px-4 shadow-inner focus:border-[#D00000] focus:ring-0"
                    />
                  )}
                />
              </div>

              {/* Phone No */}
              <div>
                <Label htmlFor="phone" className="mb-2 block text-sm font-bold">
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
                      onChange={handlePhoneChange}
                      error={errors.phone?.message}
                      className="h-[52px] w-full rounded-[4px] border border-[#D000004D] bg-black px-4 shadow-inner focus:border-[#D00000] focus:ring-0"
                    />
                  )}
                />
              </div>

              {/* Referral Code */}
              <div>
                <Label
                  htmlFor="referralCode"
                  className="mb-2 block text-sm font-bold"
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
                      className="h-[52px] w-full rounded-[4px] border border-[#D000004D] bg-black px-4 shadow-inner focus:border-[#D00000] focus:ring-0"
                    />
                  )}
                />
              </div>
            </div>

            {/* ---------- ROW 3 (desktop 3 columns) ---------- */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-x-8">
              {/* Select Bank */}
              <div>
                <Label htmlFor="bank" className="mb-2 block text-sm font-bold">
                  {t('select_bank')}
                </Label>
                <Controller
                  name="bank"
                  control={control}
                  render={({ field }) => (
                    <UiSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-[52px] w-full rounded-[4px] border border-[#D000004D] bg-black px-4 text-white shadow-inner focus:border-[#D00000] focus:ring-0">
                        <SelectValue placeholder={t('select_bank')} />
                      </SelectTrigger>
                      <SelectContent className="z-[9999] border border-[#D000004D] bg-black text-white">
                        {allBanksData?.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id.toString()}>
                            {getBankName(bank)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </UiSelect>
                  )}
                />
              </div>

              {/* Acc Holder */}
              <div>
                <Label
                  htmlFor="accountHolder"
                  className="mb-2 block text-sm font-bold"
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
                      className="h-[52px] w-full rounded-[4px] border border-[#D000004D] bg-black px-4 shadow-inner focus:border-[#D00000] focus:ring-0"
                    />
                  )}
                />
              </div>

              {/*  */}
              <div>
                <Label
                  htmlFor="accountNumber"
                  className="mb-2 block text-sm font-bold"
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
                      onChange={handleAccountNumberChange}
                      error={errors.accountNumber?.message}
                      className="h-[52px] w-full rounded-[4px] border border-[#D000004D] bg-black px-4 shadow-inner focus:border-[#D00000] focus:ring-0"
                    />
                  )}
                />
              </div>
            </div>

            {/* ---------- BUTTONS ---------- */}
            <div className="flex flex-col space-y-3 pt-2">
              <button
                type="submit"
                disabled={registerLoader}
                className="h-[55px] w-full rounded-[6px] bg-[#D90429] text-[18px] font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {registerLoader ? 'Processing...' : 'Register'}
              </button>

              <button
                type="button"
                onClick={handleOpenLoginModal}
                className="h-[55px] w-full rounded-[6px] bg-[#1a1a1a] text-[18px] font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                Already Have an Account? Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
