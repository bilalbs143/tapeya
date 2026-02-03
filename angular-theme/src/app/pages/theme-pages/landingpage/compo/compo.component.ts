import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { CommonModule, ViewportScroller } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, signal, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { filter, Subscription } from 'rxjs';
import { BrandingComponent } from 'src/app/layouts/full/vertical/sidebar/branding.component';
import { MaterialModule } from 'src/app/material.module';
import { CoreService } from 'src/app/services/core.service';
import { NavService } from 'src/app/services/nav.service';
import { navItems } from './sidebar-data';
import { AppNavItemComponent } from './nav-item/nav-item.component';
import { NavItem } from './nav-item/nav-item';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';
const BELOWMONITOR = 'screen and (max-width: 1023px)';

interface apps {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface quicklinks {
  id: number;
  title: string;
  link: string;
}

interface demos {
  id: number;
  name: string;
  url: string;
  imgSrc: string;
}

@Component({
  selector: 'app-compo',
  imports: [MaterialModule, TablerIconsModule, RouterLink, BrandingComponent, CommonModule, RouterModule, AppNavItemComponent, NgScrollbarModule, MatFormFieldModule, MatInputModule, FormsModule, MatSidenavModule],
  templateUrl: './compo.component.html',
  styleUrls: ['./compo.component.scss']
})
export class AppCompoComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleMobileCompoNav = new EventEmitter<void>();

  // scroll to demos
  gotoDemos() {
    this.scroller.scrollToAnchor('demos');
  }
  

  navItems = navItems;

  searchTerm = signal('');


  filteredNavItems = signal<NavItem[]>(navItems);


  search(term: string) {
    this.searchTerm.set(term);
    const lowerTerm = term.toLowerCase();

    if (!lowerTerm) {
      this.filteredNavItems.set(this.navItems);
    } else {
      this.filteredNavItems.set(
        this.navItems.filter(
          item => item.displayName && item.displayName.toLowerCase().includes(lowerTerm)
        )
      );
    }
  }


  @ViewChild('leftsidenav')
  public sidenav: MatSidenav;
  resView = false;
  @ViewChild('content', { static: true }) content!: MatSidenavContent;
  //get options from service
  options = this.settings.getOptions();
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;

  get isOver(): boolean {
    return this.isMobileScreen;
  }

  get isTablet(): boolean {
    return this.resView;
  }

