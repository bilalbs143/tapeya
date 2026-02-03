'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import SubNavbar from '@/dynamic-components/template21/components/Navbar/SubNavbar';
import DashboardTabs from '@/dynamic-components/template21/dashboard/DashboardTabs';
import UserHomeData from '@/dynamic-components/template21/dashboard/UserHomeData';
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
    <div className="min-h-screen bg-[#272b30]">
      <div className="mx-auto w-full px-4 pb-8 pt-4 text-white md:px-0 min-[768px]:max-w-[750px] min-[992px]:max-w-[970px] min-[1200px]:max-w-[1170px]">
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
