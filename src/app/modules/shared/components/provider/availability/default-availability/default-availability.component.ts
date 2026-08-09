import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, map, Subject, takeUntil } from 'rxjs';
import { AvailabilityService } from '../../../../../../core/services/availability.service';
import { IAvailabilityListView, IDayAvailability, IWeeklyAvailability } from '../../../../../../core/models/availability.model';
import { WeekEnum } from '../../../../../../core/enums/enums';
import { minutesToTime, timeToMinutes } from '../../../../../../core/utils/date.util';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';

interface DailyPreviewRange {
  from: string;
  to: string;
  startMin: number;
  endMin: number;
  left: number;
  width: number;
  isDot: boolean;
  durationLabel: string;
}

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

  readonly summaryCollapseThreshold = 3;
  readonly summaryVisibleRangeMax = 2;
  readonly minRangeMinutesForDot = 30;
  readonly timeScaleMarkers = [
    { label: '12 AM', pct: 0 },
    { label: '6 AM', pct: 25 },
    { label: '12 PM', pct: 50 },
    { label: '6 PM', pct: 75 },
  ];
  readonly gridLinePositions = [25, 50, 75];

  editorDay: IAvailabilityListView | null = null;
  editorIndex: number | null = null;
  editorDraft = { from: '', to: '' };
  private editingSlot: { from: string; to: string } | null = null;

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
    if (!day.timeRanges[index]) {
      return;
    }

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
    this.editingSlot = null;
    this.editorDraft = suggestion ? { ...suggestion } : { ...this.defaultTimeRange };
  }

  startEditSlot(day: IAvailabilityListView, index: number) {
    const slot = day.timeRanges[index];
    if (!slot) {
      return;
    }
    this.editorDay = day;
    this.editorIndex = index;
    this.editingSlot = slot;
    this.editorDraft = { ...slot };
  }

  closeEditor() {
    this.editorDay = null;
    this.editorIndex = null;
    this.editingSlot = null;
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
      const editedSlot = this.editingSlot;
      if (!editedSlot) {
        this.closeEditor();
        return;
      }

      const editedIndex = day.timeRanges.indexOf(editedSlot);

      if (editedIndex === -1) {
        this._toastr.warning('The slot you were editing no longer exists.');
        this.closeEditor();
        return;
      }

      this.editorIndex = editedIndex;
      editedSlot.from = from;
      editedSlot.to = to;
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

  previewRanges(day: IAvailabilityListView): DailyPreviewRange[] {
    const segments = this.previewSegments(day);

    return day.timeRanges.map((range, i) => {
      const startMin = timeToMinutes(range.from);
      const endMin = timeToMinutes(range.to);
      const duration = endMin - startMin;
      const seg = segments[i];
      return {
        from: range.from,
        to: range.to,
        startMin,
        endMin,
        left: seg.left,
        width: seg.width,
        isDot: duration < this.minRangeMinutesForDot,
        durationLabel: this.formatDuration(duration),
      };
    });
  }

  formatDuration(minutes: number): string {
    const total = Math.max(0, Math.round(minutes));
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h === 0) {
      return `${m}m`;
    }
    if (m === 0) {
      return `${h}h`;
    }
    return `${h}h ${m}m`;
  }

  summaryText(day: IAvailabilityListView): string {
    return day.timeRanges.map(r => `${r.from}–${r.to}`).join(' • ');
  }

  visibleSummaryRanges(day: IAvailabilityListView): { from: string; to: string }[] {
    const visibleCount = day.timeRanges.length > this.summaryCollapseThreshold
      ? this.summaryVisibleRangeMax
      : day.timeRanges.length;
    return day.timeRanges.slice(0, visibleCount);
  }

  summaryExtraCount(day: IAvailabilityListView): number {
    return day.timeRanges.length > this.summaryCollapseThreshold
      ? day.timeRanges.length - this.summaryVisibleRangeMax
      : 0;
  }

  rangeAriaLabel(seg: DailyPreviewRange): string {
    return `${seg.from} to ${seg.to}, duration ${seg.durationLabel}`;
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
        error: () => {
          this._toastr.error('Failed to update work hours. Please try again.');
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

    if (nextEndMinutes > this.minutesInDay) {
      return null;
    }

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

    if (start >= this.minutesInDay || end > this.minutesInDay) {
      return 'Time slots must be within the same day';
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

      if (start >= this.minutesInDay || end > this.minutesInDay) {
        return 'Time slots must be within the same day';
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