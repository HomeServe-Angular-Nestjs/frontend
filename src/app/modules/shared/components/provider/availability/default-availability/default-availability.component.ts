import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-provider-default-availability',
  templateUrl: './default-availability.component.html',
  imports: [CommonModule, FormsModule],
})
export class ProviderDefaultAvailabilityComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();

  isManageMode = true;
  isDirty = false;
  mode: 'preview' | 'manage' = 'manage';

  weeklyAvailability = [
    { label: 'Sunday', from: '09:00', to: '17:00', active: true },
    { label: 'Monday', from: '09:00', to: '18:00', active: true },
    { label: 'Tuesday', from: '09:00', to: '18:00', active: true },
    { label: 'Wednesday', from: '10:00', to: '16:00', active: true },
    { label: 'Thursday', from: '09:00', to: '18:00', active: true },
    { label: 'Friday', from: '09:00', to: '18:00', active: true },
    { label: 'Saturday', from: null, to: null, active: false }
  ];

  ngOnInit(): void {

  }

  setMode(mode: 'preview' | 'manage') {
    this.mode = mode;
  }

  markDirty() {
    this.isDirty = true;
  }

  removeSlot(day: any) {
    day.from = null;
    day.to = null;
    day.active = false;
  }

  addNextSlot(day: any) {
    const defaultStart = '09:00';
    const defaultDurationMinutes = 60;

    const [h, m] = defaultStart.split(':').map(Number);
    const endHour = h + Math.floor(defaultDurationMinutes / 60);
    const endMinute = m + (defaultDurationMinutes % 60);

    day.from = defaultStart;
    day.to = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    day.active = true;
  }

  saveWorkHours() {
    console.log('Saving:', this.weeklyAvailability);
    this.isDirty = false;
  }


  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
