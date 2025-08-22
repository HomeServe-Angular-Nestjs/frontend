import { ChangeDetectionStrategy, Component, inject, Input, signal } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { ISignupConfig } from "../../../../config/signup.config";
import { SignupAuthService } from "../../../../../core/services/signup-auth.service";
import { IUser, UserType } from "../../../models/user.model";
import { OtpComponent } from "../../../partials/auth/otp/otp.component";
import { getValidationMessage } from "../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../core/services/public/toastr.service";
import { REGEXP_ENV } from "../../../../../../environments/env";
import { delay, finalize, switchMap, timer } from "rxjs";
import { LoadingService } from "../../../../../core/services/public/loading.service";

@Component({
    selector: 'app-signup-base',
    templateUrl: './signup-base.component.html',
    styleUrl: './signup-base.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, ReactiveFormsModule, OtpComponent, RouterLink],
    providers: [SignupAuthService]
})
export class SignupBaseComponent {
    private readonly _signupAuthService = inject(SignupAuthService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _loadingService = inject(LoadingService);
    private readonly _fb = inject(FormBuilder);
    private readonly _router = inject(Router);

    private pattern = REGEXP_ENV.password;

    @Input({ required: true }) config!: ISignupConfig;

    otpModal = signal(false);
    showPassword = false;
    user!: IUser;

    form: FormGroup = this._fb.group({
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.pattern(this.pattern)]]
    });

    private initializeSignup(email: string, type: UserType) {
        this._loadingService.show('Sending OTP...');

        timer(2000).pipe(
            switchMap(() =>
                this._signupAuthService.initiateSignup(email, type)
            ),
            finalize(() => this._loadingService.hide())
        ).subscribe({
            next: () => {
                this.otpModal.set(true);
            },
            error: (err) => {
                if (err?.message?.includes('exists')) {
                    this.otpModal.set(false);
                }
            }
        });
    }

    submitForm(): void {
        const controls = {
            email: this.form.get('email') as AbstractControl,
            username: this.form.get('username') as AbstractControl,
            password: this.form.get('password') as AbstractControl,
        };

        if (this.form.valid) {
            this.user = {
                email: controls.email.value,
                type: this.config.type,
                password: controls.password.value,
                username: controls.username.value
            }

            this.initializeSignup(this.user.email, this.user.type);

        } else {
            this.form.markAllAsTouched();
            const errorMessage = getValidationMessage(controls['email'], 'email')
                || getValidationMessage(this.form.get('username'), 'username')
                || getValidationMessage(this.form.get('password'), 'password')

            if (errorMessage) {
                this._toastr.error(errorMessage);
                return;
            }
        }
    }

    verifyOtp(code: string) {
        const data = { ...this.user, code };
        this._signupAuthService.verifyOtp(data)
            .subscribe({
                next: () => {
                    this._toastr.success('Otp verified.');
                    const url: string = this.user.type === 'customer'
                        ? 'login'
                        : `${this.user.type}/login`;
                    this._router.navigate([url]);
                },
                error: (err) => {
                    const isInvalid = err?.message?.toLowerCase()?.includes('invalid');
                    const isExpired = err?.message?.toLowerCase()?.includes('expired');
                    if (!isInvalid && !isExpired) this.otpModal.set(false);
                }
            });
    }

    resendOtp() {
        this.initializeSignup(this.user.email, this.user.type);
    }

    closeModal() {
        this.otpModal.set(false);
        // this.sendingOtp.set(false);
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }
}