import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { timeToMinutes } from '../../../../../../core/utils/date.util';
import { IDateOverrideViewList } from '../../../../../../core/models/availability.model';
import { filter, map, Subject, takeUntil } from 'rxjs';
import { AvailabilityService } from '../../../../../../core/services/availability.service';
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';

type ModalAvailabilityType = 'unavailable' | 'custom';

@Component({
  selector: 'app-provider-date-overrides',
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './date-overrides.component.html',
})
export class ProviderAvailabilityDateOverridesComponent implements OnInit, OnDestroy {
  private readonly _availabilityService = inject(AvailabilityService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _destroy$ = new Subject<void>();
  private readonly _fb = inject(FormBuilder);

  form: FormGroup = this._fb.group({
    date: [''],
    timeRanges: this._fb.array([]),
    reason: [''],
  });

  slotDraftForm: FormGroup = this._fb.group({
    from: [''],
    to: [''],
  });

  availability = signal<ModalAvailabilityType | null>(null);
  today = new Date().toISOString().split('T')[0];
  modal = false;
  isLoading = true;

  overrides = signal<IDateOverrideViewList[]>([]);

  get timeRanges(): FormArray {
    return this.form.get('timeRanges') as FormArray;
  }

  ngOnInit(): void {
    this._fetchOverrides();
  }

  get slotDraftError(): string {
    const { from, to } = this.slotDraftForm.value;

    if (!from || !to) {
      return '';
    }

    const error = this._validateSlot(from, to);
    if (error) {
      return error;
    }

    if (this._hasOverlap(from, to)) {
      return 'This time slot overlaps an existing slot';
    }

    return '';
  }

  get dateError(): string {
    const date = this.form.get('date')?.value;

    if (!date) {
      return 'Date is required';
    }

    if (this._hasDateOverride(date)) {
      return 'This date already has an override';
    }

    return '';
  }

  get reasonError(): string {
    const reason = this.form.get('reason')?.value;

    if (reason && (reason.length < 10 || reason.length > 100)) {
      return 'Reason must be between 10 and 100 characters';
    }

    return '';
  }

  get slotsRequiredError(): string {
    if (this.availability() === 'custom' && this.timeRanges.length === 0) {
      return 'At least one time slot is required';
    }

    return '';
  }

  get saveDisabled(): boolean {
    if (!this.availability()) {
      return true;
    }

    if (!this.form.get('date')?.value || this.form.get('date')?.invalid) {
      return true;
    }

    if (this.dateError || this.reasonError || this.slotsRequiredError) {
      return true;
    }

    return false;
  }

  get addSlotDisabled(): boolean {
    const { from, to } = this.slotDraftForm.value;
    return !from || !to || !!this.slotDraftError;
  }

  removeTimeRange(index: number) {
    this.timeRanges.removeAt(index);
  }

  selectAvailability(type: ModalAvailabilityType) {
    this.availability.set(type);

    if (type === 'unavailable') {
      this.timeRanges.clear();
    }
  }

  addDraftSlot() {
    if (this.addSlotDisabled || this.slotDraftError) {
      if (this.slotDraftError) {
        this._toastr.error(this.slotDraftError);
      }
      return;
    }

    const { from, to } = this.slotDraftForm.value;

    this.timeRanges.push(
      this._fb.group({
        from,
        to,
      })
    );

    this.slotDraftForm.reset();
  }

  closeModal() {
    this.modal = false;
    this.form.reset();
    this.timeRanges.clear();
    this.slotDraftForm.reset();
    this.availability.set(null);
  }

  openModal() {
    this.selectAvailability('custom')
    this.modal = true;
  }

  saveChanges() {
    const { date, reason } = this.form.value;

    if (this.dateError) {
      this._toastr.error(this.dateError);
      return;
    }

    if (this.slotsRequiredError) {
      this._toastr.error(this.slotsRequiredError);
      return;
    }

    if (this.reasonError) {
      this._toastr.error(this.reasonError);
      return;
    }

    const dateFormat = new Date(date);
    dateFormat.setHours(0, 0, 0, 0);

    const payload = {
      date: dateFormat.toString(),
      timeRanges:
        this.availability() === 'custom'
          ? this.timeRanges.value.map((t: any) => ({
            startTime: t.from,
            endTime: t.to,
          }))
          : [],
      reason: reason || undefined,
      isAvailable: this.availability() === 'custom',
    };

    this._availabilityService.createDateOverride(payload)
      .pipe(
        takeUntil(this._destroy$),
        map(res => res.data || null)
      )
      .subscribe({
        next: (override) => {
          if (!override) return;

          const overrideData: IDateOverrideViewList = {
            date: override.date,
            timeRanges: override.timeRanges.map(range => ({
              startTime: range.startTime,
              endTime: range.endTime,
            })),
            reason: override.reason,
            isAvailable: override.isAvailable
          };

          this.overrides.update(overrides => [...overrides, overrideData]);
          this._toastr.success('Override created successfully');
          this.closeModal();
        }
      });
  }

  deleteOverride(date: string) {
    const formatDate = new Date(date)
    formatDate.setHours(0, 0, 0, 0)
    date = formatDate.toISOString();

    this._availabilityService.deleteOverride(date)
      .pipe(
        takeUntil(this._destroy$),
        filter(res => res.success)
      )
      .subscribe({
        next: () => {
          this.overrides.update(overrides => overrides.filter(override => {
            const overrideDate = new Date(override.date);
            overrideDate.setHours(0, 0, 0, 0);
            return overrideDate.toISOString() !== date;
          }));
          this._toastr.success('Override deleted successfully');
        }
      });
  }

  reasonFallback(override: IDateOverrideViewList): string {
    return override.isAvailable
      ? 'Custom availability for this date.'
      : 'No bookings allowed on this date.';
  }

  private _fetchOverrides() {
    this._availabilityService.getDateOverrides()
      .pipe(
        takeUntil(this._destroy$),
        map(res => res.data || [])
      )
      .subscribe({
        next: (overrides) => {
          this.overrides.set(overrides);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      })
  }

  private _hasDateOverride(date: string): boolean {
    const selectedTime = new Date(date).setHours(0, 0, 0, 0);

    return this.overrides().some(override => {
      const existing = new Date(override.date);
      existing.setHours(0, 0, 0, 0);
      return existing.getTime() === selectedTime;
    });
  }

  private _hasOverlap(newFrom: string, newTo: string): boolean {
    const newStart = timeToMinutes(newFrom);
    const newEnd = timeToMinutes(newTo);

    for (const control of this.timeRanges.controls) {
      const from = control.get('from')?.value;
      const to = control.get('to')?.value;

      if (!from || !to) continue;

      const start = timeToMinutes(from);
      const end = timeToMinutes(to);

      if (newStart < end && newEnd > start) {
        return true;
      }
    }

    return false;
  }

  private _validateSlot(from: string, to: string): string | null {
    if (!from || !to) {
      return 'Start and end time are required';
    }

    const start = timeToMinutes(from);
    const end = timeToMinutes(to);

    if (start === end) {
      return 'Start and end time cannot be the same';
    }

    if (start > end) {
      return 'Start time must be before end time';
    }

    return null;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}