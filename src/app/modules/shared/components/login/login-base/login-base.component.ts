import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ILoginConfig } from "../../../../config/login.config";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { REGEXP_ENV } from "../../../../../environments/regex.environments";
import { MESSAGES_ENV } from "../../../../../environments/messages.environments";
import { AlertService } from "../../../../../core/services/public/alert.service";
import { IUser, UserType } from "../../../models/user.model";
import { LoginAuthService } from "../../../../../core/services/login-auth.service";
import { NotificationService } from "../../../../../core/services/public/notification.service";
import { EmailInputComponent } from "../../../UI/forms/email-input/email-input.component";

@Component({
    selector: 'app-login-base',
    templateUrl: './login-base.component.html',
    styleUrl: './login-base.component.scss',
    imports: [CommonModule, ReactiveFormsModule, EmailInputComponent,]
})
export class LoginBaseComponent {
    private fb = inject(FormBuilder);
    private alert = inject(AlertService);
    private loginService = inject(LoginAuthService);
    private notyf = inject(NotificationService);

    @Input({ required: true }) config!: ILoginConfig;
    regexp = REGEXP_ENV;
    messages = MESSAGES_ENV;
    hidePassword = true;
    forgotPassword = false;
    type!: UserType;

    form: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(this.regexp.password)]]
    });

    submitForm() {
        const controls = {
            email: this.form.get('email'),
            password: this.form.get('password')
        }

        const hasErrors = this.hasValidationErrors(controls.email, 'email') ||
            this.hasValidationErrors(controls.password, 'password');
        if (hasErrors) return;

        const user: IUser = {
            email: this.form.value.email,
            password: this.form.value.password,
            type: this.config.type
        }

        this.loginService.authCredentials(user).subscribe({
            next: (response) => console.log(response),
            error: (err) => {
                if (err.status === 404) {
                    // this.alert.showToast(err.error.message, 'error');
                    this.notyf.error(err.error.message)
                } else if (err.status = 401) {
                    this.notyf.error(err.error.message)
                }
                console.log(err)
            }
        });
    }

    togglePasswordVisibility() {
        this.hidePassword = !this.hidePassword;
    }

    toggleForgotPassword() {
        this.forgotPassword = !this.forgotPassword;
        this.type = this.config.type;
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
