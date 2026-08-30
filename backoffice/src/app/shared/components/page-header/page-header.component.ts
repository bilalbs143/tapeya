import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';

import { UiButtonComponent } from 'src/app/shared/components/ui-button/ui-button.component';

export interface PageHeaderBreadcrumb {
  title: string;
  url?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [TablerIconsModule, RouterLink, UiButtonComponent],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  private readonly route = inject(ActivatedRoute);

  @Input() public title = '';
  /** @deprecated Icon tile removed from page headers; kept for call-site compat. */
  @Input() public icon = '';
  @Input() public subtitle = '';
  @Input() public badge: number | null = null;
  @Input() public breadcrumbs: PageHeaderBreadcrumb[] = [];
  @Input() public showBreadcrumbs = true;
  @Input() public showFiltersToggle = true;
  @Input() public filtersOpen = false;
  /**
   * Hides the title/subtitle/badge row, leaving breadcrumbs + pageActions.
   * For detail shells that already show a richer hero title.
   */
  @Input() public showTitle = true;

  @Output() public readonly filtersToggled = new EventEmitter<void>();

  public get resolvedBreadcrumbs(): PageHeaderBreadcrumb[] {
    if (this.breadcrumbs.length > 0) return this.breadcrumbs;
    const urls = this.route.snapshot.data['urls'] as PageHeaderBreadcrumb[] | undefined;
    return urls ?? [];
  }
}
