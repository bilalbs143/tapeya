'use client';

import React, { useEffect, useState } from 'react';

/**
 * Timer Component for Template14
 * Displays a countdown timer with days, hours, minutes, and optionally seconds
 *
 * @param {Object} props
 * @param {number} props.days - Number of days
 * @param {number} props.hours - Number of hours
 * @param {number} props.minutes - Number of minutes
 * @param {number} props.seconds - Number of seconds (optional, defaults to 0)
 * @param {string} props.endDate - ISO date string or Date object for end date (alternative to days/hours/minutes)
 * @param {string} props.label - Label text above timer (defaults to "Ends On")
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showSeconds - Whether to display seconds (defaults to false)
 * @param {boolean} props.inline - Whether to display inline style
 */
export default function Timer({
  days: initialDays = 0,
  hours: initialHours = 0,
  minutes: initialMinutes = 0,
  seconds: initialSeconds = 0,
  endDate,
  label = 'Ends On',
  className = '',
  showSeconds = false,
  inline = false,
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: initialDays,
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  });

  useEffect(() => {
    // If endDate is provided, calculate time difference
    if (endDate) {
      const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const end = new Date(endDate).getTime();
        const difference = end - now;

        if (difference <= 0) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
      };

      // Calculate immediately
      setTimeLeft(calculateTimeLeft());

      // Update every second
      const interval = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // Use static values and countdown from there
      let currentDays = initialDays;
      let currentHours = initialHours;
      let currentMinutes = initialMinutes;
      let currentSeconds = initialSeconds;

      const interval = setInterval(() => {
        if (currentSeconds > 0) {
          currentSeconds--;
        } else if (currentMinutes > 0) {
          currentMinutes--;
          currentSeconds = 59;
        } else if (currentHours > 0) {
          currentHours--;
          currentMinutes = 59;
          currentSeconds = 59;
        } else if (currentDays > 0) {
          currentDays--;
          currentHours = 23;
          currentMinutes = 59;
          currentSeconds = 59;
        } else {
          clearInterval(interval);
        }

        setTimeLeft({
          days: currentDays,
          hours: currentHours,
          minutes: currentMinutes,
          seconds: currentSeconds,
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [endDate, initialDays, initialHours, initialMinutes, initialSeconds]);

  // Format numbers to always show 2 digits
  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  // Split into individual digits for display
  const splitDigits = (num) => {
    const str = formatNumber(num);
    return [str[0], str[1]];
  };

  const [days1, days2] = splitDigits(timeLeft.days);
  const [hours1, hours2] = splitDigits(timeLeft.hours);
  const [minutes1, minutes2] = splitDigits(timeLeft.minutes);
  const [seconds1, seconds2] = splitDigits(timeLeft.seconds);

  // Template14 styling - matching the design system with purple/blue theme
  if (inline) {
    return (
      <div className={className}>
        {label && (
          <p className="mb-1 text-xs font-semibold text-white">{label}</p>
        )}
        <div className="flex items-center gap-2">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-[rgba(32,197,254,0.30)] bg-[#1E1451] text-base font-bold text-white sm:h-10 sm:w-10 sm:text-xl">
                {days1}
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-[rgba(32,197,254,0.30)] bg-[#1E1451] text-base font-bold text-white sm:h-10 sm:w-10 sm:text-xl">
                {days2}
              </div>
            </div>
            <span className="mt-1 text-[10px] font-bold text-white/70">
              DAYS
            </span>
          </div>

          <span className="mb-5 text-white">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-[rgba(32,197,254,0.30)] bg-[#1E1451] text-base font-bold text-white sm:h-10 sm:w-10 sm:text-xl">
                {hours1}
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-[rgba(32,197,254,0.30)] bg-[#1E1451] text-base font-bold text-white sm:h-10 sm:w-10 sm:text-xl">
                {hours2}
              </div>
            </div>
            <span className="mt-1 text-[10px] font-bold text-white/70">
              HOURS
            </span>
          </div>

          <span className="mb-5 text-white">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-[rgba(32,197,254,0.30)] bg-[#1E1451] text-base font-bold text-white sm:h-10 sm:w-10 sm:text-xl">
                {minutes1}
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-[rgba(32,197,254,0.30)] bg-[#1E1451] text-base font-bold text-white sm:h-10 sm:w-10 sm:text-xl">
                {minutes2}
              </div>
            </div>
            <span className="mt-1 text-[10px] font-bold text-white/70">
              MINS
            </span>
          </div>

          {showSeconds && (
            <>
              <span className="mb-5 text-white">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-[rgba(32,197,254,0.30)] bg-[#1E1451] text-base font-bold text-white sm:h-10 sm:w-10 sm:text-xl">
                    {seconds1}
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-[rgba(32,197,254,0.30)] bg-[#1E1451] text-base font-bold text-white sm:h-10 sm:w-10 sm:text-xl">
                    {seconds2}
                  </div>
                </div>
                <span className="mt-1 text-[10px] font-bold text-white/70">
                  SECS
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && <p className="mb-1 text-sm text-white">{label}</p>}
      <div className="rounded-[5px] border border-[rgba(32,197,254,0.30)] bg-[#1E1451] p-4">
        <div className="flex items-center justify-center gap-2">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[rgba(255,255,255,0.15)] bg-[#1C1600] text-xl font-bold text-white">
                {days1}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[rgba(255,255,255,0.15)] bg-[#1C1600] text-xl font-bold text-white">
                {days2}
              </div>
            </div>
            <span className="mt-1 text-xs font-bold text-white/70">DAYS</span>
          </div>

          <span className="mb-5 text-white">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[rgba(255,255,255,0.15)] bg-[#1C1600] text-xl font-bold text-white">
                {hours1}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[rgba(255,255,255,0.15)] bg-[#1C1600] text-xl font-bold text-white">
                {hours2}
              </div>
            </div>
            <span className="mt-1 text-xs font-bold text-white/70">HOURS</span>
          </div>

          <span className="mb-5 text-white">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[rgba(255,255,255,0.15)] bg-[#1C1600] text-xl font-bold text-white">
                {minutes1}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[rgba(255,255,255,0.15)] bg-[#1C1600] text-xl font-bold text-white">
                {minutes2}
              </div>
            </div>
            <span className="mt-1 text-xs font-bold text-white/70">MINS</span>
          </div>

          {showSeconds && (
            <>
              <span className="mb-5 text-white">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[rgba(255,255,255,0.15)] bg-[#1C1600] text-xl font-bold text-white">
                    {seconds1}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[rgba(255,255,255,0.15)] bg-[#1C1600] text-xl font-bold text-white">
                    {seconds2}
                  </div>
                </div>
                <span className="mt-1 text-xs font-bold text-white/70">
                  SECS
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
