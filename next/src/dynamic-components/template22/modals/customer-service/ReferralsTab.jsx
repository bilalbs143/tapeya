'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import Pagination from '@/dynamic-components/template22/components/Pagination/Pagination';
import { formatDateTimeISO } from '@/helpers/dateTime';
import { formatPoints } from '@/helpers/formatting.js';
import { calculateIndex } from '@/helpers/tableUtils';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchUserReferrals } from '@/website/websiteAction';

export default function ReferralsTab() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { referralsLoader, referralsData } = useSelector(
    (state) => state.website,
  );

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const nextItems = referralsData?.data || referralsData?.items || [];
    setItems(nextItems);
    const total =
      referralsData?.meta?.total || referralsData?.total || nextItems.length;
    setTotalItems(total);
  }, [referralsData]);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const referralCode = user.referral_info.code;
  const referralLink = `${siteUrl}?ref=${referralCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    referralLink,
  )}`;

  const copyToClipboard = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(t('copied_to_clipboard'));
      } catch (_) {
        toast.error(t('failed_to_copy'));
      }
    },
    [t],
  );

  const downloadQRCode = useCallback(async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'referral-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t('download'));
    } catch (error) {
      console.log('Error:', error);
      toast.error(t('failed_to_copy'));
    }
  }, [qrUrl, t]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

  useEffect(() => {
    dispatch(fetchUserReferrals({ perPage: rowsPerPage, page: currentPage }));
  }, [dispatch, rowsPerPage, currentPage]);

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 text-[15px] font-bold text-white md:text-[16px]">
        {t('referrals')}
      </h3>

      {/* Top section: referral link, code and QR */}
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-9">
          <div className="grid grid-cols-1 gap-3">
            {/* Referral Link */}
            <div>
              <div className="mb-2 block text-[14px] font-bold text-white">
                {t('referral_link')}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#FFFFFF66] bg-[#ffffff0d] px-3 py-3 pr-12 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                />
                <button
                  onClick={() => copyToClipboard(referralLink)}
                  aria-label={`Copy ${t('referral_link')}`}
                  className="absolute top-1/2 right-2 shrink-0 -translate-y-1/2 transition-opacity hover:opacity-80"
                >
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/copy-icon.svg"
                    alt="copy"
                    width={22}
                    height={22}
                  />
                </button>
              </div>
            </div>

            {/* Referral Code */}
            <div>
              <div className="mb-2 block text-[14px] font-bold text-white">
                {t('referral_code')}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={referralCode}
                  readOnly
                  className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#FFFFFF66] bg-[#ffffff0d] px-3 py-3 pr-12 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                />
                <button
                  onClick={() => copyToClipboard(referralCode)}
                  aria-label={`Copy ${t('referral_code')}`}
                  className="absolute top-1/2 right-2 shrink-0 -translate-y-1/2 transition-opacity hover:opacity-80"
                >
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/copy-icon.svg"
                    alt="copy"
                    width={22}
                    height={22}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-4 text-[14px] text-white italic lg:pt-8 lg:text-[16px]">
            <span className="font-semibold text-[#D3AF37] not-italic">
              {t('note')}:
            </span>{' '}
            {t('refer_new_users_to_earn_points')}
          </div>
        </div>

        {/* QR Code */}
        <div className="md:col-span-3">
          <div className="flex h-full flex-col items-center justify-center md:items-end">
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                Share QR Code
              </h2>
              <div className="rounded-[10px] border border-white/70 p-5">
                <Image src={qrUrl} alt="referral-qr" width={180} height={180} />
              </div>
              <button
                onClick={downloadQRCode}
                className="flex w-[220px] cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 pt-2 pb-3 text-xs font-semibold text-white active:scale-95"
                style={{
                  backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
                }}
              >
                <span>{t('download')}</span>
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/download-icon-3.svg"
                  alt={t('download')}
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div 
          className="overflow-hidden rounded-[4px] border"
          style={{
            backgroundColor: '#2e3338',
            borderColor: 'rgba(0, 0, 0, 0.6)',
            boxShadow: '0px 3px 5px 0px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="show-scrollbar h-[400px] overflow-x-auto overflow-y-auto md:h-[500px]">
            <table className="w-full min-w-[900px] table-fixed text-[11px] md:text-sm md:min-w-[1100px]">
              <thead>
                <tr className="border-b-0" style={{ backgroundColor: '#ee5f5b' }}>
                  <th className="w-10 text-center text-[12px] font-bold text-white md:w-14 md:text-[14px]" style={{ padding: '7px 10px' }}>
                    {t('sr')}
                  </th>
                  <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                    {t('referred_user')}
                  </th>
                  <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                    {t('earned_points')}
                  </th>
                  <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                    {t('details')}
                  </th>
                  <th className="text-left text-[12px] font-bold text-white md:text-[14px]" style={{ padding: '7px 10px' }}>
                    {t('registered_at')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {referralsLoader ? (
                  <tr>
                    <td
                      className="text-center text-white"
                      colSpan="5"
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
                      <div className="flex h-[200px] items-center justify-center">
                        <CommonLoader border="border-[#D3AF37]" />
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      className="text-center text-white"
                      colSpan="5"
                      style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                    >
                      {t('no_record_found')}
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="cursor-pointer border-b border-[#FFFFFF66] transition-all duration-300"
                      style={{
                        backgroundColor: index % 2 === 0 ? '#353a41' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#49515a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#353a41' : 'transparent';
                      }}
                    >
                      <td 
                        className="w-12 text-center whitespace-nowrap text-white md:w-14"
                        style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                      >
                        {calculateIndex(
                          index,
                          currentPage,
                          rowsPerPage,
                          totalItems,
                        )}
                      </td>
                      <td 
                        className="whitespace-nowrap text-white"
                        style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                      >
                        {item.creator?.username}
                      </td>
                      <td 
                        className="whitespace-nowrap"
                        style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                      >
                        <span className="text-[#D3AF37] transition-all duration-200">
                          {formatPoints(item.amount)}
                        </span>
                      </td>
                      <td 
                        className="whitespace-nowrap text-white"
                        style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                      >
                        {item.category}
                      </td>
                      <td 
                        className="whitespace-nowrap text-white"
                        style={{ borderTop: '1px solid #1c1e22', padding: '5px 8px' }}
                      >
                        {formatDateTimeISO(item.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="mt-4 flex-shrink-0">
          <Pagination
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      )}
    </div>
  );
}
