import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { BehaviorSubject, defer, from, map, Observable, Subscription, switchMap } from 'rxjs';
import { ApplicationUser } from '../dtos/application-user';
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

  constructor(private auth: Auth) {
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

  public ngOnDestroy(): void {
    if (this.authStateSubscription)
      this.authStateSubscription.unsubscribe();
  }
}
