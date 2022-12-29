import { NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { COMMONLY_USED_ITEMS, DEFAULT_UNITS, ShoppingItemDto } from '../dtos/shopping-item-dto';
import { ShoppingListDto } from '../dtos/shopping-list-dto';
import { ItemMode } from '../helpers/item-mode.enum';

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
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.scss'],
  providers: [
    {provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMAT}
  ]
})
export class CreatorComponent implements OnInit {
  public itemMode = ItemMode;
  public selectedMode: ItemMode = this.itemMode.Common;

  public defaultUnits = DEFAULT_UNITS;
  public commonItems = COMMONLY_USED_ITEMS;

  public shoppingList: ShoppingListDto = {
    name: "",
    deadline: "",
    items: []
  };

  public newItem: ShoppingItemDto = {
    name: "",
    quantity: null,
    unit: "",
    imageId: null,
    purchased: false
  };

  public displayedColumns: string[] = ['position', 'item', 'quantity', 'unit'];

  public dataSource = new MatTableDataSource<ShoppingItemDto>();
  
  constructor(private snackBar: MatSnackBar) { }

  public ngOnInit(): void {
    this.dataSource.data = this.shoppingList.items;
  }

  public resetShoppingItemName(): void {
    this.newItem.name = "";
  }

  public addItem(): void {
    if (!this.newItem.name || !this.newItem.quantity || !this.newItem.unit || this.newItem.unit.includes("-")) {
      this.snackBar.open(
        "The provided input for the new item is invalid", 'Ok', {
          duration: environment.snackbarDuration,
          panelClass: ['snackbar']
        }
      );

      return;
    }
    
    this.shoppingList.items.push({...this.newItem });
    this.dataSource.data = this.shoppingList.items;

    this.newItem = {
      name: "",
      quantity: null,
      unit: "",
      imageId: null,
      purchased: false
    };
  }

  public removeItem(index: number): void {
    this.shoppingList.items.splice(index, 1);
    this.dataSource.data = this.shoppingList.items;
  }

}
