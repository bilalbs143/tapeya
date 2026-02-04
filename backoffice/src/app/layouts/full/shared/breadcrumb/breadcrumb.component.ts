import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Data, NavigationEnd, Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule, TablerIconsModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: [],
})
export class AppBreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly titleService = inject(Title);

  // Allow null so template's optional chaining (pageInfo?.['title'], etc.) is type-correct.
  public pageInfo: (Data & { title?: string; urls?: Array<{ url?: string; title?: string }> }) | null = null;
  public myurl: string[] = this.router.url.slice(1).split('/');

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
        this.titleService.setTitle(event['title']);
        this.pageInfo = event;
      });
  }
}
