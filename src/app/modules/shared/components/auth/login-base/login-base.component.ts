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
import { getValidationMessage } from "../../../../../core/utils/form-validation.utils";

@Component({
    selector: 'app-login-base',
    templateUrl: './login-base.component.html',
    styleUrl: './login-base.component.scss',
    imports: [CommonModule, ReactiveFormsModule, EmailInputComponent, RouterLink]
})
export class LoginBaseComponent {
    private _fb = inject(FormBuilder);
    private _store = inject(Store);
    private _notyf = inject(NotificationService);

    @Input({ required: true }) config!: ILoginConfig;
    regexp = REGEXP_ENV;
    hidePassword = true;
    forgotPassword = false;
    apiUrl = API_ENV.loginAuth
    type!: UserType;
    formError: string = 'Email required';

    form: FormGroup = this._fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(this.regexp.password)]]
    });

    submitForm() {
        const controls = {
            email: this.form.get('email'),
            password: this.form.get('password')
        }

        if (this.form.valid) {
            const user: IUser = {
                email: this.form.value.email,
                password: this.form.value.password,
                type: this.config.type
            }

            this._store.dispatch(authActions.login({ user }));
        } else {
            this.form.markAllAsTouched();
            for (const [key, control] of Object.entries(controls)) {
                const message = getValidationMessage(control, key);
                if (message) {
                    this._notyf.error(message);
                    return;
                }
            }
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
        this._store.dispatch(authActions.googleLogin({ userType: this.config.type }));
    }
}
