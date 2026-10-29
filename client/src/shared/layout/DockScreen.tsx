import type { ReactNode } from 'react';

import { PageDock } from './PageDock';
import { ScreenBar } from './ScreenBar';

type DockScreenProps = {
  title: string;
  subtitle?: string | undefined;
  onBack: () => void;
  action?: ReactNode | undefined;
  below?: ReactNode | undefined;
  slideTitle?: boolean | undefined;
  footer?: ReactNode | undefined;
  /**
   * `scroll` (default) — dock-scroll lists/forms.
   * `fill` — dock-fill stage between header and footer (Create Reel preview).
   */
  body?: 'scroll' | 'fill' | undefined;
  className?: string | undefined;
  children: ReactNode;
};

/**
 * PageDock + ScreenBar for dock-scroll / dock-fill pages.
 * Prefer this over hand-rolling both. Immersive / Home feed stay outside PageDock.
 */
export function DockScreen({
  title,
  subtitle,
  onBack,
  action,
  below,
  slideTitle,
  footer,
  body = 'scroll',
  className,
  children,
}: DockScreenProps) {
  return (
    <PageDock
      className={className}
      body={body}
      header={
        <ScreenBar
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          action={action}
          below={below}
          slideTitle={slideTitle}
        />
      }
      footer={footer}
    >
      {children}
    </PageDock>
  );
}
