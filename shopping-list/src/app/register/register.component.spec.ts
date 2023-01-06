import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatButtonHarness } from '@angular/material/button/testing';

import { RegisterComponent } from './register.component';
import { from, of, throwError } from 'rxjs';

fdescribe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  let loader: HarnessLoader;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj<Router>(['navigate']);
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>(['open']);
    authServiceSpy = jasmine.createSpyObj<AuthService>(['register', 'updateUsername']);

    await TestBed.configureTestingModule({
      declarations: [ RegisterComponent ],
      imports : [
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
        MatSnackBarModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should form be valid when input is valid', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const usernameInput = await loader.getHarness(MatInputHarness.with({ selector: '#username' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    const confirmPasswordInput = await loader.getHarness(MatInputHarness.with({ selector: '#confirmPassword' }));

    const registerFormGroup = component.registerFormGroup;

    await emailInput.setValue("sample@domain.com");
    await usernameInput.setValue("sampleName");
    await passwordInput.setValue("Test1234");
    await confirmPasswordInput.setValue("Test1234");

    expect(registerFormGroup.valid).toBeTrue();
  });

  it('should form be invalid when values were not provided', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const usernameInput = await loader.getHarness(MatInputHarness.with({ selector: '#username' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    const confirmPasswordInput = await loader.getHarness(MatInputHarness.with({ selector: '#confirmPassword' }));

    const registerFormGroup = component.registerFormGroup;

    await emailInput.setValue("");
    await usernameInput.setValue("");
    await passwordInput.setValue("");
    await confirmPasswordInput.setValue("");

    expect(registerFormGroup.invalid).toBeTrue();
  });

  it('should form be invalid when email is invalid', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const usernameInput = await loader.getHarness(MatInputHarness.with({ selector: '#username' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    const confirmPasswordInput = await loader.getHarness(MatInputHarness.with({ selector: '#confirmPassword' }));

    const registerFormGroup = component.registerFormGroup;

    await emailInput.setValue("sampleWrongValue");
    await usernameInput.setValue("sampleName");
    await passwordInput.setValue("Test1234");
    await confirmPasswordInput.setValue("Test1234");

    expect(registerFormGroup.invalid).toBeTrue();
    expect(registerFormGroup.controls['email'].errors!['invalidEmail']).toBeTruthy();
  });

  it('should form be invalid when username is longer than 20 characters', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const usernameInput = await loader.getHarness(MatInputHarness.with({ selector: '#username' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    const confirmPasswordInput = await loader.getHarness(MatInputHarness.with({ selector: '#confirmPassword' }));

    const registerFormGroup = component.registerFormGroup;

    await emailInput.setValue("sample@domain.com");
    await usernameInput.setValue("sampleNamesampleName1234");
    await passwordInput.setValue("Test1234");
    await confirmPasswordInput.setValue("Test1234");

    expect(registerFormGroup.invalid).toBeTrue();
    expect(registerFormGroup.controls['username'].errors!['invalidUsername']).toBeTruthy();
  });

  it('should form be invalid when username is shorter than 2 characters', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const usernameInput = await loader.getHarness(MatInputHarness.with({ selector: '#username' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    const confirmPasswordInput = await loader.getHarness(MatInputHarness.with({ selector: '#confirmPassword' }));

    const registerFormGroup = component.registerFormGroup;

    await emailInput.setValue("sample@domain.com");
    await usernameInput.setValue("u");
    await passwordInput.setValue("Test1234");
    await confirmPasswordInput.setValue("Test1234");

    expect(registerFormGroup.invalid).toBeTrue();
    expect(registerFormGroup.controls['username'].errors!['invalidUsername']).toBeTruthy();
  });

  it('should form be invalid when passwords do not match', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const usernameInput = await loader.getHarness(MatInputHarness.with({ selector: '#username' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    const confirmPasswordInput = await loader.getHarness(MatInputHarness.with({ selector: '#confirmPassword' }));

    const registerFormGroup = component.registerFormGroup;

    await emailInput.setValue("sample@domain.com");
    await usernameInput.setValue("sampleName");
    await passwordInput.setValue("Test1234");
    await confirmPasswordInput.setValue("Test123");

    expect(registerFormGroup.invalid).toBeTrue();
    expect(registerFormGroup.errors!['passwordMismatch']).toBeTruthy();
  });

  it('should form be invalid when password is too weak', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const usernameInput = await loader.getHarness(MatInputHarness.with({ selector: '#username' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    const confirmPasswordInput = await loader.getHarness(MatInputHarness.with({ selector: '#confirmPassword' }));

    const registerFormGroup = component.registerFormGroup;

    await emailInput.setValue("sample@domain.com");
    await usernameInput.setValue("sampleName");
    await passwordInput.setValue("password");
    await confirmPasswordInput.setValue("password");

    expect(registerFormGroup.invalid).toBeTrue();
    expect(registerFormGroup.controls['password'].errors!['invalidPassword']).toBeTruthy();
  });

  it('should update the username in AuthService, hide spinner and navigate to home after submitting valid form data', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const usernameInput = await loader.getHarness(MatInputHarness.with({ selector: '#username' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    const confirmPasswordInput = await loader.getHarness(MatInputHarness.with({ selector: '#confirmPassword' }));

    await emailInput.setValue("sample@domain.com");
    await usernameInput.setValue("sampleName");
    await passwordInput.setValue("Test1234");
    await confirmPasswordInput.setValue("Test1234");

    const button = await loader.getHarness(MatButtonHarness.with({selector: "#registerButton"}));

    authServiceSpy.register.and.returnValue(of(true));

    await button.click();

    const username = await usernameInput.getValue();
    expect(authServiceSpy.updateUsername).toHaveBeenCalledOnceWith(username);

    expect(component.showSpinner).toBeFalse();

    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['home']);
    
  });

  it('should hide spinner and open snackbar after an error occured during register service call', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const usernameInput = await loader.getHarness(MatInputHarness.with({ selector: '#username' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    const confirmPasswordInput = await loader.getHarness(MatInputHarness.with({ selector: '#confirmPassword' }));

    await emailInput.setValue("sample@domain.com");
    await usernameInput.setValue("sampleName");
    await passwordInput.setValue("Test1234");
    await confirmPasswordInput.setValue("Test1234");

    const button = await loader.getHarness(MatButtonHarness.with({selector: "#registerButton"}));

    authServiceSpy.register.and.returnValue(throwError(() => new Error("Error occured")));

    await button.click();

    expect(component.showSpinner).toBeFalse();
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should show snackbar with error message and not call register method after submitting the form with invalid data', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const usernameInput = await loader.getHarness(MatInputHarness.with({ selector: '#username' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    const confirmPasswordInput = await loader.getHarness(MatInputHarness.with({ selector: '#confirmPassword' }));

    await emailInput.setValue("sample@domain.com");
    await usernameInput.setValue("sampleName");
    await passwordInput.setValue("Test1234");
    await confirmPasswordInput.setValue("Test12345");

    const button = await loader.getHarness(MatButtonHarness.with({selector: "#registerButton"}));

    await button.click();

    expect(snackBarSpy.open).toHaveBeenCalled();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should navigate to login form on login button click', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({selector: "#loginButton"}));

    await button.click();

    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/']);
  });


});
