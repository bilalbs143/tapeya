import { isPlatformBrowser } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class HelpersService {
  private title = inject(Title);
  private platformID = inject(PLATFORM_ID);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  public resolveTitle(activatedRoute: ActivatedRoute): string {
    const title = activatedRoute.snapshot.data['title'];
    this.setTitle(title);
    return title;
  }

  public setTitle(title: string): void {
    this.translateService.get(title).subscribe((_title) => {
      this.title.setTitle(this.translateService.instant(_title));
    });
  }

  public redirectTo404(): void {
    if (isPlatformBrowser(this.platformID)) {
      this.router.navigateByUrl('/error');
    }
  }

  public loadHttpData(service: any, requestParams: HttpParams, dataSource: any, totalRecords: any, after: any): void {
    service.get(requestParams).subscribe(
      (response: any) => {
        dataSource.data = response.data || [];
        totalRecords(response.meta.total || 0);
      },
      (error: any) => {
        console.error('Error:', error);
      },
      () => {
        after();
      }
    );
  }
}
