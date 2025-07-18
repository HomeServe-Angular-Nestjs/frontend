import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SlotType } from '../../../../../../core/models/schedules.model';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { IProvider } from '../../../../../../core/models/user.model';
import { Store } from '@ngrx/store';
import { selectBufferTime, selectDefaultSlots } from '../../../../../../store/provider/provider.selector';
import { providerActions } from '../../../../../../store/provider/provider.action';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';

@Component({
  selector: 'app-provider-schedule-default-time',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './provider-schedule-default-time.component.html',
})
export class ProviderScheduleDefaultTimeComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _store = inject(Store);
  private readonly _providerService = inject(ProviderService);
  private readonly _toastr = inject(ToastNotificationService);

  mode: 'month' | 'per-day' | 'custom' = 'month';

  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  customSlots = [
    { date: '', from: '', to: '' }
  ];

  addNewCustomSlot() {
    this.customSlots.push({ date: '', from: '', to: '' });
  }

  @Input({ required: true }) providerData!: IProvider | null;
  @Input({ required: true }) addNewSlots!: boolean;
  @Input({ required: true }) pickedDate!: string | null;
  @Output() closeModal = new EventEmitter<boolean>();
  @Output() defaultSlotAddEvent = new EventEmitter<SlotType>();


  defaultSlots: SlotType[] = [];
  newSlots: SlotType[] = [];
  bufferTime?: number | null;

  defaultForm: FormGroup = this._fb.group({
    from: ['', Validators.required],
    to: ['', Validators.required]
  });

  ngOnInit(): void {
    this._store.select(selectDefaultSlots).subscribe(data => {
      if (data) {
        this.defaultSlots = [...data];
      }
    });

    this._store.select(selectBufferTime).subscribe(bufferTime => {
      this.bufferTime = bufferTime;
    });
  }

  close() {
    this.closeModal.emit(false);
  }

  clearSlots() {
    this._providerService.deleteDefaultSlot().subscribe({
      next: () => {
        this._store.dispatch(providerActions.clearDefaultSlot());
        this.defaultSlots = [];
      },
      error: (err) => this._toastr
        .error(err)
    });
  }

  submit() {
    if (this.defaultForm.invalid) {
      this.defaultForm.markAllAsTouched();
      return;
    }

    const fromValue = this.defaultForm.get('from')?.value;
    const toValue = this.defaultForm.get('to')?.value;

    const from12 = this._convertTo12HourFormat(fromValue);
    const to12 = this._convertTo12HourFormat(toValue);

    const fromMinutes = this._timeToMinutes(fromValue);
    const toMinutes = this._timeToMinutes(toValue);

    if (fromMinutes >= toMinutes) {
      this._toastr
        .error('Start time must be earlier than end time.');
      return;
    }

    const slotsToCheck = this.addNewSlots ? this.newSlots : this.defaultSlots;

    if (this._hasOverlap(slotsToCheck, fromMinutes, toMinutes)) {
      this._toastr
        .error('This time range overlaps with an existing slot.');
      return;
    }

    if (this.addNewSlots) {

      // this.defaultSlotAddEvent.emit({ from: from12, to: to12 });
    } else {
      const slot: SlotType = { from: from12, to: to12 };
      this._providerService.updateDefaultSlot(slot).subscribe({
        next: (defaultSlots) => {
          this._store.dispatch(providerActions.updateDefaultSlot({ defaultSlots }));
        },
        error: (err) => console.error(err)
      });
    }

    // this.defaultForm.reset();
  }

  setDefaultSlots() {
    if (this.providerData && this.providerData.defaultSlots.length > 0) {
      for (let slot of this.providerData.defaultSlots) {
        this.newSlots.push({ from: slot.from, to: slot.to });
        this.defaultSlotAddEvent.emit({ from: slot.from, to: slot.to });
      }
    } else {
      this._toastr
        .error('No slots in default');
    }
  }

  private _timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private _convertTo12HourFormat(time24: string): string {
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const format = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${format}`;
  }

  private _convertTo24HourFormat(time12h: string): string {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private _hasOverlap(slots: SlotType[], fromMinutes: number, toMinutes: number): boolean {
    return slots.some(slot => {
      const existingFrom24 = this._convertTo24HourFormat(slot.from);
      const existingTo24 = this._convertTo24HourFormat(slot.to);
      const existingFromMinutes = this._timeToMinutes(existingFrom24);
      const existingToMinutes = this._timeToMinutes(existingTo24);

      return (fromMinutes < existingToMinutes && toMinutes > existingFromMinutes);
    });
  }
}
