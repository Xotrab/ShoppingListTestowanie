import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShoppingListsService } from '../services/shopping-lists.service';
import { MatRadioButtonHarness } from '@angular/material/radio/testing';

import { EditItemDialogComponent } from './edit-item-dialog.component';
import { ShoppingItemDto } from '../dtos/shopping-item-dto';
import { MatButtonHarness } from '@angular/material/button/testing';
import { of, throwError } from 'rxjs';

fdescribe('EditItemDialogComponent', () => {
  let component: EditItemDialogComponent;
  let fixture: ComponentFixture<EditItemDialogComponent>;

  let shoppingListsServiceSpy: jasmine.SpyObj<ShoppingListsService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<EditItemDialogComponent>>;

  let loader: HarnessLoader;

  beforeEach(async () => {
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>(['open']);
    shoppingListsServiceSpy = jasmine.createSpyObj<ShoppingListsService>(['updateShoppingListItem']);
    matDialogRefSpy = jasmine.createSpyObj<MatDialogRef<EditItemDialogComponent>>(['close']);

    await TestBed.configureTestingModule({
      declarations: [ 
        EditItemDialogComponent 
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
        { provide: ShoppingListsService, useValue: shoppingListsServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: {
          item: {
            name: "name",
            quantity: 4,
            unit: "kg",
            imageData: null,
            purchased: true
          } as ShoppingItemDto
        } },
        { provide: MatDialogRef, useValue: matDialogRefSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditItemDialogComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset editItem name property on radio button click', async () => {
    component.ngOnInit();

    const radioButton = await loader.getHarness(MatRadioButtonHarness);

    await radioButton.check();

    fixture.detectChanges();

    expect(component.editItem.name).toBe("");
  });

  it('should reset imagePreviewUrl and uploadedFile properties on remove image button click', async () => {
    component.imagePreviewUrl = "mockUrl";
    component.uploadedFile = new File([""], "filename", { type: 'text/html' });

    fixture.detectChanges();

    const button = await loader.getHarness(MatButtonHarness.with({text: "Remove image"}));

    await button.click();

    fixture.detectChanges();

    expect(component.imagePreviewUrl).toBeFalsy();
    expect(component.uploadedFile).toBeFalsy();
  });

  it('should close dialog on cancel button click', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({text: "Cancel"}));

    await button.click();

    expect(matDialogRefSpy.close).toHaveBeenCalled();
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

  it('should open snackBar and not call service update method when the name was not provided', async () => {
    component.editItem.name = "";

    const button = await loader.getHarness(MatButtonHarness.with({text: "Edit item"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
    expect(shoppingListsServiceSpy.updateShoppingListItem).not.toHaveBeenCalled();
  });

  it('should open snackBar and not call service update method when the quantity was not provided', async () => {
    component.editItem.quantity = null;

    const button = await loader.getHarness(MatButtonHarness.with({text: "Edit item"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
    expect(shoppingListsServiceSpy.updateShoppingListItem).not.toHaveBeenCalled();
  });

  it('should open snackBar and not call service update method when the unity was not provided', async () => {
    component.editItem.unit = "";

    const button = await loader.getHarness(MatButtonHarness.with({text: "Edit item"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
    expect(shoppingListsServiceSpy.updateShoppingListItem).not.toHaveBeenCalled();
  });

  it('should open snackBar and not call service update method when the quantity was not provided', async () => {
    component.editItem.quantity = null;

    const button = await loader.getHarness(MatButtonHarness.with({text: "Edit item"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
    expect(shoppingListsServiceSpy.updateShoppingListItem).not.toHaveBeenCalled();
  });

  it('should hide spinner and close dialog on successfull update service call', async () => {
    shoppingListsServiceSpy.updateShoppingListItem.and.returnValue(of(void 0));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Edit item"}));

    await button.click();

    expect(component.showSpinner).toBeFalse();
    expect(matDialogRefSpy.close).toHaveBeenCalled();
  });

  it('should hide spinner and show snackBar on when update service call throws error', async () => {
    shoppingListsServiceSpy.updateShoppingListItem.and.returnValue(throwError(() => new Error("Error occured")));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Edit item"}));

    await button.click();

    expect(component.showSpinner).toBeFalse();
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should call update item with removeOld as false and uploadNew as false if the image was previously present and not removed', async () =>{
    component.editItem.imageData = {
      documentPath: "",
      imageUrl: "someUrl"
    };

    component.imagePreviewUrl = "someUrl";
    component.uploadedFile = new File([""], "filename", { type: 'text/html' });

    shoppingListsServiceSpy.updateShoppingListItem.and.returnValue(of(void 0));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Edit item"}));

    await button.click();

    expect(shoppingListsServiceSpy.updateShoppingListItem).toHaveBeenCalledOnceWith(component.data.listId, component.data.itemIndex, component.editItem, false, false, component.uploadedFile);
  });

  it('should call update item with removeOld as true and uploadNew as false if the image was previously present and got removed', async () =>{
    component.editItem.imageData = {
      documentPath: "",
      imageUrl: "someUrl"
    };

    component.imagePreviewUrl = null;
    component.uploadedFile = new File([""], "filename", { type: 'text/html' });

    shoppingListsServiceSpy.updateShoppingListItem.and.returnValue(of(void 0));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Edit item"}));

    await button.click();

    expect(shoppingListsServiceSpy.updateShoppingListItem).toHaveBeenCalledOnceWith(component.data.listId, component.data.itemIndex, component.editItem, true, false, component.uploadedFile);
  });

  it('should call update item with removeOld as true and uploadNew as true if the image was previously present and got updated with a new one', async () =>{
    component.editItem.imageData = {
      documentPath: "",
      imageUrl: "someUrl"
    };

    component.uploadedFile = new File([""], "filename", { type: 'text/html' });

    shoppingListsServiceSpy.updateShoppingListItem.and.returnValue(of(void 0));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Edit item"}));

    await button.click();

    expect(shoppingListsServiceSpy.updateShoppingListItem).toHaveBeenCalledOnceWith(component.data.listId, component.data.itemIndex, component.editItem, true, true, component.uploadedFile);
  });

  it('should call update item with removeOld as false and uploadNew as true if the image was not previously present and new image got uplaoded', async () =>{
    component.editItem.imageData = null;

    component.uploadedFile = new File([""], "filename", { type: 'text/html' });

    shoppingListsServiceSpy.updateShoppingListItem.and.returnValue(of(void 0));

    const button = await loader.getHarness(MatButtonHarness.with({text: "Edit item"}));

    await button.click();

    expect(shoppingListsServiceSpy.updateShoppingListItem).toHaveBeenCalledOnceWith(component.data.listId, component.data.itemIndex, component.editItem, false, true, component.uploadedFile);
  });
});
