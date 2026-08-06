import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IProviderPerformance } from '../../../../../../core/models/sales-report.model';
import { AdminChartCardComponent } from '../../../../partials/sections/admin/chart-card/admin-chart-card.component';
import { AdminSimpleTableComponent, TableColumn } from '../../../../partials/sections/admin/table/reusable-table.component';

@Component({
    selector: 'app-admin-sales-provider-performance-table',
    standalone: true,
    imports: [CommonModule, AdminChartCardComponent, AdminSimpleTableComponent],
    templateUrl: './sales-provider-performance-table.component.html',
})
export class AdminSalesProviderPerformanceTableComponent {
    @Input() providers: IProviderPerformance[] = [];
    @Input() loading = false;

    columns: TableColumn[] = [
        { label: 'Provider', key: 'providerName', type: 'text' },
        { label: 'Completed', key: 'completedJobs', type: 'text' },
        { label: 'Cancelled', key: 'cancelled', type: 'text' },
        { label: 'Revenue', key: 'revenue', type: 'template' },
        { label: 'Completion', key: 'completionRate', type: 'template' },
        { label: 'Rating', key: 'avgRating', type: 'text' },
    ];

    formatINR(value: number): string {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    }
}