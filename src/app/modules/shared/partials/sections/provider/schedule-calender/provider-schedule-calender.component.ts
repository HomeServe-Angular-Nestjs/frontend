import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderScheduleDefaultTimeComponent } from "../schedule-default-time/provider-schedule-default-time.component";
import { IProvider } from '../../../../../../core/models/user.model';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectProvider } from '../../../../../../store/provider/provider.selector';
import { ISchedule, SlotType } from '../../../../../../core/models/schedules.model';
import { scheduleActions } from '../../../../../../store/schedules/schedule.action';
import { selectAllSchedules } from '../../../../../../store/schedules/schedule.selector';

@Component({
  selector: 'app-provider-schedule-calender',
  standalone: true,
  imports: [CommonModule, FormsModule, ProviderScheduleDefaultTimeComponent],
  templateUrl: './provider-schedule-calender.component.html',
})
export class ProviderScheduleCalenderComponent implements OnInit, OnDestroy {
  providerData$!: Observable<IProvider | null>;
  schedules$!: Observable<ISchedule[]>;

  private _destroy$ = new Subject<void>();

  constructor(private _store: Store) { }

  loading: boolean = false;
  currentDate: Date = new Date();
  dateInput: string = '';
  visibleDates: string[] = [];
  days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  modal: boolean = false;
  addNewSlots: boolean = false;
  pickedDate!: string;

  ngOnInit(): void {
    this.providerData$ = this._store.select(selectProvider);

    // Dispatch an action to fetch schedules once provider ID is available
    this.providerData$.pipe(
      takeUntil(this._destroy$),
      filter((provider): provider is IProvider => !!provider && !!provider.id)
    ).subscribe(provider => {
      this._store.dispatch(scheduleActions.fetchSchedules({ providerId: provider.id }));
    })

    this.schedules$ = this._store.select(selectAllSchedules);

    this._syncDateInputToCurrent();
    this._generateWeek(this.currentDate);
  }

  prev() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this._syncDateInputToCurrent();
    this._generateWeek(this.currentDate);
  }

  next() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this._syncDateInputToCurrent();
    this._generateWeek(this.currentDate);
  }

  onDateInputChange() {
    const selected = new Date(this.dateInput);
    if (!isNaN(selected.getTime())) {
      this.currentDate = selected;
      this._syncDateInputToCurrent();
      this._generateWeek(this.currentDate);
    }
  }

  isSelected(dateStr: string): boolean {
    const [weekday, month, day, year] = dateStr.split(' ');
    const localDate = new Date(Number(year), this._getMonthNumber(month), Number(day));
    const formatted = this._formatDateInput(localDate);
    return formatted === this.dateInput;
  }

  selectDate(dateStr: string) {
    const [weekday, month, day, year] = dateStr.split(' ');
    const localDate = new Date(Number(year), this._getMonthNumber(month), Number(day));

    // Update the dateInput (for the input field)
    this.dateInput = this._formatDateInput(localDate);

    // Update currentDate (for the week view and month/year heading)
    this.currentDate = localDate;

    // Regenerate the week based on the selected date
    this._generateWeek(this.currentDate);
  }

  addSlots(date: string) {
    this.modal = true;
    this.addNewSlots = true;
    this.pickedDate = date;
  }

  addToNewSlot(slot: SlotType) {
    this._store.dispatch(scheduleActions.updateSchedule({
      updateData: {
        scheduleDate: this.pickedDate,
        slot
      }
    }));
  }

  clearSlots(date: string, id: string, event: MouseEvent) {
    this._store.dispatch(scheduleActions.removeSchedule({ date, id }));
  }


  setDefaultHours() {
    this.modal = true;
    this.addNewSlots = false;
  }

  closeModal(event: boolean) {
    this.modal = event;
  }

  private _getMonthNumber(monthName: string): number {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.indexOf(monthName);
  }

  private _syncDateInputToCurrent() {
    this.dateInput = this._formatDateInput(this.currentDate);
  }

  private _formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private _generateWeek(baseDate: Date) {
    const startOfWeek = this._getStartOfWeek(baseDate);
    const dates: string[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      dates.push(day.toDateString());
    }

    this.visibleDates = dates;
  }

  private _getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay(); // 0 = Sun, 1 = Mon, ...
    start.setDate(start.getDate() - day);
    return start;
  }

  ngOnDestroy(): void {
    // Complete the destroy$ subject to clean up subscriptions
    this._destroy$.next();
    this._destroy$.complete();
  }
}
