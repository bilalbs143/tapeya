import { useState } from 'react';

import { Link } from 'react-router-dom';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { FOCUS_RING } from '@/lib/constants/profile';
import { formatAge } from '@/lib/utils/dateUtils';
import { getBattingStyleLabel, getBowlingStyleLabel, getPlayingRoleLabel, usePlayerProfileEnums } from '@/store/api/enumApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

import { UserEdit } from './UserEdit';

const editProfileIcon = `${CLOUDFRONT_APP_BASE}/images/icons/edit-profile.svg`;
const userStatsIcon = `${CLOUDFRONT_APP_BASE}/images/icons/user-stats.svg`;

const ACTION_CLASS = `inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-3.5 py-1.5 text-[12px] font-semibold tracking-wide text-white/85 transition-colors hover:border-white/40 hover:text-white ${FOCUS_RING}`;

function DetailRow({ label, value, wrap = false, wide = false }) {
  return (
    <div className={`flex max-w-full min-w-0 flex-col gap-0.5 ${wide ? 'col-span-2' : ''}`}>
      <span className="text-muted text-[12px] font-medium tracking-wide">{label}</span>
      <span className={`max-w-full min-w-0 text-[15px] font-medium text-white ${wrap ? 'break-all' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}

function DetailGroup({ title, rows }) {
  return (
    <div>
      <h3 className="text-muted mb-3 text-[12px] font-bold tracking-wide">{title}</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {rows.map((item) => (
          <DetailRow key={item.label} label={item.label} value={item.value} wrap={item.wrap} wide={item.wide} />
        ))}
      </div>
    </div>
  );
}

/**
 * Account details + edit for every user (same profile for all).
 */
export function ProfileRoleOverview() {
  const [editOpen, setEditOpen] = useState(false);
  const user = useAppSelector(selectUser);
  const { battingStyleOptions, bowlingStyleOptions, playingRoleOptions } = usePlayerProfileEnums();

  const battingLabel = user?.batting_style ?? getBattingStyleLabel(user?.batting_style_enum?.toLowerCase(), battingStyleOptions);
  const bowlingLabel = user?.bowling_style ?? getBowlingStyleLabel(user?.bowling_style_enum?.toLowerCase(), bowlingStyleOptions);
  const playingRoleLabel = user?.playing_role ?? getPlayingRoleLabel(user?.playing_role_enum?.toLowerCase(), playingRoleOptions);

  const contactRows = [
    { label: 'Phone', value: user?.phone ?? '—' },
    { label: 'Nickname', value: user?.nickname ?? '—' },
    { label: 'Email', value: user?.email ?? '—', wrap: true, wide: true },
  ];

  const cricketRows = [
    { label: 'Playing Role', value: playingRoleLabel },
    { label: 'Batting Style', value: battingLabel },
    { label: 'Bowling Style', value: bowlingLabel },
    { label: 'Age', value: formatAge(user?.date_of_birth) },
  ];

  const locationRows = [
    { label: 'City', value: user?.city ?? '—' },
    { label: 'Country', value: user?.country ?? '—' },
  ];

  return (
    <>
      <UserEdit open={editOpen} onOpenChange={setEditOpen} />

      <section
        className="bg-surface rounded-[17px] border border-white/[0.06] px-4 py-5 sm:px-5"
        aria-labelledby="profile-details-heading"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="profile-details-heading" className="text-[15px] font-bold text-white">
            Profile Details
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/stats" className={ACTION_CLASS}>
              <img src={userStatsIcon} alt="" width={14} height={14} className="shrink-0 opacity-90" />
              Stats
            </Link>
            <button type="button" className={ACTION_CLASS} onClick={() => setEditOpen(true)}>
              Edit
              <img src={editProfileIcon} alt="" width={14} height={14} className="shrink-0 opacity-90" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <DetailGroup title="Contact" rows={contactRows} />
          <div className="h-px w-full bg-white/[0.06]" />
          <DetailGroup title="Cricket" rows={cricketRows} />
          <div className="h-px w-full bg-white/[0.06]" />
          <DetailGroup title="Location" rows={locationRows} />
        </div>
      </section>
    </>
  );
}
