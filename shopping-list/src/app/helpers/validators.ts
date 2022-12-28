import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const emailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const length = control.value.length;
    
    const regex =
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    const isValid = length > 0 && length < 100 && regex.test(control.value);

    return isValid ? null : { invalidEmail: true };
}

export const usernameValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const length = control.value.length;
    
    const isValid = length >= 2 && length <= 20;

    return isValid ? null : { invalidUsername: true };
}

export const passwordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const length = control.value.length;
    const hasDigit = /\d/.test(control.value);
    const hasLowerCaseLetter = /[a-z]/.test(control.value);
    const hasUpperCaseLetter = /[A-Z]/.test(control.value);
    
    const isValid = length >= 5 && length <= 25 && hasDigit && hasLowerCaseLetter && hasUpperCaseLetter;

    return isValid ? null : { invalidPassword: true };
}

export const matchingPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const passwordControl = control.get('password') as FormControl;
    const confirmPasswordControl = control.get('confirmPassword') as FormControl;

    const isValid = (passwordControl.untouched && passwordControl.pristine) ||
                    (confirmPasswordControl.untouched && confirmPasswordControl.pristine) ||
                    passwordControl.value === confirmPasswordControl.value;
    
    return isValid ? null : {passwordMismatch: true};
}