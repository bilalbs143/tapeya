import React from 'react';

const CommonLoader = ({
  size = 'md',
  className = '',
  border = '',
  centered = true,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
    : centered
      ? 'flex items-center justify-center'
      : 'flex items-center';

  return (
    <div
      className={`${containerClasses} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div
        className={`animate-spin rounded-full border-b-2 ${border} ${sizeClasses[size]}`}
        aria-hidden="true"
      />
    </div>
  );
};

export default CommonLoader;
