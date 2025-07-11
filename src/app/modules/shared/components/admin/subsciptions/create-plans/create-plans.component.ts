import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { ISavePlan, IPlan, PlanDurationType, PlanRoleType, IUpdatePlan } from "../../../../../../core/models/plan.model";
import { CommonModule } from "@angular/common";
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { getValidationMessage } from "../../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { PlanService } from "../../../../../../core/services/plans.service";
import { takeUntil } from "rxjs";
import { Event } from "mapbox-gl";

@Component({
    selector: 'app-admin-create-plan',
    templateUrl: './create-plans.component.html',
    imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class AdminCreatePlansComponent implements OnChanges {
    private readonly _fb = inject(FormBuilder);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _planService = inject(PlanService);

    @Input({ required: true }) planToEdit: IPlan | null = null;
    @Output() closeModalEvent = new EventEmitter<string>();
    @Output() updatePlanTableEvent = new EventEmitter<IPlan>();

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

    private _patchPlanForm(plan: IPlan) {
        this.planForm.patchValue({
            name: plan.name,
            price: plan.price,
            role: plan.role,
            duration: plan.duration,
        });

        const featuresArray = this._fb.array([]);

        for (let feature of plan.features) {
            featuresArray.push(this._fb.control(feature));
        }

        this.planForm.setControl('features', featuresArray);
    }

    private _resetForm() {
        this.planForm = this._fb.group({
            name: [''],
            price: [0],
            features: this._fb.array([]),
            duration: [''],
            role: [''],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['planToEdit'] && this.planToEdit) {
            this._patchPlanForm(this.planToEdit);
        }
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
            const plan: ISavePlan = {
                name: this.controls.name?.value,
                price: this.controls.price?.value,
                role: this.controls.role?.value,
                duration: this.controls.duration?.value,
                features: this.controls.features?.value,
            }

            if (this.planToEdit) {
                const updatePlanData: IUpdatePlan = {
                    id: this.planToEdit.id,
                    ...plan,
                }
                this._planService.updatePlan(updatePlanData).subscribe({
                    next: (response) => {
                        if (response.success && response.data) {
                            this.updatePlanTableEvent.emit(response.data);
                            this._toastr.success(response.message);
                            this.closeModalEvent.emit('close modal button clicked.');
                        } else {
                            throw new Error(response.message);
                        }
                    },
                    error: (err) => {
                        this._toastr.error(err);
                    }
                })
            } else {
                this._planService.createPlan(plan).subscribe({
                    next: (response) => {
                        if (response.success && response.data) {
                            this.updatePlanTableEvent.emit(response.data);
                            this._toastr.success(response.message);
                            this.closeModalEvent.emit('close modal button clicked.');
                        } else {
                            throw new Error(response.message);
                        }
                    },
                    error: (err) => {
                        this._toastr.error(err);
                    }
                });
            }
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

    closeModal() {
        this._resetForm();
        this.planToEdit = null;
        this.closeModalEvent.emit('close modal button clicked');
    }
}