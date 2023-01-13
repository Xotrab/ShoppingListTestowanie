import { NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { COMMONLY_USED_ITEMS, DEFAULT_UNITS, ShoppingItemDto } from '../dtos/shopping-item-dto';
import { ShoppingListDto } from '../dtos/shopping-list-dto';
import { EditItemDialogComponent } from '../edit-item-dialog/edit-item-dialog.component';
import { EditDialogData } from '../helpers/edit-dialog-data';
import { ItemMode } from '../helpers/item-mode.enum';
import { ShoppingListsService } from '../services/shopping-lists.service';

const CUSTOM_DATE_FORMAT: NgxMatDateFormats = {
  parse: {
    dateInput: 'l, LTS'
  },
  display: {
    dateInput: 'DDY-MM-YYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss'],
  providers: [
    {provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMAT}
  ]
})
export class ShoppingListComponent implements OnInit {
  public itemMode = ItemMode;
  public selectedMode: ItemMode = this.itemMode.Common;

  public defaultUnits = DEFAULT_UNITS;
  public commonItems = COMMONLY_USED_ITEMS;

  public shoppingList: ShoppingListDto = {
    name: "",
    deadline: null,
    userId: "",
    items: []
  };

  // Fields used for two way data binding editing
  public deadlineInDate!: Date;
  public newShoppingListName!: string;

  public newItem: ShoppingItemDto = {
    name: "",
    quantity: null,
    unit: "",
    imageData: null,
    purchased: false
  };

  public uploadedImagePreviewUrl!: string | null;
  public uploadedFile: File | null = null;

  public showSpinner: boolean = false;

  public shoppingListId!: string;

  public displayedColumns: string[] = ['position', 'item', 'quantity', 'unit','image', 'remove', 'edit'];

  public dataSource = new MatTableDataSource<ShoppingItemDto>();
  
  constructor(
    private snackBar: MatSnackBar,
    private shoppingListsService: ShoppingListsService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router) { }

  public ngOnInit(): void {
    this.shoppingListId = this.route.snapshot.paramMap.get('id')!;
    this.shoppingListsService.shoppingLists$.subscribe(shoppingLists => {
      const maybeList = shoppingLists.find(shoppingList => shoppingList.id === this.shoppingListId);

      if (maybeList) {
        this.shoppingList = maybeList;
        this.dataSource.data = this.shoppingList.items;

        // Set the properties for editing purposes
        this.deadlineInDate = this.shoppingList.deadline?.toDate()!;
        this.newShoppingListName = this.shoppingList.name;
      }
    });
  }

  public navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  public onImageSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.uploadedFile = event.target.files[0];

      var reader = new FileReader();
      reader.onload = (event: any) => {
          this.uploadedImagePreviewUrl = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
      event.target.value = '';
    }
  }

  public removeImage(): void {
    this.uploadedImagePreviewUrl = null;
    this.uploadedFile = null;
  }

  public resetShoppingItemName(): void {
    this.newItem.name = "";
  }

  public showSnackbar(message: string): void {
    this.snackBar.open(
      message, 'Ok', {
        duration: environment.snackbarDuration,
        panelClass: ['snackbar']
      }
    );
  }

  public addItem(): void {
    if (!this.newItem.name || !this.newItem.quantity || !this.newItem.unit) {
      this.showSnackbar("The provided input for the new item is invalid");
      return;
    }

    this.showSpinner = true;

    this.shoppingListsService.addShoppingListItem(this.shoppingList.id!, {...this.newItem}, this.uploadedFile).subscribe({
      next: () => {
        this.showSpinner = false;

        this.newItem = {
          name: "",
          quantity: null,
          unit: "",
          imageData: null,
          purchased: false
        };

        this.removeImage();
      },
      error: () => {
        this.showSpinner = false;
        this.showSnackbar("Error occured while adding the shopping list item");
      }
    });
  }

  public removeItem(index: number): void {
    this.shoppingListsService.removeShoppingListItem(this.shoppingListId!, index).subscribe({
      error: () => {
        this.showSnackbar("Error occured while removing the shopping list item");
      }
    });
  }

  public editShoppingListName(): void {
    if (this.newShoppingListName === this.shoppingList.name) {
      this.showSnackbar("The provided name is the same as the previous value");
      return;
    }

    this.shoppingListsService.updateShoppingListName(this.shoppingListId!, this.newShoppingListName).subscribe({
      error: () => {
        this.showSnackbar("The shopping list name has been successfully updated");
      }
    });
  }

  public editShoppingDeadline(): void {
    const newDeadline = Timestamp.fromDate(this.deadlineInDate);

    if (newDeadline.seconds === this.shoppingList.deadline?.seconds) {
      this.showSnackbar("The provided deadline is the same as the previous value");
      return;
    }

    this.shoppingListsService.updateShoppingListDeadline(this.shoppingListId!, newDeadline).subscribe({
      error: () => {
        this.showSnackbar("Error occured while updating the shopping list deadline");
      }
    });
  }

  public openEditDialog(index: number): void {

    this.dialog.open(EditItemDialogComponent, { 
      disableClose: true,
      autoFocus: false,
      data: {
        listId: this.shoppingListId,
        itemIndex: index,
        item: {...this.shoppingList.items[index]}
      } as EditDialogData
    });
  }

}
