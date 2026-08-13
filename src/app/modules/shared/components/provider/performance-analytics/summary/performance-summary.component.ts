import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TimeFormatterPipe } from "../../../../../../core/pipes/time-formatter.pipe";
import { MetricPerformanceBadgePipe } from "../../../../../../core/pipes/performance-label.pipe";
import { IOverviewCard, IProviderPerformanceOverview } from "../../../../../../core/models/analytics.model";
import { KpiCardComponent, KpiTone } from "../../../analytics/kpi-card/kpi-card.component";
import { KpiCardGridComponent } from "../../../analytics/kpi-card-grid/kpi-card-grid.component";

type PerformanceKey = keyof IProviderPerformanceOverview;

@Component({
    selector: 'app-performance-summary',
    imports: [CommonModule, KpiCardComponent, KpiCardGridComponent],
    providers: [TimeFormatterPipe, MetricPerformanceBadgePipe],
    template: `
        <app-kpi-card-grid>
            <app-kpi-card
                *ngFor="let card of overviewCards"
                [label]="card.label"
                [value]="getCardValue(card)"
                [unit]="getCardUnit(card)"
                [icon]="card.icon"
                [iconColor]="card.iconColor"
                [badge]="getBadge(card).label"
                [badgeClass]="getBadge(card).classes"
                [description]="card.description"
                [tone]="card.tone">
            </app-kpi-card>
        </app-kpi-card-grid>
    `,
})
export class ProviderPerformanceSummaryComponent {
    private readonly _timeFormatter = inject(TimeFormatterPipe);
    private readonly _badge = inject(MetricPerformanceBadgePipe);

    @Input() performanceOverviewStats: IProviderPerformanceOverview = {
        avgRating: 0,
        avgResponseTime: 0,
        completionRate: 0,
        onTimePercent: 0
    };

    overviewCards: (IOverviewCard<IProviderPerformanceOverview> & { tone: KpiTone })[] = [
        {
            label: 'Completion Rate',
            valueKey: 'completionRate',
            icon: 'fa-solid fa-circle-check',
            iconColor: 'from-green-400 to-emerald-600',
            description: 'Completed jobs ÷ Total bookings',
            tone: 'positive',
        },
        {
            label: 'Average Rating',
            valueKey: 'avgRating',
            icon: 'fa-solid fa-star',
            iconColor: 'from-green-300 to-green-500',
            description: 'Based on customer feedback',
            tone: 'positive',
        },
        {
            label: 'Response Time',
            valueKey: 'avgResponseTime',
            icon: 'fa-solid fa-clock',
            iconColor: 'from-green-200 to-green-400',
            description: 'Average time to reply',
            tone: 'info',
        },
        {
            label: 'On-Time Arrival',
            valueKey: 'onTimePercent',
            icon: 'fa-solid fa-location-dot',
            iconColor: 'from-green-400 to-green-600',
            description: 'Punctuality performance',
            tone: 'positive',
        }
    ];

    private get stats() {
        return this.performanceOverviewStats;
    }

    getCardValue(card: IOverviewCard<IProviderPerformanceOverview>): string {
        const v = this.stats[card.valueKey];
        if (card.valueKey === 'avgResponseTime') {
            return String(this._timeFormatter.transform(v, 'value'));
        }
        return String(v);
    }

    getCardUnit(card: IOverviewCard<IProviderPerformanceOverview>): string {
        if (card.valueKey === 'avgResponseTime') {
            return this._timeFormatter.transform(this.stats.avgResponseTime, 'unit') as string;
        }
        if (card.valueKey === 'avgRating') return '★';
        if (card.valueKey === 'completionRate') return '%';
        if (card.valueKey === 'onTimePercent') return '%';
        return '';
    }

    getBadge(card: IOverviewCard<IProviderPerformanceOverview>) {
        return this._badge.transform(this.stats[card.valueKey], card.valueKey as PerformanceKey);
    }
}