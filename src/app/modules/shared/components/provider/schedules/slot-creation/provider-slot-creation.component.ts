import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatingInputComponent } from "../../../../partials/sections/provider/floating-inputs/provider-floating-input.component";
import { ScheduleService } from '../../../../../../core/services/schedule.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { IDaySlot, IMonthMode, IMonthSchedule } from '../../../../../../core/models/schedules.model';
import { Store } from '@ngrx/store';
import { selectBufferTime } from '../../../../../../store/provider/provider.selector';
import { ConfirmDialogComponent } from '../../../../partials/shared/confirm-dialog-box/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subject, switchMap, tap, timer } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-provider-slot-creation',
    templateUrl: './provider-slot-creation.component.html',
    imports: [CommonModule, FormsModule, FloatingInputComponent]
})
export class ProviderSlotCreationComponent {
    private readonly _scheduleService = inject(ScheduleService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _store = inject(Store);
    private readonly _dialog = inject(MatDialog)
    private readonly _router = inject(Router);

    private defaultBuffer = 0;

    submitted$ = new BehaviorSubject<boolean>(false);

    isOpen = true;
    mode: 'month' | 'per-day' | 'custom' = 'month';
    weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    minMonth!: string;

    month: IMonthMode = {
        month: '',
        excludeDays: [],
        from: '',
        to: '',
        duration: 60,
        buffer: this.defaultBuffer,
        numberOfSlots: undefined
    };

    perDay = {
        selectedDays: [] as number[],
        from: '',
        to: ''
    };

    custom = {
        month: '', // yyyy-MM
        selectedDays: [] as number[],
        from: '',
        to: ''
    };

    currentMonthDays: number[] = [];
    customMonthDays: number[] = [];

    ngOnInit(): void {
        this._store.select(selectBufferTime).subscribe((buffer) => {
            this.defaultBuffer = buffer ?? 0;
            this.month.buffer = this.defaultBuffer;
        });

        this._generateCurrentMonthDays();
        this._getMinMonth();
    }

    generateSlots() {
        switch (this.mode) {
            case 'month': {
                if (!this._validateMonthForm()) return;

                this.submitted$.next(true);

                const slotsToSave = this._generateSlotsForMonthMode();

                if (slotsToSave && slotsToSave.month && slotsToSave.days?.length > 0) {
                    this._scheduleService.createSchedules(slotsToSave).subscribe({
                        next: (response) => {
                            if (response.success) {
                                this._toastr.success(response.message);
                                this._router.navigate(['provider', 'profiles', 'schedule']);
                            } else {
                                const message = this._formatScheduledDates(response.data)
                                this._openConfirmationDialog(message, 'Schedule already exists')
                                    .afterClosed()
                                    .subscribe();
                            }
                        },
                        error: () => this._toastr.error('Oops, Something happened.'),
                        complete: () => {
                            this._resetForm();
                            timer(2000).subscribe(() => this.submitted$.next(false));
                        }
                    });
                }
                break;
            }

            case 'per-day': {
                break;
            }
            case 'custom':
                // Handle other modes if required
                break;
        }
    }


    private _generateSlotsForMonthMode(): IMonthSchedule | undefined {
        const { month, from, to, excludeDays, duration, buffer, numberOfSlots } = this.month;
        const [year, monthIndex] = month.split('-').map(Number);
        const startDate = new Date(year, monthIndex - 1, 1);
        const endDate = new Date(year, monthIndex, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isCurrentMonth = year === today.getFullYear() && monthIndex === today.getMonth() + 1;

        const days: IDaySlot[] = [];

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

            if (isCurrentMonth && currentDate < today) continue;
            if (excludeDays.includes(dayName)) continue;

            const slotPairs = this._generateTimeSlots(from, to, duration, buffer);

            if (numberOfSlots !== undefined) {
                if (slotPairs.length < numberOfSlots) {
                    this._toastr.error(
                        `Cannot create ${numberOfSlots} slots on ${currentDate.toDateString()}. Only ${slotPairs.length} possible. Aborting generation.`
                    );
                    return;
                }
            }

            const usableSlots = numberOfSlots ? slotPairs.slice(0, numberOfSlots) : slotPairs;

            days.push({
                date: currentDate.toISOString().split('T')[0], // e.g., "2025-06-12"
                slots: usableSlots.map(([from, to]) => ({ from, to, takenBy: '' }))
            });
        }

        const monthSchedule: IMonthSchedule = {
            month, // e.g., "2025-06"
            days
        };
        return monthSchedule;
    }


    private _validateMonthForm(): boolean {
        const { month, from, to, duration, buffer } = this.month;

        if (!month) return this._showValidationError("Please select a month.");
        if (!from || !to) return this._showValidationError("Start and end time are required.");
        if (!this._isValidTime(from) || !this._isValidTime(to)) return this._showValidationError("Invalid time format.");
        if (from >= to) return this._showValidationError("End time must be after start time.");

        if (!duration || duration <= 0) return this._showValidationError("Duration must be a positive number.");
        if (buffer == null || buffer < 0) return this._showValidationError("Buffer time must be zero or positive.");

        if (this.month.numberOfSlots !== undefined && this.month.numberOfSlots <= 0)
            return this._showValidationError("Number of slots must be greater than 0.");

        return true;
    }

    private _isValidTime(time: string): boolean {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
    }

    private _showValidationError(msg: string): false {
        this._toastr.error(msg)
        return false;
    }

    toggleExcludeDay(day: string, checked: any): void {
        const index = this.month.excludeDays.indexOf(day);
        if (checked && index === -1) {
            this.month.excludeDays.push(day);
        } else if (!checked && index !== -1) {
            this.month.excludeDays.splice(index, 1);
        }
    }

    private _generateTimeSlots(start: string, end: string, duration: number, buffer: number): [string, string][] {
        const slots: [string, string][] = [];

        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);

        let startTime = new Date();
        startTime.setHours(startHour, startMin, 0, 0);

        const endTime = new Date();
        endTime.setHours(endHour, endMin, 0, 0);

        while (true) {
            const slotStart = new Date(startTime);
            const slotEnd = new Date(slotStart.getTime() + duration * 60000);

            if (slotEnd > endTime) break;

            slots.push([this._formatTime(slotStart), this._formatTime(slotEnd)]);

            // Move forward by duration + buffer
            startTime = new Date(slotEnd.getTime() + buffer * 60000);
        }

        return slots;
    }


