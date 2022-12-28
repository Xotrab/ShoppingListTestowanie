import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { RegisterDto } from '../dtos/register-dto';
import { PasswordStateMatcher } from '../helpers/password-state-matcher';
import { emailValidator, matchingPasswordValidator, passwordValidator, usernameValidator } from '../helpers/validators';
import { AuthService } from '../services/auth.service';

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

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) { }

  public ngOnInit(): void {
  }

  public submitForm(): void {
    if (this.registerFormGroup.invalid) {
      this.snackBar.open(
        "The provided input is invalid", 'Ok', {
          duration: environment.snackbarDuration,
          panelClass: ['snackbar']
        }
      );

      return;
    }

    const registerDto: RegisterDto = {
      username: this.registerFormGroup.get('username')?.value,
      email: this.registerFormGroup.get('email')?.value,
      password: this.registerFormGroup.get('password')?.value,
      confirmPassword: this.registerFormGroup.get('confirmPassword')?.value
    };

    this.showSpinner = true;

    this.authService.register(registerDto).subscribe({
      next: () => {
        this.authService.updateUsername(registerDto.username);
        this.showSpinner = false;
        this.router.navigate(['home']);
      },
      error: () => {
        this.showSpinner = false;
        this.snackBar.open(
          "Error occured, please try again", 'Ok', {
            duration: environment.snackbarDuration,
            panelClass: ['snackbar']
          }
        );
      }
    });
  }

}
