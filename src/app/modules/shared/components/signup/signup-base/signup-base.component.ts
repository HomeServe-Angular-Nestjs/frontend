import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { ISignupConfig } from "../../../../config/signup.config";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"

@Component({
    selector: 'app-signup-base',
    templateUrl: './signup-base.component.html',
    styleUrl: './signup-base.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, ReactiveFormsModule]
})
export class SignupBaseComponent {
    @Input() config!: ISignupConfig;

    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
        });
    }

    onSubmit(): void {
        if (this.form.valid) {
            console.log(this.form.value);
            // this.formSubmit.emit(this.form.value);
        }
    }
}