import { Component, EventEmitter, inject, OnDestroy, OnInit, Output, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IFilter } from '../../../../../../core/models/filter.model';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';

@Component({
    selector: 'app-customer-provider-view-card-filter',
    templateUrl: './provider-view-card-filter.component.html',
    imports: [FormsModule],
    providers: [DebounceService]
})
export class ProviderViewCardFilterComponent implements OnInit, OnDestroy {
    private _debounceService = inject(DebounceService);
    private _filters$ = new BehaviorSubject({});
    private _destroy$ = new Subject<void>();

    @Output() filterEvents = new EventEmitter<{ search?: string; isCertified?: boolean; status?: string }>();

    searchQuery: string = '';
    certifiedOnly: boolean = false;
    sortOption: string = 'all';

    ngOnInit(): void {
        this._filters$
            .pipe(takeUntil(this._destroy$))
            .subscribe((filter) => {
                this.filterEvents.emit(filter);
            });

        this._debounceService.onSearch(700)
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                this._emitFilter()
            })
    }

    onSearchTriggered() {
        this._debounceService.delay(this.searchQuery);
    }

    toggleCertifiedOnly() {
        this._emitFilter();
    }

    sortProviders() {
        this._emitFilter();
    }

    reset() {
        this.certifiedOnly = false;
        this.searchQuery = '';
        this.sortOption = 'all';
        this._emitFilter();
    }

    private _emitFilter() {
        const filter = {
            search: this.searchQuery.trim(),
            isCertified: this.certifiedOnly,
            status: this.sortOption,
        };

        this._filters$.next(filter);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
