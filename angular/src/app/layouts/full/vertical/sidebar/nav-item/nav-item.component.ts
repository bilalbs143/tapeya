import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, OnChanges, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TablerIconComponent } from '@luoxiao123/angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material.module';

import { NavService } from '../../../../../services/nav.service';

import { NavItem } from './nav-item';

@Component({
  selector: 'app-nav-item',
  imports: [TranslateModule, TablerIconComponent, MaterialModule, CommonModule],
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
  navService = inject(NavService);
  router = inject(Router);

  @Output() private readonly toggleMobileLink = new EventEmitter<void>();
  @Output() private readonly notify: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() public item: NavItem | any;
  @Input() public depth: number;
  @Input() public isChild: boolean = false;
  public expanded: boolean = false;
  public disabled: boolean = false;
  @HostBinding('attr.aria-expanded') private ariaExpanded = this.expanded;

  constructor() {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  public ngOnChanges(): void {
    this.navService.currentUrl.subscribe((url: string) => {
      if (this.item && this.item.route && url) {
        this.expanded = url.indexOf(`/${this.item.route}`) === 0;
        this.ariaExpanded = this.expanded;
      }
    });
  }

  public async onItemSelected(item: NavItem): Promise<void> {
    if (!item.children || !item.children.length) {
      await this.router.navigate([item.route]);
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

  public onSubItemSelected(item: NavItem): void {
    if (!item.children || !item.children.length) {
      if (this.expanded && window.innerWidth < 1024) {
        this.notify.emit();
      }
    }
  }
}
