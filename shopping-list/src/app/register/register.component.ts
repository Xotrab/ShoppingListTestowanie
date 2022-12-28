import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PasswordStateMatcher } from '../helpers/password-state-matcher';
import { emailValidator, matchingPasswordValidator, passwordValidator, usernameValidator } from '../helpers/validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public registerFormGroup: FormGroup = new FormGroup({
    email: new FormControl('', [emailValidator]),
    username: new FormControl('', [usernameValidator]),
    password: new FormControl('', [passwordValidator]),
    confirmPassword: new FormControl('', [passwordValidator])
  }, {validators: matchingPasswordValidator});

  public passwordStateMatcher = new PasswordStateMatcher();

  public showSpinner: boolean = false;

  constructor() { }

  public ngOnInit(): void {
  }

  public navigateToLoginForm(): void {
    
  }

  public submitForm(): void {

  }

}
