import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ToggleType } from "../../../../../../core/models/filter.model";
import { DebounceService } from "../../../../../../core/services/public/debounce.service";
import { IServiceFilter, ServiceToggleType } from "../../../../../../core/models/offeredService.model";
import { ServiceSort } from "../../../../../../core/enums/enums";

@Component({
    selector: 'app-provider-service-filter',
    templateUrl: './service-filter.component.html',
    imports: [CommonModule, FormsModule],
    providers: [DebounceService]
})
export class ProviderServiceFilterComponent {
    @Output() filtersChanged = new EventEmitter<IServiceFilter>();

    serviceStatusOptions: { value: ServiceToggleType, label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
    ];

    serviceIsVerifiedOptions: { value: ServiceToggleType, label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'true', label: 'Verified' },
        { value: 'false', label: 'Unverified' }
    ];

    serviceSortOptions: { value: ServiceSort, label: string }[] = [
        { value: ServiceSort.LATEST, label: 'Latest' },
        { value: ServiceSort.OLDEST, label: 'oldest' },
        { value: ServiceSort.A_Z, label: 'A-Z' },
        { value: ServiceSort.Z_A, label: 'Z-A' },
    ];

    selectedServiceStatus: ServiceToggleType = 'all';
    selectedVerification: ServiceToggleType = 'all';
    selectedSortOption: ServiceSort = ServiceSort.LATEST;
    searchText: string = '';

    showFilters = false;

    onSearchChange() {
        this._emitChanges();
    }

    onStatusChange() {
        this._emitChanges();
    }

    onVerificationChange() {
        this._emitChanges();
    }

    onSortChange() {
        this._emitChanges();
    }

    resetServiceFilters() {
        this.selectedServiceStatus = 'all';
        this.selectedVerification = 'all';
        this.selectedSortOption = ServiceSort.LATEST;
        this.searchText = '';
        this._emitChanges();
    }

    private _emitChanges() {
        this.filtersChanged.emit({
            search: this.searchText,
            sort: this.selectedSortOption,
            isVerified: this.selectedVerification,
            status: this.selectedServiceStatus
        });
    }
}

