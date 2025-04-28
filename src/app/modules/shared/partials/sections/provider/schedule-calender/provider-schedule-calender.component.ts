import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderScheduleDefaultTimeComponent } from "../schedule-default-time/provider-schedule-default-time.component";
import { IProvider } from '../../../../../../core/models/user.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectProvider } from '../../../../../../store/provider/provider.selector';
import { ISchedule, ISlot, SlotType } from '../../../../../../core/models/schedules.model';
import { scheduleActions } from '../../../../../../store/schedules/schedule.action';
import { selectAllSchedules } from '../../../../../../store/schedules/schedule.selector';

@Component({
  selector: 'app-provider-schedule-calender',
  standalone: true,
  imports: [CommonModule, FormsModule, ProviderScheduleDefaultTimeComponent],
  templateUrl: './provider-schedule-calender.component.html',
})
export class ProviderScheduleCalenderComponent implements OnInit {
  providerData$!: Observable<IProvider | null>;
  // schedules$!: Observable<ISchedule[]>;

  constructor(private store: Store) {
    this.providerData$ = this.store.select(selectProvider);
    this.store.select(selectAllSchedules).subscribe(data => {
      this.schedules = data;
    });
  }

  currentDate: Date = new Date();
  dateInput: string = '';
  visibleDates: string[] = [];
  days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  modal: boolean = false;
  addNewSlots: boolean = false;
  pickedDate!: string;
  schedules: ISchedule[] = [];

  ngOnInit(): void {
    this.syncDateInputToCurrent();
    this.generateWeek(this.currentDate);
  }

  prev() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.syncDateInputToCurrent();
    this.generateWeek(this.currentDate);
  }

  next() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.syncDateInputToCurrent();
    this.generateWeek(this.currentDate);
  }

  onDateInputChange() {
    const selected = new Date(this.dateInput);
    if (!isNaN(selected.getTime())) {
      this.currentDate = selected;
      this.syncDateInputToCurrent();
      this.generateWeek(this.currentDate);
    }
  }

  isSelected(dateStr: string): boolean {
    const [weekday, month, day, year] = dateStr.split(' ');
    const localDate = new Date(Number(year), this.getMonthNumber(month), Number(day));
    const formatted = this.formatDateInput(localDate);
    return formatted === this.dateInput;
  }

  selectDate(dateStr: string) {
    const [weekday, month, day, year] = dateStr.split(' ');
    const localDate = new Date(Number(year), this.getMonthNumber(month), Number(day));

    // Update the dateInput (for the input field)
    this.dateInput = this.formatDateInput(localDate);

    // Update currentDate (for the week view and month/year heading)
    this.currentDate = localDate;

    // Regenerate the week based on the selected date
    this.generateWeek(this.currentDate);
  }

  addSlots(date: string) {
    this.modal = true;
    this.addNewSlots = true;
    this.pickedDate = date;
  }

  addToNewSlot(slot: SlotType) {
    this.modal = false;
    this.store.dispatch(scheduleActions.updateSchedule({
      updateData: {
        scheduleDate: this.pickedDate,
        slot
      }
    }));
  }

  setDefaultHours() {
    this.modal = true;
    this.addNewSlots = false;
  }

  closeModal(event: boolean) {
    this.modal = event;
  }

  private getMonthNumber(monthName: string): number {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.indexOf(monthName);
  }

  private syncDateInputToCurrent() {
    this.dateInput = this.formatDateInput(this.currentDate);
  }

  private formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private generateWeek(baseDate: Date) {
    const startOfWeek = this.getStartOfWeek(baseDate);
    const dates: string[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      dates.push(day.toDateString());
    }

    this.visibleDates = dates;
  }

  private getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay(); // 0 = Sun, 1 = Mon, ...
    start.setDate(start.getDate() - day);
    return start;
  }
}
