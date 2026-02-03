'use client';

import React, { useCallback, useRef, useState } from 'react';

const Tooltip = ({
  children,
  text,
  position = 'bottom',
  className = '',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setIsVisible(false), 100);
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-white',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-white',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-white',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-white',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Tooltip */}
      <div
        className={`pointer-events-none absolute z-[1000] ${positionClasses[position]} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'} transition-all duration-200 ease-out`}
      >
        {/* Tooltip content */}
        <div
          className={`rounded-lg bg-white px-3 py-2 text-sm font-medium whitespace-nowrap text-gray-900 shadow-lg ${className} `}
        >
          {text}

          {/* Arrow */}
          <div
            className={`absolute h-0 w-0 border-4 border-transparent ${arrowClasses[position]} `}
          />
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
