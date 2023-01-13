import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { off } from 'process';
import { BehaviorSubject, defer, from, map, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { ApplicationUser } from '../dtos/application-user';
import { LoginDto } from '../dtos/login-dto';
import { RegisterDto } from '../dtos/register-dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authStateSubscription: Subscription | undefined;

  private currentUser = new BehaviorSubject<ApplicationUser | null>(null);
  get currentUser$(): Observable<ApplicationUser | null> {
    return this.currentUser.asObservable();
  }

  public isAuthenticated$: Observable<boolean>;

  constructor(private auth: Auth, private router: Router) {
    this.isAuthenticated$ = authState(this.auth)
      .pipe(
        map(user => user !== null)
      );

    this.authStateSubscription = authState(this.auth).subscribe(user => {
      if (user == null)
        this.currentUser.next(null);
      else {
        const applicationUser: ApplicationUser = {
          id: user.uid,
          email: user.email!,
          username: user.displayName!
        }

        this.currentUser.next(applicationUser);
      }      
    });
   }

  public register(registerDto: RegisterDto): Observable<boolean> {
    return defer(
      () => createUserWithEmailAndPassword(this.auth, registerDto.email, registerDto.password)
    )
    .pipe(
      map(userCredential => userCredential.user),
      switchMap(user => from(updateProfile(user, {displayName: registerDto.username}))
      .pipe(map(() => true))),
    )
  }

  public updateUsername(name: string): void {
    const user = this.currentUser.value;
    
    if (user == null)
        this.currentUser.next(null);
    else {
      const applicationUser: ApplicationUser = {
        id: user.id,
        email: user.email,
        username: name
      }

      this.currentUser.next(applicationUser);
    }
  }

  public ngOnDestroy(): void {
    if (this.authStateSubscription)
      this.authStateSubscription.unsubscribe();
  }

  public login(loginDto: LoginDto): Observable<boolean> {
    return defer(
      () => signInWithEmailAndPassword(this.auth, loginDto.email, loginDto.password)
    )
    .pipe(
      tap(() => this.router.navigate(['home'])),
      switchMap(() => of(true))
    );
  }

  public logout(): Observable<boolean> {
    return defer(
      () => signOut(this.auth)
    )
    .pipe(
      switchMap(() => of(true))
    );
  }

  public deleteUser(): Observable<void> {
    const currUser = this.auth.currentUser;

    if (currUser !== null)
      return from(currUser.delete());
    
      return of(void 0);
  }
}
