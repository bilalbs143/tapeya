'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';

const SLOTS_HOW_TO_PLAY_IMAGE =
  'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/howplay_slot.webp';

const SPORTSBOOK_HOW_TO_PLAY_IMAGE =
  'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/bet-guide-oneca.webp';

const TAB_KEYS = ['sportsbook', 'live-casino', 'slots'];

/** Template21 theme: primary accent #ec4d49 (red/coral) */
const T22_ACCENT = '#ec4d49';
const T22_ACCENT_RGBA_30 = 'rgba(236, 77, 73, 0.3)';
const T22_ACCENT_RGBA_20 = 'rgba(236, 77, 73, 0.2)';
const T22_ACCENT_RGBA_15 = 'rgba(236, 77, 73, 0.15)';

/** Renders content where lines starting with ## are bold (headings/terms). Blocks split by \n\n. */
function renderFormattedContent(text, textClassName = 'text-[#B0B0B0]') {
  if (!text || typeof text !== 'string') return null;
  return text.split(/\n\n+/).map((block, i) => (
    <div key={i} className="mb-3 last:mb-0">
      {block.split('\n').map((line, j) => (
        <React.Fragment key={j}>
          {j > 0 && <br />}
          {line.startsWith('##') ? (
            <strong className="font-semibold text-white">{line.slice(2)}</strong>
          ) : (
            <span className={textClassName}>{line}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  ));
}

function HowToPlayPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = useMemo(() => {
    const fromQuery = (searchParams?.get('tab') || '').toLowerCase();
    return TAB_KEYS.includes(fromQuery) ? fromQuery : 'sportsbook';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedLiveAccordion, setExpandedLiveAccordion] = useState(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeTab !== 'live-casino') setExpandedLiveAccordion(null);
  }, [activeTab]);

  const tabs = [
    { key: 'sportsbook', labelKey: 'how_to_play_tab_sportsbook' },
    { key: 'live-casino', labelKey: 'how_to_play_tab_live_casino' },
    { key: 'slots', labelKey: 'how_to_play_tab_slots' },
  ];

  const handleTabChange = (key) => {
    setActiveTab(key);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', key);
    router.push(`/how-to-play?${params.toString()}`);
  };

  const tabContent = {
    'sportsbook': t('how_to_play_content_sportsbook'),
    'live-casino': t('how_to_play_content_live_casino'),
    'slots': t('how_to_play_content_slots'),
  };

  const content = tabContent[activeTab] || tabContent['sportsbook'];

  const liveCasinoAccordions = [
    { id: 0, titleKey: 'how_to_play_live_baccarat_title', contentKey: 'how_to_play_live_baccarat_content' },
    { id: 1, titleKey: 'how_to_play_live_blackjack_title', contentKey: 'how_to_play_live_blackjack_content' },
    { id: 2, titleKey: 'how_to_play_live_roulette_title', contentKey: 'how_to_play_live_roulette_content' },
  ];

  const rouletteBetPositions = [
    { name: 'Single Number Bet', description: '(pilih salah satu nomor, termasuk angka 0)', payment: '35 to 1' },
    { name: 'Split Bet', description: '(pilih 2 nomor)', payment: '17 to 1' },
    { name: 'Street Bet', description: '(pilih 3 nomor sekaligus)', payment: '11 to 1' },
    { name: 'Square Bet', description: '(Choose 4 numbers in 1 group)', payment: '8 to 1' },
    { name: 'Line Bet', description: '(Select 6 numbers in 1 group)', payment: '5 to 1' },
    { name: 'Column / Dozen Bet', description: '(Select 12 numbers in 1 group)', payment: '2 to 1' },
    { name: 'Red / Black / 1-18 / 19-36 / Odd / Even', payment: '1 to 1' },
  ];

  const sportsbookSections = [
    { titleKey: 'how_to_play_sportsbook_section_types_title', contentKey: 'how_to_play_sportsbook_section_types_content' },
    { titleKey: 'how_to_play_sportsbook_section_time_title', contentKey: 'how_to_play_sportsbook_section_time_content' },
    { titleKey: 'how_to_play_sportsbook_section_event_title', contentKey: 'how_to_play_sportsbook_section_event_content' },
    { titleKey: 'how_to_play_sportsbook_section_competing_team_title', contentKey: 'how_to_play_sportsbook_section_competing_team_content' },
    { titleKey: 'how_to_play_sportsbook_section_betting_market_title', contentKey: 'how_to_play_sportsbook_section_betting_market_content' },
    { titleKey: 'how_to_play_sportsbook_section_place_bets_title', contentKey: 'how_to_play_sportsbook_section_place_bets_content' },
  ];

  const slotsSections = [
    { titleKey: 'how_to_play_slots_section_info_title', contentKey: 'how_to_play_slots_section_info_content' },
    { titleKey: 'how_to_play_slots_section_paylines_title', contentKey: 'how_to_play_slots_section_paylines_content' },
    { titleKey: 'how_to_play_slots_section_line_bet_title', contentKey: 'how_to_play_slots_section_line_bet_content' },
    { titleKey: 'how_to_play_slots_section_total_bet_title', contentKey: 'how_to_play_slots_section_total_bet_content' },
    { titleKey: 'how_to_play_slots_section_spin_title', contentKey: 'how_to_play_slots_section_spin_content' },
    { titleKey: 'how_to_play_slots_section_max_bet_title', contentKey: 'how_to_play_slots_section_max_bet_content' },
    { titleKey: 'how_to_play_slots_section_auto_spin_title', contentKey: 'how_to_play_slots_section_auto_spin_content' },
  ];

  const renderContent = () => {
    if (activeTab === 'sportsbook') {
      return (
        <div className="space-y-6 text-[#B0B0B0] md:space-y-8 md:text-base">
          <h2 className="text-xl font-semibold text-white md:text-2xl">
            {t('how_to_play_sportsbook_guide_title')}
          </h2>
          <p className="leading-relaxed">{t('how_to_play_sportsbook_intro')}</p>
          <div
            className="relative overflow-hidden rounded-lg border"
            style={{ borderColor: T22_ACCENT_RGBA_30 }}
          >
            <Image
              src={SPORTSBOOK_HOW_TO_PLAY_IMAGE}
              alt={t('how_to_play_sportsbook_image_caption')}
              width={800}
              height={450}
              className="h-auto w-full object-contain"
              unoptimized
            />
          </div>
          <div className="space-y-5">
            {sportsbookSections.map((section) => (
              <div key={section.titleKey}>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white md:text-base">
                  {t(section.titleKey)}
                </h3>
                <p className="leading-relaxed">{t(section.contentKey)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (activeTab === 'slots') {
      return (
        <div className="space-y-6 text-[#B0B0B0] md:space-y-8 md:text-base">
          <h2 className="text-xl font-semibold text-white md:text-2xl">
            {t('how_to_play_slots_guide_title')}
          </h2>
          <p className="leading-relaxed">{t('how_to_play_slots_intro')}</p>
          <div
            className="relative overflow-hidden rounded-lg border"
            style={{ borderColor: T22_ACCENT_RGBA_30 }}
          >
            <Image
              src={SLOTS_HOW_TO_PLAY_IMAGE}
              alt={t('how_to_play_slots_image_caption')}
              width={800}
              height={450}
              className="h-auto w-full object-contain"
              unoptimized
            />
          </div>
          <div className="space-y-5">
            {slotsSections.map((section) => (
              <div key={section.titleKey}>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white md:text-base">
                  {t(section.titleKey)}
                </h3>
                <p className="leading-relaxed">{t(section.contentKey)}</p>
              </div>
            ))}
          </div>
          <p className="pt-2 font-medium text-white">{t('how_to_play_slots_closing')}</p>
        </div>
      );
    }
    if (activeTab === 'live-casino') {
      return (
        <div className="space-y-0">
          {liveCasinoAccordions.map((item) => {
            const isOpen = expandedLiveAccordion === item.id;
            return (
              <div
                key={item.id}
                className="overflow-hidden border-b first:rounded-t-[4px] last:rounded-b-[4px] last:border-b-0"
                style={{ borderColor: T22_ACCENT_RGBA_30 }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedLiveAccordion(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#1A1A1A] md:px-5 md:py-4"
                  style={{ backgroundColor: isOpen ? 'rgba(26, 26, 26, 0.8)' : '#0C0C0C' }}
                >
                  <span className="text-sm font-semibold text-white md:text-base">
                    {t(item.titleKey)}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`flex-shrink-0 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isOpen && (
                  <div
                    className="border-t px-4 pb-4 pt-2 md:px-5 md:pb-5 md:pt-3"
                    style={{ borderColor: T22_ACCENT_RGBA_20, backgroundColor: '#111111' }}
                  >
                    <div className="leading-relaxed md:text-base">
                      {item.id === 0
                        ? (
                            <>
                              {renderFormattedContent(t(item.contentKey), 'text-[#B0B0B0]')}
                              <h4 className="mb-3 mt-5 text-sm font-semibold uppercase tracking-wide text-white md:text-base">
                                {t('how_to_play_baccarat_rules_title')}
                              </h4>
                              <p className="mb-2 text-sm font-medium text-white md:text-base">{t('how_to_play_baccarat_section_a_title')}</p>
                              <div
                                className="mb-4 overflow-x-auto overscroll-x-contain rounded-[4px]"
                                style={{
                                  border: '1px solid rgba(0, 0, 0, 0.6)',
                                  backgroundColor: '#2e3338',
                                  boxShadow: '0px 3px 5px 0px rgba(0, 0, 0, 0.4)',
                                }}
                              >
                                <table className="w-full min-w-[280px] table-fixed text-left text-[11px] md:text-sm">
                                  <thead>
                                    <tr className="border-b-0" style={{ backgroundColor: '#ee5f5b' }}>
                                      <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }} scope="col">
                                        {t('how_to_play_baccarat_player_col1')}
                                      </th>
                                      <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }} scope="col">
                                        {t('how_to_play_baccarat_player_col2')}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-[#FFFFFF66]" style={{ backgroundColor: '#353a41' }}>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_player_r1_c1')}</td>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_player_r1_c2')}</td>
                                    </tr>
                                    <tr className="border-b border-[#FFFFFF66]" style={{ backgroundColor: 'transparent' }}>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_player_r2_c1')}</td>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_player_r2_c2')}</td>
                                    </tr>
                                    <tr className="border-b border-[#FFFFFF66]" style={{ backgroundColor: '#353a41' }}>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_player_r3_c1')}</td>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_player_r3_c2')}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <p className="mb-2 text-sm font-medium text-white md:text-base">{t('how_to_play_baccarat_section_b_title')}</p>
                              <div
                                className="mb-4 overflow-x-auto overscroll-x-contain rounded-[4px]"
                                style={{
                                  border: '1px solid rgba(0, 0, 0, 0.6)',
                                  backgroundColor: '#2e3338',
                                  boxShadow: '0px 3px 5px 0px rgba(0, 0, 0, 0.4)',
                                }}
                              >
                                <table className="w-full min-w-[360px] table-fixed text-left text-[11px] md:text-sm">
                                  <thead>
                                    <tr className="border-b-0" style={{ backgroundColor: '#ee5f5b' }}>
                                      <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }} scope="col">
                                        {t('how_to_play_baccarat_banker_col1')}
                                      </th>
                                      <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }} scope="col">
                                        {t('how_to_play_baccarat_banker_col2')}
                                      </th>
                                      <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }} scope="col">
                                        {t('how_to_play_baccarat_banker_col3')}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-[#FFFFFF66]" style={{ backgroundColor: '#353a41' }}>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r1_c1')}</td>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r1_c2')}</td>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r1_c3')}</td>
                                    </tr>
                                    <tr className="border-b border-[#FFFFFF66]" style={{ backgroundColor: 'transparent' }}>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r2_c1')}</td>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r2_c2')}</td>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r2_c3')}</td>
                                    </tr>
                                    <tr className="border-b border-[#FFFFFF66]" style={{ backgroundColor: '#353a41' }}>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r3_c1')}</td>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r3_c2')}</td>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r3_c3')}</td>
                                    </tr>
                                    <tr className="border-b border-[#FFFFFF66]" style={{ backgroundColor: 'transparent' }}>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r4_c1')}</td>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r4_c2')}</td>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r4_c3')}</td>
                                    </tr>
                                    <tr className="border-b border-[#FFFFFF66]" style={{ backgroundColor: '#353a41' }}>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r5_c1')}</td>
                                      <td className="text-white" colSpan={2} style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r5_span')}</td>
                                    </tr>
                                    <tr className="border-b border-[#FFFFFF66]" style={{ backgroundColor: 'transparent' }}>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r6_c1')}</td>
                                      <td className="text-white" colSpan={2} style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r6_span')}</td>
                                    </tr>
                                    <tr className="border-b border-[#FFFFFF66]" style={{ backgroundColor: '#353a41' }}>
                                      <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r7_c1')}</td>
                                      <td className="text-white" colSpan={2} style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{t('how_to_play_baccarat_banker_r7_span')}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <ul className="list-inside list-disc space-y-2 text-[#B0B0B0]">
                                <li>{t('how_to_play_baccarat_bullet1')}</li>
                                <li>{t('how_to_play_baccarat_bullet2')}</li>
                                <li>{t('how_to_play_baccarat_bullet3')}</li>
                                <li>{t('how_to_play_baccarat_bullet4')}</li>
                                <li>{t('how_to_play_baccarat_bullet5')}</li>
                              </ul>
                            </>
                          )
                        : item.id === 1
                          ? renderFormattedContent(t(item.contentKey), 'text-[#B0B0B0]')
                          : item.id === 2
                            ? (
                                <>
                                  {renderFormattedContent(t(item.contentKey), 'text-[#B0B0B0]')}
                                  <h4 className="mb-3 mt-5 text-sm font-semibold uppercase tracking-wide text-white md:text-base">
                                    {t('how_to_play_roulette_bet_table_title')}
                                  </h4>
                                  <div
                                    className="overflow-x-auto overscroll-x-contain rounded-[4px]"
                                    style={{
                                      border: '1px solid rgba(0, 0, 0, 0.6)',
                                      backgroundColor: '#2e3338',
                                      boxShadow: '0px 3px 5px 0px rgba(0, 0, 0, 0.4)',
                                    }}
                                  >
                                    <table className="w-full min-w-[280px] table-fixed text-left text-[11px] md:text-sm">
                                      <thead>
                                        <tr className="border-b-0" style={{ backgroundColor: '#ee5f5b' }}>
                                          <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }} scope="col">
                                            {t('how_to_play_roulette_bet_position_header')}
                                          </th>
                                          <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }} scope="col">
                                            {t('how_to_play_roulette_bet_payment_header')}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {rouletteBetPositions.map((row, idx) => (
                                          <tr
                                            key={idx}
                                            className="border-b border-[#FFFFFF66]"
                                            style={{ backgroundColor: idx % 2 === 0 ? '#353a41' : 'transparent' }}
                                          >
                                            <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>
                                              <span className="font-medium text-white">{row.name}</span>
                                              {row.description != null && (
                                                <span className="mt-0.5 block text-xs text-[#B0B0B0] md:text-sm">{row.description}</span>
                                              )}
                                            </td>
                                            <td className="text-white" style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}>{row.payment}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )
                            : (
                                <p className="text-[#B0B0B0]">{t(item.contentKey)}</p>
                              )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return (
      <div className="space-y-4 text-[#B0B0B0] md:space-y-5 md:text-base">
        {content
          ? content.split(/\n\n+/).map((paragraph, i) => (
            <p key={i} className="leading-relaxed">
              {paragraph.trim()}
            </p>
          ))
          : (
              <p className="leading-relaxed">
                {t('no_data_found')}
              </p>
            )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-white md:mb-8 md:text-3xl lg:text-4xl">
          {t('how_to_play_title')}
        </h1>

        {/* Tabs - same style as /dashboard/home secondary tabs */}
        <div className="mb-6 flex flex-wrap md:mb-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className="flex items-center gap-2 text-white text-[14px] transition-all py-[10px] px-[15px] rounded-[4px] group ml-[2px] mb-[2px]"
                style={{
                  backgroundImage: isActive
                    ? 'linear-gradient(#020202, #101112 40%, #191b1d)'
                    : 'linear-gradient(#484e55, #3a3f44 60%, #313539)',
                  border: '1px solid rgba(0, 0, 0, 0.6)',
                  textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundImage = 'linear-gradient(#020202, #101112 40%, #191b1d)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundImage = 'linear-gradient(#484e55, #3a3f44 60%, #313539)';
                  }
                }}
              >
                <span className="capitalize">
                  {t(tab.labelKey)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content area - same border as dashboard tab content */}
        <div
          className="min-h-[120px] overflow-hidden rounded-[5px] border border-[#2A2A2A] p-2 lg:p-4"
          style={{ backgroundColor: '#111111' }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default HowToPlayPage;
