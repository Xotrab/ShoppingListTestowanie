import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ShoppingListDto } from '../dtos/shopping-list-dto';
import { ShoppingListsService } from '../services/shopping-lists.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public dataSource = new MatTableDataSource<ShoppingListDto>();
  public displayedColumns: string[] = ['position', 'name', 'deadline', 'itemCount', 'action'];

  constructor(private shoppingListsService: ShoppingListsService) { }

  public ngOnInit(): void {
    this.shoppingListsService.shoppingLists$.subscribe(shoppingLists => this.dataSource.data = shoppingLists);
  }

  public removeShoppingList(id: string): void {
    this.shoppingListsService.removeShoppingList(id);
  }

}
