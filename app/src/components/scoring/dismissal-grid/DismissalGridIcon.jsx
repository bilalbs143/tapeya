import dismissalBowledUrl from '@/assets/images/icons/dismissal-bowled.svg';
import dismissalCaughtUrl from '@/assets/images/icons/dismissal-caught.svg';
import dismissalCaughtBowledUrl from '@/assets/images/icons/dismissal-caught-bowled.svg';
import dismissalCaughtBehindUrl from '@/assets/images/icons/dismissal-caught-behind.svg';
import dismissalDefaultUrl from '@/assets/images/icons/dismissal-default.svg';
import dismissalHitBallTwiceUrl from '@/assets/images/icons/dismissal-hit-ball-twice.svg';
import dismissalHitWicketUrl from '@/assets/images/icons/dismissal-hit-wicket.svg';
import dismissalLbwUrl from '@/assets/images/icons/dismissal-lbw.svg';
import dismissalMankadUrl from '@/assets/images/icons/dismissal-mankad.svg';
import dismissalNoBallWicketUrl from '@/assets/images/icons/dismissal-no-ball-wicket.svg';
import dismissalObstructingUrl from '@/assets/images/icons/dismissal-obstructing.svg';
import dismissalRetiredUrl from '@/assets/images/icons/dismissal-retired.svg';
import dismissalRetiredHurtUrl from '@/assets/images/icons/dismissal-retired-hurt.svg';
import dismissalRunOutUrl from '@/assets/images/icons/dismissal-run-out.svg';
import dismissalStumpedUrl from '@/assets/images/icons/dismissal-stumped.svg';
import dismissalTimedOutUrl from '@/assets/images/icons/dismissal-timed-out.svg';
import dismissalWideWicketUrl from '@/assets/images/icons/dismissal-wide-wicket.svg';
import { CdnIcon } from '@/ui/CdnIcon';

const DISMISSAL_ICON_URLS = {
  bowled:                dismissalBowledUrl,
  caught:                dismissalCaughtUrl,
  caught_bowled:         dismissalCaughtBowledUrl,
  caught_behind:         dismissalCaughtBehindUrl,
  lbw:                   dismissalLbwUrl,
  obstructing_the_field: dismissalObstructingUrl,
  run_out:               dismissalRunOutUrl,
  mankad:                dismissalMankadUrl,
  stumped:               dismissalStumpedUrl,
  retired_hurt:          dismissalRetiredHurtUrl,
  retired:               dismissalRetiredUrl,
  hit_wicket:            dismissalHitWicketUrl,
  hit_ball_twice:        dismissalHitBallTwiceUrl,
  timed_out:             dismissalTimedOutUrl,
  wide_wicket:           dismissalWideWicketUrl,
  no_ball_wicket:        dismissalNoBallWicketUrl,
  default:               dismissalDefaultUrl,
};

/**
 * @param {{ iconKey?: string, className?: string }} props
 */
export function DismissalGridIcon({ iconKey = 'default', className = 'h-7 w-7' }) {
  const src = DISMISSAL_ICON_URLS[iconKey] ?? DISMISSAL_ICON_URLS.default;
  return <CdnIcon src={src} className={className} />;
}

export default DismissalGridIcon;
