import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { AdminService } from "../../../../../core/services/admin.service";
import { filter, map, Observable, Subject, takeUntil } from "rxjs";
import { IAdminSettings } from "../../../../../core/models/admin-settings.model";
import { IResponse } from "../../../models/response.model";
import { CommonModule } from "@angular/common";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SERVICE_LISTING_UNLIMITED } from "../../../../../core/models/plan.model";

@Component({
    selector: 'admin-settings',
    templateUrl: 'settings.component.html',
    imports: [CommonModule, ReactiveFormsModule]
})
export class AdminSettingsComponent implements OnInit, OnDestroy {
    private readonly _adminService = inject(AdminService);
    private destroy$ = new Subject<void>();
    private originalSettings: Partial<IAdminSettings> = {};

    settings$!: Observable<IAdminSettings>;
    form!: FormGroup;
    readonly unlimited = SERVICE_LISTING_UNLIMITED;
    isDefaultLimitUnlimited = false;
    private _lastDefaultLimit: number = 1;

    isEditing = {
        gstPercentage: false,
        providerCommission: false,
        customerCommission: false,
        defaultServiceLimit: false,
    };

    ngOnInit(): void {
        this.settings$ = this._adminService.fetchSettings().pipe(
            takeUntil(this.destroy$),
            filter((res): res is Required<IResponse<IAdminSettings>> => res.success && !!res.data),
            map((res) => {
                this.originalSettings = { ...res.data };

                this.form = new FormGroup({
                    gstPercentage: new FormControl(
                        { value: res.data.gstPercentage, disabled: true }
                    ),
                    providerCommission: new FormControl(
                        { value: res.data.providerCommission, disabled: true }
                    ),
                    customerCommission: new FormControl(
                        { value: res.data.customerCommission, disabled: true }
                    ),
                    defaultServiceLimit: new FormControl(
                        { value: res.data.defaultServiceLimit, disabled: true }
                    ),
                });
                this.isDefaultLimitUnlimited = res.data.defaultServiceLimit === this.unlimited;
                return res.data;
            })
        );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    enableEdit(field: keyof IAdminSettings) {
        this.isEditing[field] = true;
        this.form.get(field)?.enable();
    }

    save(field: keyof IAdminSettings) {
        this.isEditing[field] = false;
        const updatedValue = this.form.get(field)?.value;
        this.form.get(field)?.disable();

        this._adminService.updateSettings({ [field]: updatedValue })
            .pipe(takeUntil(this.destroy$)).subscribe();
    }

    cancel(field: keyof IAdminSettings) {
        this.isEditing[field] = false;

        const originalValue = this.originalSettings[field];
        this.form.get(field)?.setValue(originalValue, { emitEvent: false });
        this.isDefaultLimitUnlimited = originalValue === this.unlimited;

        this.form.get(field)?.disable();
    }

    onDefaultLimitToggle(checked: boolean) {
        const control = this.form.get('defaultServiceLimit');
        if (!control) return;

        if (checked) {
            this._lastDefaultLimit = typeof control.value === 'number' && control.value > 0
                ? control.value
                : 1;
            control.setValue(this.unlimited, { emitEvent: false });
            this.isDefaultLimitUnlimited = true;
        } else {
            control.setValue(this._lastDefaultLimit ?? 1, { emitEvent: false });
            this.isDefaultLimitUnlimited = false;
        }
    }
}