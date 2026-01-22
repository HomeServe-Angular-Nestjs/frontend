import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ToggleType } from "../../../../../../core/models/filter.model";
import { DebounceService } from "../../../../../../core/services/public/debounce.service";
import { IServiceFilter, StatusToggleType } from "../../../../../../core/models/offeredService.model";
import { SortEnum } from "../../../../../../core/enums/enums";
import { Subject, takeUntil } from "rxjs";

@Component({
    selector: 'app-provider-service-filter',
    templateUrl: './service-filter.component.html',
    imports: [CommonModule, FormsModule],
    providers: [DebounceService]
})
export class ProviderServiceFilterComponent implements OnInit, OnDestroy {
    private readonly _debounceService = inject(DebounceService);

    private _destroy = new Subject<void>();

    @Output() filtersChanged = new EventEmitter<IServiceFilter>();

    serviceStatusOptions: { value: StatusToggleType, label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
    ];



    SortEnumOptions: { value: SortEnum, label: string }[] = [
        { value: SortEnum.LATEST, label: 'Latest' },
        { value: SortEnum.OLDEST, label: 'Oldest' },
        { value: SortEnum.A_Z, label: 'A-Z' },
        { value: SortEnum.Z_A, label: 'Z-A' },
        { value: SortEnum.PRICE_HIGH_TO_LOW, label: 'Price: High to Low' },
        { value: SortEnum.PRICE_LOW_TO_HIGH, label: 'Price: Low to High' },
    ];

    selectedServiceStatus: StatusToggleType = 'all';
    selectedSortOption: SortEnum = SortEnum.LATEST;
    searchText: string = '';

    showFilters = false;

    ngOnInit(): void {
        this._debounceService.onSearch(400)
            .pipe(takeUntil(this._destroy))
            .subscribe(() => {
                this._emitChanges();
            });
    }

    ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

    onSearchChange() {
        this._debounceService.delay(this.searchText);
    }

    onStatusChange() {
        this._emitChanges();
    }



    onSortChange() {
        this._emitChanges();
    }

    resetServiceFilters() {
        this.selectedServiceStatus = 'all';
        this.selectedSortOption = SortEnum.LATEST;
        this.searchText = '';
        this._emitChanges();
    }

    private _emitChanges() {
        this.filtersChanged.emit({
            search: this.searchText,
            sort: this.selectedSortOption,
            status: this.selectedServiceStatus
        });
    }
}

