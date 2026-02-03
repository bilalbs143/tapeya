'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';

import InquiryTab from '../modals/customer-service/InquiryTab';

export default function CustomerInquiryPage() {
  const searchParams = useSearchParams();
  const openInquiryId = searchParams?.get('inquiryId');

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 text-white">
      <div className="space-y-6">
        {/* Scrollable content */}
        <div className="scrollbar-hide min-h-[500px] overflow-y-auto rounded-[10px] border border-[#FFFFFF66] p-3 md:p-4 lg:p-6">
          <div className="space-y-4 md:space-y-6">
            <InquiryTab activeTab="inquiry" openInquiryId={openInquiryId} />
          </div>
        </div>
      </div>
    </div>
  );
}
