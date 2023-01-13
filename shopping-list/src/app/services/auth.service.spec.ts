import { TestBed } from '@angular/core/testing';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { initializeFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { RegisterDto } from '../dtos/register-dto';
import { uuidv4 } from '@firebase/util';
import { catchError, lastValueFrom, of, skip, switchMap, take, tap } from 'rxjs'

import { AuthService } from './auth.service';
import { LoginDto } from '../dtos/login-dto';

fdescribe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    routerSpy = jasmine.createSpyObj<Router>(['navigate']);

    TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => {
          const app = initializeApp(environment.firebase)
          initializeFirestore(app, {experimentalForceLongPolling: true })
          return app;
        }),
        provideAuth(() => {
          const auth = getAuth();
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    
          return auth;
        })
      ],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should automatically log in the new user after a successfull register process', async () => {
    const registerDto: RegisterDto = {
      email: `${uuidv4().slice(0.8)}@domain.com`,
      username: "testUsername",
      password: "Test1234",
      confirmPassword: "Test1234"
    };

    const isAuthenticated = await lastValueFrom(service.register(registerDto).pipe(
      switchMap(() => service.isAuthenticated$
      .pipe(
        take(1)
      ))
    ));

    expect(isAuthenticated).toBe(true);
  });

  it('should login process fail when invalid credentials are provided', async () => {
    const loginDto: LoginDto = {
      email: `${uuidv4().slice(0.8)}@wrong.com`,
      password: 'wrongPassword'
    };

    const successfullyLoggedIn = await lastValueFrom(service.login(loginDto).pipe(
      catchError(() => of(false))
    ));

    expect(successfullyLoggedIn).toBeFalsy();
  });

  it('should log in and navigate to /home when valid credentials are provided', async () => {
    const loginDto: LoginDto = {
      email: `loginTest@domain.com`,
      password: 'Test1234'
    };
    
    const successfullyLoggedIn = await lastValueFrom(service.login(loginDto));

    expect(successfullyLoggedIn).toBe(true);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['home']);
  });

  it('should isAuthenticated$ emit false on successfull logout', async () => {
    const loginDto: LoginDto = {
      email: `loginTest@domain.com`,
      password: 'Test1234'
    };

    const isAuthenticated = await lastValueFrom(service.login(loginDto).pipe(
      switchMap(() => service.logout()),
      switchMap(() => service.isAuthenticated$.pipe(take(1)))
    ));

    expect(isAuthenticated).toBe(false);
  });
});
