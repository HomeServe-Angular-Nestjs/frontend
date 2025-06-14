import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ScheduleService } from '../../../../../../core/services/schedule.service';
import { AvailabilityType, IDaysDetails, IScheduleDetailFilters } from '../../../../../../core/models/schedules.model';
import { BehaviorSubject, map, Observable, shareReplay, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { ServiceToggleType } from '../../../../../../core/models/offeredService.model';

@Component({
    selector: 'app-provider-schedule-list-details',
    templateUrl: './schedule-list-details.component.html',
    imports: [CommonModule, FormsModule]
})
export class ProviderScheduleListDetailsComponent implements OnInit, OnDestroy {
    private readonly _scheduleService = inject(ScheduleService);

    @Input({ required: true }) scheduleId!: string;
    @Input({ required: true }) scheduleMonth!: string;

    private _filters$ = new BehaviorSubject<IScheduleDetailFilters>({});
    private _destroy$ = new Subject<void>();

    scheduleDates$!: Observable<(IDaysDetails & { expanded: boolean })[]>;

    statusOptions: { value: ServiceToggleType, label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
    ];

    availabilityOptions: { value: AvailabilityType, label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'booked', label: 'Booked' },
        { value: 'available', label: "Available" }
    ];

    selectedStatus: ServiceToggleType = 'all';
    selectedAvailability: AvailabilityType = 'all';
    selectedDate: string = '';

    ngOnInit(): void {
        this._filters$
            .pipe(takeUntil(this._destroy$))
            .subscribe((filters) => {
                this._loadScheduleDetails(filters);
            })
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    toggleActive(dayId: string, status: boolean) {
        this.scheduleDates$ = this._scheduleService.toggleScheduleDateStatus({
            scheduleId: this.scheduleId,
            month: this.scheduleMonth,
            dayId,
            status: !status
        }).pipe(
            map(response => response.data?.map(date => ({ ...date, expanded: false })) ?? [])
        );
    }

    toggleSlotStatus(dayId: string, slotId: string, status: boolean) {
        this._scheduleService.toggleScheduleDateSlotStatus({
            scheduleId: this.scheduleId,
            month: this.scheduleMonth,
            dayId,
            slotId,
            status: false
        }).subscribe();
    }

    changeStatus() {
        this._emitFilters();
    }

    changeDate() {
        this._emitFilters();
    }

    changeAvailability() {
        this._emitFilters();
    }

    resetFilters() {
        this._filters$.next({});
    }

    private _loadScheduleDetails(filters: IScheduleDetailFilters) {
        this.scheduleDates$ = this._scheduleService.fetchScheduleDetails(this.scheduleId, this.scheduleMonth, filters).pipe(
            map(response => response.data ?? []),
            shareReplay(1)
        );
    }

    private _emitFilters() {
        const filters: IScheduleDetailFilters = {
            status: this.selectedStatus,
            availableType: this.selectedAvailability,
            date: this.selectedDate
        };

        this._filters$.next(filters);
    }
}
