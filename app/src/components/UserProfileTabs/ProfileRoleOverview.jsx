import { useState } from 'react';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatDate } from '@/lib/format';
import { formatAge } from '@/lib/utils/dateUtils';
import { getBattingStyleLabel, getBowlingStyleLabel, getPlayingRoleLabel, usePlayerProfileEnums } from '@/store/api/enumApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

import { CONTENT_MAX_WIDTH, FOCUS_RING, PROFILE_OVERVIEW_ROLE } from './constants';
import { UserEdit } from './UserEdit';

const editProfileIcon = `${CLOUDFRONT_APP_BASE}/images/icons/edit-profile.svg`;

const EDIT_PROFILE_BUTTON_CLASS = `inline-flex items-center gap-2 rounded-[17px] border border-white bg-transparent px-4 py-1 text-[12px] font-semibold uppercase tracking-wide text-white/70 transition-colors hover:border-white/60 hover:text-white/90 ${FOCUS_RING}`;

function DetailRow({ label, value, withColon = true, truncateAt }) {
  const raw = value ?? '—';
  const isTruncatable = truncateAt != null && typeof raw === 'string' && raw !== '—' && raw.length > truncateAt;
  const display = isTruncatable ? `${raw.slice(0, truncateAt)}...` : raw;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-bold tracking-wide text-white/60 uppercase">
        {label}
        {withColon ? ':' : ''}
      </span>
      <span
        className={`min-w-0 text-[16px] font-normal text-white ${truncateAt != null ? 'break-all' : ''}`}
        title={isTruncatable ? raw : undefined}
      >
        {display}
      </span>
    </div>
  );
}

/**
 * Single overview panel for player / organizer / sponsor profiles.
 *
 * @param {object} props
 * @param {'player'|'organizer'|'sponsor'} props.role — {@link PROFILE_OVERVIEW_ROLE}
 * @param {number} [props.tournaments] — organizer metrics
 * @param {number} [props.events] — organizer metrics
 */
export function ProfileRoleOverview({ role, tournaments: _tournaments, events: _events }) {
  const [editOpen, setEditOpen] = useState(false);
  const user = useAppSelector(selectUser);
  const { battingStyleOptions, bowlingStyleOptions, playingRoleOptions } = usePlayerProfileEnums();

  const r = role ?? PROFILE_OVERVIEW_ROLE.PLAYER;

  const battingLabel = user?.batting_style ?? getBattingStyleLabel(user?.batting_style_enum?.toLowerCase(), battingStyleOptions);
  const bowlingLabel = user?.bowling_style ?? getBowlingStyleLabel(user?.bowling_style_enum?.toLowerCase(), bowlingStyleOptions);
  const playingRoleLabel = user?.playing_role ?? getPlayingRoleLabel(user?.playing_role_enum?.toLowerCase(), playingRoleOptions);

  const memberSince = user?.created_at ? formatDate(user.created_at, { month: 'short', year: 'numeric' }) : '—';

  let detailsLeft = [];
  let detailsRight = [];

  if (r === PROFILE_OVERVIEW_ROLE.PLAYER) {
    detailsLeft = [
      { label: 'PHONE', value: user?.phone ?? '—' },
      { label: 'NICKNAME', value: user?.nickname ?? '—' },
      { label: 'BATTING STYLE', value: battingLabel },
      { label: 'EMAIL', value: user?.email ?? '—', truncateAt: 15 },
      { label: 'MEMBER SINCE', value: memberSince, withColon: true },
    ];
    detailsRight = [
      { label: 'AGE', value: formatAge(user?.date_of_birth), withColon: true },
      { label: 'PLAYING ROLE', value: playingRoleLabel, withColon: true },
      { label: 'BOWLING STYLE', value: bowlingLabel, withColon: true },
      { label: 'CITY', value: user?.city ?? '—', withColon: false },
      { label: 'COUNTRY', value: user?.country ?? '—', withColon: true },
    ];
  } else if (r === PROFILE_OVERVIEW_ROLE.ORGANIZER) {
    detailsLeft = [
      { label: 'PHONE', value: user?.phone ?? '—' },
      { label: 'NICKNAME', value: user?.nickname ?? '—' },
      { label: 'EMAIL', value: user?.email ?? '—', truncateAt: 15 },
    ];
    detailsRight = [
      { label: 'CITY', value: user?.city ?? '—', withColon: false },
      { label: 'COUNTRY', value: user?.country ?? '—', withColon: true },
      { label: 'MEMBER SINCE', value: memberSince, withColon: true },
    ];
  } else if (r === PROFILE_OVERVIEW_ROLE.SPONSOR) {
    detailsLeft = [
      { label: 'PHONE', value: user?.phone ?? '—' },
      { label: 'NICKNAME', value: user?.nickname ?? '—' },
      { label: 'EMAIL', value: user?.email ?? '—', truncateAt: 15 },
    ];
    detailsRight = [
      { label: 'CITY', value: user?.city ?? '—', withColon: false },
      { label: 'COUNTRY', value: user?.country ?? '—', withColon: true },
      { label: 'MEMBER SINCE', value: memberSince, withColon: true },
    ];
  }

  return (
    <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH}`}>
      <UserEdit open={editOpen} onOpenChange={setEditOpen} />

      <div className="flex flex-wrap items-center justify-end gap-4 py-4">
        <button type="button" className={EDIT_PROFILE_BUTTON_CLASS} onClick={() => setEditOpen(true)}>
          EDIT
          <img src={editProfileIcon} alt="" width={16} height={16} className="shrink-0" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6 py-6">
        <div className="flex flex-col gap-5">
          {detailsLeft.map((item) => (
            <DetailRow key={item.label} label={item.label} value={item.value} truncateAt={item.truncateAt} />
          ))}
        </div>
        <div className="flex flex-col gap-5">
          {detailsRight.map((item) => (
            <DetailRow key={item.label} label={item.label} value={item.value} withColon={item.withColon ?? true} />
          ))}
        </div>
      </div>
    </div>
  );
}
