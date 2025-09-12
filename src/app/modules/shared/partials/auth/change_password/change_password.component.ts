import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IUser } from "../../../models/user.model";
import { REGEXP_ENV } from "../../../../../../environments/env";
import { getValidationMessage, isPasswordMatches } from "../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../core/services/public/toastr.service";


@Component({
    selector: 'app-change-password',
    templateUrl: './change_password.component.html',
    imports: [ReactiveFormsModule, CommonModule]
})
export class ChangePasswordComponent {
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _fb = inject(FormBuilder);

    @Input({ required: true }) userType!: string;
    @Output() closeModalEvent = new EventEmitter<void>();
    @Output() newPasswordEvent = new EventEmitter<string>();

    regexp = REGEXP_ENV;
    user!: IUser;
    hidePassword: boolean = true;
    hideConfirmPassword: boolean = true;

    form: FormGroup = this._fb.group({
        newPassword: ['', [Validators.required, Validators.pattern(REGEXP_ENV.password)]],
        confirmPassword: ['', [Validators.required]]
    }, {
        validators: [
            isPasswordMatches('newPassword', 'confirmPassword')
        ]
    });

    submitForm() {
        const controls = {
            newPassword: this.form.get('newPassword'),
            confirmPassword: this.form.get('confirmPassword'),
        }

        for (const [key, control] of Object.entries(controls)) {
            const message = getValidationMessage(control, key);
            if (message) {
                this._toastr.error(message);
                return;
            }
        }

        this.newPasswordEvent.emit(controls.newPassword?.value);
    }

    closeModal() {
        this.closeModalEvent.emit();
    }
}