import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ProgressBarComponent } from "../../loading-Animations/progress-bar/progress-bar.component";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { LoginAuthService } from "../../../../../core/services/login-auth.service";
import { REGEXP_ENV } from "../../../../../environments/regex.environments";
import { MESSAGES_ENV } from "../../../../../environments/messages.environments";
import { ValidateForm } from "../../../validations/form-validation.service";
import { IUser } from "../../../models/user.model";


@Component({
    selector: 'app-change-password',
    templateUrl: './change_password.component.html',
    imports: [ReactiveFormsModule, CommonModule, ProgressBarComponent, RouterLink]
})
export class ChangePasswordComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);
    private router = inject(Router);
    private loginService = inject(LoginAuthService);
    private fb = inject(FormBuilder);

    private validateForm = inject(ValidateForm);

    regexp = REGEXP_ENV;
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

        const hasErrors = this.validateForm.hasValidationErrors(controls.password, 'password') ||
            this.validateForm.hasValidationErrors(controls.confirmPassword, 'confirmPassword');
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

}