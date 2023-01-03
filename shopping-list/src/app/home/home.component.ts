import { NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { filter } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ShoppingListDto } from '../dtos/shopping-list-dto';
import { AuthService } from '../services/auth.service';
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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    {provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMAT}
  ]
})
export class HomeComponent implements OnInit {
  public dataSource = new MatTableDataSource<ShoppingListDto>();
  public displayedColumns: string[] = ['position', 'name', 'deadline', 'itemCount', 'action'];

  public shoppingList: ShoppingListDto = {
    name: "",
    deadline: "",
    userId: "",
    items: []
  };

  constructor(private shoppingListsService: ShoppingListsService, private authService: AuthService, private snackBar: MatSnackBar) { }

  public ngOnInit(): void {
    this.shoppingListsService.shoppingLists$.subscribe(shoppingLists => this.dataSource.data = shoppingLists);

    this.authService.currentUser$.pipe(
      filter(currentUser => currentUser !== null)
    )
    .subscribe(currentUser => this.shoppingList.userId = currentUser?.id!);
  }

  public removeShoppingList(id: string): void {
    this.shoppingListsService.removeShoppingList(id);
  }

  public showSnackbar(message: string): void {
    this.snackBar.open(
      message, 'Ok', {
        duration: environment.snackbarDuration,
        panelClass: ['snackbar']
      }
    );
  }

  public createShoppingList(): void {
    if (!this.shoppingList.name || !this.shoppingList.deadline) {
      this.showSnackbar("Please provide the name and the deadline in order to create the shopping list");
      return;
    }

    this.shoppingListsService.createShoppingList({...this.shoppingList});

    // reset the fields after creating the new shopping list
    this.shoppingList.name = "";
    this.shoppingList.deadline = "";
  }

}
