'use client';

import React from 'react';

import PaymentMethodCard from './PaymentMethodCard';

const PaymentSection = ({
  title,
  methods,
  approvalType,
  onMethodClick,
  className = '',
  gridCols = 'grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
}) => {
  return (
    <div className={`mb-3 space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <span className="text-sm text-[#FC7E09]">({approvalType})</span>
      </div>
      <div className={`grid gap-4 ${gridCols}`}>
        {methods.map((method) => (
          <PaymentMethodCard
            key={method.name}
            method={method}
            methodType={title}
            onClick={onMethodClick}
          />
        ))}
      </div>
      <div className="py-4">
        <div className="border-opacity-50 w-full border-b border-[#4B51A3]" />
      </div>
    </div>
  );
};

export default PaymentSection;
