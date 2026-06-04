import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const TEAM_MATCH_ICON = `${CLOUDFRONT_APP_BASE}/images/icons/team-match-icon.svg`;
const TEAM_ICON = `${CLOUDFRONT_APP_BASE}/images/icons/team-icon.svg`;
const TEAM_LOGO_STANDARD = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

/**
 * Per-context team logo fallbacks. Update a variant here to retune one surface
 * without touching shared TeamLogo usage.
 *
 * fallbackType: 'image' — static asset when team has no logo (or load fails)
 * fallbackType: 'initial' — first letter of team name
 */
export const TEAM_LOGO_VARIANTS = {
  /** Organizer team cards (saved teams, add squad, squad editor). */
  organizerCard: {
    fallbackType: 'initial',
    fallbackSrc: null,
    containerClass: 'flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#0d0d0b]',
    imgClass: 'h-full w-full object-contain',
    initialClass: 'flex h-full w-full items-center justify-center text-[18px] font-bold text-white',
  },
  /** Team picker rows (Select Team dialog). */
  dialogSelect: {
    fallbackType: 'image',
    fallbackSrc: TEAM_MATCH_ICON,
    containerClass: 'flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden',
    imgClass: 'h-6 w-6 object-contain',
    initialClass: '',
  },
  /** Toss / match setup dialogs. */
  dialog: {
    fallbackType: 'image',
    fallbackSrc: TEAM_MATCH_ICON,
    containerClass: null,
    imgClass: 'h-8 w-8 shrink-0 object-contain',
    initialClass: '',
  },
  /** Create fixture team cards. */
  match: {
    fallbackType: 'image',
    fallbackSrc: TEAM_MATCH_ICON,
    containerClass: null,
    imgClass: 'h-10 w-10 shrink-0 object-contain',
    initialClass: '',
  },
  /** Fixture list rows. */
  fixture: {
    fallbackType: 'image',
    fallbackSrc: TEAM_MATCH_ICON,
    containerClass: 'flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden',
    imgClass: 'h-6 w-6 object-contain',
    initialClass: '',
  },
  /** Scorecard match cards (inline avatar). */
  scorecardCard: {
    fallbackType: 'initial',
    fallbackSrc: null,
    containerClass: 'flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white',
    imgClass: 'h-5 w-5 shrink-0 rounded-md object-cover',
    initialClass: '',
  },
  /** Scorecard status / details inline flag. */
  scorecardInline: {
    fallbackType: 'initial',
    fallbackSrc: null,
    containerClass: 'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold text-white',
    imgClass: 'h-5 w-5 shrink-0 rounded-sm object-cover',
    initialClass: '',
  },
  /** Tournament teams / squad list rows. */
  list: {
    fallbackType: 'initial',
    fallbackSrc: null,
    containerClass:
      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[11px] font-bold text-[#DA9811]',
    imgClass: 'h-5 w-5 shrink-0 rounded-full object-cover',
    initialClass: '',
  },
  /** Teams tab (scorecard + upcoming). */
  teamsTab: {
    fallbackType: 'image',
    fallbackSrc: TEAM_MATCH_ICON,
    containerClass: 'flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full',
    imgClass: 'h-5 w-5 shrink-0 rounded-full object-cover',
    initialClass: '',
  },
  /** Live scoring header + scorecard team tabs. */
  scoring: {
    fallbackType: 'image',
    fallbackSrc: TEAM_MATCH_ICON,
    containerClass: null,
    imgClass: 'h-8 w-8 shrink-0 object-contain',
    initialClass: '',
  },
  /** Drafting team list / detail. */
  draft: {
    fallbackType: 'image',
    fallbackSrc: TEAM_ICON,
    containerClass: 'flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg',
    imgClass: 'h-full w-full object-contain',
    initialClass: '',
  },
  /** Default / graphics-style fallback. */
  default: {
    fallbackType: 'image',
    fallbackSrc: TEAM_LOGO_STANDARD,
    containerClass: 'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden',
    imgClass: 'h-full w-full object-contain',
    initialClass: '',
  },
};
