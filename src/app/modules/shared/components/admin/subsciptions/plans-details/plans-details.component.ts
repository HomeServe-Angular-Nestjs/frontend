import { Component, EventEmitter, Input, Output, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IPlan } from "../../../../../../core/models/plan.model";

@Component({
    selector: 'app-admin-plan-details',
    templateUrl: './plans-details.component.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule]
})
export class AdminPlanDetailsComponent implements OnInit {
    private readonly _fb = inject(FormBuilder);

    @Input({ required: true }) plan!: IPlan;
    @Input({ required: true }) isEditMode!: boolean;

    @Output() closeModalEvent = new EventEmitter<void>();
    @Output() savePlanEvent = new EventEmitter<IPlan>();

    planForm!: FormGroup;

    ngOnInit(): void {
        this.buildForm();
    }

    private buildForm() {
        this.planForm = this._fb.group({
            id: [this.plan.id, Validators.required],
            name: [this.plan.name, Validators.required],
            price: [this.plan.price, [Validators.required, Validators.min(0)]],
            role: [this.plan.role, Validators.required],
            duration: [this.plan.duration, Validators.required],
            features: this._fb.array(
                this.plan.features.map(feature =>
                    this._fb.control(feature, Validators.required)
                )
            ),
            isActive: [this.plan.isActive, Validators.required]
        });

        if (!this.isEditMode) {
            this.planForm.disable();
        }
    }

    get features(): FormArray {
        return this.planForm.get('features') as FormArray;
    }

    enableEdit() {
        this.isEditMode = true;
        this.planForm.enable();
    }

    cancelEdit() {
        this.planForm.reset(this.plan);
        this.planForm.disable();
        this.isEditMode = false;
        this.closeModalEvent.emit();
    }

    saveChanges() {
        if (this.planForm.invalid) {
            this.planForm.markAllAsTouched();
            return;
        }

        this.savePlanEvent.emit(this.planForm.getRawValue());
        this.isEditMode = false;
        this.planForm.disable();
    }

    addFeature() {
        this.features.push(this._fb.control('', Validators.required));
    }

    removeFeature(index: number) {
        this.features.removeAt(index);
    }

    closeModal() {
        this.closeModalEvent.emit();
    }
}
