import { Component, effect, EventEmitter, inject, OnDestroy, OnInit, Output, signal, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { AvailabilityType, IAvailabilityViewList } from '../../../../../../core/models/availability.model';
import { IFilterFetchProviders } from '../../../../../../core/models/user.model';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';

@Component({
    selector: 'app-customer-provider-view-card-filter',
    templateUrl: './provider-view-card-filter.component.html',
    imports: [CommonModule, FormsModule],
    providers: [DebounceService]
})
export class ProviderViewCardFilterComponent implements OnInit, OnDestroy {
    private _debounceService = inject(DebounceService);
    private readonly _toastr = inject(ToastNotificationService);
    private _destroy$ = new Subject<void>();

    filter = signal<IFilterFetchProviders>({
        search: '',
        availability: 'all',
        status: 'all',
        date: '',
        categoryId: '',
        lat: null,
        lng: null,
    });

    availabilitySlots: IAvailabilityViewList[] = [
        { label: 'Morning', icon: 'fas fa-sun', value: 'morning' },
        { label: 'Afternoon', icon: 'fas fa-cloud-sun', value: 'afternoon' },
        { label: 'Evening', icon: 'fas fa-moon', value: 'evening' },
        { label: 'Night', icon: 'fas fa-star', value: 'night' },
    ];

    @Output() filterEvents = new EventEmitter<Partial<IFilterFetchProviders>>();

    constructor() {
        // Automatically emit on filter changes (except search which is debounced)
        effect(() => {
            const { availability, status, date } = this.filter();
            this._emitFilter();
        });
    }

    ngOnInit(): void {
        this._debounceService.onSearch(700)
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                this._emitFilter()
            });
    }

    onSearchTriggered(value: string) {
        this.filter.update(curr => ({ ...curr, search: value }));
        this._debounceService.delay(value);
    }

    toggleCertifiedOnly() {
        // Not implemented in UI yet, but keeping for future
    }

    onStatusChange(status: any) {
        this.filter.update(curr => ({ ...curr, status }));
    }

    onDateChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const date = input.value;

        // If date is cleared, reset availability
        this.filter.update(curr => ({
            ...curr,
            date,
            availability: !date ? 'all' : curr.availability
        }));
    }

    toggleAvailability(value: AvailabilityType) {
        const current = this.filter();

        // Enforce date selection
        if (!current.date?.trim()) {
            this._toastr.warning('Please select a date');
            return;
        }

        // Toggle logic: if clicking same value, revert to 'all'
        const newAvailability = current.availability === value ? 'all' : value;
        this.filter.update(curr => ({ ...curr, availability: newAvailability }));
    }

    clearAvailability() {
        this.filter.update(curr => ({ ...curr, availability: 'all' }));
    }

    reset() {
        this.filter.set({
            search: '',
            availability: 'all',
            status: 'all',
            date: '',
            categoryId: '',
            lat: null,
            lng: null,
        });
        
        this._emitFilter();
    }

    private _emitFilter() {
        const current = this.filter();
        const filter: Partial<IFilterFetchProviders> = {
            search: current.search?.trim(),
            availability: current.availability,
            status: current.status,
            date: current.date,
            categoryId: current.categoryId,
            lat: current.lat,
            lng: current.lng,
        };

        this.filterEvents.emit(filter);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
