import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { of } from 'rxjs';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

fdescribe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerSpy = {
    navigate: jasmine.createSpy('navigate').and.returnValue(of({} as UrlTree))
  };
  let authServiceMock: Partial<AuthService>;

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated$: of(true),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerSpy }
      ]
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should navigate to /home when a logged in user tries to acces the login form', (done: any) => {
    const canActivateObservable = guard.canActivate({} as ActivatedRouteSnapshot, {url: "/"} as RouterStateSnapshot);

    canActivateObservable.subscribe(_ => {
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
      done();
    });
  });

  it('should navigate to /home when a logged in user tries to acces the register form', (done: any) => {
    const canActivateObservable = guard.canActivate({} as ActivatedRouteSnapshot, {url: "/register"} as RouterStateSnapshot);

    canActivateObservable.subscribe(_ => {
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
      done();
    });
  });

  it('should let the logged in user access /home', (done: any) => {
    const canActivateObservable = guard.canActivate({} as ActivatedRouteSnapshot, {url: "/home"} as RouterStateSnapshot);

    canActivateObservable.subscribe(result => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('should let the not logged in user access /', (done: any) => {
    authServiceMock.isAuthenticated$ = of(false);
    const canActivateObservable = guard.canActivate({} as ActivatedRouteSnapshot, {url: "/"} as RouterStateSnapshot);

    canActivateObservable.subscribe(result => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('should let the not logged in user access /register', (done: any) => {
    authServiceMock.isAuthenticated$ = of(false);
    const canActivateObservable = guard.canActivate({} as ActivatedRouteSnapshot, {url: "/register"} as RouterStateSnapshot);

    canActivateObservable.subscribe(result => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('should navigate to / when a not logged in user tries to access /home ', (done: any) => {
    authServiceMock.isAuthenticated$ = of(false);
    const canActivateObservable = guard.canActivate({} as ActivatedRouteSnapshot, {url: "/home"} as RouterStateSnapshot);

    canActivateObservable.subscribe(_ => {
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
      done();
    });
  });
});
