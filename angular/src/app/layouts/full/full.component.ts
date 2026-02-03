import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, inject, ChangeDetectorRef } from '@angular/core';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TablerIconComponent } from '@luoxiao123/angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppSettings } from 'src/app/app.config';
import { MaterialModule } from 'src/app/material.module';
import { CoreService } from 'src/app/services/core.service';

import { AuthService } from '../../shared/auth/auth.service';
import { CustomizerButtonService } from '../../shared/services/customizer-button.service';
import { SystemService } from '../../shared/services/system.service';
import { LoggedInUser } from '../../shared/types/types';
import { navItemsAdmin, navItemsAgent } from '../shared/sidebar-data';

import { AppHorizontalHeaderComponent } from './horizontal/header/header.component';
import { AppHorizontalSidebarComponent } from './horizontal/sidebar/sidebar.component';
import { AppBreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';
import { CustomizerComponent } from './shared/customizer/customizer.component';
import { HeaderComponent } from './vertical/header/header.component';
import { NavItem } from './vertical/sidebar/nav-item/nav-item';
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
    TablerIconComponent,
    HeaderComponent,
    AppHorizontalHeaderComponent,
    AppHorizontalSidebarComponent,
    AppBreadcrumbComponent,
    CustomizerComponent,
    TranslateModule,
  ],
  templateUrl: './full.component.html',
  styleUrls: [],
  encapsulation: ViewEncapsulation.None,
})
export class FullComponent implements OnInit, OnDestroy {
  private settings = inject(CoreService);
  private router = inject(Router);
  private systemService = inject(SystemService);
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private customizerButtonService = inject(CustomizerButtonService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('customizerRight') public customizerRight!: MatSidenav;
  public navItems: NavItem[] = [];
  public loggedInUser: LoggedInUser;
  public systemInfo: any;
  public isFilterNavOpen: boolean = false;

  @ViewChild('leftsidenav')
  public sidenav: MatSidenav;
  public resView = false;
  @ViewChild('content', { static: true }) public content!: MatSidenavContent;

  public options = this.settings.getOptions();
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

  constructor() {
    this.loggedInUser = this.authService.getLoggedInUser();
    this.htmlElement = document.querySelector('html')!;
    this.layoutChangesSubscription = this.breakpointObserver.observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW, BELOWMONITOR]).subscribe((state) => {
      // SidenavOpened must be reset true when layout changes
      this.options.sidenavOpened = true;
      this.isMobileScreen = state.breakpoints[MOBILE_VIEW];
      if (!this.options.sidenavCollapsed) {
        this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
      }
      this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
      this.resView = state.breakpoints[BELOWMONITOR];
    });

    if (this.loggedInUser.typeEnum === 'ADMINISTRATOR') {
      this.navItems = navItemsAdmin;
    } else {
      this.navItems = navItemsAgent;
    }

    // Initialize project theme with options
    this.receiveOptions(this.options);

    // This is for scroll to top
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.content.scrollTo({ top: 0 });
    });
  }

  public ngOnInit(): void {
    this.customizerButtonService.isCustomizerOpen$.subscribe(() => {
      if (this.customizerRight) {
        this.customizerRight.toggle();
      }
    });

    this.getSystemInfo();
  }

  public getSystemInfo(): void {
    this.systemService.get().subscribe({
      next: (response) => {
        this.systemInfo = response.data || null;
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }

  public ngOnDestroy(): void {
    this.layoutChangesSubscription.unsubscribe();
  }

  public toggleCollapsed(): void {
    this.isContentWidthFixed = false;
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.resetCollapsedState();
  }

  public toggleFilterNav(): void {
    this.isFilterNavOpen = !this.isFilterNavOpen;
    console.log('Sidebar open:', this.isFilterNavOpen);
    this.cdr.detectChanges(); // Ensures Angular updates the view
  }

  private resetCollapsedState(timer = 400): void {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }

  public onSidenavClosedStart(): void {
    this.isContentWidthFixed = false;
  }

  public onSidenavOpenedChange(isOpened: boolean): void {
    this.isCollapsedWidthFixed = !this.isOver;
    this.options.sidenavOpened = isOpened;
    this.settings.setOptions(this.options);
  }

  public receiveOptions(options: AppSettings): void {
    this.options = { ...this.options, ...options };
    this.toggleDarkTheme(options);
    this.toggleColorsTheme(options);
  }

  private toggleDarkTheme(options: AppSettings): void {
    this.htmlElement.classList.remove('dark-theme', 'light-theme');
    if (options.theme === 'dark') {
      this.htmlElement.classList.add('dark-theme');
    } else {
      this.htmlElement.classList.add('light-theme');
    }
  }

  private toggleColorsTheme(options: AppSettings): void {
    const classList = Array.from(this.htmlElement.classList);
    classList.forEach((className) => {
      if (className.endsWith('_theme')) {
        this.htmlElement.classList.remove(className);
      }
    });
    this.htmlElement.classList.add(options.activeTheme);
  }

  public logout(): void {
    this.authService.logout(true);
  }
}
