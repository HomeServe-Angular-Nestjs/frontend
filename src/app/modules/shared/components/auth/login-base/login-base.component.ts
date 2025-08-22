import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Store } from "@ngrx/store";
import { ILoginConfig } from "../../../../config/login.config";
import { IUser, UserType } from "../../../models/user.model";
import { REGEXP_ENV } from "../../../../../../environments/env";
import { authActions } from "../../../../../store/auth/auth.actions";
import { EmailInputComponent } from "../../../partials/auth/email-input/email-input.component";
import { getValidationMessage } from "../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../core/services/public/toastr.service";
import { OtpComponent } from "../../../partials/auth/otp/otp.component";
import { LoginAuthService } from "../../../../../core/services/login-auth.service";
import { finalize, switchMap, timer } from "rxjs";
import { LoadingService } from "../../../../../core/services/public/loading.service";
import { ChangePasswordComponent } from "../../../partials/auth/change_password/change_password.component";

@Component({
    selector: 'app-login-base',
    templateUrl: './login-base.component.html',
    styleUrl: './login-base.component.scss',
    imports: [CommonModule, ReactiveFormsModule, EmailInputComponent, RouterLink, OtpComponent, ChangePasswordComponent],
})
export class LoginBaseComponent {
    private readonly _loadingService = inject(LoadingService);
    private _toastr = inject(ToastNotificationService);
    private _loginService = inject(LoginAuthService);
    private _fb = inject(FormBuilder);
    private _store = inject(Store);

    @Input({ required: true }) config!: ILoginConfig;

    regexp = REGEXP_ENV;
    type!: UserType;

    hidePassword = true;
    emailForm = false;
    otpModal = false;
    email = '';
    changePasswordModal = false;

    form: FormGroup = this._fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(this.regexp.password)]]
    });

    private _requestOtp(user: IUser) {
        this._loadingService.show('Sending OTP...');
        timer(2000).pipe(
            switchMap(() =>
                this._loginService.requestOtpForForgotPass(user)
            ),
            finalize(() => this._loadingService.hide())
        ).subscribe();
    }

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
                    this._toastr.error(message);
                    return;
                }
            }
        }
    }

    togglePasswordVisibility() {
        this.hidePassword = !this.hidePassword;
    }

    toggleForgotPassword() {
        this.emailForm = !this.emailForm;
        this.otpModal = false;
        this.type = this.config.type;
    }

    openOtpModal(user: IUser) {
        this.closeEmailForm();
        this.emailForm = false;
        this.email = user.email;
        this.otpModal = true;
        this._requestOtp(user);
    }

    verifyOtp(code: string) {
        this._loginService.verifyOtpForForgotPass(this.email, code)
            .subscribe({
                next: () => {
                    this._toastr.success('Otp verified.');
                    this.changePasswordModal = true;
                },
                error: (err) => {
                    const isInvalid = err?.message?.toLowerCase()?.includes('invalid');
                    const isExpired = err?.message?.toLowerCase()?.includes('expired');
                    if (!isInvalid && !isExpired) this.otpModal = false;
                }
            });
    }

    resendOtp() {
        this._requestOtp({ email: this.email, type: this.config.type });
    }

    changePassword(newPassword: string) {
        this._loadingService.show('Please wait...')
        timer(2000).pipe(
            switchMap(() =>
                this._loginService.changePassword(this.email, newPassword, this.config.type)
            ),
            finalize(() => this._loadingService.hide())
        ).subscribe({
            next: () => {
                this.closeChangePasswordModal();
                this._toastr.success('Password changed successfully');
            }
        });
    }

    getGoogleAuthUrl() {
        this._store.dispatch(authActions.googleLogin({ userType: this.config.type }));
    }

    closeEmailForm() {
        this.emailForm = false;
    }

    closeOtpModal() {
        this.closeEmailForm();
        this.emailForm = false;
        this.otpModal = false;
    }

    closeChangePasswordModal() {
        this.changePasswordModal = false;
        this.closeOtpModal();
    }
}
