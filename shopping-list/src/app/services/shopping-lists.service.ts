import { Injectable } from '@angular/core';
import { CollectionReference, deleteDoc, doc, Firestore, getDocs, query, where } from '@angular/fire/firestore';
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

    this.authService.currentUser$.subscribe(currentUser => {
      this.userId = currentUser?.id;

      if (!this.userId) {
        this.shoppingLists.next([]);
      }
      else {
        this.getShoppingLists();
      }
    });
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
      .then((doc) => {
        newShoppingList.id = doc.id;
        const shoppingLists = this.shoppingLists.value;
        this.shoppingLists.next([...shoppingLists, newShoppingList]);
        this.router.navigate(['home']);
      })
      .catch(_ => {
        this.showSnackbar("Error occured while creating the shopping list");
      });
   }

   public getShoppingLists(): void {
    const userShoppingListsQuery = query(this.shoppingListsCollectionRef, where('userId', '==', this.userId));

    getDocs(userShoppingListsQuery)
      .then((snapshot) => {
        let shoppingLists: ShoppingListDto[] = [];

        snapshot.docs.forEach((doc)=> {
          const shoppingList: ShoppingListDto = {id: doc.id, ...doc.data()};
          shoppingLists.push(shoppingList);
        });

        this.shoppingLists.next(shoppingLists);
      })
      .catch(_ => {
        this.showSnackbar("Error occured while fetching the shopping lists");
      })
   }

   public removeShoppingList(id: string): void{
    const shoppingListRef = doc(this.firestore, this.collectionName, id);
    
    deleteDoc(shoppingListRef)
      .then(() => {
        let shoppingLists = this.shoppingLists.value;
        shoppingLists = shoppingLists.filter(shoppingList => shoppingList.id !== id);
        
        this.shoppingLists.next(shoppingLists);
      })
      .catch(_ => {
        this.showSnackbar("Error occured while removing the shopping list");
      })
   }
}
