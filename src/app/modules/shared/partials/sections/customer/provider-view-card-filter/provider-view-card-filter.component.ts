import {
    Component,
    EventEmitter,
    inject,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
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
    private _filters$ = new BehaviorSubject<IFilter>({});
    private _destroy$ = new Subject<void>();

    @Output() filterEvents = new EventEmitter<IFilter>();

    searchQuery: string = '';
    certifiedOnly: boolean = false;
    ratingFilter: number = 0;
    sortOption: string = 'rating';

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

    filterProviders() { }

    toggleCertifiedOnly() {
        this._debounceService.delay(this.certifiedOnly);
    }

    sortProviders() { }

    reset() {
        this.certifiedOnly = false;
        this.searchQuery = '';
        // this.ratingFilter = 0;
        // this.sortOption = 'rating';
        this._emitFilter();
    }

    private _emitFilter() {
        const filter: IFilter = {
            search: this.searchQuery,
            isCertified: this.certifiedOnly,
        };

        this._filters$.next(filter);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