    private _formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    private _resetForm() {
        this.mode = 'month';
        this.month = {
            month: '',
            excludeDays: [],
            from: '',
            to: '',
            buffer: this.defaultBuffer,
            duration: 60,
            numberOfSlots: undefined
        };
    }

    private _openConfirmationDialog(message: string, title: string) {
        return this._dialog.open(ConfirmDialogComponent, {
            data: { title, message, isConfirm: false },
        });
    }

    private _generateCurrentMonthDays(): void {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-indexed
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        this.currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }

    private _formatScheduledDates(dates: string[]): string {
        const monthGroups: Record<string, string[]> = {};

        dates.forEach(dateStr => {
            const date = new Date(dateStr);
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            const key = `${month} ${year}`;

            if (!monthGroups[key]) {
                monthGroups[key] = [];
            }
            monthGroups[key].push(day.toString());
        });

        let message = 'A schedule already exists for the following dates:\n';

        for (const [monthYear, days] of Object.entries(monthGroups)) {
            const sortedDays = days
                .map(Number)
                .sort((a, b) => a - b)
                .join(', ');
            message += `- ${monthYear}: ${sortedDays}\n`;
        }

        return message.trim();
    }
    /**
     * Generates the list of days (1–n) based on the selected custom month
     */
    // onCustomMonthChange(): void {
    //     if (!this.custom.month) return;

    //     const [year, month] = this.custom.month.split('-').map(Number);
    //     const daysInMonth = new Date(year, month, 0).getDate();
    //     this.customMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    // }

    private _getMinMonth() {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Ensure two-digit format.
        const year = today.getFullYear();
        this.minMonth = `${year}-${month}`;
    }
}
