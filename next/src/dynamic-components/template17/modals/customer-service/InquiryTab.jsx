'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import StatusPill from '@/components/StatusPill/StatusPill';
import ContentDetail from '@/dynamic-components/template17/components/ContentDetail/ContentDetail';
import Pagination from '@/dynamic-components/template17/components/Pagination/Pagination';
import { formatDateTimeISO } from '@/helpers/dateTime';
import { getStatusVariant } from '@/helpers/statusUtils';
import { calculateIndex } from '@/helpers/tableUtils';
import { useTranslations } from '@/hooks/useTranslations';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Labels';
import { customerInquirySchema } from '@/validations/customerInquiry.validation';
import {
  createCustomerInquiry,
  deleteCustomerInquiry,
  fetchAllCustomerInquiries,
  fetchCustomerInquiry,
} from '@/website/websiteAction';

export default function InquiryTab({ activeTab = 'inquiry', openInquiryId }) {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { allCustomerInquiriesLoader, allCustomerInquiriesData } = useSelector(
    (state) => state.website,
  );

  // Form management using react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: joiResolver(customerInquirySchema),
    defaultValues: {
      title: '',
      content: '',
    },
    mode: 'onChange',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Customer inquiry states
  const [deletingInquiryId, setDeletingInquiryId] = useState(null);

  // Detail view state
  const [showInquiryDetails, setShowInquiryDetails] = useState(false);
  const [selectedInquiryData, setSelectedInquiryData] = useState(null);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  // Fetch customer inquiries on component mount and when pagination changes
  useEffect(() => {
    if (activeTab === 'inquiry') {
      dispatch(
        fetchAllCustomerInquiries({
          perPage: rowsPerPage,
          page: currentPage,
        }),
      );
    }
  }, [dispatch, activeTab, currentPage, rowsPerPage]);

  // Close inquiry details when switching tabs
  useEffect(() => {
    if (showInquiryDetails && activeTab !== 'inquiry') {
      setShowInquiryDetails(false);
      setSelectedInquiryData(null);
    }
  }, [activeTab, showInquiryDetails]);

  // Handle opening specific inquiry when openInquiryId is provided
  useEffect(() => {
    if (openInquiryId && activeTab === 'inquiry') {
      handleRowClick(openInquiryId);
    }
  }, [openInquiryId, activeTab]);

  const handleSubmitSupport = async (data) => {
    try {
      await dispatch(
        createCustomerInquiry({ title: data.title, content: data.content }),
      ).unwrap();
      // Reset form and refresh data
      reset();
      dispatch(
        fetchAllCustomerInquiries({
          perPage: rowsPerPage,
          page: currentPage,
        }),
      );
    } catch (error) {
      console.error('Failed to create inquiry:', error);
    }
  };

  const handleRowClick = async (id) => {
    try {
      const result = await dispatch(fetchCustomerInquiry({ id })).unwrap();
      setSelectedInquiryData(result.data);
      setShowInquiryDetails(true);
    } catch (error) {
      console.error('Failed to fetch inquiry:', error);
    }
  };

  const handleCloseDetails = () => {
    setShowInquiryDetails(false);
    setSelectedInquiryData(null);
  };

  const handleDeleteInquiry = async (id) => {
    const confirmed = window.confirm(t('confirm_delete_message'));

    if (confirmed) {
      setDeletingInquiryId(id);
      try {
        await dispatch(deleteCustomerInquiry({ id })).unwrap();
        // Refresh data
        dispatch(
          fetchAllCustomerInquiries({
            perPage: rowsPerPage,
            page: currentPage,
          }),
        );
      } catch (error) {
        console.error('Failed to delete inquiry:', error);
      } finally {
        setDeletingInquiryId(null);
      }
    }
  };

  const getSerialNumber = (index) => {
    const totalItems = allCustomerInquiriesData?.meta?.total || 0;
    return calculateIndex(index, currentPage, rowsPerPage, totalItems);
  };

  // Get customer inquiries data array
  const inquiriesData = allCustomerInquiriesData?.data || [];

  return (
    <>
      {showInquiryDetails ? (
        <ContentDetail
          title={t('inquiry_details')}
          data={selectedInquiryData}
          onClose={handleCloseDetails}
          fields={[
            {
              type: 'row',
              fields: [
                {
                  key: 'title',
                  label: t('title'),
                },
                {
                  key: 'status',
                  label: t('status'),
                },
              ],
            },
            {
              key: 'content',
              label: t('content'),
              type: 'html',
            },
          ]}
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-[10px] border border-[#E8D25E4D] p-3 md:p-4 lg:p-6">
            <form
              onSubmit={handleSubmit(handleSubmitSupport)}
              className="space-y-4"
            >
              <div>
                <Label className="mb-2 block text-[14px] font-bold text-white">
                  {t('title')}
                </Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('title')}
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#D3AF3780] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                      error={
                        errors.title?.message ? t(errors.title.message) : ''
                      }
                    />
                  )}
                />
              </div>

              <div className="mb-0">
                <label className="mb-2 block text-[14px] font-bold text-white">
                  {t('details')}
                </label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder={t('details')}
                      rows="4"
                      className="relative block min-h-[46px] w-full resize-none appearance-none rounded-[5px] border border-[#D3AF3780] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:min-h-[55px]"
                    />
                  )}
                />
                {errors.content?.message && (
                  <p className="mt-1 text-sm text-red-400">
                    {t(errors.content.message)}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="flex cursor-pointer items-center justify-center rounded-[10px] bg-[#E8D25E] px-6 pt-3 pb-4 text-[14px] font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800] active:scale-95"
                  data-hover={t('submit')}
                >
                  {t('submit')}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {/* Table Container with Fixed Height and Scroll */}
            <div className="overflow-hidden rounded-2xl border border-[#FFFFFF66]">
              <div className="show-scrollbar h-[400px] overflow-x-auto overflow-y-auto md:h-[500px]">
                <table className="w-full min-w-[720px] table-fixed text-[11px] md:text-sm">
                  <thead>
                    <tr className="border-b-0 border-[#FFFFFF66] bg-[#D3AF37B2]">
                      <th className="w-12 px-1 py-2 text-center text-[12px] font-bold text-white md:w-14 md:px-2 md:py-3 md:text-[14px]">
                        {t('sr')}
                      </th>
                      <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('title')}
                      </th>
                      <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('writer')}
                      </th>
                      <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('status')}
                      </th>
                      <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('registration_date')}
                      </th>
                      <th className="px-2 py-2 text-center text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('details')}
                      </th>
                      <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCustomerInquiriesLoader ? (
                      <tr>
                        <td
                          className="px-2 py-3 text-center text-white"
                          colSpan="7"
                        >
                          <div className="flex items-center justify-center py-8">
                            <CommonLoader size="lg" border="border-[#D3AF37]" />
                          </div>
                        </td>
                      </tr>
                    ) : !inquiriesData || inquiriesData.length === 0 ? (
                      <tr>
                        <td
                          className="px-2 py-3 text-center text-white"
                          colSpan="7"
                        >
                          {t('no_record_found')}
                        </td>
                      </tr>
                    ) : (
                      inquiriesData.map((inquiry, index) => (
                        <tr
                          key={`row-${inquiry.id}`}
                          className="cursor-pointer border-b border-[#FFFFFF66] transition-all duration-300 hover:border-[#D3AF37] hover:shadow-[0_0_10px_0_#D3AF37_inset]"
                          onClick={() => handleRowClick(inquiry.id)}
                        >
                          <td className="w-12 px-1 py-2 text-center text-white md:w-14 md:px-2 md:py-3">
                            {getSerialNumber(index)}
                          </td>
                          <td className="px-1 py-2 md:px-2 md:py-3">
                            <span className="text-[#D3AF37] transition-all duration-200">
                              {inquiry.title}
                            </span>
                          </td>
                          <td className="px-1 py-2 text-white md:px-2 md:py-3">
                            {inquiry.creator?.name || 'N/A'}
                          </td>
                          <td className="px-1 py-2 text-white md:px-2 md:py-3">
                            <StatusPill
                              value={inquiry.status || t('pending')}
                              variant={getStatusVariant(inquiry.status_enum)}
                              size="xs"
                            />
                          </td>
                          <td className="px-1 py-2 text-white md:px-2 md:py-3">
                            {formatDateTimeISO(inquiry.created_at)}
                          </td>
                          <td className="px-2 py-2 text-center text-white md:px-2 md:py-3">
                            <button className="btn-hover-outline rounded-[6px] border border-[#D3AF37] bg-transparent px-3 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-[#D3AF37] hover:text-black">
                              {t('details')}
                            </button>
                          </td>
                          <td className="px-1 py-2 text-white md:px-2 md:py-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteInquiry(inquiry.id);
                              }}
                              className="cursor-pointer text-red-500 hover:text-red-400"
                              disabled={deletingInquiryId === inquiry.id}
                            >
                              {deletingInquiryId === inquiry.id ? (
                                <CommonLoader
                                  size="sm"
                                  border="border-[#D3AF37]"
                                />
                              ) : (
                                t('delete')
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={
                allCustomerInquiriesData?.meta?.total || inquiriesData.length
              }
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </div>
        </div>
      )}
    </>
  );
}
