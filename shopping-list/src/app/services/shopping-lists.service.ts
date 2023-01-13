import { Injectable } from '@angular/core';
import { CollectionReference, deleteDoc, doc, Firestore, getDocs, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { deleteObject, getDownloadURL, ref, Storage, uploadBytes, UploadMetadata } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { addDoc, collection } from '@firebase/firestore';
import { uuidv4 } from '@firebase/util';
import { BehaviorSubject, defer, forkJoin, from, iif, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ImageDataDto } from '../dtos/image-data-dto';
import { ShoppingItemDto } from '../dtos/shopping-item-dto';
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
    private storage: Storage,
    private authService: AuthService,
    private snackBar: MatSnackBar) {
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

   public uploadImage(image: File): Observable<ImageDataDto> {
    const uuid = uuidv4();
    const documentPath = `images/${this.userId}/${uuid}`;

    const imageRef = ref(this.storage, documentPath);

    const metadata: UploadMetadata  = {
      contentType: image.type,
    };

    return defer(() => uploadBytes(imageRef, image, metadata)).pipe(
      switchMap(_ => this.getImageUrl(documentPath)),
      map(url => {
        return {
          documentPath: documentPath,
          imageUrl: url
        } as ImageDataDto;
      })
    );
  }

  public removeImage(imagePath: string): Observable<void> {
    const imageRef = ref(this.storage, imagePath);

    return defer(() => deleteObject(imageRef));
  }

  public removeImages(ids: string[]): Observable<void> {
    return ids.length === 0 ? of(void 0) : forkJoin([
      ...ids.map(id => this.removeImage(id))
    ]).pipe(map(() => {}));
  }

  getImageUrl(documentPath: string): Observable<string> {
    const imageRef = ref(this.storage, documentPath);

    return defer(() => getDownloadURL(imageRef));
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

   public removeShoppingList(id: string): Observable<void> {
    const shoppingListRef = doc(this.firestore, this.collectionName, id);

    const imagePathsToRemove: string[] = this.shoppingLists.value
      .find(list => list.id === id)!.items
      .map(item => item.imageData)
      .filter(ImageData => ImageData !== null)
      .map(ImageData => ImageData?.documentPath!);
    
    return defer(() => deleteDoc(shoppingListRef)).pipe(
      switchMap(() => this.removeImages(imagePathsToRemove)),
      tap(() => {
        let shoppingLists = this.shoppingLists.value;
        shoppingLists = shoppingLists.filter(shoppingList => shoppingList.id !== id);

        this.shoppingLists.next(shoppingLists);
      })
    );
   }

   public addShoppingListItem(listId: string, newItem: ShoppingItemDto, image: File | null): Observable<void> {
    return iif(
      () => image !== null,
      defer(() => this.uploadImage(image!)), 
      defer(() => of(null))
    )
    .pipe(
      switchMap(result => {
        newItem.imageData = result;

        const shoppingListRef = doc(this.firestore, this.collectionName, listId);

        const listToUpdate = this.shoppingLists.value.find(list => list.id === listId)!;
        const updatedItems = [...listToUpdate.items, newItem];

        return from(updateDoc(shoppingListRef, {items: updatedItems}))
          .pipe(
            tap(() => {
              listToUpdate.items = updatedItems;
              this.shoppingLists.next(this.shoppingLists.value);
            })
          )
      })
    );

   }

   public removeShoppingListItem(listId: string, itemIndex: number): Observable<void> {
    const shoppingListRef = doc(this.firestore, this.collectionName, listId);

    const listToUpdate = this.shoppingLists.value.find(list => list.id === listId)!;

    let updatedItems = [...listToUpdate.items];

    const itemToBeRemoved = {...listToUpdate.items[itemIndex]};

    updatedItems.splice(itemIndex, 1);

    const observables = [defer(() => updateDoc(shoppingListRef, {items: updatedItems}))];

    if (itemToBeRemoved.imageData) {
      observables.push(this.removeImage(itemToBeRemoved.imageData.documentPath));
    }

    return forkJoin(observables).pipe(
      tap(() => {
        listToUpdate.items = updatedItems;
        this.shoppingLists.next(this.shoppingLists.value);
      }),
      map(() => {})
    );
   }

   public updateShoppingListItem(listId: string, itemIndex: number, updatedItem: ShoppingItemDto, removeOldImg: boolean, uploadNewImg: boolean, image: File): Observable<void> {
    const shoppingListRef = doc(this.firestore, this.collectionName, listId);

    const listToUpdate = this.shoppingLists.value.find(list => list.id === listId)!;

    let updatedItems = [...listToUpdate.items];

    const observables = [];

    if (removeOldImg) {
      observables.push(this.removeImage(updatedItem.imageData?.documentPath!));
      updatedItem.imageData = null;
    }

    const maybeUploadThenUpdate = 
      iif(
        () => uploadNewImg,
        defer(() => this.uploadImage(image!)), 
        defer(() => of(null))
      )
      .pipe(
        switchMap(result => {
          if (result) {
            updatedItem.imageData = result;
          }
          
          updatedItems[itemIndex] = updatedItem;

          return from(updateDoc(shoppingListRef, {items: updatedItems}));
        })
      );

      observables.push(maybeUploadThenUpdate);

      return forkJoin(observables).pipe(
        tap(() => {
          listToUpdate.items = updatedItems;
          this.shoppingLists.next(this.shoppingLists.value);
        }),
        map(() => {})
      );

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
