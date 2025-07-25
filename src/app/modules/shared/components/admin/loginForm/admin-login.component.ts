import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IUser } from '../../../models/user.model';
import { authActions } from '../../../../../store/auth/auth.actions';
import { REGEXP_ENV } from '../../../../../environments/env';
import { getValidationMessage } from '../../../../../core/utils/form-validation.utils';
import { ToastNotificationService } from '../../../../../core/services/public/toastr.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
  imports: [ReactiveFormsModule, CommonModule],

})
export class AdminLoginComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _store = inject(Store);
  private readonly _toastr = inject(ToastNotificationService);

  private readonly _regexp = REGEXP_ENV;

  errorMessage: string = '';
  fPassword = false;

  form: FormGroup = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(this._regexp.password)]],
  });

  formSubmit() {
    const controls = {
      email: this.form.get('email'),
      password: this.form.get('password')
    };

    if (this.form.valid) {
      const user: IUser = {
        email: controls.email?.value,
        password: controls.password?.value,
        type: 'admin'
      }

      if (this.form.valid) {
        this._store.dispatch(authActions.login({ user }));
      }
    } else {
      for (const [key, control] of Object.entries(controls)) {
        const message = getValidationMessage(control, key);
        if (message) {
          this._toastr.error(message);
          return;
        }
      }
    }
  }

  forgotPassword() {
    this.fPassword = !this.fPassword;
  }
}
