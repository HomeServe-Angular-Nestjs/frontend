import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, map, Subject, takeUntil } from 'rxjs';
import { AvailabilityService } from '../../../../../../core/services/availability.service';
import { IAvailabilityListView, IDayAvailability, IWeeklyAvailability } from '../../../../../../core/models/availability.model';
import { WeekEnum } from '../../../../../../core/enums/enums';
import { minutesToTime, timeToMinutes } from '../../../../../../core/utils/date.util';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';

@Component({
  selector: 'app-provider-default-availability',
  templateUrl: './default-availability.component.html',
  imports: [CommonModule, FormsModule],
})
export class ProviderDefaultAvailabilityComponent implements OnInit, OnDestroy {
  private readonly _availabilityService = inject(AvailabilityService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _destroy$ = new Subject<void>();

  isManageMode = true;
  isDirty = false;
  mode: 'preview' | 'manage' = 'manage';
  defaultTimeRange = { from: '09:00', to: '17:00' };

  weeklyAvailability: IAvailabilityListView[] = [
    { label: WeekEnum.SUN, active: false, timeRanges: [] },
    { label: WeekEnum.MON, active: false, timeRanges: [] },
    { label: WeekEnum.TUE, active: false, timeRanges: [] },
    { label: WeekEnum.WED, active: false, timeRanges: [] },
    { label: WeekEnum.THU, active: false, timeRanges: [] },
    { label: WeekEnum.FRI, active: false, timeRanges: [] },
    { label: WeekEnum.SAT, active: false, timeRanges: [] },
  ];

  ngOnInit(): void {
    this._fetchAvailability()
  }

  setMode(mode: 'preview' | 'manage') {
    this.mode = mode;
  }

  markDirty() {
    this.isDirty = true;
  }

  removeSlot(day: IAvailabilityListView, index: number) {
    day.timeRanges.splice(index, 1);

    if (day.timeRanges.length === 0) {
      day.active = false;
    }
    this.markDirty();
  }

  addFirstSlot(day: IAvailabilityListView) {
    day.active = true;
    day.timeRanges = [this.defaultTimeRange]
    this.markDirty();
  }

  addNextSlot(day: IAvailabilityListView) {
    const DEFAULT_DURATION_MIN = 60;
    const BUFFER_MIN = 10;

    // If no slots exist, behave like "add first slot"
    if (day.timeRanges.length === 0) {
      day.active = true;
      day.timeRanges.push(this.defaultTimeRange);
      this.markDirty();
      return;
    }

    const lastSlot = day.timeRanges[day.timeRanges.length - 1];

    const lastEndMinutes = timeToMinutes(lastSlot.to);
    const nextStartMinutes = lastEndMinutes + BUFFER_MIN;
    const nextEndMinutes = nextStartMinutes + DEFAULT_DURATION_MIN;

    day.timeRanges.push({
      from: minutesToTime(nextStartMinutes),
      to: minutesToTime(nextEndMinutes),
    });

    this.markDirty();
  }

  saveWorkHours() {
    if (!this._validateWeeklyAvailability()) {
      return;
    }

    const weekData = this._mapUiToWeeklyAvailability();

    this._availabilityService.updateAvailability(weekData)
      .pipe(
        takeUntil(this._destroy$),
        map(res => res?.data?.week ?? this._emptyWeek()),
      )
      .subscribe({
        next: (week) => {
          this.weeklyAvailability = this._initializeAvailability(week);
          this.isDirty = false;
          this._toastr.success('Work hours updated successfully');
        },
      });
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent) {
    if (this.isDirty) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  private _mapUiToWeeklyAvailability(): IWeeklyAvailability['week'] {
    const mapDay = (day: IAvailabilityListView): IDayAvailability => ({
      isAvailable: day.active,
      timeRanges: day.timeRanges.map(slot => ({
        startTime: slot.from,
        endTime: slot.to,
      })),
    });

    const getDay = (label: WeekEnum) =>
      this.weeklyAvailability.find(d => d.label === label)!;

    return {
      sun: mapDay(getDay(WeekEnum.SUN)),
      mon: mapDay(getDay(WeekEnum.MON)),
      tue: mapDay(getDay(WeekEnum.TUE)),
      wed: mapDay(getDay(WeekEnum.WED)),
      thu: mapDay(getDay(WeekEnum.THU)),
      fri: mapDay(getDay(WeekEnum.FRI)),
      sat: mapDay(getDay(WeekEnum.SAT)),
    };
  }


  private _initializeAvailability(week: IWeeklyAvailability['week']): IAvailabilityListView[] {
    const mapDay = (label: WeekEnum, day: IDayAvailability): IAvailabilityListView => ({
      label,
      active: day.isAvailable,
      timeRanges: day.timeRanges.map(r => ({
        from: r.startTime,
        to: r.endTime,
      })),
    });

    return [
      mapDay(WeekEnum.SUN, week.sun),
      mapDay(WeekEnum.MON, week.mon),
      mapDay(WeekEnum.TUE, week.tue),
      mapDay(WeekEnum.WED, week.wed),
      mapDay(WeekEnum.THU, week.thu),
      mapDay(WeekEnum.FRI, week.fri),
      mapDay(WeekEnum.SAT, week.sat),
    ];
  }

  private _emptyWeek(): IWeeklyAvailability['week'] {
    return {
      sun: { isAvailable: false, timeRanges: [] },
      mon: { isAvailable: false, timeRanges: [] },
      tue: { isAvailable: false, timeRanges: [] },
      wed: { isAvailable: false, timeRanges: [] },
      thu: { isAvailable: false, timeRanges: [] },
      fri: { isAvailable: false, timeRanges: [] },
      sat: { isAvailable: false, timeRanges: [] },
    };
  }

  private _fetchAvailability(): void {
    this._availabilityService.getAvailability()
      .pipe(
        takeUntil(this._destroy$),
        map(res => res?.data?.week ?? this._emptyWeek()),
      )
      .subscribe((week) => {
        this.weeklyAvailability = this._initializeAvailability(week);
        this.isDirty = false;
      });
  }

  private _validateWeeklyAvailability(): boolean {
    for (const day of this.weeklyAvailability) {

      const slots = day.timeRanges;

      if (!slots || slots.length === 0) {
        continue;
      }

      const intervals: [number, number][] = [];

      for (const slot of slots) {
        if (!slot.from || !slot.to) {
          this._toastr.error(`${day.label}: Start and end time are required`);
          return false;
        }

        const start = timeToMinutes(slot.from);
        const end = timeToMinutes(slot.to);

        if (start >= end) {
          this._toastr.error(`${day.label}: Start time must be before end time`);
          return false;
        }

        intervals.push([start, end]);
      }

      // Sort by start time
      intervals.sort((a, b) => a[0] - b[0]);

      // Check overlaps
      for (let i = 1; i < intervals.length; i++) {
        const prevEnd = intervals[i - 1][1];
        const currStart = intervals[i][0];

        if (currStart < prevEnd) {
          this._toastr.error(`${day.label}: Time slots must not overlap`);
          return false;
        }
      }
    }

    return true;
  }


  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
