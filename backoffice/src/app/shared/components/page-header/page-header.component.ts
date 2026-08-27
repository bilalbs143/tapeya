import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';

export interface PageHeaderBreadcrumb {
  title: string;
  url?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatButtonModule, TablerIconsModule, RouterLink],
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  private readonly route = inject(ActivatedRoute);

  @Input() public title = '';
  @Input() public icon = '';
  @Input() public subtitle = '';
  @Input() public badge: number | null = null;
  @Input() public breadcrumbs: PageHeaderBreadcrumb[] = [];
  @Input() public showBreadcrumbs = true;
  @Input() public showFiltersToggle = true;
  @Input() public filtersOpen = false;

  @Output() public readonly filtersToggled = new EventEmitter<void>();

  public get resolvedIcon(): string {
    if (this.icon) return this.icon;
    return (this.route.snapshot.data['icon'] as string | undefined) ?? '';
  }

  public get resolvedBreadcrumbs(): PageHeaderBreadcrumb[] {
    if (this.breadcrumbs.length > 0) return this.breadcrumbs;
    const urls = this.route.snapshot.data['urls'] as PageHeaderBreadcrumb[] | undefined;
    return urls ?? [];
  }
}
