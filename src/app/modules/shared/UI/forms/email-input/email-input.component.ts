import { CommonModule } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MESSAGES_ENV } from "../../../../../environments/messages.environments";
import { NotificationService } from "../../../../../core/services/public/notification.service";
import { LoginAuthService } from "../../../../../core/services/login-auth.service";
import { IUser, UserType } from "../../../models/user.model";

// type UserTye = 'customer' | 'provider';

@Component({
    selector: 'app-email-input',
    templateUrl: './email-input.component.html',
    imports: [ReactiveFormsModule, CommonModule]
})
export class EmailInputComponent {
    private fb = inject(FormBuilder);
    private loginService = inject(LoginAuthService);
    private notyf = inject(NotificationService);

    @Input({ required: true }) userType!: UserType;
    messages = MESSAGES_ENV;
    user!: IUser;

    form: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email],]
    });

    submitForm() {
        const emailControl = this.form.get('email');

        const hasErrors = this.hasValidationErrors(emailControl, 'email');
        if (hasErrors) return;

        this.user = {
            email: this.form.value.email,
            type: this.userType
        }

        this.loginService.forgotPassword(this.user).subscribe({
            next: (response) => console.log(response),
            error: (err) => console.error(err)
        });
    }

    private hasValidationErrors(control: AbstractControl | null, fieldName: string): boolean {
        if (control?.errors) {
            Object.keys(control.errors).forEach((key) => {
                if (this.messages['errorMessages'][fieldName]?.[key]) {
                    // this.alert.showToast(this.messages['errorMessages'][fieldName][key], 'error');
                    this.notyf.error(this.messages['errorMessages'][fieldName][key]);
                }
            });
            return true;
        }
        return false;
    }
}