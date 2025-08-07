import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { StatusToggleType } from "../../../../../../core/models/offeredService.model";
import { RuleSortEnum } from "../../../../../../core/enums/enums";
import { DebounceService } from "../../../../../../core/services/public/debounce.service";
import { Subject, takeUntil } from "rxjs";
import { IRuleFilter } from "../../../../../../core/models/slot-rule.model";
import { SlotRuleService } from "../../../../../../core/services/slot-rule.service";

@Component({
    selector: 'app-provider-rule-filter',
    templateUrl: './rule-filters.component.html',
    imports: [CommonModule, FormsModule],
    providers: [DebounceService]
})
export class ProviderRuleFilterComponent implements OnInit, OnDestroy {
    private readonly _debounceService = inject(DebounceService);
    private readonly _slotRuleService = inject(SlotRuleService);
    private readonly _destroy$ = new Subject<void>();

    showFilters = false;

    filters: IRuleFilter = {
        search: '',
        startDate: '',
        endDate: '',
        ruleStatus: 'all',
        sort: RuleSortEnum.LATEST
    };

    ruleStatusOptions: { value: StatusToggleType, label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
    ];

    ruleSortOptions: { value: RuleSortEnum, label: string }[] = [
        { value: RuleSortEnum.LATEST, label: 'Latest' },
        { value: RuleSortEnum.OLDEST, label: 'Oldest' },
        { value: RuleSortEnum.HIGH_PRIORITY, label: 'High Priority' },
        { value: RuleSortEnum.LOW_PRIORITY, label: 'Low Priority' },
    ];

    ngOnInit(): void {
        this._debounceService.onSearch(300)
            .pipe(takeUntil(this._destroy$))
            .subscribe((filter) => {
                this._applyFilters(filter);
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private _applyFilters(filter: IRuleFilter) {
        this._slotRuleService.setRuleFilter(filter);
    }

    search() {
        const filter: IRuleFilter = {
            ...this.filters,
            search: this.filters.search
        }
        this._debounceService.delay(filter);
    }

    changeStartDate() {
        const filter: IRuleFilter = {
            ...this.filters,
            startDate: this.filters.startDate
        }
        this._applyFilters(filter);
    }

    changeEndDate() {
        const filter: IRuleFilter = {
            ...this.filters,
            endDate: this.filters.endDate
        }
        this._applyFilters(filter);
    }

    changeRuleStatus() {
        const filter: IRuleFilter = {
            ...this.filters,
            ruleStatus: this.filters.ruleStatus
        }
        this._applyFilters(filter);
    }

    changeSort() {
        const filter: IRuleFilter = {
            ...this.filters,
            sort: this.filters.sort
        }
        this._applyFilters(filter);
    }

    resetFilters() {
        this.filters = {
            search: '',
            startDate: '',
            endDate: '',
            ruleStatus: 'all',
            sort: RuleSortEnum.LATEST
        }

        this._applyFilters(this.filters);
    }
}