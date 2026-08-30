import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Data, NavigationEnd, Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import { AuthService } from 'src/app/services/auth.service';
import { CoreService } from 'src/app/services/core.service';
import { authUserDisplayName, authUserDisplayRole } from 'src/app/shared/functions/auth-user-display';
import { applyDocumentTheme } from 'src/app/shared/functions/theme-swap.function';

import { filterNavItems, navItemsHaveLinks } from './shared/nav/filter-nav-items';
import type { NavItem } from './shared/nav/nav-item.model';
import { getVisibleNavItems } from './shared/nav/sidebar-data';
import { HeaderComponent } from './vertical/header/header.component';
import { AppNavItemComponent } from './vertical/sidebar/nav-item/nav-item.component';
import { SidebarComponent } from './vertical/sidebar/sidebar.component';

/** Narrow viewport — overlay sidenav (hamburger). */
const OVERLAY_VIEW = 'screen and (max-width: 1023px)';
/** Tablet band — auto-collapse sidebar to mini rail. */
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';

@Component({
  selector: 'app-full',
  imports: [
    RouterModule,
    AppNavItemComponent,
    MaterialModule,
    CommonModule,
    SidebarComponent,
    NgScrollbarModule,
    TablerIconsModule,
    HeaderComponent,
  ],
  templateUrl: './full.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class FullComponent implements OnDestroy {
  private readonly settings = inject(CoreService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly auth = inject(AuthService);
  private readonly titleService = inject(Title);

  public readonly navSearchQuery = signal('');

  public readonly visibleNavItems = computed(() =>
    filterNavItems(getVisibleNavItems(this.auth.currentUser()), this.navSearchQuery())
  );

  public readonly navSearchActive = computed(() => this.navSearchQuery().trim().length > 0);

  public readonly navSearchHasResults = computed(() => navItemsHaveLinks(this.visibleNavItems()));

  public onNavSearchChange(query: string): void {
    this.navSearchQuery.set(query);
  }

  public trackNavItem(index: number, item: NavItem): string {
    return item.navCap ?? item.route ?? item.displayName ?? String(index);
  }

  public readonly sidebarUserName = computed(() => authUserDisplayName(this.auth.currentUser()));

  public readonly sidebarUserRole = computed(() => authUserDisplayRole(this.auth.currentUser()));

  public readonly sidebarUserInitials = computed(() => {
    const name = this.sidebarUserName().trim();
    if (!name) return '?';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  @ViewChild('leftsidenav')
  public sidenav!: MatSidenav;
  @ViewChild('content', { static: true }) public content!: MatSidenavContent;

  /** Current options from the service (persisted in localStorage). */
  public get options() {
    return this.settings.getOptions();
  }

  private layoutChangesSubscription = Subscription.EMPTY;
  public isOver = false;

  constructor() {
    this.layoutChangesSubscription = this.breakpointObserver.observe([OVERLAY_VIEW, TABLET_VIEW]).subscribe((state) => {
      const overlay = state.breakpoints[OVERLAY_VIEW];
      if (overlay !== this.isOver) {
        // Crossing desktop ↔ overlay: desktop starts open, overlay starts closed.
        this.options.sidenavOpened = !overlay;
      }
      this.isOver = overlay;
      if (!this.options.sidenavCollapsed) {
        this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
      }
    });
    applyDocumentTheme(this.options.theme);
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
      this.content.scrollTo({ top: 0 });
      this.syncDocumentTitle();
    });
    queueMicrotask(() => this.syncDocumentTitle());
  }

  /**
   * Sets the browser tab title from the active route's `data.title`, merged root → leaf so
   * lazy-loaded child routes (which only declare their own slice of `data`) still resolve it.
   */
  private syncDocumentTitle(): void {
    let leaf = this.router.routerState.root;
    while (leaf.firstChild) leaf = leaf.firstChild;
    if (leaf.outlet !== 'primary') return;

    const chain: ActivatedRoute[] = [];
    let r: ActivatedRoute | null = leaf;
    while (r) {
      chain.unshift(r);
      r = r.parent;
    }

    let title: unknown;
    for (const route of chain) {
      const data: Data = route.snapshot.data;
      if (data['title'] != null) title = data['title'];
    }
    if (typeof title === 'string' && title !== '') {
      this.titleService.setTitle(title);
    }
  }

  public ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  public toggleCollapsed() {
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.resetCollapsedState();
  }

  public resetCollapsedState(timer = 400) {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }

  public onSidenavOpenedChange(isOpened: boolean) {
    this.options.sidenavOpened = isOpened;
    this.settings.setOptions(this.options);
  }
}
