import { MediaMatcher } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LocalStorageService } from '../../../../shared/services/local-storage.service';
import { navItemsAdmin, navItemsAgent } from '../../../shared/sidebar-data';
import { NavItem } from '../../vertical/sidebar/nav-item/nav-item';

import { AppHorizontalNavItemComponent } from './nav-item/nav-item.component';

@Component({
  selector: 'app-horizontal-sidebar',
  imports: [AppHorizontalNavItemComponent, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class AppHorizontalSidebarComponent {
  router = inject(Router);
  localStorageService = inject(LocalStorageService);

  public navItems: NavItem[] = [];
  public mobileQuery: MediaQueryList;
  public user: any;
  private readonly _mobileQueryListener: () => void;

  constructor() {
    const media = inject(MediaMatcher);
    const changeDetectorRef = inject(ChangeDetectorRef);

    this.mobileQuery = media.matchMedia('(min-width: 1100px)');
    this._mobileQueryListener = (): void => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.user = this.localStorageService.get('user');

    if (this.user.typeEnum === 'ADMINISTRATOR') {
      this.navItems = navItemsAdmin;
    } else {
      this.navItems = navItemsAgent;
    }
  }
}
