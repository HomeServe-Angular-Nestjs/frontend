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

  isDirty = false;
  isSaving = false;
  isLoading = true;
  mode: 'preview' | 'manage' = 'manage';
  defaultTimeRange = { from: '09:00', to: '17:00' };

  readonly minutesInDay = 24 * 60;

  editorDay: IAvailabilityListView | null = null;
  editorIndex: number | null = null;
  editorDraft = { from: '', to: '' };

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
    this._fetchAvailability();
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

  get editorInlineError(): string {
    if (!this.editorDay) {
      return '';
    }

    const { from, to } = this.editorDraft;

    const slotError = this._validateSingleSlot(from, to);
    if (slotError) {
      return slotError;
    }

    if (this._hasOverlap(this.editorDay, from, to, this.editorIndex)) {
      return 'Time slots must not overlap';
    }

    return '';
  }

  isEditor(day: IAvailabilityListView): boolean {
    return this.editorDay === day;
  }

  dayError(day: IAvailabilityListView): string | null {
    return this._validateDay(day);
  }

  openAddSlot(day: IAvailabilityListView) {
    const suggestion = this._suggestNextSlot(day);
    this.editorDay = day;
    this.editorIndex = null;
    this.editorDraft = suggestion ? { ...suggestion } : { ...this.defaultTimeRange };
  }

  startEditSlot(day: IAvailabilityListView, index: number) {
    const slot = day.timeRanges[index];
    this.editorDay = day;
    this.editorIndex = index;
    this.editorDraft = { ...slot };
  }

  closeEditor() {
    this.editorDay = null;
    this.editorIndex = null;
    this.editorDraft = { from: '', to: '' };
  }

  confirmEditor() {
    const day = this.editorDay;
    if (!day) {
      return;
    }

    if (this.editorInlineError) {
      this._toastr.error(this.editorInlineError);
      return;
    }

    const { from, to } = this.editorDraft;

    if (this.editorIndex === null) {
      if (day.timeRanges.length === 0) {
        day.active = true;
      }
      day.timeRanges.push({ from, to });
    } else {
      const slot = day.timeRanges[this.editorIndex];
      slot.from = from;
      slot.to = to;
    }

    this.markDirty();
    this.closeEditor();
  }

  previewSegments(day: IAvailabilityListView): { left: number; width: number }[] {
    const startPct = (minutes: number) => Math.min(100, (minutes / this.minutesInDay) * 100);

    return day.timeRanges.map(range => {
      const startMin = timeToMinutes(range.from);
      const endMin = timeToMinutes(range.to);
      const start = startPct(startMin);
      const width = Math.max(0, Math.min(100 - start, startPct(endMin) - start));
      return { left: start, width };
    });
  }

  saveWorkHours() {
    if (!this._validateWeeklyAvailability()) {
      return;
    }

    this.isSaving = true;

    const weekData = this._mapUiToWeeklyAvailability();

    this._availabilityService.updateAvailability(weekData)
      .pipe(
        takeUntil(this._destroy$),
        finalize(() => (this.isSaving = false)),
        map(res => res?.data?.week ?? this._emptyWeek()),
      )
      .subscribe({
        next: (week) => {
          this.weeklyAvailability = this._initializeAvailability(week);
          this.isDirty = false;
          this.closeEditor();
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

  private _suggestNextSlot(day: IAvailabilityListView): { from: string; to: string } | null {
    const lastSlot = day.timeRanges[day.timeRanges.length - 1];

    if (!lastSlot) {
      return null;
    }

    const DEFAULT_DURATION_MIN = 60;
    const BUFFER_MIN = 10;

    const lastEndMinutes = timeToMinutes(lastSlot.to);
    const nextStartMinutes = lastEndMinutes + BUFFER_MIN;
    const nextEndMinutes = nextStartMinutes + DEFAULT_DURATION_MIN;

    return {
      from: minutesToTime(nextStartMinutes),
      to: minutesToTime(nextEndMinutes),
    };
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
      .subscribe({
        next: (week) => {
          this.weeklyAvailability = this._initializeAvailability(week);
          this.isDirty = false;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  private _hasOverlap(day: IAvailabilityListView, from: string, to: string, excludeIndex: number | null): boolean {
    const newStart = timeToMinutes(from);
    const newEnd = timeToMinutes(to);

    for (let i = 0; i < day.timeRanges.length; i++) {
      if (i === excludeIndex) {
        continue;
      }

      const start = timeToMinutes(day.timeRanges[i].from);
      const end = timeToMinutes(day.timeRanges[i].to);

      if (newStart < end && newEnd > start) {
        return true;
      }
    }

    return false;
  }

  private _validateSingleSlot(from: string, to: string): string | null {
    if (!from || !to) {
      return 'Start and end time are required';
    }

    const start = timeToMinutes(from);
    const end = timeToMinutes(to);

    if (start >= end) {
      return 'Start time must be before end time';
    }

    return null;
  }

  private _validateDay(day: IAvailabilityListView): string | null {
    const slots = day.timeRanges;

    if (!slots || slots.length === 0) {
      return null;
    }

    const intervals: [number, number][] = [];

    for (const slot of slots) {
      if (!slot.from || !slot.to) {
        return 'Start and end time are required';
      }

      const start = timeToMinutes(slot.from);
      const end = timeToMinutes(slot.to);

      if (start >= end) {
        return 'Start time must be before end time';
      }

      intervals.push([start, end]);
    }

    intervals.sort((a, b) => a[0] - b[0]);

    for (let i = 1; i < intervals.length; i++) {
      const prevEnd = intervals[i - 1][1];
      const currStart = intervals[i][0];

      if (currStart < prevEnd) {
        return 'Time slots must not overlap';
      }
    }

    return null;
  }

  private _validateWeeklyAvailability(): boolean {
    for (const day of this.weeklyAvailability) {
      const error = this._validateDay(day);

      if (error) {
        this._toastr.error(`${day.label}: ${error}`);
        return false;
      }
    }

    return true;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}