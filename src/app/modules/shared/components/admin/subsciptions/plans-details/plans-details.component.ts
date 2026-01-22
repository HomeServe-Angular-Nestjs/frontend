import { Component, EventEmitter, Input, Output, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IPlan, ICreatePlan, FEATURE_REGISTRY } from "../../../../../../core/models/plan.model";

@Component({
    selector: 'app-admin-plan-details',
    templateUrl: './plans-details.component.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule]
})
export class AdminPlanDetailsComponent implements OnInit {
    private readonly _fb = inject(FormBuilder);

    @Input() plan?: IPlan;
    @Input({ required: true }) isEditMode!: boolean;
    @Input() isCreateMode: boolean = false;

    @Output() closeModalEvent = new EventEmitter<void>();
    @Output() savePlanEvent = new EventEmitter<IPlan | ICreatePlan>();
    @Output() deletePlanEvent = new EventEmitter<string>();

    planForm!: FormGroup;
    readonly featureRegistry = Object.values(FEATURE_REGISTRY);

    ngOnInit(): void {
        this.buildForm();
    }

    private buildForm() {
        const featuresGroup = this._fb.group({});

        // Initialize features with default values from registry or existing plan
        this.featureRegistry.forEach(feature => {
            let defaultValue: any = '';
            if (this.plan?.features && this.plan.features[feature.key] !== undefined) {
                defaultValue = this.plan.features[feature.key];
            } else {
                switch (feature.type) {
                    case 'boolean': defaultValue = false; break;
                    case 'number': defaultValue = 0; break;
                    case 'enum': defaultValue = feature.values?.[0] || ''; break;
                }
            }
            featuresGroup.addControl(feature.key, this._fb.control(defaultValue, Validators.required));
        });

        this.planForm = this._fb.group({
            id: [this.plan?.id || ''],
            name: [this.plan?.name || '', Validators.required],
            price: [this.plan?.price || 0, [Validators.required, Validators.min(0)]],
            role: [this.plan?.role || 'provider', Validators.required],
            duration: [this.plan?.duration || 'monthly', Validators.required],
            features: featuresGroup,
            isActive: [this.plan?.isActive ?? true, Validators.required]
        });

        if (!this.isEditMode && !this.isCreateMode) {
            this.planForm.disable();
        }
    }

    get featuresFormGroup(): FormGroup {
        return this.planForm.get('features') as FormGroup;
    }

    enableEdit() {
        this.isEditMode = true;
        this.planForm.enable();
    }

    cancelEdit() {
        if (this.isCreateMode) {
            this.closeModalEvent.emit();
            return;
        }
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

        const formValue = this.planForm.getRawValue();
        if (this.isCreateMode) {
            const { id, ...createData } = formValue;
            this.savePlanEvent.emit(createData as ICreatePlan);
        } else {
            this.savePlanEvent.emit(formValue as IPlan);
        }

        this.isEditMode = false;
        this.planForm.disable();
    }

    deletePlan() {
        if (this.plan?.id) {
            this.deletePlanEvent.emit(this.plan.id);
        }
    }

    closeModal() {
        this.closeModalEvent.emit();
    }
}

