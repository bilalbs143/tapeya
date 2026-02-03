'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import Pagination from '@/dynamic-components/template10/components/Pagination/Pagination';
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
      {/* Top section: referral link, code and QR */}
      <div className="rounded-[3px] border border-[#E33A2480] bg-[#1D4647] px-4 py-3 shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] md:px-6 md:py-4">
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-9 md:mt-8">
            <div className="grid grid-cols-1 gap-3">
              {/* Referral Link */}
              <div>
                <div className="mb-2 block text-[16px] font-bold text-white">
                  {t('referral_link')}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#E33A2480] bg-[#172F31]/80 px-3 py-3 pr-12 text-[12px] text-[white] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[white] focus:bg-[#172F31CC] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
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
                <div className="mb-2 block text-[16px] font-bold text-white">
                  {t('referral_code')}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#E33A2480] bg-[#172F31]/80 px-3 py-3 pr-12 text-[12px] text-[white] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[white] focus:border-[#E33A2480] focus:bg-[#172F31CC] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
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

            <div className="mt-2 pt-4 text-[14px] font-extrabold text-[#FFFFFF99] italic lg:pt-8 lg:text-[15px]">
              <span className="font-semibold text-[#E33A24] not-italic">
                {t('note')}:
              </span>{' '}
              {t('refer_new_users_to_earn_points')}
            </div>
          </div>

          {/* QR Code */}
          <div className="md:col-span-3">
            <div className="mt-2 flex h-full flex-col items-center justify-center md:items-end">
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-base font-semibold text-white">
                  Share QR Code
                </h2>
                <div>
                  <Image
                    src={qrUrl}
                    alt="referral-qr"
                    width={180}
                    height={180}
                  />
                </div>
                <button
                  onClick={downloadQRCode}
                  className="filled-hover-effect mt-2 flex w-[291px] cursor-pointer items-center justify-center gap-2 rounded-[3px] bg-[#E33A24] px-4 pt-4 pb-4 text-[13px] font-extrabold text-white active:scale-95 md:w-[191px] md:rounded-[5px]"
                >
                  <span>{t('download')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 space-y-4">
        <div className="mb-4 block text-[19px] font-bold text-white">
          {t('Recent Referrals')}
        </div>
        <div className="flex h-[400px] flex-col md:h-[500px]">
          <div className="overflow-x-auto md:overflow-x-visible">
            <div className="inline-block w-full min-w-[900px] align-top md:min-w-[1100px]">
              {/* Table Header */}
              <div className="overflow-hidden rounded-t-[8px] border border-b-0 border-[#E33A2480]">
                <table className="w-full table-fixed text-[11px] md:text-sm">
                  <thead>
                    <tr className="border-b-0 border-[#E33A2480] bg-[#1D4647]">
                      <th className="w-10 px-1 py-2 text-center text-[12px] font-bold text-white md:w-14 md:px-2 md:py-3 md:text-[14px]">
                        {t('sr')}
                      </th>
                      <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('referred_user')}
                      </th>
                      <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('earned_points')}
                      </th>
                      <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('details')}
                      </th>
                      <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('registered_at')}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Table Body */}
              <div className="show-scrollbar flex-1 overflow-y-auto rounded-b-[8px] border border-t-0 border-[#E33A2480]">
                {referralsLoader ? (
                  <div className="flex h-[200px] items-center justify-center">
                    <CommonLoader border="border-[#1D4647]" />
                  </div>
                ) : (
                  <table className="w-full table-fixed text-[11px] md:text-sm">
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td
                            className="px-2 py-3 text-center text-white"
                            colSpan="5"
                          >
                            {t('no_record_found')}
                          </td>
                        </tr>
                      ) : (
                        items.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className="border-b border-[#E33A2480] transition-all duration-300 last:border-b-0 hover:border-[#E33A2480] hover:bg-[#172F31CC] hover:shadow-[inset_0_4px_14px_0_rgba(227,58,36,0.50)]"
                          >
                            <td className="w-12 px-1 py-2 text-center whitespace-nowrap text-[#FFFFFF99] md:w-14 md:px-2 md:py-3">
                              {calculateIndex(
                                index,
                                currentPage,
                                rowsPerPage,
                                totalItems,
                              )}
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-[#FFFFFF99] md:px-2 md:py-3">
                              {item.creator?.username}
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-white md:px-2 md:py-3">
                              <span className="text-[#FFFFFF99] transition-all duration-200">
                                {formatPoints(item.amount)}
                              </span>
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-[#FFFFFF99] md:px-2 md:py-3">
                              {item.category}
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-[#FFFFFF99] md:px-2 md:py-3">
                              {formatDateTimeISO(item.created_at)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
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
