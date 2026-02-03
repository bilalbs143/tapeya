'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import SubNavbar from '@/dynamic-components/template17/components/Navbar/SubNavbar';
import DashboardTabs from '@/dynamic-components/template17/dashboard/DashboardTabs';
import UserHomeData from '@/dynamic-components/template17/dashboard/UserHomeData';
import { useTranslations } from '@/hooks/useTranslations';

export default function DashboardHomePage() {
  const { t } = useTranslations();
  const router = useRouter();
  const isAuth = useSelector((state) => state.auth.isAuth);

  useEffect(() => {
    if (!isAuth) {
      // Show toast message and redirect to home if not authenticated
      toast.info(t('please_log_in_to_continue'));
      router.push('/');
    }
  }, [isAuth, router, t]);

  // Don't render content if not authenticated
  if (!isAuth) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <div className="container mx-auto px-4 py-8 text-white md:px-0">
        {/* SubNavbar at the top of dashboard home, inside container */}
        <SubNavbar variant="dashboard" />
        <div className="relative flex min-h-0 flex-1 flex-col mt-4">
          <UserHomeData />
          <DashboardTabs />
        </div>
      </div>
    </div>
  );
}
