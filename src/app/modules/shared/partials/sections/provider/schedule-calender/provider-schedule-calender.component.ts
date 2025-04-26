import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-provider-schedule-calender',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './provider-schedule-calender.component.html',
})
export class ProviderScheduleCalenderComponent implements OnInit {
  currentDate: Date = new Date();
  dateInput: string = '';
  visibleDates: string[] = [];
  days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  ngOnInit(): void {
    this.syncDateInputToCurrent();
    this.generateWeek(this.currentDate);
  }

  syncDateInputToCurrent() {
    this.dateInput = this.formatDateInput(this.currentDate);
  }

  formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  generateWeek(baseDate: Date) {
    const startOfWeek = this.getStartOfWeek(baseDate);
    const dates: string[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      dates.push(day.toDateString());
    }

    this.visibleDates = dates;
  }

  getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay(); // 0 = Sun, 1 = Mon, ...
    start.setDate(start.getDate() - day);
    return start;
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

  
getMonthNumber(monthName: string): number {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.indexOf(monthName);
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


}
