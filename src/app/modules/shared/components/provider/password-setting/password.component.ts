import { Component, inject, OnDestroy } from "@angular/core";
import { ButtonComponent } from "../../../../../UI/button/button.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { REGEXP_ENV } from "../../../../../../environments/env";
import { getValidationMessage, isPasswordMatches } from "../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../core/services/public/toastr.service";
import { ProviderService } from "../../../../../core/services/provider.service";
import { Subject, takeUntil } from "rxjs";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-provider-passwords',
  templateUrl: './password.component.html',
  imports: [ButtonComponent, ReactiveFormsModule, CommonModule]
})
export class ProviderPasswordsComponent implements OnDestroy {
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _providerService = inject(ProviderService);
  private readonly _fb = inject(FormBuilder);

  private _destroy$ = new Subject<void>();
  private readonly passwordRegex = REGEXP_ENV.password;

  isCurrentPasswordVisible = false;
  isNewPasswordVisible = false;
  isConfirmPasswordVisible = false;

  form: FormGroup = this._fb.group({
    currentPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
    newPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
    confirmPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]]
  }, {
    validators: [isPasswordMatches('newPassword', 'confirmPassword')]
  });

  onSubmit() {
    this.form.markAllAsTouched();

    const controls = {
      currentPassword: this.form.get('currentPassword'),
      confirmPassword: this.form.get('confirmPassword'),
      newPassword: this.form.get('newPassword'),
    }

    if (this.form.valid) {
      const current = (controls.currentPassword?.value ?? '').trim();
      const newPassword = (controls.newPassword?.value ?? ''.trim());

      if (!current || !newPassword) {
        this._toastr.error('Invalid credentials');
        return;
      }

      if (current === newPassword) {
        this._toastr.error("Current Password and new password should\'nt be the same.");
        return;
      }

      this._providerService.updatePassword(current, newPassword)
        .pipe(takeUntil(this._destroy$))
        .subscribe();
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

  toggleCurrentPasswordVisibility() { this.isCurrentPasswordVisible = !this.isCurrentPasswordVisible }
  toggleNewPasswordVisibility() { this.isNewPasswordVisible = !this.isNewPasswordVisible }
  toggleConfirmPasswordVisibility() { this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
