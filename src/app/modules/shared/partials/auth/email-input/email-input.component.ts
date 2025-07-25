import { CommonModule } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { LoginAuthService } from "../../../../../core/services/login-auth.service";
import { IUser, UserType } from "../../../models/user.model";
import { getValidationMessage } from "../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../core/services/public/toastr.service";


@Component({
    selector: 'app-email-input',
    templateUrl: './email-input.component.html',
    imports: [ReactiveFormsModule, CommonModule]
})
export class EmailInputComponent {
    private readonly _fb = inject(FormBuilder);
    private readonly _loginService = inject(LoginAuthService);
    private readonly _toastr = inject(ToastNotificationService);

    @Input({ required: true }) userType!: UserType;
    user!: IUser;

    form: FormGroup = this._fb.group({
        email: ['', [Validators.required, Validators.email],]
    });

    submitForm() {
        const emailControl = this.form.get('email');

        const errorMessage = getValidationMessage(emailControl, 'email');
        if (errorMessage) {
            this._toastr.error(errorMessage);
            return;
        };

        this.user = {
            email: this.form.value.email,
            type: this.userType
        }

        this._loginService.forgotPassword(this.user).subscribe({
            next: (response) => console.log(response),
            error: (err) => console.error(err)
        });
    }
}