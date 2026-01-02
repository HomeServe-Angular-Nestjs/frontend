import { Component, effect, EventEmitter, inject, OnDestroy, OnInit, Output, signal, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { AvailabilityType, IAvailabilityViewList } from '../../../../../../core/models/availability.model';
import { IFilterFetchProviders } from '../../../../../../core/models/user.model';

@Component({
    selector: 'app-customer-provider-view-card-filter',
    templateUrl: './provider-view-card-filter.component.html',
    imports: [CommonModule, FormsModule],
    providers: [DebounceService]
})
export class ProviderViewCardFilterComponent implements OnInit, OnDestroy {
    private _debounceService = inject(DebounceService);
    // private _filters$ = new BehaviorSubject({});
    private _destroy$ = new Subject<void>();

    filter = signal<IFilterFetchProviders>({
        search: '',
        availability: null,
        sort: 'all'
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
        // this._filters$
        //     .pipe(takeUntil(this._destroy$))
        //     .subscribe(() => {
        //         this._emitFilter();
        //     });

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

    toggleAvailability(value: AvailabilityType) {
        // this.selectedAvailability = this.selectedAvailability === value ? null : value;
        this._emitFilter();
    }

    clearAvailability() {
        // this.selectedAvailability = null;
        this._emitFilter();
    }

    reset() {
        this.filter.set({
            search: '',
            availability: null,
            sort: 'all'
        });
        this._emitFilter();
    }

    private _emitFilter() {
        const filter = {
            search: this.filter().search?.trim() || '',
            availability: this.filter().availability,
            sort: this.filter().sort,
        };

        this.filterEvents.emit(filter);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
