import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginDto } from '../dtos/login-dto';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  public loginFormGroup: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  public showSpinner: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  public submitForm(): void {
    if (this.loginFormGroup.invalid)
      return;

    const loginDto: LoginDto = {
      email: this.loginFormGroup.get('email')?.value,
      password: this.loginFormGroup.get('password')?.value,
    };

    this.showSpinner = true;

    this.authService.login(loginDto).subscribe({
      next: () => {
        this.showSpinner = false;
      },
      error: () => {
        this.showSpinner = false;
      }
    });
  }

}
