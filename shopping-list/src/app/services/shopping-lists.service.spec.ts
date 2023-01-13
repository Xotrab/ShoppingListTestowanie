import { TestBed } from '@angular/core/testing';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectFirestoreEmulator, enableIndexedDbPersistence, getFirestore, initializeFirestore, provideFirestore, Timestamp } from '@angular/fire/firestore';
import { connectStorageEmulator, getStorage, provideStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, lastValueFrom, map, switchMap, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApplicationUser } from '../dtos/application-user';
import { ShoppingItemDto } from '../dtos/shopping-item-dto';
import { ShoppingListDto } from '../dtos/shopping-list-dto';
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

  it('should create new list and emit the updated value in ShoppingLists$', async () =>{
    const user = await lastValueFrom(authServiceMock.currentUser$.pipe(take(1)));

    const newShoppingList: ShoppingListDto = {
      name: "test-list",
      deadline: Timestamp.fromDate(new Date()),
      userId: user.id,
      items: []
    };

    const createdShoppingList = await lastValueFrom(service.createShoppingList(newShoppingList).pipe(
      switchMap(id => service.shoppingLists$.pipe(
        take(1),
        map(shoppingLists => shoppingLists.find(shoppingList => shoppingList.id === id))
      ))
    ));

    //cleanup
    await lastValueFrom(service.removeShoppingList(createdShoppingList.id));

    expect(createdShoppingList.name).toBe(newShoppingList.name);
    expect(createdShoppingList.deadline.seconds).toBe(newShoppingList.deadline.seconds);
    expect(createdShoppingList.deadline.nanoseconds).toBe(newShoppingList.deadline.nanoseconds);
    expect(createdShoppingList.userId).toBe(newShoppingList.userId);
    expect(createdShoppingList.items.length).toBe(0);
  });

  it('should remove the shopping list and emit the updated value in ShoppingLists$', async () => {
    const user = await lastValueFrom(authServiceMock.currentUser$.pipe(take(1)));

    const newShoppingList: ShoppingListDto = {
      name: "test-list-to-remove",
      deadline: Timestamp.fromDate(new Date()),
      userId: user.id,
      items: []
    };

    const createdListId = await lastValueFrom(service.createShoppingList(newShoppingList));
    
    const removedList = await lastValueFrom(service.removeShoppingList(createdListId).pipe(
      switchMap(() => service.shoppingLists$.pipe(
        take(1),
        map(shoppingLists => shoppingLists.find(shoppingList => shoppingList.id === createdListId))
      ))
    ));

    expect(removedList).toBe(undefined);
  });

  it('should add list item', async () => {
    const user = await lastValueFrom(authServiceMock.currentUser$.pipe(take(1)));

    const newShoppingList: ShoppingListDto = {
      name: "test-list-to-remove",
      deadline: Timestamp.fromDate(new Date()),
      userId: user.id,
      items: []
    };

    const newItem: ShoppingItemDto = {
      name: "add-test",
      quantity: 1,
      unit: "kg",
      imageData: null,
      purchased: false
    };

    const createdListId = await lastValueFrom(service.createShoppingList(newShoppingList));

    const updatedList = await lastValueFrom(service.addShoppingListItem(createdListId, newItem, null).pipe(
      switchMap(() => service.shoppingLists$.pipe(
        take(1),
        map(shoppingLists => shoppingLists.find(shoppingList => shoppingList.id === createdListId))
      ))
    ));

    //cleanup
    await lastValueFrom(service.removeShoppingList(createdListId));

    expect(updatedList.items.length).toBe(1);
    expect(updatedList.items[0].name).toBe(newItem.name);
    expect(updatedList.items[0].quantity).toBe(newItem.quantity);
    expect(updatedList.items[0].unit).toBe(newItem.unit);
  });

  it('should remove list item', async () => {
    const user = await lastValueFrom(authServiceMock.currentUser$.pipe(take(1)));

    const newShoppingList: ShoppingListDto = {
      name: "test-list-to-remove",
      deadline: Timestamp.fromDate(new Date()),
      userId: user.id,
      items: []
    };

    const newItem: ShoppingItemDto = {
      name: "add-test",
      quantity: 1,
      unit: "kg",
      imageData: null,
      purchased: false
    };

    const updatedList = await lastValueFrom(service.createShoppingList(newShoppingList).pipe(
      switchMap(listId => service.shoppingLists$.pipe(
        take(1),
        map(shoppingLists => shoppingLists.find(shoppingList => shoppingList.id === listId))
      )),
      switchMap(shoppingList => service.addShoppingListItem(shoppingList.id, newItem, null).pipe(
        map(() => shoppingList.id)
      )),
      switchMap(listId => service.removeShoppingListItem(listId, 0).pipe(
        map(() => listId)
      )),
      switchMap(listId => service.shoppingLists$.pipe(
        take(1),
        map(shoppingLists => shoppingLists.find(shoppingList => shoppingList.id === listId))
      ))
    ));

    await lastValueFrom(service.removeShoppingList(updatedList.id));

    expect(updatedList.items.length).toBe(0);
  });

  it('should update the shopping list name', async () => {
    const newName = "newName";

    const user = await lastValueFrom(authServiceMock.currentUser$.pipe(take(1)));

    const newShoppingList: ShoppingListDto = {
      name: "test-list-to-update-name",
      deadline: Timestamp.fromDate(new Date()),
      userId: user.id,
      items: []
    };

    const updatedList = await lastValueFrom(service.createShoppingList(newShoppingList).pipe(
      switchMap(listId => service.updateShoppingListName(listId, newName).pipe(
        map(() => listId)
      )),
      switchMap(listId => service.shoppingLists$.pipe(
        take(1),
        map(shoppingLists => shoppingLists.find(shoppingList => shoppingList.id === listId))
      ))
    ));

    await lastValueFrom(service.removeShoppingList(updatedList.id));

    expect(updatedList.name).toBe(newName);
  });
});
