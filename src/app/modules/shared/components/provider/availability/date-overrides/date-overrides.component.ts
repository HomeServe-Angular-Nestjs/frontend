import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { formatTimeRanges, timeToMinutes } from '../../../../../../core/utils/date.util';
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
  draftFrom = '';
  draftTo = '';

  overrides = signal<IDateOverrideViewList[]>([]);

  get timeRanges(): FormArray {
    return this.form.get('timeRanges') as FormArray;
  }

  ngOnInit(): void {
    this._fetchOverrides();
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
    const { from, to } = this.slotDraftForm.value;

    // basic slot validation
    const error = this._validateSlot(from, to);
    if (error) {
      this._toastr.error(error);
      return;
    }

    // overlap validation
    if (this._hasOverlap(from, to)) {
      this._toastr.error('This time slot overlaps an existing slot');
      return;
    }

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

    // Date required
    if (!date) {
      this._toastr.error('Date is required');
      return;
    }

    const dateFormat = new Date(date);
    dateFormat.setHours(0, 0, 0, 0);

    // Duplicate date check
    const selectedTime = dateFormat.getTime();

    const isDuplicateDate = this.overrides().some(override => {
      const existing = new Date(override.date);
      existing.setHours(0, 0, 0, 0);
      return existing.getTime() === selectedTime;
    });

    if (isDuplicateDate) {
      this._toastr.error('This date already has an override');
      return;
    }

    // Custom availability must have slots
    if (this.availability() === 'custom' && this.timeRanges.length === 0) {
      this._toastr.error('At least one time slot is required');
      return;
    }

    // Reason length validation
    if (reason && (reason.length < 10 || reason.length > 100)) {
      this._toastr.error('Reason must be between 10 and 100 characters');
      return;
    }

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
            console.log(override.date)
            console.log(date)
            return override.date !== date
          }));
          this._toastr.success('Override deleted successfully');
        }
      });
  }

  formatTimeRanges(ranges: { startTime: string; endTime: string }[]): string {
    return formatTimeRanges(ranges);
  }

  private _fetchOverrides() {
    this._availabilityService.getDateOverrides()
      .pipe(
        takeUntil(this._destroy$),
        map(res => res.data || [])
      )
      .subscribe({
        next: (overrides) => this.overrides.set(overrides)
      })
  }

  get reason(): string {
    return this.availability() === 'custom' ? 'Custom availability for this date.'
      : 'No bookings allowed on this date.'
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
