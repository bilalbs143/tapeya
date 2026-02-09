import { useState } from 'react';
import editProfileIcon from '@/assets/images/icons/edit-profile.svg';
import { CONTENT_MAX_WIDTH, FOCUS_RING } from './constants';
import { UserEdit } from './UserEdit';

const DETAILS_LEFT = [
  { label: 'PHONE', value: '03157118511' },
  { label: 'CATEGORY', value: 'Player' },
  { label: 'BATTING STYLE', value: 'Left handed' },
  { label: 'EMAIL (OPTIONAL)', value: '----------' },
];

const DETAILS_RIGHT = [
  { label: 'AGE', value: '22 years 1 days' },
  { label: 'PLAYING ROLE', value: 'Bowler' },
  { label: 'BOWLING STYLE', value: 'Right handed' },
  { label: 'CITY', value: 'Lahore, Pakistan' },
];

const BECOME_SPONSOR_BUTTON_CLASS = `inline-flex items-center gap-2 rounded-[17px] border border-[#d8a11e] bg-transparent px-4 py-1 text-[12px] font-semibold tracking-wide text-[#d8a11e] transition-colors hover:border-[#e5b42a] hover:text-[#e5b42a] ${FOCUS_RING}`;

const EDIT_PROFILE_BUTTON_CLASS = `inline-flex items-center gap-2 rounded-[17px] border border-white bg-transparent px-4 py-1 text-[12px] font-semibold uppercase tracking-wide text-white/70 transition-colors hover:border-white/60 hover:text-white/90 ${FOCUS_RING}`;

function DetailRow({ label, value, withColon = true }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-wide text-white/60">
        {label}{withColon ? ':' : ''}
      </span>
      <span className="text-[16px] font-normal text-white">{value}</span>
    </div>
  );
}

export function ProfileOverview() {
  const [editOpen, setEditOpen] = useState(false);

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
          <img src={editProfileIcon} alt="" width={16} height={16} className="shrink-0" />
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
