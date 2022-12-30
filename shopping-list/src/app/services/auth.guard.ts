import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { delay, filter, from, Observable, of, skip, switchMap, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {
      return this.authService.isAuthenticated$.pipe(
        switchMap(isAuthenticated => {
          if (isAuthenticated) {
            if (state.url == '/' || state.url == '/register') {
              return from(this.router.navigate(['/home']));
            }

            return of(true);
          }

          if (state.url == '/' || state.url == '/register') {
            return of(true);
          }

          return from(this.router.navigate(['/']));
        })
      );
  }
  
}
