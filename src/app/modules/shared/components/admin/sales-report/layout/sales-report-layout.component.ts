import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { AdminService } from '../../../../../../core/services/admin.service';
import { SharedDataService } from '../../../../../../core/services/public/shared-data.service';
import {
    IAdminOverViewCard, ISalesFilterOptions, ISalesReportBundle, ISalesReportFilter
} from '../../../../../../core/models/sales-report.model';
import { OverviewCardComponent } from '../../../../partials/sections/admin/overview-card/admin-overview-card.component';
import { AdminSalesTrendChartComponent } from '../sales-trend-chart/sales-trend-chart.component';
import { AdminSalesCategoriesChartComponent } from '../sales-categories-chart/sales-categories-chart.component';
import { AdminSalesDistributionChartComponent } from '../sales-distribution-chart/sales-distribution-chart.component';
import { AdminSalesTopServicesTableComponent } from '../sales-top-services-table/sales-top-services-table.component';
import { AdminSalesProviderPerformanceTableComponent } from '../sales-provider-performance-table/sales-provider-performance-table.component';
import { AdminSalesCancellationAnalysisComponent } from '../sales-cancellation-analysis/sales-cancellation-analysis.component';

type RangeOption = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';

@Component({
    selector: 'app-admin-sales-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        OverviewCardComponent,
        AdminSalesTrendChartComponent,
        AdminSalesCategoriesChartComponent,
        AdminSalesDistributionChartComponent,
        AdminSalesTopServicesTableComponent,
        AdminSalesProviderPerformanceTableComponent,
        AdminSalesCancellationAnalysisComponent,
    ],
    templateUrl: './sales-report-layout.component.html',
    styleUrls: ['./sales-report-layout.component.css'],
})
export class AdminSalesReportLayoutComponent {
    private readonly _adminService = inject(AdminService);
    private readonly _sharedDataService = inject(SharedDataService);

    rangeOptions: RangeOption[] = ['today', 'thisWeek', 'thisMonth', 'thisYear', 'custom'];
    rangeLabels: Record<RangeOption, string> = {
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        thisYear: 'This Year',
        custom: 'Custom',
    };

    range = signal<RangeOption>('thisYear');
    fromDate = signal<string>('');
    toDate = signal<string>('');
    professionId = signal<string>('');
    categoryId = signal<string>('');
    providerId = signal<string>('');
    bookingStatus = signal<string>('');

    filters = toSignal(
        toObservable(
            computed(() => this._buildFilter())
        ).pipe(
            switchMap((filter) => this._adminService.getSalesReport(filter))
        ),
        { initialValue: null }
    );

    report = computed<ISalesReportBundle | null>(() => this.filters()?.data ?? null);
    isLoading = computed(() => this.filters() === null);
    filterOptions = computed<ISalesFilterOptions>(() => this.report()?.filters ?? { professions: [], categories: [], providers: [] });

    summaryCards = computed<IAdminOverViewCard[]>(() => {
        const summary = this.report()?.summary;
        if (!summary) return [];
        return [
            { title: 'Total Sales', value: this._formatINR(summary.totalSales), icon: 'fa-solid fa-sack-dollar', iconBg: 'bg-emerald-50 text-emerald-600' },
            { title: 'Completed Sales', value: summary.completedSales.toLocaleString(), icon: 'fa-solid fa-circle-check', iconBg: 'bg-blue-50 text-blue-600' },
            { title: 'Cancelled Sales', value: summary.cancelledSales.toLocaleString(), icon: 'fa-solid fa-circle-xmark', iconBg: 'bg-rose-50 text-rose-600' },
            { title: 'Avg Order Value', value: this._formatINR(summary.avgOrderValue), icon: 'fa-solid fa-cart-flatbed', iconBg: 'bg-violet-50 text-violet-600' },
            { title: 'Avg Daily Sales', value: this._formatINR(summary.avgDailySales), icon: 'fa-solid fa-calendar-day', iconBg: 'bg-amber-50 text-amber-600' },
            {
                title: 'Sales Growth',
                value: `${summary.salesGrowthPct}%`,
                icon: summary.salesGrowthPct >= 0 ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down',
                iconBg: summary.salesGrowthPct >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600',
            },
        ];
    });

    bookingsStrip = computed(() => {
        const b = this.report()?.bookingsSold;
        if (!b) return [];
        return [
            { label: 'Today', value: b.today },
            { label: 'This Week', value: b.week },
            { label: 'This Month', value: b.month },
            { label: 'This Year', value: b.year },
        ];
    });

    trend = computed(() => this.report()?.trend ?? []);
    professions = computed(() => this.report()?.professions ?? []);
    categories = computed(() => this.report()?.categories ?? []);
    distribution = computed(() => this.report()?.distribution ?? []);
    services = computed(() => this.report()?.services ?? []);
    providers = computed(() => this.report()?.providers ?? []);
    cancellation = computed(() => this.report()?.cancellation);

    ngOnInit(): void {
        this._sharedDataService.setAdminHeader('Sales Report');
    }

    onRangeChange(value: RangeOption): void {
        this.range.set(value);
        if (value === 'custom') return;
        const [from, to] = this._computeRange(value);
        this.fromDate.set(from);
        this.toDate.set(to);
    }

    resetFilters(): void {
        this.range.set('thisYear');
        this.fromDate.set('');
        this.toDate.set('');
        this.professionId.set('');
        this.categoryId.set('');
        this.providerId.set('');
        this.bookingStatus.set('');
    }

    exportPdf(): void {
        this._adminService.downloadSalesReportPdf(this._buildFilter()).subscribe({
            next: (blob) => this._triggerDownload(blob, 'sales-report.pdf'),
        });
    }

    exportExcel(): void {
        this._adminService.downloadSalesReportExcel(this._buildFilter()).subscribe({
            next: (blob) => this._triggerDownload(blob, 'sales-report.xlsx'),
        });
    }

    formatINR(value: number): string {
        return this._formatINR(value);
    }

    private _buildFilter(): ISalesReportFilter {
        const filter: ISalesReportFilter = {};
        if (this.fromDate()) filter.fromDate = this.fromDate();
        if (this.toDate()) filter.toDate = this.toDate();
        if (this.professionId()) filter.professionId = this.professionId();
        if (this.categoryId()) filter.categoryId = this.categoryId();
        if (this.providerId()) filter.providerId = this.providerId();
        if (this.bookingStatus()) filter.bookingStatus = this.bookingStatus();
        return filter;
    }

    private _computeRange(value: Exclude<RangeOption, 'custom'>): [string, string] {
        const now = new Date();
        let from = new Date();
        switch (value) {
            case 'today':
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'thisWeek': {
                const day = now.getDay();
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
                break;
            }
            case 'thisMonth':
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'thisYear':
                from = new Date(now.getFullYear(), 0, 1);
                break;
        }
        const to = new Date(now);
        to.setHours(23, 59, 59, 999);
        return [this._toIso(from), this._toIso(to)];
    }

    private _toIso(date: Date): string {
        return date.toISOString();
    }

    private _formatINR(value: number): string {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    }

    private _triggerDownload(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
