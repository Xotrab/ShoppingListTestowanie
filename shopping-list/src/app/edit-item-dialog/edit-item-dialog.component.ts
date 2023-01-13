import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { COMMONLY_USED_ITEMS, DEFAULT_UNITS, ShoppingItemDto } from '../dtos/shopping-item-dto';
import { EditDialogData } from '../helpers/edit-dialog-data';
import { ItemMode } from '../helpers/item-mode.enum';
import { ShoppingListsService } from '../services/shopping-lists.service';

@Component({
  selector: 'app-edit-item-dialog',
  templateUrl: './edit-item-dialog.component.html',
  styleUrls: ['./edit-item-dialog.component.scss']
})
export class EditItemDialogComponent implements OnInit {
  public itemMode = ItemMode;
  public selectedMode: ItemMode = this.itemMode.Own;
  public defaultUnits = DEFAULT_UNITS;
  public commonItems = COMMONLY_USED_ITEMS;

  public imagePreviewUrl!: string | null;
  public uploadedFile: File | null = null;

  public editItem!: ShoppingItemDto

  public showSpinner: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<EditItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditDialogData,
    private snackBar: MatSnackBar,
    private shoppingListsService: ShoppingListsService
  ) { }

  public ngOnInit(): void {
    this.editItem = {...this.data.item};
    this.imagePreviewUrl = this.editItem.imageData?.imageUrl!;
  }

  public resetShoppingItemName(): void {
    this.editItem.name = "";
  }

  public onImageSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.uploadedFile = event.target.files[0];

      var reader = new FileReader();
      reader.onload = (event: any) => {
          this.imagePreviewUrl = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
      event.target.value = '';
    }
  }

  public removeImage(): void {
    this.imagePreviewUrl = null;
    this.uploadedFile = null;
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public showSnackbar(message: string): void {
    this.snackBar.open(
      message, 'Ok', {
        duration: environment.snackbarDuration,
        panelClass: ['snackbar']
      }
    );
  }

  public edit(): void {
    if (!this.editItem.name || !this.editItem.quantity || !this.editItem.unit) {
      this.showSnackbar("The provided input for the new item is invalid");
      return;
    }

    this.showSpinner = true;

    let removeOld: boolean;
    let uploadNew: boolean;

    // There was no image previously and no new image was uploaded or there was an image and it's still the same image
    if ((this.editItem.imageData === null && this.imagePreviewUrl === null) || (this.editItem.imageData !== null && this.editItem.imageData.imageUrl === this.imagePreviewUrl)) {
      removeOld = false;
      uploadNew = false;
    }
    //  There was an image, but it got removed
    else if (this.editItem.imageData !== null && this.imagePreviewUrl === null) {
      removeOld = true;
      uploadNew = false
    }
    //  There was an image, but it got updated with a new one
    else if (this.editItem.imageData !== null && this.uploadedFile !== null) {
      removeOld = true;
      uploadNew = true;
    }
    // There was no image previously, but new image got uploaded
    else if (this.editItem.imageData === null && this.uploadedFile !== null) {
      removeOld = false;
      uploadNew = true;
    }

    this.shoppingListsService.updateShoppingListItem(this.data.listId, this.data.itemIndex, this.editItem, removeOld!, uploadNew!, this.uploadedFile!).subscribe({
      next: () => {
        this.showSpinner = false;
        this.dialogRef.close();
      },
      error: () => {
        this.showSpinner = false;
        this.showSnackbar("Error occured while updating the shopping list item");
      }
    });

  }

}
