'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import StatusPill from '@/components/StatusPill/StatusPill';
import ContentDetail from '@/dynamic-components/template4/components/ContentDetail/ContentDetail';
import Pagination from '@/dynamic-components/template4/components/Pagination/Pagination';
import { formatDateTimeISO } from '@/helpers/dateTime';
import { getStatusText, getStatusVariant } from '@/helpers/statusUtils';
import { calculateIndex } from '@/helpers/tableUtils';
import { useTranslations } from '@/hooks/useTranslations';
import {
  fetchUnreadNotes,
  fetchUserMessages,
  fetchUserNotes,
} from '@/website/websiteAction';

export default function NoteTab({ openMessageId }) {
  const dispatch = useDispatch();
  const { userNotesLoader, userNotesData } = useSelector(
    (state) => state.website,
  );
  const { t } = useTranslations();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Detail view state
  const [showNoteDetails, setShowNoteDetails] = useState(false);
  const [selectedNoteData, setSelectedNoteData] = useState(null);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  const handleRowClick = useCallback(
    async (id) => {
      try {
        const result = await dispatch(fetchUserMessages({ id })).unwrap();
        setSelectedNoteData(result.data);
        setShowNoteDetails(true);

        // Update the local notes data to reflect the read status change
        if (result.data && userNotesData?.data) {
          const updatedNotesData = {
            ...userNotesData,
            data: userNotesData.data.map((note) => {
              if (note.id === id) {
                // Update the note with the new read status
                return {
                  ...note,
                  reader: result.data.reader || note.reader,
                  read_at: result.data.read_at || note.read_at,
                };
              }
              return note;
            }),
          };

          // Dispatch an action to update the Redux store
          dispatch({
            type: 'website/updateUserNotesData',
            payload: updatedNotesData,
          });

          // Refresh unread notes data to update the navbar counter
          dispatch(fetchUnreadNotes());
        }
      } catch (error) {
        console.error('Failed to fetch note:', error);
      }
    },
    [dispatch, userNotesData?.data],
  );

  // Fetch notes data when component mounts or pagination changes
  useEffect(() => {
    dispatch(
      fetchUserNotes({
        perPage: rowsPerPage,
        page: currentPage,
      }),
    );
  }, [dispatch, currentPage, rowsPerPage]);

  // Auto-open specific message if openMessageId is provided
  useEffect(() => {
    if (openMessageId && userNotesData?.data && !hasAutoOpened) {
      // Find the message in the current data
      const message = userNotesData.data.find(
        (note) => note.id === openMessageId,
      );
      if (message) {
        // Automatically open the message
        handleRowClick(openMessageId);
        setHasAutoOpened(true);
      }
    }
  }, [openMessageId, userNotesData?.data, handleRowClick, hasAutoOpened]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const getSerialNumber = (index) => {
    const totalItems = userNotesData?.meta?.total || 0;
    return calculateIndex(index, currentPage, rowsPerPage, totalItems);
  };

  const handleCloseDetails = () => {
    setShowNoteDetails(false);
    setSelectedNoteData(null);
  };

  // Show loading state
  if (userNotesLoader) {
    return (
      <div className="flex items-center justify-center py-8">
        <CommonLoader size="lg" border="border-[#55BC55]" />
      </div>
    );
  }

  // Get notes data array
  const notesData = userNotesData?.data || [];

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 text-[15px] font-bold text-white md:text-[16px]">
        {t('note')}
      </h3>

      {showNoteDetails ? (
        <ContentDetail
          title={t('note_details')}
          data={selectedNoteData}
          onClose={handleCloseDetails}
          fields={[
            {
              type: 'row',
              fields: [
                {
                  key: 'note.category',
                  label: t('category'),
                },
                {
                  key: 'note.title',
                  label: t('title'),
                },
              ],
            },
            {
              key: 'note.content',
              label: t('content'),
              type: 'html',
            },
          ]}
        />
      ) : (
        <>
          {/* Table Container with Fixed Height and Scroll */}
          <div className="overflow-hidden rounded-2xl border border-[#FFFFFF66]">
            <div className="show-scrollbar h-[400px] overflow-x-auto overflow-y-auto md:h-[500px]">
              <table className="w-full min-w-[680px] table-fixed text-[11px] md:text-sm">
                <thead>
                  <tr className="border-b-0 border-[#FFFFFF66] bg-[#153030]">
                    <th className="w-12 px-1 py-2 text-center text-[12px] font-bold text-white md:w-14 md:px-2 md:py-3 md:text-[14px]">
                      {t('sr')}
                    </th>
                    <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                      {t('message')} {t('title')}
                    </th>
                    <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                      {t('category')}
                    </th>
                    <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                      {t('status')}
                    </th>
                    <th className="px-1 py-2 text-left text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                      {t('time_spent')}
                    </th>
                    <th className="px-2 py-2 text-center text-[12px] font-bold text-white md:px-2 md:py-3 md:text-[14px]">
                      {t('details')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {notesData.length === 0 ? (
                    <tr>
                      <td
                        className="px-2 py-3 text-center text-white"
                        colSpan="6"
                      >
                        {t('no_record_found')}
                      </td>
                    </tr>
                  ) : (
                    notesData.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="cursor-pointer border border-[#FFFFFF66] transition-all duration-300 hover:border-[#5AB25A] hover:shadow-[0_5px_30px_0_rgba(85,188,85,0.46)_inset]"
                        onClick={() => handleRowClick(item.id)}
                      >
                        <td className="w-12 px-1 py-2 text-center text-white md:w-14 md:px-2 md:py-3">
                          {getSerialNumber(index)}
                        </td>
                        <td className="px-1 py-2 md:px-2 md:py-3">
                          <span className="text-white transition-all duration-200">
                            {item?.note?.title || 'N/A'}
                          </span>
                        </td>
                        <td className="px-1 py-2 text-white md:px-2 md:py-3">
                          {item?.note?.category || 'N/A'}
                        </td>
                        <td className="px-1 py-2 md:px-2 md:py-3">
                          <StatusPill
                            value={getStatusText(
                              item?.reader?.username ? 'read' : 'unread',
                              t,
                            )}
                            variant={getStatusVariant(
                              item?.reader?.username ? 'read' : 'unread',
                            )}
                            size="xs"
                          />
                        </td>
                        <td className="px-1 py-2 text-white md:px-2 md:py-3">
                          {formatDateTimeISO(item.created_at)}
                        </td>
                        <td className="px-2 py-2 text-center text-white md:px-2 md:py-3">
                          <button className="btn-hover-outline rounded-[6px] border border-[#03c72c4d] bg-transparent px-3 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-[#5AB25A] hover:text-white">
                            {t('details')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination - Fixed at Bottom */}
          {notesData.length > 0 && (
            <div className="mt-4 flex-shrink-0">
              <Pagination
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                totalItems={userNotesData?.meta?.total || notesData.length}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
