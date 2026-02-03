import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { verifyPermission } from '../functions/permissions.function';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  public canActivate(activeRoute: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredPermission = activeRoute.data['permission'] || '';
    const userPermissions = this.authService.getPermissions();

    return this.hasPermission(requiredPermission, userPermissions).pipe(
      tap((hasPermission) => {
        if (!hasPermission) {
          this.authService.logout(true);
        }
      })
    );
  }

  private hasPermission(requiredPermission: string, userPermissions: string[]): Observable<boolean> {
    return of(verifyPermission(requiredPermission, userPermissions));
  }
}
