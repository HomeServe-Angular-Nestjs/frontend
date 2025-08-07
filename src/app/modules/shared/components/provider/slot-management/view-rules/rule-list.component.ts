import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { ToggleButtonComponent } from "../../../../../../UI/button/toggle-button.component";
import { SlotRuleService } from "../../../../../../core/services/slot-rule.service";
import { IRuleFilter, ISlotRule } from "../../../../../../core/models/slot-rule.model";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { ConfirmDialogComponent } from "../../../../partials/shared/confirm-dialog-box/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ProviderPaginationComponent } from "../../../../partials/sections/provider/pagination/provider-pagination.component";
import { IPagination } from "../../../../../../core/models/booking.model";
import { Subject, takeUntil } from "rxjs";

@Component({
    selector: 'app-provider-rule-list',
    templateUrl: './rule-list.component.html',
    imports: [CommonModule, ButtonComponent, ToggleButtonComponent, FormsModule, ProviderPaginationComponent],
})
export class ProviderSlotRuleListComponent implements OnInit, OnDestroy {
    private readonly _slotRuleService = inject(SlotRuleService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _dialog = inject(MatDialog);
    private readonly _destroy$ = new Subject<void>();

    @Output() editEvent = new EventEmitter<ISlotRule>();

    slotRules$ = this._slotRuleService._slotRule$;
    pagination: IPagination = {
        limit: 1,
        page: 1,
        total: 1,
    };
    filter: IRuleFilter = {};

    ngOnInit(): void {
        this._slotRuleService._ruleFilter$
            .pipe(takeUntil(this._destroy$))
            .subscribe((filter) => {
                this.filter = filter;
                this._loadRuleList(filter)
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private _loadRuleList(filters: IRuleFilter, page: number = 1) {
        this._slotRuleService.fetchRules(filters, page).subscribe(response => {
            const data = response.data;
            this._slotRuleService.setSlotRules(data?.rules ?? []);
            if (data) this.pagination = data.pagination;
        });
    }

    private _openConfirmationDialog(message: string, title: string) {
        return this._dialog.open(ConfirmDialogComponent, {
            data: { title, message },
        });
    }

    onEdit(rule: ISlotRule) {
        this.editEvent.emit(rule);
    }

    onDelete(rule: ISlotRule) {
        this._openConfirmationDialog(
            'Are you sure you want to delete this rule? This action is permanent and cannot be undone.',
            'Confirm Deletion'
        ).afterClosed()
            .subscribe(confirmed => {
                if (!confirmed) return;

                this._slotRuleService.removeRule(rule.id).subscribe(response => {
                    if (response && response.success) {
                        this._slotRuleService.removeOneRule(rule.id);
                        this._toastr.success(`Slot "${rule.name}" ${response.message}`);
                    }
                });
            })
    }

    handleToggle(rule: ISlotRule) {
        this._slotRuleService.toggleStatus(rule.id, rule.isActive).subscribe(response => {
            if (response && response.data) {
                this._slotRuleService.updateRule(response.data);
                this._toastr.success(response.message);
            }
        });
    }

    changePage(page: number) {
        this._loadRuleList(this.filter, page);
    }
}