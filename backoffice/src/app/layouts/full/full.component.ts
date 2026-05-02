import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, ViewChild, ViewEncapsulation, computed, inject } from '@angular/core';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { NavService } from '../../services/nav.service';

import { AppSettings } from 'src/app/config';
import { MaterialModule } from 'src/app/material.module';
import { AuthService } from 'src/app/services/auth.service';
import { CoreService } from 'src/app/services/core.service';
import { authUserDisplayName, authUserDisplayRole } from 'src/app/shared/functions/auth-user-display';

import { AppHorizontalHeaderComponent } from './horizontal/header/header.component';
import { AppHorizontalSidebarComponent } from './horizontal/sidebar/sidebar.component';
import { AppBreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';
import { CustomizerComponent } from './shared/customizer/customizer.component';
import { getVisibleNavItems } from './shared/nav/sidebar-data';
import { HeaderComponent } from './vertical/header/header.component';
import { AppNavItemComponent } from './vertical/sidebar/nav-item/nav-item.component';
import { SidebarComponent } from './vertical/sidebar/sidebar.component';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';
const BELOWMONITOR = 'screen and (max-width: 1023px)';

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
    AppHorizontalHeaderComponent,
    AppHorizontalSidebarComponent,
    AppBreadcrumbComponent,
    CustomizerComponent,
  ],
  templateUrl: './full.component.html',

  encapsulation: ViewEncapsulation.None,
})
export class FullComponent implements OnDestroy {
  private readonly settings = inject(CoreService);
  private readonly mediaMatcher = inject(MediaMatcher);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly navService = inject(NavService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly auth = inject(AuthService);

  public readonly visibleNavItems = computed(() => getVisibleNavItems(this.auth.currentUser()));

  public readonly sidebarUserName = computed(() => authUserDisplayName(this.auth.currentUser()));

  public readonly sidebarUserRole = computed(() => authUserDisplayRole(this.auth.currentUser()));

  @ViewChild('leftsidenav')
  public sidenav: MatSidenav;
  public resView = false;
  @ViewChild('content', { static: true }) public content!: MatSidenavContent;

  /** Current options from the service (persisted in localStorage). */
  public get options(): AppSettings {
    return this.settings.getOptions();
  }
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;

  public get isOver(): boolean {
    return this.isMobileScreen;
  }

  public get isTablet(): boolean {
    return this.resView;
  }

  /** Hide breadcrumb on dashboard routes (cricket + ecommerce). */
  public get showBreadcrumb(): boolean {
    const path = this.router.url.split('?')[0];
    return path !== '/dashboard' && path !== '/ecommerce';
  }

  constructor() {
    this.htmlElement = document.querySelector('html')!;
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW, BELOWMONITOR])
      .subscribe((state) => {
        this.options.sidenavOpened = true;
        this.isMobileScreen = state.breakpoints[BELOWMONITOR];
        if (this.options.sidenavCollapsed === false) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
        }
        this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
        this.resView = state.breakpoints[BELOWMONITOR];
      });
    this.receiveOptions(this.options);
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
      this.content.scrollTo({ top: 0 });
    });
  }

  public isFilterNavOpen = false;

  public toggleFilterNav() {
    this.isFilterNavOpen = !this.isFilterNavOpen;
    this.cdr.detectChanges();
  }

  public ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  public toggleCollapsed() {
    this.isContentWidthFixed = false;
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.resetCollapsedState();
  }

  public resetCollapsedState(timer = 400) {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }

  public onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  public onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
    this.options.sidenavOpened = isOpened;
    this.settings.setOptions(this.options);
  }

  public receiveOptions(options: AppSettings): void {
    this.toggleDarkTheme(options);
    this.toggleColorsTheme(options);
  }

  private toggleDarkTheme(options: AppSettings) {
    if (options.theme === 'dark') {
      this.htmlElement.classList.add('dark-theme');
      this.htmlElement.classList.remove('light-theme');
    } else {
      this.htmlElement.classList.remove('dark-theme');
      this.htmlElement.classList.add('light-theme');
    }
  }

  private toggleColorsTheme(options: AppSettings) {
    // Remove any existing theme class dynamically
    this.htmlElement.classList.forEach((className) => {
      if (className.endsWith('_theme')) {
        this.htmlElement.classList.remove(className);
      }
    });

    // Add the selected theme class
    this.htmlElement.classList.add(options.activeTheme);
  }
}
