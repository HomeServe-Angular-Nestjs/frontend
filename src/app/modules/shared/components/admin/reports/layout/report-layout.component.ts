import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AdminReportFilterComponent } from "../filters/report-filter.component";
import { IFilterConfig, ReportCategoryType } from "../../../../../../core/models/admin-report.model";
import { AdminService } from "../../../../../../core/services/admin.service";
import { SharedDataService } from "../../../../../../core/services/public/shared-data.service";

@Component({
    selector: 'app-admin-reports',
    templateUrl: './report-layout.component.html',
    imports: [CommonModule, FormsModule, AdminReportFilterComponent]
})
export class AdminReportsComponent implements OnInit {
    private readonly _adminService = inject(AdminService);
    private readonly _sharedService = inject(SharedDataService);

    isModalOpen = false;

    categories: ReportCategoryType[] = ['booking', 'users', 'transactions',];
    selectedCategory: ReportCategoryType = 'booking';
    selectedFilters!: any;

    bookingFilters: IFilterConfig[] = [
        {
            type: 'select',
            name: 'dateFilterType',
            label: 'Date Filter',
            placeholder: 'Select',
            options: ['Custom Date Range']
        },
        {
            type: 'date',
            name: 'fromDate',
            label: 'From Date',
            dependsOn: { name: 'dateFilterType', value: 'Custom Date Range' }
        },
        {
            type: 'date',
            name: 'toDate',
            label: 'To Date',
            dependsOn: { name: 'dateFilterType', value: 'Custom Date Range' }
        },
        {
            type: 'select',
            name: 'status',
            label: 'Status',
            placeholder: 'Select',
            options: ['pending', 'completed', 'cancelled']
        },
        {
            type: 'text',
            name: 'userId',
            label: 'User ID',
            desc: '(Optional)',
            placeholder: 'Enter User ID'
        }
    ];

    userFilters: IFilterConfig[] = [
        {
            type: 'select',
            name: 'role',
            label: 'Role',
            options: ['customer', 'provider'],
        },
        {
            type: 'select',
            name: 'status',
            label: 'Status',
            options: ['active', 'blocked'],
        },
        {
            type: 'select',
            name: 'dateFilterType',
            label: 'Date Filter',
            options: ['Custom Date Range']
        },
        {
            type: 'date',
            name: 'fromDate',
            label: 'From Date',
            dependsOn: { name: 'dateFilterType', value: 'Custom Date Range' }
        },
        {
            type: 'date',
            name: 'toDate',
            label: 'To Date',
            dependsOn: { name: 'dateFilterType', value: 'Custom Date Range' }
        },
    ];

    transactionFilter: IFilterConfig[] = [
        {
            type: 'select',
            name: 'method',
            label: 'Method',
            options: ['debit', 'credit'],
        },
        {
            type: 'select',
            name: 'transactionType',
            label: 'Transaction Type',
            options: ['Booking', 'Subscription'],
        },
        {
            type: 'select',
            name: 'dateFilterType',
            label: 'Date Filter',
            options: ['Custom Date Range']
        },
        {
            type: 'date',
            name: 'fromDate',
            label: 'From Date',
            dependsOn: { name: 'dateFilterType', value: 'Custom Date Range' }
        },
        {
            type: 'date',
            name: 'toDate',
            label: 'To Date',
            dependsOn: { name: 'dateFilterType', value: 'Custom Date Range' }
        },
    ];

    filtersConfig: Record<string, IFilterConfig[]> = {
        booking: this.bookingFilters,
        users: this.userFilters,
        transactions: this.transactionFilter,
    };

    ngOnInit(): void {
        this._sharedService.setAdminHeader('Report Management');
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    selectCategory(cat: ReportCategoryType) {
        this.selectedCategory = cat;
        this.selectedFilters = {}; // reset filters
    }

    onFilterChange(updated: any) {
        this.selectedFilters = updated;
    }

    generateReport() {
        this.closeModal();

        const downloadBookingData: any = {};
        downloadBookingData['category'] = this.selectedCategory;

        for (const key in this.selectedFilters) {
            if (this.selectedFilters[key] && key !== 'dateFilterType') {
                downloadBookingData[key] = this.selectedFilters[key];
            }
        }

        switch (this.selectedCategory) {
            case 'booking':
                this._adminService.downloadBookingReport(downloadBookingData).subscribe({
                    next: (blob: Blob) => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'booking-report.pdf';
                        a.click();
                        URL.revokeObjectURL(url);
                    },
                });
                this.selectedFilters = {};
                break;
            case 'users':
                this._adminService.downloadUserReport(downloadBookingData).subscribe({
                    next: (blob: Blob) => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'user-report.pdf';
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                });
                this.selectedFilters = {};
                break;
            case 'transactions':
                this._adminService.downloadTransactionReport(downloadBookingData).subscribe({
                    next: (blob: Blob) => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'transaction-report.pdf';
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                });
                this.selectedFilters = {};
                break;
            default:
                throw new Error('Error: Invalid category select');
        }
    }
}
