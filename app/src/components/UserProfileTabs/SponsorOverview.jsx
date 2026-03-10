import { useState } from 'react';

import editProfileIcon from '@/assets/images/icons/edit-profile.svg';

import { CONTENT_MAX_WIDTH, FOCUS_RING } from './constants';
import { UserEdit } from './UserEdit';

const DETAILS_LEFT = [
  { label: 'PHONE', value: '—' },
  { label: 'CATEGORY', value: 'Sponsor' },
  { label: 'BRAND / COMPANY', value: '—' },
  { label: 'EMAIL', value: '—' },
];

const DETAILS_RIGHT = [
  { label: 'CITY', value: '—' },
  { label: 'TEAMS SPONSORED', value: '—' },
  { label: 'PARTNERSHIPS', value: '—' },
  { label: 'MEMBER SINCE', value: '—' },
];

const EDIT_PROFILE_BUTTON_CLASS = `inline-flex items-center gap-2 rounded-[17px] border border-white bg-transparent px-4 py-1 text-[12px] font-semibold uppercase tracking-wide text-white/70 transition-colors hover:border-white/60 hover:text-white/90 ${FOCUS_RING}`;

function DetailRow({ label, value, withColon = true }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold tracking-wide text-white/60 uppercase">
        {label}
        {withColon ? ':' : ''}
      </span>
      <span className="text-[16px] font-normal text-white">{value}</span>
    </div>
  );
}

export function SponsorOverview() {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH}`}>
      <UserEdit open={editOpen} onOpenChange={setEditOpen} />
      <div className="flex flex-wrap items-center justify-end gap-4 py-4">
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
          {DETAILS_LEFT.map((item) => (
            <DetailRow key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
        <div className="flex flex-col gap-5">
          {DETAILS_RIGHT.map((item) => (
            <DetailRow
              key={item.label}
              label={item.label}
              value={item.value}
              withColon={item.label !== 'CITY'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
