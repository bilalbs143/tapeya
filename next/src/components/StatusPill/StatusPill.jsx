'use client';

import React from 'react';

const StatusPill = ({
  value,
  variant = 'default',
  className = '',
  size = 'sm',
}) => {
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };

  const variantClasses = {
    default: 'bg-[#5343B1] text-white',
    resolved: 'bg-green-500 text-white',
    pending: 'bg-[#51A2FF] text-white',
    rejected: 'bg-red-500 text-white',
    gray: 'bg-gray-500 text-white',
    win: 'bg-emerald-600 text-white',
    lose: 'bg-red-600 text-white',
    draw: 'bg-gray-600 text-white',
    refunded: 'bg-purple-500 text-white',
    read: 'bg-green-600 text-white',
    unread: 'bg-orange-500 text-white',
    approved: 'bg-green-500 text-white',
  };

  return (
    <span
      className={`status-pill inline-flex items-center justify-center rounded-full ${className} font-medium ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.default} `}
    >
      {value}
    </span>
  );
};

export default StatusPill;
