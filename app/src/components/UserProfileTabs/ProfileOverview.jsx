import { useState } from 'react';

import editProfileIcon from '@/assets/images/icons/edit-profile.svg';
import {
  getBattingStyleLabel,
  getBowlingStyleLabel,
  usePlayerProfileEnums,
} from '@/store/api/enumApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

import { CONTENT_MAX_WIDTH, FOCUS_RING } from './constants';
import { UserEdit } from './UserEdit';

/** Compute age string from date_of_birth (YYYY-MM-DD): "X years Y days" */
function formatAge(dateOfBirth) {
  if (!dateOfBirth) return '—';
  const d = new Date(dateOfBirth);
  if (Number.isNaN(d.getTime())) return '—';
  const today = new Date();
  let years = today.getFullYear() - d.getFullYear();
  const lastBday = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (lastBday > today) {
    years -= 1;
    lastBday.setFullYear(today.getFullYear() - 1);
  }
  const days = Math.floor((today - lastBday) / (24 * 60 * 60 * 1000));
  if (years <= 0 && days <= 0) return '—';
  const parts = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  return parts.join(' ');
}

const BECOME_SPONSOR_BUTTON_CLASS = `inline-flex items-center gap-2 rounded-[17px] border border-[#d8a11e] bg-transparent px-4 py-1 text-[12px] font-semibold tracking-wide text-[#d8a11e] transition-colors hover:border-[#e5b42a] hover:text-[#e5b42a] ${FOCUS_RING}`;

const EDIT_PROFILE_BUTTON_CLASS = `inline-flex items-center gap-2 rounded-[17px] border border-white bg-transparent px-4 py-1 text-[12px] font-semibold uppercase tracking-wide text-white/70 transition-colors hover:border-white/60 hover:text-white/90 ${FOCUS_RING}`;

function DetailRow({ label, value, withColon = true }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold tracking-wide text-white/60 uppercase">
        {label}
        {withColon ? ':' : ''}
      </span>
      <span className="text-[16px] font-normal text-white">{value || '—'}</span>
    </div>
  );
}

export function ProfileOverview() {
  const [editOpen, setEditOpen] = useState(false);
  const user = useAppSelector(selectUser);
  const { battingStyleOptions, bowlingStyleOptions } = usePlayerProfileEnums();

  const battingLabel =
    user?.batting_style ??
    getBattingStyleLabel(
      user?.batting_style_enum?.toLowerCase(),
      battingStyleOptions,
    );
  const bowlingLabel =
    user?.bowling_style ??
    getBowlingStyleLabel(
      user?.bowling_style_enum?.toLowerCase(),
      bowlingStyleOptions,
    );

  const detailsLeft = [
    { label: 'PHONE', value: user?.phone ?? '—' },
    { label: 'BATTING STYLE', value: battingLabel },
    { label: 'EMAIL (OPTIONAL)', value: user?.email ?? '—' },
  ];

  const detailsRight = [
    { label: 'AGE', value: formatAge(user?.date_of_birth) },
    { label: 'BOWLING STYLE', value: bowlingLabel },
    { label: 'CITY', value: user?.city ?? '—', withColon: false },
    { label: 'COUNTRY', value: user?.country ?? '—' },
  ];

  return (
    <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH}`}>
      <UserEdit open={editOpen} onOpenChange={setEditOpen} />
      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <button
          type="button"
          className={BECOME_SPONSOR_BUTTON_CLASS}
          onClick={() => {}}
        >
          Become a Sponsor
        </button>
        <button
          type="button"
          className={EDIT_PROFILE_BUTTON_CLASS}
          onClick={() => setEditOpen(true)}
        >
          EDIT
          <img
            src={editProfileIcon}
            alt=""
            width={16}
            height={16}
            className="shrink-0"
          />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6 py-6">
        <div className="flex flex-col gap-5">
          {detailsLeft.map((item) => (
            <DetailRow key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
        <div className="flex flex-col gap-5">
          {detailsRight.map((item) => (
            <DetailRow
              key={item.label}
              label={item.label}
              value={item.value}
              withColon={item.withColon !== false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
