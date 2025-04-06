import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { REGEXP_ENV } from '../../../../../environments/regex.environments';
import { MESSAGES_ENV } from '../../../../../environments/messages.environments';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { IUser } from '../../../models/user.model';
import { authActions } from '../../../../../store/actions/auth.actions';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
  imports: [ReactiveFormsModule, CommonModule],

})
export class AdminLoginComponent {

  private fb = inject(FormBuilder);
  private store = inject(Store);

  private regexp = REGEXP_ENV;
  private messages = MESSAGES_ENV;
  errorMessage: string = '';

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(this.regexp.password)]]
  });

  formSubmit() {
    const controls = {
      email: this.form.get('email'),
      password: this.form.get('password')
    };

    const hasError = this.hasValidationErrors(controls.email, 'email') ||
      this.hasValidationErrors(controls.password, 'password');

    if (hasError) return;

    const user: IUser = {
      email: controls.email?.value,
      password: controls.password?.value,
      type: 'admin'
    }

    if (this.form.valid) {
      this.store.dispatch(authActions.login({ user }));
    }

  }

  private hasValidationErrors(control: AbstractControl | null, fieldName: string): boolean {
    if (!control) return false;

    if (control.invalid && control.errors) {
      const errorKey = Object.keys(control.errors)[0];
      if (this.messages['errorMessages']?.[fieldName]?.[errorKey]) {
        this.errorMessage = this.messages['errorMessages'][fieldName][errorKey];
      }
      return true;
    }
    return false;
  }
}
