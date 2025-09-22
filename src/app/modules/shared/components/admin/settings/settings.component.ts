import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { AdminService } from "../../../../../core/services/admin.service";
import { filter, map, Observable, Subject, takeUntil } from "rxjs";
import { IAdminSettings } from "../../../../../core/models/admin-settings.model";
import { IResponse } from "../../../models/response.model";
import { CommonModule } from "@angular/common";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";

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

    isEditing = {
        gstPercentage: false,
        providerCommission: false,
        customerCommission: false,
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
                });
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

        this.form.get(field)?.disable();
    }
}