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
        date: ''
    });

    availabilitySlots: IAvailabilityViewList[] = [
        { label: 'Morning', icon: 'fas fa-sun', value: 'morning' },
        { label: 'Afternoon', icon: 'fas fa-cloud-sun', value: 'afternoon' },
        { label: 'Evening', icon: 'fas fa-moon', value: 'evening' },
        { label: 'Night', icon: 'fas fa-star', value: 'night' },
    ];

    @Output() filterEvents = new EventEmitter<IFilterFetchProviders>();

    constructor() {
        effect(() => {
            this._emitFilter();
        });
    }

    ngOnInit(): void {
        this._debounceService.onSearch(700)
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                this._emitFilter()
            })
    }

    onSearchTriggered(value: string) {
        this._debounceService.delay(value);
    }

    toggleCertifiedOnly() {
        this._emitFilter();
    }

    sortProviders() {
        this._emitFilter();
    }

    onDateChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const date = input.value;
        const currentFilter = this.filter();

        // If date is cleared, reset availability
        if (!date) {
            this.filter.set({ ...currentFilter, date, availability: 'all' });
        } else {
            this.filter.set({ ...currentFilter, date });
        }
    }

    toggleAvailability(value: AvailabilityType) {
        const currentFilter = this.filter();

        // Enforce date selection
        if (!currentFilter.date?.trim()) {
            this._toastr.warning('Please select a date');
            return;
        }

        // Toggle logic: if clicking same value, revert to 'all'
        const newAvailability = currentFilter.availability === value ? 'all' : value;

        this.filter.set({ ...currentFilter, availability: newAvailability });
    }

    clearAvailability() {
        this.filter.set({ ...this.filter(), availability: 'all' });
    }

    reset() {
        this.filter.set({
            search: '',
            availability: 'all',
            status: 'all',
            date: ''
        });
    }

    private _emitFilter() {
        const filter = {
            search: this.filter().search?.trim() || '',
            availability: this.filter().availability,
            status: this.filter().status,
            date: this.filter().date
        };

        this.filterEvents.emit(filter);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
