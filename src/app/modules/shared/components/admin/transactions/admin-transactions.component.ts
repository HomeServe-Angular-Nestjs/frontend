import { Component, inject, OnInit } from "@angular/core";
import { SharedDataService } from "../../../../../core/services/public/shared-data.service";
import { IAdminOverViewCard, OverviewCardComponent } from "../../../partials/sections/admin/overview-card/admin-overview-card.component";
import { TransactionService } from "../../../../../core/services/public/transaction.service";
import { filter, map } from "rxjs";
import { ITransactionStats, ITransactionTableData } from "../../../../../core/models/transaction.model";
import { CommonModule } from "@angular/common";
import { IPagination } from "../../../../../core/models/booking.model";
import { AdminPaginationComponent } from "../../../partials/sections/admin/pagination/pagination.component";

@Component({
    selector: 'app-admin-transactions',
    templateUrl: './admin-transactions.component.html',
    imports: [CommonModule, OverviewCardComponent, AdminPaginationComponent],
})
export class AdminTransactionsComponent implements OnInit {
    private readonly _sharedService = inject(SharedDataService);
    private readonly _transactionService = inject(TransactionService);

    stats: IAdminOverViewCard[] = [];
    transactions: ITransactionTableData[] = [];
    pagination: IPagination = {
        limit: 1,
        page: 1,
        total: 0
    }

    ngOnInit(): void {
        this._sharedService.setAdminHeader('Revenues & Transactions');
        this._loadOverviewData();
        this._loadTableData();
    }

    private _loadTableData(page = 1) {
        this._transactionService.getTransactionTableData(page).subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.transactions = res.data.tableData;
                    this.pagination = res.data.pagination;
                }
            }
        });
    }

    private _loadOverviewData() {
        this._transactionService.getTransactionStats().subscribe({
            next: (res) => {
                if (res && res.data) {
                    this.stats = this._buildOverviewCards(res.data);
                }
            }
        });
    }

    private _buildOverviewCards(data: ITransactionStats): IAdminOverViewCard[] {
        return [
            {
                icon: 'fas fa-receipt',
                iconBg: 'bg-blue-100 text-blue-700',
                title: 'Total Transactions',
                value: data.totalTransactions,
            },
            {
                icon: 'fas fa-rupee-sign',
                iconBg: 'bg-green-100 text-green-700',
                title: 'Total Revenue',
                value: this.formatINR(data.totalRevenue),
            },
            {
                icon: 'fas fa-percentage',
                iconBg: 'bg-red-100 text-red-600',
                title: 'Success Rate',
                value: `${data.successRate.toFixed(1)}%`,
            },
            {
                icon: 'fas fa-balance-scale',
                iconBg: 'bg-purple-100 text-purple-700',
                title: 'Average Transaction Value',
                value: data.avgTransactionValue.toFixed(2),
            },
        ];
    }

    formatINR(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    }

    pageChange(page: number) {
        this._loadTableData(page);
    }
}