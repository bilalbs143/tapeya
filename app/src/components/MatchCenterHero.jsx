import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import { NAVBAR_HERO_CONTROL_OFFSET } from '@/lib/constants/layout';

/**
 * Full-width match center banner with back control and optional footer slot (e.g. tab strip).
 */
export function MatchCenterHero({ imageSrc, onBack, children }) {
  return (
    <header className="-mx-4 pb-10">
      <div className="relative w-full">
        <img src={imageSrc} alt="" className="block h-auto w-full" aria-hidden />

        <div
          className="absolute inset-x-0 top-0 flex items-start px-4"
          style={{ paddingTop: NAVBAR_HERO_CONTROL_OFFSET }}
        >
          <AppSubpageBackButton onClick={onBack} />
        </div>

        {children}
      </div>
    </header>
  );
}
