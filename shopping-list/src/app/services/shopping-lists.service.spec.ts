import { TestBed } from '@angular/core/testing';

import { ShoppingListsService } from './shopping-lists.service';

describe('ShoppingListsService', () => {
  let service: ShoppingListsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppingListsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
