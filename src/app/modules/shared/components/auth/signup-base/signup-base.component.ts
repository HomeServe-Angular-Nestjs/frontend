import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { ISignupConfig } from "../../../../config/signup.config";
import { CommonModule } from "@angular/common";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { SignupAuthService } from "../../../../../core/services/signup-auth.service";
import { Router, RouterLink } from "@angular/router";
import { IUser, UserType } from "../../../models/user.model";
import { OtpComponent } from "../../../partials/auth/otp/otp.component";
import { getValidationMessage } from "../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../core/services/public/toastr.service";
import { REGEXP_ENV } from "../../../../../environments/env";

@Component({
    selector: 'app-signup-base',
    templateUrl: './signup-base.component.html',
    styleUrl: './signup-base.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, ReactiveFormsModule, OtpComponent, RouterLink]
})
export class SignupBaseComponent {
    private signupAuthService = inject(SignupAuthService);
    private router = inject(Router);
    private fb = inject(FormBuilder);
    private _toastr = inject(ToastNotificationService);

    @Input({ required: true }) config!: ISignupConfig;

    private pattern = REGEXP_ENV.password;
    isValidForm = false;
    user!: IUser;

    // Step: 1
    form: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.pattern(this.pattern)]]
    });

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
        this.signupAuthService.verifyOtp(this.user.email, code).subscribe({
            next: () => this.finalizeSignup(this.user),
            error: (err) => this._toastr.error(err),
        });
    }

    finalizeSignup(user: IUser) {
        this.signupAuthService.completeOtp(user).subscribe({
            next: () => {
                const url: string = this.user.type === 'customer' ? 'login' : `${this.user.type}/login`;
                this.router.navigate([url]);
            },
            error: (err) => this._toastr.error(err)
        });
    }

    resendOtp() {
        this.initializeSignup(this.user.email, this.user.type);
    }

    private initializeSignup(email: string, type: UserType) {
        this.signupAuthService.initiateSignup(email, type).subscribe({
            next: () => this.isValidForm = true,
            error: (err) => this._toastr.error(err)
        })
    }
}