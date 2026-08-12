import { Component, EventEmitter, Input, Output, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IPlan, ICreatePlan, FEATURE_REGISTRY, PlanFeatures, SERVICE_LISTING_UNLIMITED, SERVICE_LISTING_LIMIT_KEY } from "../../../../../../core/models/plan.model";
import { PlanService } from "../../../../../../core/services/plans.service";

@Component({
    selector: 'app-admin-plan-details',
    templateUrl: './plans-details.component.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule]
})
export class AdminPlanDetailsComponent implements OnInit {
    private readonly _fb = inject(FormBuilder);
    private readonly _planService = inject(PlanService);

    @Input() plan?: IPlan;
    @Input({ required: true }) isEditMode!: boolean;
    @Input() isCreateMode: boolean = false;

    @Output() closeModalEvent = new EventEmitter<void>();
    @Output() savePlanEvent = new EventEmitter<IPlan | ICreatePlan>();
    @Output() deletePlanEvent = new EventEmitter<string>();

    planForm!: FormGroup;
    readonly featureRegistry = Object.values(FEATURE_REGISTRY);
    readonly serviceListingLimitKey = SERVICE_LISTING_LIMIT_KEY;
    readonly unlimited = SERVICE_LISTING_UNLIMITED;
    isServiceLimitUnlimited = false;

    get isFreeTier(): boolean {
        return this.planForm?.get('duration')?.value === 'freetier';
    }

    ngOnInit(): void {
        this.buildForm();
        this.planForm.get('duration')?.valueChanges.subscribe(() => this._applyFreeTierLock());
        this._applyFreeTierLock();
        this._syncServiceLimitLock();
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
                    case 'number': defaultValue = 1; break;
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

    /** Locked fallback used only if the backend call fails (e.g. offline). */
    private readonly _fallbackFreeTier = {
        price: 0,
        features: {
            [FEATURE_REGISTRY['BASIC_SUPPORT'].key]: true,
            [FEATURE_REGISTRY['SERVICE_LISTING_LIMIT'].key]: 2,
            [FEATURE_REGISTRY['ANALYTICS_DASHBOARD'].key]: false,
            [FEATURE_REGISTRY['SEARCH_PRIORITY'].key]: 'low',
        } as PlanFeatures,
    };

    /** When the plan is a Free Tier, lock the price and all feature controls. */
    private _applyFreeTierLock() {
        if (!this.isEditMode && !this.isCreateMode) return;

        const price = this.planForm.get('price');
        const features = this.featuresFormGroup;

        if (this.isFreeTier) {
            // Fetch the canonical defaults from the backend (single source of truth).
            this._planService.fetchFreeTierDefaults().subscribe({
                next: (res) => {
                    if (res?.data) {
                        this.planForm.patchValue({ price: res.data.price, name: 'Free Tier' });
                        features.patchValue(res.data.features);
                    } else {
                        this._applyFallbackFreeTier();
                    }
                    this._lockFreeTier();
                },
                error: () => {
                    this._applyFallbackFreeTier();
                    this._lockFreeTier();
                }
            });
        } else {
            price?.enable();
            Object.keys(features.controls).forEach(key => features.get(key)?.enable());
            this._syncServiceLimitLock();
        }
    }

    /** Reflects the "Unlimited" checkbox and keeps the numeric input disabled while unlimited. */
    private _syncServiceLimitLock(): void {
        const control = this.featuresFormGroup.get(this.serviceListingLimitKey);
        if (!control) return;
        this.isServiceLimitUnlimited = control.value === this.unlimited;
        if (this.isServiceLimitUnlimited && !this.isFreeTier) {
            control.disable({ emitEvent: false });
        }
    }

    onServiceLimitToggle(checked: boolean): void {
        const control = this.featuresFormGroup.get(this.serviceListingLimitKey);
        if (!control) return;

        if (checked) {
            this._lastPositiveLimit = typeof control.value === 'number' && control.value > 0
                ? control.value
                : 1;
            control.setValue(this.unlimited, { emitEvent: false });
            control.disable({ emitEvent: false });
            this.isServiceLimitUnlimited = true;
        } else {
            control.setValue(this._lastPositiveLimit ?? 1, { emitEvent: false });
            control.enable({ emitEvent: false });
            this.isServiceLimitUnlimited = false;
        }
    }

    private _lastPositiveLimit: number = 1;

    private _applyFallbackFreeTier() {
        this.planForm.patchValue({ price: this._fallbackFreeTier.price, name: 'Free Tier' });
        this.featuresFormGroup.patchValue(this._fallbackFreeTier.features);
    }

    private _lockFreeTier() {
        this.planForm.get('price')?.disable();
        Object.keys(this.featuresFormGroup.controls).forEach(key => this.featuresFormGroup.get(key)?.disable());
    }

    enableEdit() {
        this.isEditMode = true;
        this.planForm.enable();
        this._applyFreeTierLock();
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

