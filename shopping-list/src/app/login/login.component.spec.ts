import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
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
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

import { LoginComponent } from './login.component';

fdescribe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  let loader: HarnessLoader;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj<Router>(['navigate']);
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>(['open']);
    authServiceSpy = jasmine.createSpyObj<AuthService>(['login']);

    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
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

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should form be valid when the input was provided', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    
    const loginFormGroup = component.loginFormGroup;

    await emailInput.setValue("sample@domain.com");
    await passwordInput.setValue("Test1234");

    expect(loginFormGroup.valid).toBeTrue();
  });

  it('should form be invalid when the email was not provided', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    
    const loginFormGroup = component.loginFormGroup;

    await emailInput.setValue("");
    await passwordInput.setValue("Test1234");

    expect(loginFormGroup.invalid).toBeTrue();
  });

  it('should form be invalid when the password was not provided', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));
    
    const loginFormGroup = component.loginFormGroup;

    await emailInput.setValue("sample@domain.com");
    await passwordInput.setValue("");

    expect(loginFormGroup.invalid).toBeTrue();
  });

  it('should navigate to register form on register button click', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({selector: "#registerButton"}));

    await button.click();

    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/register']);
  });

  it('should not call login after submitting the form with invalid data', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));

    const loginFormGroup = component.loginFormGroup;

    await emailInput.setValue("sample@domain.com");
    await passwordInput.setValue("");

    const result = component.submitForm();

    expect(loginFormGroup.invalid).toBeTrue();
    expect(result).toBe(void 0);
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should hide spinner after a successfull login', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));

    await emailInput.setValue("sample@domain.com");
    await passwordInput.setValue("Test1234");

    const button = await loader.getHarness(MatButtonHarness.with({selector: "#loginButton"}));

    authServiceSpy.login.and.returnValue(of(true));

    await button.click();

    expect(component.showSpinner).toBeFalse();
  });

  it('should hide spinner and open snackbar after an error occured during login', async () => {
    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '#email' }));
    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '#password' }));

    await emailInput.setValue("sample@domain.com");
    await passwordInput.setValue("Test1234");

    const button = await loader.getHarness(MatButtonHarness.with({selector: "#loginButton"}));

    authServiceSpy.login.and.returnValue(throwError(() => new Error("Error occured")));

    await button.click();

    expect(component.showSpinner).toBeFalse();
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

});
