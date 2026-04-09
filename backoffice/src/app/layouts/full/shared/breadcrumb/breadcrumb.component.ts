import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Data, NavigationEnd, Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { filter } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule, TablerIconsModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: [],
})
export class AppBreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  /** Merged from root → leaf so static `data` on lazy child routes is never missed. */
  public pageInfo: (Data & { title?: string; urls?: Array<{ url?: string; title?: string }> }) | null = null;

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        queueMicrotask(() => this.refreshBreadcrumb());
      });

    // Initial URL: first NavigationEnd may have fired before this component existed.
    queueMicrotask(() => this.refreshBreadcrumb());
  }

  private refreshBreadcrumb(): void {
    const leaf = this.getDeepestRoute(this.router.routerState.root);
    if (!leaf || leaf.outlet !== 'primary') {
      this.pageInfo = null;
      return;
    }

    const data = this.mergeAncestorData(leaf);
    const title = data['title'];

    if (title != null && title !== '') {
      this.titleService.setTitle(String(title));
    }

    const urls = data['urls'] as Array<{ url?: string; title?: string }> | undefined;
    this.pageInfo = urls?.length || title ? data : null;
  }

  private getDeepestRoute(route: ActivatedRoute): ActivatedRoute {
    let r = route;
    while (r.firstChild) {
      r = r.firstChild;
    }
    return r;
  }

  /** Combine `snapshot.data` from root to leaf so lazy-loaded routes still expose `title` / `urls`. */
  private mergeAncestorData(leaf: ActivatedRoute): Data {
    const chain: ActivatedRoute[] = [];
    let r: ActivatedRoute | null = leaf;
    while (r) {
      chain.unshift(r);
      r = r.parent;
    }

    const merged: Data = {};
    for (const node of chain) {
      Object.assign(merged, node.snapshot.data);
    }
    return merged;
  }
}
