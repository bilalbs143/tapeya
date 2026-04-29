import { MediaMatcher } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NavService } from '../../../../services/nav.service';
import { getVisibleNavItems } from '../../shared/nav/sidebar-data';

import { AppHorizontalNavItemComponent } from './nav-item/nav-item.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-horizontal-sidebar',
  imports: [AppHorizontalNavItemComponent, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class AppHorizontalSidebarComponent implements OnInit {
  private readonly navService = inject(NavService);
  private readonly router = inject(Router);
  private readonly media = inject(MediaMatcher);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly auth = inject(AuthService);

  public readonly visibleNavItems = computed(() => getVisibleNavItems(this.auth.currentUser()));
  public parentActive = '';
  public mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor() {
    this.mobileQuery = this.media.matchMedia('(min-width: 1100px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.router.events.subscribe(() => (this.parentActive = this.router.url.split('/')[1]));
  }

  public ngOnInit(): void {
    this.parentActive = this.router.url.split('/')[1];
    this.router.events.subscribe(() => {
      this.parentActive = this.router.url.split('/')[1];
    });
  }
}
