import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TablerIconComponent } from '@luoxiao123/angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { filter } from 'rxjs/operators';
import { AppSettings } from 'src/app/app.config';
import { MaterialModule } from 'src/app/material.module';
import { CoreService } from 'src/app/services/core.service';

import { USER_DETAILS_MENU } from '../../shared/constants/constants';
import { AppBreadcrumbComponent } from '../full/shared/breadcrumb/breadcrumb.component';

import { AppHorizontalHeaderComponent } from './horizontal/header/header.component';

@Component({
  selector: 'app-full',
  imports: [
    RouterModule,
    MaterialModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconComponent,
    AppHorizontalHeaderComponent,
    AppBreadcrumbComponent,
    TranslateModule,
  ],
  templateUrl: './child.component.html',
  styleUrls: [],
  encapsulation: ViewEncapsulation.None,
})
export class ChildComponent {
  private settings = inject(CoreService);
  private router = inject(Router);

  public sidenav: MatSidenav;
  public resView = false;
  @ViewChild('content', { static: true }) public content!: MatSidenavContent;
  public options = this.settings.getOptions();
  private htmlElement!: HTMLHtmlElement;
  public userId = 1;

  // for mobile app sidebar
  public userDetailsMenu = USER_DETAILS_MENU;

  constructor() {
    this.htmlElement = document.querySelector('html')!;

    // Initialize project theme with options
    this.receiveOptions(this.options);

    // This is for scroll to top
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.content.scrollTo({ top: 0 });
    });
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
}
