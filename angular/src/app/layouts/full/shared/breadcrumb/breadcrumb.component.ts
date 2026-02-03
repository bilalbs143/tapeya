import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterModule, Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
import { TablerIconComponent } from '@luoxiao123/angular-tabler-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule, TablerIconComponent, TranslateModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: [],
})
export class AppBreadcrumbComponent {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private translateService = inject(TranslateService);
  private titleService = inject(Title);

  public pageInfo: Data | any = Object.create(null);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .pipe(map(() => this.activatedRoute))
      .pipe(
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        })
      )
      .pipe(filter((route) => route.outlet === 'primary'))
      .pipe(mergeMap((route) => route.data))
      .subscribe((event) => {
        this.titleService.setTitle(this.translateService.instant(event['title']));
        this.pageInfo = event;
      });
  }
}
