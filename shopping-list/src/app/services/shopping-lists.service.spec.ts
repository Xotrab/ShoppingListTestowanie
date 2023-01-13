import { TestBed } from '@angular/core/testing';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectFirestoreEmulator, enableIndexedDbPersistence, getFirestore, initializeFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectStorageEmulator, getStorage, provideStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, lastValueFrom, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApplicationUser } from '../dtos/application-user';
import { AuthService } from './auth.service';

import { ShoppingListsService } from './shopping-lists.service';

fdescribe('ShoppingListsService', () => {
  let service: ShoppingListsService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let authServiceMock: jasmine.SpyObj<Partial<AuthService>>;
  let currentUserSubject: BehaviorSubject<ApplicationUser>;

  beforeAll(() => {
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>(['open']);

    currentUserSubject = new BehaviorSubject<ApplicationUser>({
      id: "sQTGnNwyri544SbOoVhG1riyOPeK",
      email: "loginTest@domain.com",
      username: "loginTest"
    });

    authServiceMock = {
      currentUser$: currentUserSubject.asObservable(),
    };

    TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => {
          const app = initializeApp(environment.firebase)
          initializeFirestore(app, {experimentalForceLongPolling: true })
          return app;
        }),
        provideFirestore(() => {
          const firestore = getFirestore();
    
          connectFirestoreEmulator(firestore, 'localhost', 8081);
          enableIndexedDbPersistence(firestore);
        
          return firestore;
        }),
        provideStorage(() => {
          const storage = getStorage();
    
          connectStorageEmulator(storage, 'localhost', 9199);
          return storage;
        })
      ],
      providers: [
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
    service = TestBed.inject(ShoppingListsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create new list', async () =>{
    const userId = await lastValueFrom(authServiceMock.currentUser$.pipe(take(1)));

    expect(userId.id).toBe("sQTGnNwyri544SbOoVhG1riyOPeK");
  });
});
