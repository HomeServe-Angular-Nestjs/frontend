import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { LoginAuthService } from "../../../../../core/services/login-auth.service";
import { IUser, UserType } from "../../../models/user.model";
import { getValidationMessage } from "../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../core/services/public/toastr.service";
import { LoadingService } from "../../../../../core/services/public/loading.service";
import { finalize } from "rxjs";


@Component({
    selector: 'app-email-input',
    templateUrl: './email-input.component.html',
    imports: [ReactiveFormsModule, CommonModule]
})
export class EmailInputComponent {
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _fb = inject(FormBuilder);

    @Input({ required: true }) userType!: UserType;
    @Output() sendOtpEvent = new EventEmitter<IUser>();
    @Output() closeModalEvent = new EventEmitter();

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

        this.sendOtpEvent.emit(this.user);
    }

    closeModal() {
        this.closeModalEvent.emit();
    }
}