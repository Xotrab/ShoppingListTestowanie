import { Injectable } from '@angular/core';
import { CollectionReference, deleteDoc, doc, Firestore, getDocs, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { ref, Storage, uploadBytes, UploadMetadata } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { addDoc, collection } from '@firebase/firestore';
import { BehaviorSubject, defer, filter, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ShoppingListDto } from '../dtos/shopping-list-dto';
import { AuthService } from './auth.service';
import { uuidv4 } from '@firebase/util';
import { ShoppingItemDto } from '../dtos/shopping-item-dto';

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
    private storage: Storage,
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

   public uploadImage(image: File) {
    const uuid = uuidv4();
    const storageRef = ref(this.storage, `images/${this.userId}/${uuid}`);

    const metadata: UploadMetadata  = {
      contentType: image.type,
    };

    return defer(() => uploadBytes(storageRef, image, metadata)).pipe(map(() => uuid));
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
      });
   }

   public removeShoppingList(id: string): void {
    const shoppingListRef = doc(this.firestore, this.collectionName, id);
    
    deleteDoc(shoppingListRef)
      .then(() => {
        let shoppingLists = this.shoppingLists.value;
        shoppingLists = shoppingLists.filter(shoppingList => shoppingList.id !== id);

        this.shoppingLists.next(shoppingLists);
      })
      .catch(_ => {
        this.showSnackbar("Error occured while removing the shopping list");
      });
   }

   public addShoppingListItem(listId: string, newItem: ShoppingItemDto): void {
    const shoppingListRef = doc(this.firestore, this.collectionName, listId);

    const listToUpdate = this.shoppingLists.value.find(list => list.id === listId)!;
    const updatedItems = [...listToUpdate.items, newItem];

    updateDoc(shoppingListRef, {items: updatedItems})
      .then(() => {
        listToUpdate.items = updatedItems;
        this.shoppingLists.next(this.shoppingLists.value); 
      })
      .catch(_ => {
        this.showSnackbar("Error occured while adding the shopping list item");
      });
   }

   public removeShoppingListItem(listId: string, itemIndex: number): void {
    const shoppingListRef = doc(this.firestore, this.collectionName, listId);

    const listToUpdate = this.shoppingLists.value.find(list => list.id === listId)!;

    let updatedItems = [...listToUpdate.items];

    updatedItems.splice(itemIndex, 1);

    updateDoc(shoppingListRef, {items: updatedItems})
      .then(() => {
        listToUpdate.items = updatedItems;
        this.shoppingLists.next(this.shoppingLists.value); 
      })
      .catch(_ => {
        this.showSnackbar("Error occured while removing the shopping list item");
      });
   }

   public updateShoppingListName(listId: string, newName: string) : void {
    const shoppingListRef = doc(this.firestore, this.collectionName, listId);

    const listToUpdate = this.shoppingLists.value.find(list => list.id === listId)!;

    updateDoc(shoppingListRef, {name: newName})
      .then(() => {
        listToUpdate.name = newName;
        this.shoppingLists.next(this.shoppingLists.value);
        this.showSnackbar("The shopping list name has been successfully updated");
      })
      .catch(_ => {
        this.showSnackbar("Error occured while updating the shopping list name");
      });
   }

   public updateShoppingListDeadline(listId: string, newDeadline: Timestamp) : void {
    const shoppingListRef = doc(this.firestore, this.collectionName, listId);

    const listToUpdate = this.shoppingLists.value.find(list => list.id === listId)!;

    updateDoc(shoppingListRef, {deadline: newDeadline})
      .then(() => {
        listToUpdate.deadline = newDeadline;
        this.shoppingLists.next(this.shoppingLists.value);
        this.showSnackbar("The shopping list deadline has been successfully updated");
      })
      .catch(_ => {
        this.showSnackbar("Error occured while updating the shopping list deadline");
      });
   }
}
