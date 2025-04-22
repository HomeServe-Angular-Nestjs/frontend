import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Store } from "@ngrx/store";
import { REGEXP_ENV } from "../../../../../environments/regex.environments";
import { ILoginConfig } from "../../../../config/login.config";
import { MESSAGES_ENV } from "../../../../../environments/messages.environments";
import { IUser, UserType } from "../../../models/user.model";
import { NotificationService } from "../../../../../core/services/public/notification.service";
import { API_ENV } from "../../../../../environments/api.environments";
import { authActions } from "../../../../../store/auth/auth.actions";
import { EmailInputComponent } from "../../../partials/auth/email-input/email-input.component";

@Component({
    selector: 'app-login-base',
    templateUrl: './login-base.component.html',
    styleUrl: './login-base.component.scss',
    imports: [CommonModule, ReactiveFormsModule, EmailInputComponent, RouterLink]
})
export class LoginBaseComponent {
    private fb = inject(FormBuilder);
    private store = inject(Store);
    private notyf = inject(NotificationService);

    @Input({ required: true }) config!: ILoginConfig;
    regexp = REGEXP_ENV;
    messages = MESSAGES_ENV;
    hidePassword = true;
    forgotPassword = false;
    apiUrl = API_ENV.loginAuth
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

        if (this.form.valid) {
            this.store.dispatch(authActions.login({ user }));
        }
    }

    togglePasswordVisibility() {
        this.hidePassword = !this.hidePassword;
    }

    toggleForgotPassword() {
        this.forgotPassword = !this.forgotPassword;
        this.type = this.config.type;
    }

    getGoogleAuthUrl() {
        this.store.dispatch(authActions.googleLogin({ userType: this.config.type }));
    }

    private hasValidationErrors(control: AbstractControl | null, fieldName: string): boolean {
        if (control?.errors) {
            Object.keys(control.errors).forEach((key) => {
                if (this.messages['errorMessages'][fieldName]?.[key]) {
                    this.notyf.error(this.messages['errorMessages'][fieldName][key]);
                }
            });
            return true;
        }
        return false;
    }
}
