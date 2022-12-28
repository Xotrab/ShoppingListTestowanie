import { FormControl, FormGroupDirective, NgForm } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";

export class PasswordStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl, form: FormGroupDirective | NgForm): boolean {
        return control?.parent?.errors?.['passwordMismatch'] && (control?.touched && control?.dirty);
    }

}