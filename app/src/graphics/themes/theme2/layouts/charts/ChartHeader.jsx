import { FsPageHeader } from '../shared/FsPageHeader';

/**
 * Shared FS chart page header — worm, Manhattan, wagon wheel.
 * Same FsPageHeader band as other full-screens; right inset clears ChartRightCrests.
 */
export function ChartHeader({ title, sub, logoUrl }) {
  return (
    <FsPageHeader
      title={title}
      sub={sub}
      size="lg"
      logoUrl={logoUrl}
      logoAlt={title || 'Tournament'}
      logoVariant="tournament"
      className="right-[400px]"
    />
  );
}
