import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatRadioButtonHarness } from '@angular/material/radio/testing';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Route, Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { of } from 'rxjs';
import { ShoppingListDto } from '../dtos/shopping-list-dto';
import { ShoppingListsService } from '../services/shopping-lists.service';

import { ShoppingListComponent } from './shopping-list.component';

fdescribe('ShoppingListComponent', () => {
  let component: ShoppingListComponent;
  let fixture: ComponentFixture<ShoppingListComponent>;

  let shoppingListsMock: Partial<ShoppingListsService>;
  let shoppingListsSubject: BehaviorSubject<ShoppingListDto[]>
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let routerSpy: jasmine.SpyObj<Router>;

  let loader: HarnessLoader;

  beforeEach(async () => {
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>(['open']);
    dialogSpy = jasmine.createSpyObj<MatDialog>(['open']);
    routerSpy = jasmine.createSpyObj<Router>(['navigate']);

    shoppingListsSubject = new BehaviorSubject<ShoppingListDto[]>([
      {
        id: '1',
        name: 'name',
        userId: '1',
        deadline: null,
        items: [
          {
            name: "item 1",
            quantity: 2,
            unit: "kg",
            imageData: null,
            purchased: true
          }
        ]
      },
      {
        id: '2',
        name: 'name2',
        userId: '1',
        deadline: null,
        items: []
      }
    ]);

    shoppingListsMock = {
      shoppingLists$: shoppingListsSubject.asObservable(),
      addShoppingListItem: () => of(void 0),
      removeShoppingListItem: () => of(void 0),
      updateShoppingListName: () => void 0,
      updateShoppingListDeadline: () => void 0
    };

    await TestBed.configureTestingModule({
      declarations: [ 
        ShoppingListComponent 
      ],
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule,
        NgxMatTimepickerModule,
        NgxMatDatetimePickerModule,
        NgxMatNativeDateModule,
        MatDatepickerModule,
        MatDividerModule,
        MatRadioModule,
        MatSelectModule,
        MatListModule,
        MatTableModule,
        MatCheckboxModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ActivatedRoute, useValue: {
          snapshot: {
            paramMap: convertToParamMap({
              id: '1'
            })
          }
        } },
        { provide: ShoppingListsService, useValue: shoppingListsMock },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoppingListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show snackBar when error occurs during the removeShoppingItem service call', async () => {
    fixture.detectChanges();

    const removeItemSpy = spyOn(shoppingListsMock, 'removeShoppingListItem').and.returnValue(throwError(() => new Error("Error occured")));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Remove"}));

    await button.click();

    expect(removeItemSpy).toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should navigate to /home on Back button click', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({text: "Back"}));

    await button.click();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should show snackBar with error message and not call the service method when adding and item with no name', async () => {
    component.newItem = {
      name: "",
      quantity: 1,
      unit: "kg",
      imageData: null,
      purchased: false
    };

    const addItemSpy = spyOn(shoppingListsMock, 'addShoppingListItem').and.returnValue(of(void 0));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Add item"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
    expect(addItemSpy).not.toHaveBeenCalled();
  });

  it('should show snackBar with error message and not call the service method when adding and item with no quantity', async () => {
    component.newItem = {
      name: "name",
      quantity: null,
      unit: "kg",
      imageData: null,
      purchased: false
    };

    const addItemSpy = spyOn(shoppingListsMock, 'addShoppingListItem').and.returnValue(of(void 0));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Add item"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
    expect(addItemSpy).not.toHaveBeenCalled();
  });

  it('should show snackBar with error message and not call the service method when adding and item with no unit', async () => {
    component.newItem = {
      name: "name",
      quantity: 1,
      unit: null,
      imageData: null,
      purchased: false
    };

    const addItemSpy = spyOn(shoppingListsMock, 'addShoppingListItem').and.returnValue(of(void 0));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Add item"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
    expect(addItemSpy).not.toHaveBeenCalled();
  });

  it('should call addShoppingListItem service method when the provided input was valid', async () => {
    component.newItem = {
      name: "name",
      quantity: 1,
      unit: "kg",
      imageData: null,
      purchased: false
    };

    const addItemSpy = spyOn(shoppingListsMock, 'addShoppingListItem').and.returnValue(of(void 0));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Add item"}));

    await button.click();

    expect(addItemSpy).toHaveBeenCalled();
  });

  it('should hide spinner and reset the new item properties on successfull addShoppingListItem result', async() => {
    component.newItem = {
      name: "name",
      quantity: 1,
      unit: "kg",
      imageData: null,
      purchased: false
    };

    const addItemSpy = spyOn(shoppingListsMock, 'addShoppingListItem').and.returnValue(of(void 0));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Add item"}));

    await button.click();

    expect(addItemSpy).toHaveBeenCalled();
    expect(component.showSpinner).toBeFalse();
    expect(component.newItem).toEqual(jasmine.objectContaining({
      name: "",
      quantity: null,
      unit: "",
      imageData: null,
      purchased: false
    }));
    expect(component.uploadedImagePreviewUrl).toBeFalsy();
    expect(component.uploadedFile).toBeFalsy();
  });

  it('should hide spinner and show snackBar on error returned from addShoppingListItem', async() => {
    component.newItem = {
      name: "name",
      quantity: 1,
      unit: "kg",
      imageData: null,
      purchased: false
    };

    const addItemSpy = spyOn(shoppingListsMock, 'addShoppingListItem').and.returnValue(throwError(() => new Error("Error occured")));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Add item"}));

    await button.click();

    expect(addItemSpy).toHaveBeenCalled();
    expect(component.showSpinner).toBeFalse();
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should show snackBar and not call updateShoppingListName service method when the provided name is the same and the update name button has been clicked', async () => {
    component.newShoppingListName = "test";
    component.shoppingList.name = "test";

    const UpdateNameSpy = spyOn(shoppingListsMock, 'updateShoppingListName');

    const button = await loader.getHarness(MatButtonHarness.with({text: "Update name"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
    expect(UpdateNameSpy).not.toHaveBeenCalled();
  });

  it('should call the updateShoppingListName service method when update name button has been clicked with a different name', async () => {
    component.newShoppingListName = "test2";
    component.shoppingList.name = "test";

    const UpdateNameSpy = spyOn(shoppingListsMock, 'updateShoppingListName');

    const button = await loader.getHarness(MatButtonHarness.with({text: "Update name"}));

    await button.click();

    expect(UpdateNameSpy).toHaveBeenCalledWith("1", "test2");
  });

  it('should reset editItem name property on radio button click', async () => {
    component.selectedMode= component.itemMode.Own;

    const radioButton = await loader.getHarness(MatRadioButtonHarness);

    await radioButton.check();

    expect(component.newItem.name).toBe("");
  });

  it('should show snackBar and not call updateShoppingListDeadline service method when the provided deadline is the same and the update deadline button has been clicked', async () => {
    component.deadlineInDate = new Date(100000);
    component.shoppingList.deadline = Timestamp.fromDate(new Date(100000));

    const UpdateDeadlineSpy = spyOn(shoppingListsMock, 'updateShoppingListDeadline');

    const button = await loader.getHarness(MatButtonHarness.with({text: "Update deadline"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
    expect(UpdateDeadlineSpy).not.toHaveBeenCalled();
  });

  it('should call updateShoppingListDeadline service method when the provided deadline is different from previous value and the update deadline button has been clicked', async () => {
    component.deadlineInDate = new Date(100000);
    component.shoppingList.deadline = Timestamp.fromDate(new Date(200000));

    const UpdateDeadlineSpy = spyOn(shoppingListsMock, 'updateShoppingListDeadline');

    const button = await loader.getHarness(MatButtonHarness.with({text: "Update deadline"}));

    await button.click();

    expect(snackBarSpy.open).not.toHaveBeenCalled();
    expect(UpdateDeadlineSpy).toHaveBeenCalled();
  });

  it('should open edit dialog after clicking on edit button of a shopping list item in a table', async () => {
    fixture.detectChanges();

    const button = await loader.getHarness(MatButtonHarness.with({text: "Edit"}));

    await button.click();

    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should set uploadedFile property when an image has been selected', async () => {
    const eventMock = {
      target: {
        files: [
          new File([""], "filename", { type: 'text/html' })
        ]
      }
    }

    component.onImageSelected(eventMock);

    expect(component.uploadedFile).toBe(eventMock.target.files[0]);
  });
});