  constructor(
    private settings: CoreService,
    private scroller: ViewportScroller,
    private mediaMatcher: MediaMatcher,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private navService: NavService, private cdr: ChangeDetectorRef
  ) {
    this.htmlElement = document.querySelector('html')!;
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW, BELOWMONITOR])
      .subscribe((state) => {
        // SidenavOpened must be reset true when layout changes
        this.options.sidenavOpened = true;
        this.isMobileScreen = state.breakpoints[BELOWMONITOR];
        if (this.options.sidenavCollapsed == false) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
        }
        this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
        this.resView = state.breakpoints[BELOWMONITOR];
      });

    // This is for scroll to top
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((e) => {
        this.content.scrollTo({ top: 0 });
      });
  }

  isFilterNavOpen = false;

  toggleFilterNav() {
    this.isFilterNavOpen = !this.isFilterNavOpen;
    console.log('Sidebar open:', this.isFilterNavOpen);
    this.cdr.detectChanges(); // Ensures Angular updates the view
  }

  isCompoNavOpen = false;

  toggleCompoNav() {
    this.isCompoNavOpen = !this.isCompoNavOpen;
    console.log('Sidebar open:', this.isCompoNavOpen);
    this.cdr.detectChanges(); // Ensures Angular updates the view
  }

  ngOnInit(): void { }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  toggleCollapsed() {
    this.isContentWidthFixed = false;
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.resetCollapsedState();
  }

  resetCollapsedState(timer = 400) {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
    this.options.sidenavOpened = isOpened;
    this.settings.setOptions(this.options);
  }


  apps: apps[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-dd-chat.svg',
      title: 'Chat Application',
      subtitle: 'Messages & Emails',
      link: '/apps/chat',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-dd-cart.svg',
      title: 'Todo App',
      subtitle: 'New task',
      link: '/apps/todo',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-dd-invoice.svg',
      title: 'Invoice App',
      subtitle: 'Get latest invoice',
      link: '/apps/invoice',
    },
    {
      id: 4,
      img: '/assets/images/svgs/icon-dd-date.svg',
      title: 'Calendar App',
      subtitle: 'Get Dates',
      link: '/apps/calendar',
    },
    {
      id: 5,
      img: '/assets/images/svgs/icon-dd-mobile.svg',
      title: 'Contact Application',
      subtitle: '2 Unsaved Contacts',
      link: '/apps/contacts',
    },
    {
      id: 6,
      img: '/assets/images/svgs/icon-dd-lifebuoy.svg',
      title: 'Tickets App',
      subtitle: 'Create new ticket',
      link: '/apps/tickets',
    },
    {
      id: 7,
      img: '/assets/images/svgs/icon-dd-message-box.svg',
      title: 'Email App',
      subtitle: 'Get new emails',
      link: '/apps/email/inbox',
    },
    {
      id: 8,
      img: '/assets/images/svgs/icon-dd-application.svg',
      title: 'Contact List',
      subtitle: 'Create new contact',
      link: '/apps/contact-list',
    },
  ];

  demos: demos[] = [
    {
      id: 1,
      imgSrc: '/assets/images/landingpage/demos/demo-main.png',
      name: 'Main',
      url: 'https://tailwind-angular.netlify.app/dashboards/dashboard1',
    },
    {
      id: 2,
      imgSrc: '/assets/images/landingpage/demos/demo-dark.png',
      name: 'Dark',
      url: 'https://tailwind-angular-dark.netlify.app/dashboards/dashboard2',
    },
    {
      id: 3,
      imgSrc: '/assets/images/landingpage/demos/demo-rtl.png',
      name: 'RTL',
      url: 'https://tailwind-angular-rtl.netlify.app/dashboards/dashboard1',
    },
    {
      id: 4,
      imgSrc: '/assets/images/landingpage/demos/demo-minisidebar.png',
      name: 'Minisidebar',
      url: 'https://tailwind-angular-minisidebar.netlify.app/dashboards/dashboard1',
    },
    {
      id: 5,
      imgSrc: '/assets/images/landingpage/demos/demo-horizontal.png',
      name: 'Horizontal',
      url: 'https://tailwind-angular-horizontal.netlify.app/dashboards/dashboard2',
    },
  ];

  appdemos: demos[] = [
    {
      id: 1,
      imgSrc: '/assets/images/landingpage/apps/app-calendar.jpg',
      name: 'Calendar',
      url: 'https://tailwind-angular.netlify.app/apps/calendar',
    },
    {
      id: 2,
      imgSrc: '/assets/images/landingpage/apps/app-chat.jpg',
      name: 'Chat',
      url: 'https://tailwind-angular.netlify.app/apps/chat',
    },
    {
      id: 3,
      imgSrc: '/assets/images/landingpage/apps/app-contact.jpg',
      name: 'Contact',
      url: 'https://tailwind-angular.netlify.app/apps/contacts',
    },
    {
      id: 4,
      imgSrc: '/assets/images/landingpage/apps/app-email.jpg',
      name: 'Email',
      url: 'https://tailwind-angular.netlify.app/apps/email/inbox',
    },
    {
      id: 5,
      imgSrc: '/assets/images/landingpage/apps/app-contact-list.jpg',
      name: 'Contact List',
      url: 'https://tailwind-angular.netlify.app/apps/contact-list',
    },
    {
      id: 6,
      imgSrc: '/assets/images/landingpage/apps/app-employee.jpg',
      name: 'Employee',
      url: 'https://tailwind-angular.netlify.app/apps/employee',
    },
    {
      id: 7,
      imgSrc: '/assets/images/landingpage/apps/app-note.jpg',
      name: 'Notes',
      url: 'https://tailwind-angular.netlify.app/apps/notes',
    },
    {
      id: 8,
      imgSrc: '/assets/images/landingpage/apps/app-ticket.jpg',
      name: 'Tickets',
      url: 'https://tailwind-angular.netlify.app/apps/tickets',
    },
    {
      id: 9,
      imgSrc: '/assets/images/landingpage/apps/app-invoice.jpg',
      name: 'Invoice',
      url: 'https://tailwind-angular.netlify.app/apps/invoice',
    },
    {
      id: 10,
      imgSrc: '/assets/images/landingpage/apps/app-todo.jpg',
      name: 'Todo',
      url: 'https://tailwind-angular.netlify.app/apps/todo',
    },
    {
      id: 11,
      imgSrc: '/assets/images/landingpage/apps/app-taskboard.jpg',
      name: 'Kanban',
      url: 'https://tailwind-angular.netlify.app/apps/kanban',
    },
    {
      id: 12,
      imgSrc: '/assets/images/landingpage/apps/app-blog.jpg',
      name: 'Blog List',
      url: 'https://tailwind-angular.netlify.app/apps/blog/post',
    },
  ];

  quicklinks: quicklinks[] = [
    {
      id: 1,
      title: 'Pricing Page',
      link: '/theme-pages/pricing',
    },
    {
      id: 2,
      title: 'Authentication Design',
      link: '/authentication/login',
    },
    {
      id: 3,
      title: 'Register Now',
      link: '/authentication/side-register',
    },
    {
      id: 4,
      title: '404 Error Page',
      link: '/authentication/error',
    },
    {
      id: 5,
      title: 'Notes App',
      link: '/apps/notes',
    },
    {
      id: 6,
      title: 'Employee App',
      link: '/apps/employee',
    },
    {
      id: 7,
      title: 'Todo Application',
      link: '/apps/todo',
    },
    {
      id: 8,
      title: 'Treeview',
      link: '/theme-pages/treeview',
    },
  ];
}
