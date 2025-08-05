import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, OnInit, Output, } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { arrayNotEmptyValidator, checkNegativeValidator, commaSeparatedDateValidator, dateRangeValidator, getValidationMessage, pastDateValidator, timeRangeValidator, timeValidator } from "../../../../../../core/utils/form-validation.utils";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { ISlotRule } from "../../../../../../core/models/slot-rule.model";
import { SlotRuleService } from "../../../../../../core/services/slot-rule.service";
import { ButtonComponent } from "../../../../../../UI/button/button.component";

@Component({
    selector: 'app-provider-slot-rule-modal',
    templateUrl: './slot-rule-modal.component.html',
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent]
})
export class ProviderSlotRuleModalComponent implements OnInit {
    private readonly _fb = inject(FormBuilder);
    private readonly _slotRuleService = inject(SlotRuleService);
    private readonly _toastr = inject(ToastNotificationService);

    @Output() closeModalEvent = new EventEmitter<void>();

    weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    slotRuleForm: FormGroup = this._fb.group({
        name: ['', Validators.required],
        description: ['', Validators.required],
        startDate: ['', [Validators.required, pastDateValidator()]],
        endDate: ['', [Validators.required, pastDateValidator()]],
        daysOfWeek: [[], [Validators.required, arrayNotEmptyValidator()]],
        startTime: ['', [Validators.required, timeValidator()]],
        endTime: ['', [Validators.required, timeValidator()]],
        slotDuration: ['', [Validators.required, checkNegativeValidator()]],
        breakDuration: ['', [Validators.required, checkNegativeValidator()]],
        capacity: ['', [checkNegativeValidator()]],
        isActive: [true],
        priority: ['', Validators.min(1)],
        excludeDates: ['', [commaSeparatedDateValidator()]],
    }, {
        validators: [
            timeRangeValidator('startTime', 'endTime'),
            dateRangeValidator('startDate', 'endDate'),
        ]
    });

    todayString!: string;
    minEndDate!: string;

    ngOnInit(): void {
        const now = new Date();
        this.todayString = now.toISOString().split('T')[0];

        this.slotRuleForm.get('startDate')?.valueChanges.subscribe((selectedDate: string) => {
            this.minEndDate = selectedDate;
            const endDateControl = this.slotRuleForm.get('endDate');
            if (endDateControl?.value && endDateControl.value < selectedDate) {
                endDateControl.setValue('');
            }
        });
    }

    toggleDay(day: string) {
        const days = this.slotRuleForm.value.daysOfWeek;
        if (days.includes(day)) {
            this.slotRuleForm.patchValue({ daysOfWeek: days.filter((d: string) => d !== day) });
        } else {
            this.slotRuleForm.patchValue({ daysOfWeek: [...days, day] });
        }
    }

    onSubmit() {
        this.slotRuleForm.markAllAsTouched();
        this.slotRuleForm.updateValueAndValidity();

        const controls = {
            name: this.slotRuleForm.get('name'),
            description: this.slotRuleForm.get('description'),
            startDate: this.slotRuleForm.get('startDate'),
            endDate: this.slotRuleForm.get('endDate'),
            daysOfWeek: this.slotRuleForm.get('daysOfWeek'),
            startTime: this.slotRuleForm.get('startTime'),
            endTime: this.slotRuleForm.get('endTime'),
            slotDuration: this.slotRuleForm.get('slotDuration'),
            breakDuration: this.slotRuleForm.get('breakDuration'),
            capacity: this.slotRuleForm.get('capacity'),
            isActive: this.slotRuleForm.get('isActive'),
            priority: this.slotRuleForm.get('priority'),
            excludeDates: this.slotRuleForm.get('excludeDates'),
        };

        if (!this.slotRuleForm.valid) {
            for (const [key, control] of Object.entries(controls)) {
                const message = getValidationMessage(control, key);
                if (message) {
                    this._toastr.error(message);
                    return;
                }
            }
        }

        const slotRuleData: ISlotRule = {
            ...this.slotRuleForm.value,
            excludeDates: this.slotRuleForm.value.excludeDates
                .split(',')
                .map((d: string) => d.trim())
                .filter(Boolean),
            priority: Number(this.slotRuleForm.value.priority)
        };

        this._slotRuleService.createRule(slotRuleData).subscribe({
            next: (res) => {
                if (res && res.success && res.data) {
                    this._slotRuleService.addSloRule(res.data);
                    this._toastr.success(res.message);
                    this.closeModal();
                } else {
                    this._toastr.error('Failed to create slot rule.');
                }
            }
        });
    }

    closeModal() {
        this.closeModalEvent.emit();
    }
}