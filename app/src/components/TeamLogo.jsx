import { useState } from 'react';

import { TEAM_LOGO_VARIANTS } from '@/lib/constants/teamAssets';
import { extractTeamLogo, getTeamInitial } from '@/lib/utils/teamUtils';

const ACCENT_BG = {
  green: 'bg-emerald-600',
  orange: 'bg-amber-500',
};

/**
 * Renders a team logo from API data with a per-context static or initial fallback.
 *
 * @param {object} [props.team] - Team object ({ logo, name, ... }).
 * @param {string} [props.logo] - Explicit logo URL (overrides team.logo).
 * @param {string} [props.name] - Team name for initial fallback.
 * @param {keyof typeof TEAM_LOGO_VARIANTS} [props.variant='default']
 * @param {'green'|'orange'} [props.accent] - Initial background on scorecard variants.
 * @param {string} [props.className] - Extra classes on the outer container.
 * @param {string} [props.imgClassName] - Extra classes on the img element.
 * @param {boolean} [props.dimmed] - Lower opacity (e.g. inactive scorecard tab).
 */
export function TeamLogo({ team, logo, name, variant = 'default', accent, className = '', imgClassName = '', dimmed = false }) {
  const config = TEAM_LOGO_VARIANTS[variant] ?? TEAM_LOGO_VARIANTS.default;
  const resolvedLogo = logo ?? extractTeamLogo(team);
  const resolvedName = name ?? team?.name ?? '';
  const [failed, setFailed] = useState(false);

  const showDynamic = Boolean(resolvedLogo) && !failed;
  const useInitialFallback = !showDynamic && config.fallbackType === 'initial';
  const useImageFallback = !showDynamic && !useInitialFallback && Boolean(config.fallbackSrc);

  const initial = getTeamInitial(resolvedName);
  const accentClass = accent ? ACCENT_BG[accent] : '';
  const dimClass = dimmed ? 'opacity-70' : '';
  const imgClasses = [config.imgClass, imgClassName, dimClass].filter(Boolean).join(' ');

  if (showDynamic) {
    const content = <img src={resolvedLogo} alt="" className={imgClasses} onError={() => setFailed(true)} aria-hidden />;
    if (config.containerClass) {
      return <div className={[config.containerClass, className].filter(Boolean).join(' ')}>{content}</div>;
    }
    return content;
  }

  if (useInitialFallback) {
    const initialClasses = [config.containerClass, config.initialClass, accentClass, className].filter(Boolean).join(' ');
    if (initialClasses) {
      return <span className={initialClasses}>{initial}</span>;
    }
    return <span>{initial}</span>;
  }

  if (useImageFallback) {
    const content = <img src={config.fallbackSrc} alt="" className={imgClasses} aria-hidden />;
    if (config.containerClass) {
      return <div className={[config.containerClass, className].filter(Boolean).join(' ')}>{content}</div>;
    }
    return content;
  }

  return null;
}

export default TeamLogo;
