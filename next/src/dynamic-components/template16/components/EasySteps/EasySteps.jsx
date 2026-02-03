'use client';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

const steps = [
  {
    number: '01',
    stepLabelKey: 'step_1',
    descriptionKey: 'register_an_account',
  },
  {
    number: '02',
    stepLabelKey: 'step_2',
    descriptionKey: 'deposit_amount',
  },
  {
    number: '03',
    stepLabelKey: 'step_3',
    descriptionKey: 'play_and_win',
  },
  {
    number: '04',
    stepLabelKey: 'step_4',
    descriptionKey: 'withdraw_winnings',
  },
];

function EasySteps() {
  const { t } = useTranslations();

  return (
    <section className="w-full bg-[#000304] py-4 md:py-6">
      <div className="container mx-auto px-4 md:px-0">
        {/* Title */}
        <h2
          className="mb-6 text-left text-2xl font-bold md:text-3xl lg:text-4xl"
          style={{ color: '#E8D25E' }}
        >
          {t('4_easy_steps') || '4 Easy Steps'}
        </h2>

        {/* Steps Grid Container with Border */}
        <div
          className="rounded-lg p-3 md:p-6"
          style={{
            border: '1px solid #E8D25E4D',
          }}
        >
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex w-full overflow-hidden rounded-lg"
              >
                {/* Left Section - Yellow-Gold Background with Number */}
                <div
                  className="flex w-[35%] items-center justify-center px-2 py-4 md:px-4 md:py-6"
                  style={{
                    backgroundColor: '#E8D25E',
                  }}
                >
                  <span className="text-2xl font-bold text-black md:text-4xl lg:text-5xl">
                    {step.number}
                  </span>
                </div>

                {/* Right Section - Dark Background with Text */}
                <div className="flex w-[65%] flex-col justify-center bg-[#1a1a1a] px-3 py-4 md:px-6 md:py-6">
                  <p className="mb-1 text-[10px] leading-tight font-light text-white opacity-70 md:text-sm">
                    {t(step.stepLabelKey) || `Step ${step.number}`}
                  </p>
                  <p className="text-sm leading-tight font-bold text-white md:text-lg lg:text-xl">
                    {t(step.descriptionKey) ||
                      step.descriptionKey.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EasySteps;
