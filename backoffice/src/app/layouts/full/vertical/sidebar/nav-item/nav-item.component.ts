import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, inject, Input, OnChanges, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';

import { NavService } from '../../../../../services/nav.service';

import { MaterialModule } from 'src/app/material.module';

import { NavItem } from '../../../shared/nav/nav-item.model';

@Component({
  selector: 'app-nav-item',
  imports: [TablerIconsModule, MaterialModule, CommonModule],
  templateUrl: './nav-item.component.html',
  styleUrls: [],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
    ]),
  ],
})
export class AppNavItemComponent implements OnChanges {
  @Output() public readonly toggleMobileLink = new EventEmitter<void>();
  @Output() public readonly notify = new EventEmitter<boolean>();

  public expanded = false;
  public disabled = false;
  public twoLines = false;
  @HostBinding('attr.aria-expanded') public ariaExpanded = this.expanded;
  @Input() public item!: NavItem;
  @Input() public depth = 0;

  public readonly navService = inject(NavService);
  public readonly router = inject(Router);

  public ngOnChanges() {
    const url = this.navService.currentUrl();
    if (this.item.route && url) {
      this.expanded = url.indexOf(`/${this.item.route}`) === 0;
      this.ariaExpanded = this.expanded;
    }
  }

  public onItemSelected(item: NavItem) {
    if (!item.children?.length && item.route) {
      void this.router.navigate([item.route]);
    }
    if (item.children && item.children.length) {
      this.expanded = !this.expanded;
    }
    //scroll
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    if (!this.expanded) {
      if (window.innerWidth < 1024) {
        this.notify.emit();
      }
    }
  }

  public onSubItemSelected(item: NavItem) {
    if (!item.children || !item.children.length) {
      if (this.expanded && window.innerWidth < 1024) {
        this.notify.emit();
      }
    }
  }

  public isDirectlyActive(item: NavItem): boolean {
    return !!item.route && this.router.isActive(item.route, true);
  }

  public isChildActive(item: NavItem): boolean {
    if (!item.children) return false;
    return item.children.some((child) => this.isDirectlyActive(child) || this.isChildActive(child));
  }
}
