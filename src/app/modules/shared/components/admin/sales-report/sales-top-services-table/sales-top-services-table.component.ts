import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ITopSellingService } from '../../../../../../core/models/sales-report.model';
import { AdminChartCardComponent } from '../../../../partials/sections/admin/chart-card/admin-chart-card.component';
import { AdminSimpleTableComponent, TableColumn } from '../../../../partials/sections/admin/table/reusable-table.component';

@Component({
    selector: 'app-admin-sales-top-services-table',
    standalone: true,
    imports: [CommonModule, AdminChartCardComponent, AdminSimpleTableComponent],
    templateUrl: './sales-top-services-table.component.html',
    styleUrls: ['./sales-top-services-table.component.css'],
})
export class AdminSalesTopServicesTableComponent {
    @Input() services: ITopSellingService[] = [];
    @Input() loading = false;

    columns: TableColumn[] = [
        { label: 'Service', key: 'serviceName', type: 'template' },
        { label: 'Profession', key: 'profession', type: 'text' },
        { label: 'Provider', key: 'providerName', type: 'text' },
        { label: 'Bookings', key: 'bookings', type: 'text' },
        { label: 'Revenue', key: 'revenue', type: 'template' },
        { label: 'Rating', key: 'avgRating', type: 'text' },
    ];

    formatINR(value: number): string {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    }
}