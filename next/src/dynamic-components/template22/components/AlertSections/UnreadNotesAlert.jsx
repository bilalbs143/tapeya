'use client';

import { useDispatch } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';

export default function UnreadNotesAlert({
  unreadNotes = [],
  unreadCount = 0,
  hasUnreadNotes = false,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslations();

  // Don't render if no unread notes
  if (!hasUnreadNotes) {
    return null;
  }

  const handleOpenNotesModal = (e) => {
    e.preventDefault();

    if (unreadCount === 1 && unreadNotes.length === 1) {
      const unreadMessage = unreadNotes[0];
      dispatch(
        openModal({
          modal: 'customerService',
          props: {
            defaultTab: 'note',
            openMessageId: unreadMessage.id,
          },
        }),
      );
    } else {
      dispatch(
        openModal({
          modal: 'customerService',
          props: { defaultTab: 'note' },
        }),
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#D3AF37] via-[#FFF788] to-[#D3AF37]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#D9D9D9]">
            {t('you_have_unread_messages')}
          </p>
          <p className="text-xs text-[#B8B8B8]">
            {unreadCount}{' '}
            {unreadCount === 1 ? t('unread_message') : t('unread_messages')}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-[#1a1a2e] p-4">
        <p className="text-sm text-[#D9D9D9]">
          {t('please_check_your_messages_before_continuing')}
        </p>
      </div>

      <button
        onClick={handleOpenNotesModal}
        className="w-full cursor-pointer rounded-[10px] bg-gradient-to-r from-[#D3AF37] via-[#FFF788] to-[#D3AF37] px-4 py-3 text-sm font-semibold text-black [box-shadow:inset_0_-3px_0_#876800] transition-all duration-150 active:scale-95"
        data-hover="View Messages"
      >
        {t('view_messages')}
      </button>
    </div>
  );
}
