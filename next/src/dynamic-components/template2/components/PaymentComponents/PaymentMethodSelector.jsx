'use client';

import React from 'react';

import PaymentSection from './PaymentSection';

const PaymentMethodSelector = ({
  sections,
  onMethodClick,
  title = 'Payment Methods',
  className = '',
}) => {
  return (
    <div className={`space-y-6 overflow-hidden ${className}`}>
      {title && <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>}

      {sections.map((section) => (
        <PaymentSection
          key={section.title}
          title={section.title}
          methods={section.methods}
          approvalType={section.approvalType}
          onMethodClick={onMethodClick}
          gridCols={section.gridCols}
        />
      ))}
    </div>
  );
};

export default PaymentMethodSelector;
