import { ChangeDetectionStrategy, Component, inject, Input, signal } from "@angular/core";
import { ISignupConfig } from "../../../../config/signup.config";
import { CommonModule } from "@angular/common";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { SignupAuthService } from "../../../../../core/services/signup-auth.service";
import { Router, RouterLink } from "@angular/router";
import { AlertService } from "../../../../../core/services/public/alert.service";
import { OtpComponent } from "../../../UI/forms/otp/otp.component";
import { IUser } from "../../../models/user.model";

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
    private alert = inject(AlertService);

    @Input({ required: true }) config!: ISignupConfig;
    currentStep = signal(1)
    email = '';
    username = '';
    password = '';
    regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/


    // Step: 1
    form: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.pattern(this.regexPassword)]]
    });

    constructor() {
        this.signupAuthService.currentStep$.subscribe(step => {
            this.currentStep.set(step);
        });
    }

    submitForm(): void {
        const controls = {
            email: this.form.get('email'),
            username: this.form.get('username'),
            password: this.form.get('password'),
        };

        if (this.currentStep() === 1) {
            if (this.hasValidationErrors(controls.email, 'email')) {
                return;
            }

            this.email = this.form.value.email;
            this.signupAuthService.initiateSignup(this.email, this.config.type).subscribe({
                error: (err) => {
                    if (err.error.statusCode === 409) {
                        this.alert.showToast(err.error.message, 'error');
                    } else {
                        console.error(err.error);
                    }
                },
            });
        }

        // Step: 3
        if (this.currentStep() === 3) {
            const hasErrors =
                this.hasValidationErrors(controls.username, 'username') ||
                this.hasValidationErrors(controls.password, 'password');

            if (hasErrors) {
                return;
            }

            const user: IUser = {
                email: this.form.value.email,
                username: this.form.value.username,
                password: this.form.value.password,
                type: this.config.type
            }

            this.signupAuthService.completeOtp(user).subscribe({
                next: () => {
                    const url: string = this.config.type === 'customer' ? 'login' : `${this.config.type}/login`;
                    this.router.navigate([url]);
                },
                error: (err) => console.log(err)
            });
        }
    }

    // Step: 2
    verifyOtp(code: string) {
        this.signupAuthService.verifyOtp(this.email, code).subscribe({
            error: (err) => {
                if (err.error.statusCode === 400) {
                    this.alert.showToast(err.error.message, 'error');
                } else {
                    console.log(err);
                }
            },
        });
    }

    resendOtp() {
        this.signupAuthService.initiateSignup(this.email, this.config.type).subscribe({
            next: () => this.alert.showToast('Otp resented', 'success'),
            error: (err) => console.error(err.error)
        });
    }

    private errorMessages: { [key: string]: { [key: string]: string } } = {
        email: {
            required: 'Email is required',
            email: 'Invalid email',
        },
        username: {
            required: 'Username is required',
            minLength: 'Username must be at least 3 characters',
        },
        password: {
            required: 'Password is required',
            pattern: 'Password does not meet the required format',
        },
    };

    private hasValidationErrors(control: AbstractControl | null, fieldName: string): boolean {
        if (control?.errors) {
            Object.keys(control.errors).forEach((key) => {
                if (this.errorMessages[fieldName]?.[key]) {
                    this.alert.showToast(this.errorMessages[fieldName][key], 'error');
                }
            });
            return true;
        }
        return false;
    }
}