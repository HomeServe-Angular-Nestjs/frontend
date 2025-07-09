import { Component, EventEmitter, inject, Output } from "@angular/core";
import { ICreatePlan, PlanDurationType, PlanRoleType } from "../../../../../../core/models/plan.model";
import { CommonModule } from "@angular/common";
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { getValidationMessage } from "../../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { PlanService } from "../../../../../../core/services/plans.service";
import { takeUntil } from "rxjs";

@Component({
    selector: 'app-admin-create-plan',
    templateUrl: './create-plans.component.html',
    imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class AdminCreatePlansComponent {
    private readonly _fb = inject(FormBuilder);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _planService = inject(PlanService);

    @Output() closeModalEvent = new EventEmitter<string>();

    planForm: FormGroup = this._fb.group({
        name: ['', Validators.required],
        price: [0, [Validators.required, Validators.minLength(0)]],
        role: ['', Validators.required],
        duration: ['', Validators.required],
        features: this._fb.array([this._fb.control('', Validators.required)])
    });

    planRoles: PlanRoleType[] = ['customer', 'provider'];
    planDurations: PlanDurationType[] = ['monthly', 'yearly', 'lifetime'];

    get features(): FormArray<FormControl> {
        return this.planForm.get('features') as FormArray<FormControl>;
    }

    get controls() {
        return {
            name: this.planForm.get('name'),
            price: this.planForm.get('price'),
            role: this.planForm.get('role'),
            duration: this.planForm.get('duration'),
            features: this.planForm.get('features'),
        };
    }

    private _markAllAsTouched(form: FormGroup | FormArray) {
        Object.values(form.controls).forEach(control => {
            if (control instanceof FormControl) {
                control.markAsTouched();
            } else if (control instanceof FormGroup || control instanceof FormArray) {
                this._markAllAsTouched(control);
            }
        });
    }

    addFeature() {
        this.features.push(this._fb.control('', Validators.required));
    }

    removeFeature(index: number) {
        this.features.removeAt(index);
    }


    submitPlan() {
        this._markAllAsTouched(this.planForm);

        if (this.planForm.valid) {
            const plan: ICreatePlan = {
                name: this.controls.name?.value,
                price: this.controls.price?.value,
                role: this.controls.role?.value,
                duration: this.controls.duration?.value,
                features: this.controls.features?.value,
            }

            this._planService.createPlan(plan).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.closeModalEvent.emit('close modal button clicked.');
                    } else {
                        throw new Error('Oops, Something went wrong.');
                    }
                },
                error: (err) => {
                    this._toastr.error(err);
                }
            })
        } else {
            for (let [key, control] of Object.entries(this.controls)) {
                const message = getValidationMessage(control, key);
                if (message) {
                    this._toastr.error(message);
                    return;
                }
            }

            for (let i = 0; i < this.features.length; i++) {
                const control = this.features.at(i);
                const msg = getValidationMessage(control, `Feature ${i + 1}`);
                if (msg) {
                    this._toastr.error(msg);
                    return;
                }
            }
        }
    }
}