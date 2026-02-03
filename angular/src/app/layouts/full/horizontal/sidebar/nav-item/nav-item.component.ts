import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TablerIconComponent } from '@luoxiao123/angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-horizontal-nav-item',
  imports: [TablerIconComponent, CommonModule, MatIconModule, TranslateModule],
  templateUrl: './nav-item.component.html',
})
export class AppHorizontalNavItemComponent {
  protected router = inject(Router);

  @Input() public depth: any;
  @Input() public item: any;

  constructor() {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  public onItemSelected(item: any): void {
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route]);
    }
  }
}
