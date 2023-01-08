import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApplicationUser } from '../dtos/application-user';
import { FromFirebaseDatePipe } from '../helpers/from-firebase-date.pipe';
import { AuthService } from '../services/auth.service';
import { ShoppingListsService } from '../services/shopping-lists.service';

import { HomeComponent } from './home.component';

fdescribe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceMock: Partial<AuthService>;
  let shoppingListsServiceMock: Partial<ShoppingListsService>;

  let loader: HarnessLoader;

  beforeEach(async () => {
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>(['open']);
    routerSpy = jasmine.createSpyObj<Router>(['navigate']);

    authServiceMock = {
      currentUser$: of({id: "1", email: "", username: ""} as ApplicationUser)
    }

    shoppingListsServiceMock = {
      shoppingLists$: of([
        {
          name: 'name',
          userId: '1',
          items: [],
          deadline: null
        }
      ]),
      removeShoppingList: (index) => throwError(() => new Error("Error occured")),
      createShoppingList: (newShoppingList) => void 0
    }

    await TestBed.configureTestingModule({
      declarations: [ 
        HomeComponent,
        FromFirebaseDatePipe
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
        MatTableModule
      ],
      providers: [
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ShoppingListsService, useValue: shoppingListsServiceMock },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open snackBar upon clicking Create shopping list button when the name was not provided', async () => {
    component.shoppingList.name = "";
    component.deadlineInDate = new Date();

    const button = await loader.getHarness(MatButtonHarness.with({text: "Create shopping list"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should open snackBar upon clicking Create shopping list button when the deadline was not provided', async () => {
    component.shoppingList.name = "sampleName";
    component.deadlineInDate = null;

    const button = await loader.getHarness(MatButtonHarness.with({text: "Create shopping list"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should reset new shopping list fields after successfully creating the previous list', async () => {
    component.shoppingList.name = "sampleName";
    component.deadlineInDate = new Date();

    const button = await loader.getHarness(MatButtonHarness.with({text: "Create shopping list"}));

    await button.click();
    
    expect(component.shoppingList.name).toBe("");
    expect(component.shoppingList.deadline).toBe(null);
    expect(component.deadlineInDate).toBeFalsy();
  });

  it('should show snackBar when removeShoppingList throws error', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({text: "Remove"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should navigate to shopping list details after clicking on details button', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({text: "Details"}));

    await button.click();

    expect(routerSpy.navigate).toHaveBeenCalled();
  });
});
