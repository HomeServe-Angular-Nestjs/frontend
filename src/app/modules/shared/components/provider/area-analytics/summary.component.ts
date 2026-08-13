import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IAreaSummary, IOverviewCard } from '../../../../../core/models/analytics.model';
import { KpiCardComponent, KpiTone } from '../../analytics/kpi-card/kpi-card.component';
import { KpiCardGridComponent } from '../../analytics/kpi-card-grid/kpi-card-grid.component';

@Component({
    selector: 'app-area-analytics-summary',
    standalone: true,
    imports: [CommonModule, KpiCardComponent, KpiCardGridComponent],
    template: `
        <app-kpi-card-grid>
            <app-kpi-card
                *ngFor="let card of areaKpis"
                [label]="card.label"
                [value]="getCardValue(card)"
                [icon]="card.icon"
                [iconColor]="card.iconColor"
                [badge]="card.badge"
                [badgeClass]="card.badgeColor"
                [description]="card.description"
                [tone]="card.tone">
            </app-kpi-card>
        </app-kpi-card-grid>
    `,
})
export class AreaKpiComponent {
    @Input() areaSummary: IAreaSummary = {
        totalBookings: 0,
        topPerformingArea: 'N/A',
        underperformingArea: 'N/A',
        peakBookingHour: 'N/A'
    };

    areaKpis: (IOverviewCard<IAreaSummary> & { tone: KpiTone })[] = [
        {
            label: 'Total Bookings',
            valueKey: 'totalBookings',
            icon: 'fa-solid fa-calendar-check',
            iconColor: 'from-emerald-400 to-emerald-600',
            badge: 'Completed',
            badgeColor: 'bg-emerald-100 text-emerald-700',
            description: 'Total number of completed bookings this month',
            tone: 'info',
        },
        {
            label: 'Top Performing Area',
            valueKey: 'topPerformingArea',
            icon: 'fa-solid fa-trophy',
            iconColor: 'from-yellow-400 to-yellow-600',
            description: 'Area generating highest revenue this month',
            tone: 'positive',
        },
        {
            label: 'Underperforming Area',
            valueKey: 'underperformingArea',
            icon: 'fa-solid fa-arrow-trend-down',
            iconColor: 'from-red-400 to-red-600',
            badge: 'Decline',
            badgeColor: 'bg-red-100 text-red-700',
            description: 'Area with decreased revenue compared to last month',
            tone: 'negative',
        },
        {
            label: 'Peak Booking Time',
            valueKey: 'peakBookingHour',
            icon: 'fa-solid fa-clock',
            iconColor: 'from-indigo-400 to-indigo-600',
            description: 'Time of day with the highest number of bookings',
            tone: 'info',
        }
    ];

    getCardValue(card: IOverviewCard<IAreaSummary>): number | string {
        return this.areaSummary[card.valueKey];
    }
}