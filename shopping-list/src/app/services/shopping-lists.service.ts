import { Injectable } from '@angular/core';
import { CollectionReference, Firestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { addDoc, collection } from '@firebase/firestore';
import { BehaviorSubject, defer, filter, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ShoppingListDto } from '../dtos/shopping-list-dto';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListsService {
  private readonly collectionName = "shopping-lists";
  private shoppingListsCollectionRef: CollectionReference<ShoppingListDto>;

  private userId: string | undefined;

  private shoppingLists = new BehaviorSubject<ShoppingListDto[]>([]);
  get shoppingLists$(): Observable<ShoppingListDto[]> {
    return this.shoppingLists.asObservable();
  }

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router) {
    this.shoppingListsCollectionRef = collection(this.firestore, this.collectionName) as CollectionReference<ShoppingListDto>;

    this.authService.currentUser$.pipe(
      filter(currentUser => currentUser !== null)
    )
    .subscribe(currentUser => this.userId = currentUser?.id);
   }

   public showSnackbar(message: string): void {
    this.snackBar.open(
      message, 'Ok', {
        duration: environment.snackbarDuration,
        panelClass: ['snackbar']
      }
    );
  }

   public createShoppingList(newShoppingList: ShoppingListDto): void {
    addDoc(this.shoppingListsCollectionRef, newShoppingList)
      .then(() => {
        const shoppingLists = this.shoppingLists.value;
        this.shoppingLists.next([...shoppingLists, newShoppingList]);
        this.router.navigate(['home']);
      })
      .catch(_ => {
        this.showSnackbar("The error occured while creating the shopping list");
      });
   }
}
