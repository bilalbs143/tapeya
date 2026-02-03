'use client';

import Image from 'next/image';
import React from 'react';

const PaymentMethodCard = ({ method, methodType, onClick, className = '' }) => {
  const handleClick = () => {
    onClick(method.name, methodType);
  };

  // Special handling for QRIS methods that have two logos
  if (method.src1 && method.src2) {
    return (
      <button
        onClick={handleClick}
        className={`flex h-[64px] w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-white p-2 transition-colors hover:bg-gray-50 sm:h-[75px] ${className}`}
      >
        <div className="relative mb-1 h-6 w-24 sm:mb-2 sm:h-8 sm:w-30">
          <Image
            src={method.src1}
            alt={`${method.label} logo 1`}
            fill
            className="object-contain"
          />
        </div>
        <div className="relative h-6 w-12 sm:h-8 sm:w-16">
          <Image
            src={method.src2}
            alt={`${method.label} logo 2`}
            fill
            className="object-contain"
          />
        </div>
      </button>
    );
  }

  // Regular payment method card
  return (
    <button
      onClick={handleClick}
      className={`flex h-[64px] w-full cursor-pointer items-center justify-center rounded-lg bg-white transition-colors hover:bg-gray-50 sm:h-[75px] ${className}`}
    >
      <div className="relative h-10 w-24 sm:h-16 sm:w-30">
        <Image
          src={method.src}
          alt={method.label}
          fill
          className="object-contain"
        />
      </div>
    </button>
  );
};

export default PaymentMethodCard;
