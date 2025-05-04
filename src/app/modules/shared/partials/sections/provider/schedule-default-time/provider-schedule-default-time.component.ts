import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SlotType } from '../../../../../../core/models/schedules.model';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { NotificationService } from '../../../../../../core/services/public/notification.service';
import { IProvider } from '../../../../../../core/models/user.model';
import { ScheduleService } from '../../../../../../core/services/schedule.service';
import { Store } from '@ngrx/store';
import { scheduleActions } from '../../../../../../store/schedules/schedule.action';
import { selectDefaultSlots } from '../../../../../../store/provider/provider.selector';
import { providerActions } from '../../../../../../store/provider/provider.action';

@Component({
  selector: 'app-provider-schedule-default-time',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './provider-schedule-default-time.component.html',
})
export class ProviderScheduleDefaultTimeComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _store = inject(Store);
  private readonly _providerService = inject(ProviderService);
  private readonly _notyf = inject(NotificationService);

  @Input({ required: true }) providerData!: IProvider | null;
  @Input({ required: true }) addNewSlots!: boolean;
  @Input({ required: true }) pickedDate!: string | null;
  @Output() closeModal = new EventEmitter<boolean>();
  @Output() newSlotEvent = new EventEmitter<SlotType>();


  defaultSlots: SlotType[] = [];
  newSlots: SlotType[] = [];

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
      error: (err) => this._notyf.error(err)
    });
  }

  submit() {
    if (this.defaultForm.invalid) {
      this.defaultForm.markAllAsTouched();
      return;
    }

    const fromValue = this.defaultForm.get('from')?.value;
    const toValue = this.defaultForm.get('to')?.value;

    const from12 = this.convertTo12HourFormat(fromValue);
    const to12 = this.convertTo12HourFormat(toValue);

    const fromMinutes = this.timeToMinutes(fromValue);
    const toMinutes = this.timeToMinutes(toValue);

    if (fromMinutes >= toMinutes) {
      this._notyf.error('Start time must be earlier than end time.');
      return;
    }

    const slotsToCheck = this.addNewSlots ? this.newSlots : this.defaultSlots;

    if (this.hasOverlap(slotsToCheck, fromMinutes, toMinutes)) {
      this._notyf.error('This time range overlaps with an existing slot.');
      return;
    }

    if (this.addNewSlots) {
      this.newSlotEvent.emit({ from: from12, to: to12 });
    } else {
      this._providerService.updateDefaultSlot({ from: from12, to: to12 }).subscribe({
        next: () => {
          this._store.dispatch(providerActions.addDefaultSlot({ slot: { from: from12, to: to12 } }))
        },
        error: (err) => this._notyf.error(err)
      });
    }

    this.defaultForm.reset();
  }

  setDefaultSlots() {
    if (this.providerData && this.providerData.defaultSlots.length > 0) {
      for (let slot of this.providerData.defaultSlots) {
        this.newSlots.push({ from: slot.from, to: slot.to });
        this.newSlotEvent.emit({ from: slot.from, to: slot.to });
      }
    } else {
      this._notyf.error('No slots in default');
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private convertTo12HourFormat(time24: string): string {
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const format = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${format}`;
  }

  private convertTo24HourFormat(time12h: string): string {
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

  private hasOverlap(slots: SlotType[], fromMinutes: number, toMinutes: number): boolean {
    return slots.some(slot => {
      const existingFrom24 = this.convertTo24HourFormat(slot.from);
      const existingTo24 = this.convertTo24HourFormat(slot.to);
      const existingFromMinutes = this.timeToMinutes(existingFrom24);
      const existingToMinutes = this.timeToMinutes(existingTo24);

      return (fromMinutes < existingToMinutes && toMinutes > existingFromMinutes);
    });
  }
}
