import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { LoginAuthService } from "../../../../../core/services/login-auth.service";
import { IUser } from "../../../models/user.model";
import { NotificationService } from "../../../../../core/services/public/notification.service";
import { REGEXP_ENV } from "../../../../../../environments/env";
import { ProgressBarComponent } from "../../shared/loading-Animations/progress-bar/progress-bar.component";
import { getValidationMessage } from "../../../../../core/utils/form-validation.utils";


@Component({
    selector: 'app-change-password',
    templateUrl: './change_password.component.html',
    imports: [ReactiveFormsModule, CommonModule, RouterLink, ProgressBarComponent]
})
export class ChangePasswordComponent implements OnInit {
    private readonly _route = inject(ActivatedRoute);
    private readonly _loginService = inject(LoginAuthService);
    private readonly _fb = inject(FormBuilder);
    private readonly _toastr = inject(NotificationService);

    regexp = REGEXP_ENV;
    verificationState: 'verified' | 'loading' | 'error' | 'done' = 'loading';
    errorMessage = '';
    user!: IUser;
    hidePassword = true;

    form: FormGroup = this._fb.group({
        password: ['', [Validators.required, Validators.pattern(REGEXP_ENV.password)]],
        confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    ngOnInit(): void {
        this.verifyToken()
    }

    verifyToken() {
        const token = this._route.snapshot.queryParamMap.get('verification_token');

        if (!token) {
            this.verificationState = "verified";
            this.errorMessage = 'Error'
            return;
        }

        this._loginService.verifyToken(token).subscribe({
            next: (data) => {
                this.user = {
                    email: data.email,
                    type: data.type
                }
                this.verificationState = "verified";
            },
            error: (err) => {
                this.verificationState = 'error';
                this.errorMessage = err.error.message;
                console.error(err)
            }
        });
    }

    submitForm() {
        const controls = {
            password: this.form.get('password'),
            confirmPassword: this.form.get('confirmPassword'),
        }

        if (this.form.valid) {
            this.user['password'] = controls.password?.value;

            this._loginService.changePassword(this.user).subscribe({
                next: () => {
                    this.verificationState = 'done';
                },
                error: (err) => {
                    console.error(err);
                    this.verificationState = 'error';
                    this.errorMessage = err.error.message;
                }
            });
        } else {
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

    private passwordMatchValidator(formGroup: FormGroup) {
        const password = formGroup.get('password')?.value;
        const confirmPassword = formGroup.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { mismatch: true };
    }
}