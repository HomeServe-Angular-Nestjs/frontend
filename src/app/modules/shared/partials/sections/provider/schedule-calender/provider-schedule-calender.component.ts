import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderScheduleDefaultTimeComponent } from "../schedule-default-time/provider-schedule-default-time.component";
import { IProvider } from '../../../../../../core/models/user.model';
import { catchError, combineLatest, filter, map, Observable, of, shareReplay, startWith, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectProvider } from '../../../../../../store/provider/provider.selector';
import { ISchedule, SlotType } from '../../../../../../core/models/schedules.model';
import { scheduleActions } from '../../../../../../store/schedules/schedule.action';
import { ScheduleService } from '../../../../../../core/services/schedule.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';

@Component({
  selector: 'app-provider-schedule-calender',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './provider-schedule-calender.component.html',
})
export class ProviderScheduleCalenderComponent implements OnInit, OnDestroy {
  private readonly _store = inject(Store);
  private readonly _scheduleService = inject(ScheduleService);
  private readonly _toastr = inject(ToastNotificationService);

  private _destroy$ = new Subject<void>();

  providerData$!: Observable<IProvider | null>;
  schedules$!: Observable<ISchedule[]>;
  loading$!: Observable<boolean>;

  currentDate: Date = new Date();
  dateInput: string = '';
  visibleDates: string[] = [];
  days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  modal: boolean = false;
  addNewSlots: boolean = false;
  pickedDate!: string;

  ngOnInit(): void {
    this.providerData$ = this._store.select(selectProvider);
    const delayed$ = timer(3000); // min 3 sec delay

    const fetchedSchedules$ = this.providerData$.pipe(
      takeUntil(this._destroy$),
      filter((provider): provider is IProvider => !!provider && !!provider.id),
      switchMap(provider =>
        this._scheduleService.fetchSchedules(provider.id).pipe(
          catchError(err => {
            this._toastr.error('Failed to load schedules');
            console.error(err);
            return of([]);
          })
        )
      ),
      shareReplay(1)
    );

    this.schedules$ = fetchedSchedules$;

    this.loading$ = combineLatest([fetchedSchedules$, delayed$]).pipe(
      takeUntil(this._destroy$),
      map(() => false),
      startWith(true)
    );

    this._syncDateInputToCurrent();
    this._generateWeek(this.currentDate);
  }

  prev() {
    this.currentDate = new Date(this.currentDate);
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this._syncDateInputToCurrent();
    this._generateWeek(this.currentDate);
  }

  next() {
    this.currentDate = new Date(this.currentDate);
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
    const parsed = this._parseDateString(dateStr);
    return this._formatDateInput(parsed) === this.dateInput;
  }

  selectDate(dateStr: string) {
    const parsed = this._parseDateString(dateStr);
    this.dateInput = this._formatDateInput(parsed);
    this.currentDate = parsed;
    this._generateWeek(this.currentDate);
  }

  addSlots(date: string) {
    this.modal = true;
    this.addNewSlots = true;
    this.pickedDate = date;
  }

  addToDefaultSlot(slot: SlotType) {
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

  // shouldShowActions(loading: boolean, schedules: ISchedule[], date: string): boolean {
  //   if (loading) return false;
  //   return schedules.some(s => s.scheduleDate === date && s.slots.length > 0);
  // }

  getSlotCountForDate(schedules: ISchedule[], date: string): number {
    const match = schedules.find(item => item.scheduleDate === date);
    return match ? match.slots.length : 0;
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
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return start;
  }

  private _parseDateString(dateStr: string): Date {
    const [_, month, day, year] = dateStr.split(' ');
    return new Date(Number(year), this._getMonthNumber(month), Number(day));
  }

  private _getMonthNumber(monthName: string): number {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.indexOf(monthName);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
