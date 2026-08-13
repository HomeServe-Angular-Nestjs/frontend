import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IOverviewCard, IProviderRevenueOverview } from "../../../../../core/models/analytics.model";
import { InrCurrencyPipe } from "../../../../../core/pipes/inr-currency.pipe";
import { KpiCardComponent, KpiTone } from "../../analytics/kpi-card/kpi-card.component";
import { KpiCardGridComponent } from "../../analytics/kpi-card-grid/kpi-card-grid.component";

@Component({
    selector: 'app-revenue-overview',
    imports: [CommonModule, KpiCardComponent, KpiCardGridComponent],
    providers: [InrCurrencyPipe],
    template: `
        <app-kpi-card-grid>
            <app-kpi-card
                *ngFor="let card of overviewCards"
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
export class RevenueOverviewComponent {
    private readonly _currency = inject(InrCurrencyPipe);

    @Input() revenueStats: IProviderRevenueOverview = {
        totalRevenue: 0,
        revenueGrowth: 0,
        completedTransactions: 0,
        avgTransactionValue: 0,
    };

    overviewCards: (IOverviewCard<IProviderRevenueOverview> & { tone: KpiTone })[] = [
        {
            label: "Total Revenue",
            valueKey: "totalRevenue",
            icon: "fa-solid fa-money-bill-wave",
            iconColor: "from-emerald-400 to-emerald-600",
            badge: "Monthly",
            badgeColor: "bg-emerald-100 text-emerald-700",
            description: "Total revenue earned this month",
            tone: 'info',
        },
        {
            label: "Revenue Growth",
            valueKey: "revenueGrowth",
            icon: "fa-solid fa-chart-line",
            iconColor: "from-green-400 to-lime-600",
            badge: "YoY",
            badgeColor: "bg-green-100 text-green-700",
            description: "Revenue increase compared to last month",
            tone: 'positive',
        },
        {
            label: "Completed Transactions",
            valueKey: "completedTransactions",
            icon: "fa-solid fa-check-circle",
            iconColor: "from-lime-400 to-emerald-600",
            badge: "Stable",
            badgeColor: "bg-lime-100 text-lime-700",
            description: "Number of successfully completed transactions",
            tone: 'info',
        },
        {
            label: "Avg Transaction Value",
            valueKey: "avgTransactionValue",
            icon: "fa-solid fa-coins",
            iconColor: "from-teal-400 to-emerald-600",
            badge: "High",
            badgeColor: "bg-teal-100 text-teal-700",
            description: "Average value per transaction",
            tone: 'info',
        },
    ];

    getCardValue(card: IOverviewCard<IProviderRevenueOverview>): string {
        const value = this.revenueStats[card.valueKey];
        if (card.valueKey === 'totalRevenue' || card.valueKey === 'avgTransactionValue') {
            return this._currency.transform(value);
        }
        return String(value);
    }
}