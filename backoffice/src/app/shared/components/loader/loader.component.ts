import { Component, Input } from '@angular/core';

/**
 * App-wide loading spinner — the single source of truth for "is something loading" UI.
 * Replaces every bare `mat-spinner` and plain "Loading…" text across the backoffice.
 * Never render a visible "Loading…" caption next to it — the ring is the only indicator;
 * `label` is screen-reader-only text carried via `role="status"/aria-label`.
 *
 * Decorative by default (`label=null`) — pass `label` only when nothing else on screen already
 * announces the loading state; otherwise it's a redundant screen-reader message. For a centered
 * card/tab/dialog body loading state, use `<app-loader-block>` instead — it owns the wrapper,
 * centering, and a11y announcement so this stays a bare, unopinionated ring.
 *
 * `[diameter]` mirrors the old `mat-spinner` API 1:1 (px), so existing call sites swap in unchanged.
 *
 * <app-loader />                        — bare decorative ring, drop inline (buttons, next to text)
 * <app-loader [tone]="'light'" />       — white ring for use inside a filled/colored button
 */
@Component({
  selector: 'app-loader',
  standalone: true,
  templateUrl: './loader.component.html',
})
export class LoaderComponent {
  @Input() public diameter: number = 40;
  @Input() public label: string | null = null;
  @Input() public tone: 'primary' | 'light' = 'primary';

  public get toneClass(): string {
    return this.tone === 'light' ? 'border-white/30 border-t-white' : 'border-border border-t-primary border-r-primary/50';
  }

  public get glowStyle(): string {
    return this.tone === 'light' ? '' : 'box-shadow: 0 0 14px -2px color-mix(in srgb, var(--mat-sys-primary) 45%, transparent)';
  }

  public get borderWidth(): number {
    if (this.diameter <= 22) return 2;
    if (this.diameter <= 32) return 2.5;
    if (this.diameter <= 42) return 3;
    return 3.5;
  }
}
