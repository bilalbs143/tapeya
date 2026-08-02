/**
 * Full-screen page header — theme1 placement + type scale on theme2 stages.
 * Absolute top band: optional logo + title + sub.
 * Logo: team crest (session team color plate) or tournament crest (wine plate).
 */
import { cn } from '@/lib/utils';

import { fsSummaryPanel } from '../../config';
import { TeamLogoOrCrest } from '../../primitives';
import {
  FS_HEADER_SUB,
  FS_MATCH_PAGE_TITLE,
  FS_PAGE_TITLE_LG,
  FS_PAGE_TITLE_MD,
  FS_PANEL_SUB,
  FS_PANEL_TITLE,
  FS_SECTION_TITLE,
  FS_TITLE_SHADOW,
  fsFont,
} from './fsTypographyStyles';

const DEFAULT_LOGO_SIZE = 104;

const TITLE_BY_SIZE = {
  md: { className: FS_PAGE_TITLE_MD, px: fsSummaryPanel.pageTitleMd },
  lg: { className: FS_PAGE_TITLE_LG, px: fsSummaryPanel.pageTitleLg },
  section: { className: FS_SECTION_TITLE, px: fsSummaryPanel.sectionTitle },
  panel: { className: cn(FS_PANEL_TITLE, FS_TITLE_SHADOW), px: fsSummaryPanel.panelTitle },
  match: { className: FS_MATCH_PAGE_TITLE, px: fsSummaryPanel.matchPageTitle },
};

/**
 * @param {{
 *   title?: string|null,
 *   sub?: string|null,
 *   size?: 'md' | 'lg' | 'section' | 'panel' | 'match',
 *   logoUrl?: string|null,
 *   logoCode?: string|null,
 *   logoAlt?: string|null,
 *   logoSize?: number,
 *   logoVariant?: 'team' | 'tournament',
 *   logoAccent?: string|null,
 *   logoTeam?: object|null,
 *   className?: string,
 *   absolute?: boolean,
 * }} props
 */
export function FsPageHeader({
  title,
  sub,
  size = 'md',
  logoUrl = null,
  logoCode = null,
  logoAlt = null,
  logoSize = DEFAULT_LOGO_SIZE,
  logoVariant = 'tournament',
  logoAccent = null,
  logoTeam = null,
  className,
  absolute = true,
}) {
  const hasLogo = Boolean(logoUrl || logoCode || logoTeam);
  if (!title && !sub && !hasLogo) return null;

  const titleSpec = TITLE_BY_SIZE[size] ?? TITLE_BY_SIZE.md;
  const subClass = size === 'panel' || size === 'match' ? FS_PANEL_SUB : FS_HEADER_SUB;
  const subPx = size === 'panel' || size === 'match' ? fsSummaryPanel.panelSub : fsSummaryPanel.headerSub;

  return (
    <div
      className={cn(absolute && 'absolute top-14 right-16 left-16 z-[3]', 'flex items-start gap-7', className)}
      data-testid="fs-page-header"
    >
      {hasLogo ? (
        <TeamLogoOrCrest
          logoUrl={logoUrl}
          shortName={logoCode}
          name={logoAlt || title || logoCode}
          team={logoTeam}
          accent={logoAccent}
          variant={logoVariant}
          size={logoSize}
          data-testid="fs-page-header-logo"
        />
      ) : null}

      <div className="min-w-0 flex-1 pt-1">
        {title ? (
          <h2 className={titleSpec.className} style={fsFont(titleSpec.px)}>
            {title}
          </h2>
        ) : null}
        {sub ? (
          <p className={cn(subClass, title && 'mt-1')} style={fsFont(subPx)}>
            {sub}
          </p>
        ) : null}
      </div>
    </div>
  );
}
