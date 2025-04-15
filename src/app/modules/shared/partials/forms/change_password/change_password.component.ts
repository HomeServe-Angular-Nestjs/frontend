import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ProgressBarComponent } from "../../loading-Animations/progress-bar/progress-bar.component";
import { LoginAuthService } from "../../../../../core/services/login-auth.service";
import { REGEXP_ENV } from "../../../../../environments/regex.environments";
import { MESSAGES_ENV } from "../../../../../environments/messages.environments";
import { IUser } from "../../../models/user.model";
import { NotificationService } from "../../../../../core/services/public/notification.service";


@Component({
    selector: 'app-change-password',
    templateUrl: './change_password.component.html',
    imports: [ReactiveFormsModule, CommonModule, ProgressBarComponent, RouterLink]
})
export class ChangePasswordComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private loginService = inject(LoginAuthService);
    private fb = inject(FormBuilder);
    private notyf = inject(NotificationService);

    regexp = REGEXP_ENV;
    messages = MESSAGES_ENV;
    verificationState: 'verified' | 'loading' | 'error' | 'done' = 'loading';
    errorMessage = '';
    user!: IUser;
    hidePassword = true;

    form: FormGroup = this.fb.group({
        password: ['', [Validators.required, Validators.pattern(REGEXP_ENV.password)]],
        confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    ngOnInit(): void {
        this.verifyToken()
    }

    verifyToken() {
        const token = this.route.snapshot.queryParamMap.get('verification_token');

        if (!token) {
            this.verificationState = "verified";
            this.errorMessage = 'Error'
            return;
        }

        this.loginService.verifyToken(token).subscribe({
            next: (data) => {
                this.user = {
                    email: data.email,
                    type: data.type
                }
                this.verificationState = "verified";
            },
            error: (err) => {
                console.log(err)
                this.verificationState = 'error';
                this.errorMessage = err.error.message;
            }
        });
    }

    submitForm() {
        const controls = {
            password: this.form.get('password'),
            confirmPassword: this.form.get('confirmPassword'),
        }

        const hasErrors = this.hasValidationErrors(controls.password, 'password') ||
            this.hasValidationErrors(controls.confirmPassword, 'confirmPassword');
        if (hasErrors) return;

        this.user['password'] = controls.password?.value;

        this.loginService.changePassword(this.user).subscribe({
            next: () => {
                this.verificationState = 'done';
            },
            error: (err) => {
                console.error(err);
                this.verificationState = 'error';
                this.errorMessage = err.error.message;
            }
        });
    }

    togglePasswordVisibility() {
        this.hidePassword = !this.hidePassword;
    }

    private passwordMatchValidator(formGroup: FormGroup) {
        const password = formGroup.get('password')?.value;
        const confirmPassword = formGroup.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { mismatch: true };
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