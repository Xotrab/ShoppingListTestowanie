import { NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { COMMONLY_USED_ITEMS, DEFAULT_UNITS, ShoppingItemDto } from '../dtos/shopping-item-dto';
import { ShoppingListDto } from '../dtos/shopping-list-dto';
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
    userId: "",
    items: []
  };

  public newItem: ShoppingItemDto = {
    name: "",
    quantity: null,
    unit: "",
    imageId: null,
    purchased: false
  };

  public shoppingListId!: string;

  public displayedColumns: string[] = ['position', 'item', 'quantity', 'unit', 'remove'];

  public dataSource = new MatTableDataSource<ShoppingItemDto>();
  
  constructor(private snackBar: MatSnackBar, private shoppingListsService: ShoppingListsService, private route: ActivatedRoute) { }

  public ngOnInit(): void {
    this.shoppingListId = this.route.snapshot.paramMap.get('id')!;
    this.shoppingListsService.shoppingLists$.subscribe(shoppingLists => {
      const maybeList = shoppingLists.find(shoppingList => shoppingList.id === this.shoppingListId);

      if (maybeList) {
        this.shoppingList = maybeList;
        this.dataSource.data = this.shoppingList.items;
      }
    });
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
    if (!this.newItem.name || !this.newItem.quantity || !this.newItem.unit || this.newItem.unit.includes("-")) {
      this.showSnackbar("The provided input for the new item is invalid");
      return;
    }
    
    this.shoppingListsService.addShoppingListItem(this.shoppingList.id!, {...this.newItem});

    this.newItem = {
      name: "",
      quantity: null,
      unit: "",
      imageId: null,
      purchased: false
    };
  }

  public removeItem(index: number): void {
    this.shoppingListsService.removeShoppingListItem(this.shoppingListId!, index);
  }

}
