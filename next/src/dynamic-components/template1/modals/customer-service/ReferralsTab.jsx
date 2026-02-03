'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import Pagination from '@/dynamic-components/template1/components/Pagination/Pagination';
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Referral Link */}
            <div>
              <div className="mb-2 block text-[14px] font-bold text-white">
                {t('referral_link')}
              </div>
              <div className="h[46px] flex w-full items-center justify-between gap-2 rounded-[12px] border border-transparent bg-[#372A84] px-3 py-3 text-white">
                <span className="text-xs break-all sm:text-sm">
                  {referralLink}
                </span>
                <button
                  onClick={() => copyToClipboard(referralLink)}
                  aria-label={`Copy ${t('referral_link')}`}
                  className="shrink-0 transition-opacity hover:opacity-80"
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
              <div className="h[46px] flex w-full items-center justify-between gap-2 rounded-[12px] border border-transparent bg-[#372A84] px-3 py-3 text-white">
                <span className="text-xs break-all sm:text-sm">
                  {referralCode}
                </span>
                <button
                  onClick={() => copyToClipboard(referralCode)}
                  aria-label={`Copy ${t('referral_code')}`}
                  className="shrink-0 transition-opacity hover:opacity-80"
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
            <span className="font-semibold text-[#FF9F00] not-italic">
              {t('note')}:
            </span>{' '}
            {t('refer_new_users_to_earn_points')}
          </div>
        </div>

        {/* QR Code */}
        <div className="md:col-span-3">
          <div className="flex h-full flex-col items-center justify-center gap-2 md:items-end">
            <div className="rounded-[10px] border border-white/70 p-5">
              <Image src={qrUrl} alt="referral-qr" width={180} height={180} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white">{t('share_qr_code')}</span>
              <button
                onClick={downloadQRCode}
                className="inline-flex items-center gap-2 rounded-[8px] bg-[#241866] pt-[6px] pr-[18px] pb-[6px] pl-[19px] text-xs font-bold text-white transition-opacity hover:opacity-90"
              >
                <span>{t('download')}</span>
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/apk-download.svg"
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
        <div className="flex h-[400px] flex-col md:h-[500px]">
          <div className="overflow-x-auto md:overflow-x-visible">
            <div className="inline-block w-full min-w-[900px] align-top md:min-w-[1100px]">
              {/* Table Header */}
              <div className="overflow-hidden rounded-t-2xl border border-b-0 border-[#5343B1]">
                <table className="w-full table-fixed text-[11px] md:text-sm">
                  <thead>
                    <tr className="bg-opacity-38 border-b border-[#4B51A3] bg-[#5343B1]">
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
              <div className="show-scrollbar flex-1 overflow-y-auto rounded-b-2xl border border-t-0 border-[#5343B1]">
                {referralsLoader ? (
                  <div className="flex h-[200px] items-center justify-center">
                    <CommonLoader border="border-[#FC7E09]" />
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
                            className="border-b border-[#5343B1] transition-all duration-300 last:border-b-0 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset]"
                          >
                            <td className="w-12 px-1 py-2 text-center whitespace-nowrap text-white md:w-14 md:px-2 md:py-3">
                              {calculateIndex(
                                index,
                                currentPage,
                                rowsPerPage,
                                totalItems,
                              )}
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-white md:px-2 md:py-3">
                              {item.creator?.username}
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-white md:px-2 md:py-3">
                              <span className="text-[#FC7E09] transition-all duration-200 hover:text-[#FF9500]">
                                {formatPoints(item.amount)}
                              </span>
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-white md:px-2 md:py-3">
                              {item.category}
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-white md:px-2 md:py-3">
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
