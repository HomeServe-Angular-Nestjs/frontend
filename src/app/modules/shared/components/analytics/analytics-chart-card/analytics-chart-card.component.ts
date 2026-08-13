import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { AnalyticsEmptyStateComponent } from "../analytics-empty-state/analytics-empty-state.component";
import { AnalyticsChartHeight, CHART_HEIGHT_CLASS, CARD_CLASS } from "../analytics.tokens";

@Component({
    selector: 'app-analytics-chart-card',
    standalone: true,
    imports: [CommonModule, AnalyticsEmptyStateComponent],
    template: `
        <div class="{{ CARD_CLASS }} p-6">
            <div class="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
                    <p *ngIf="subtitle" class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
                </div>
                <ng-content select="[app-analytics-toolbar]"></ng-content>
            </div>

            <ng-container *ngIf="!isLoading && hasData">
                <div class="w-full" [ngClass]="heightClass">
                    <ng-content></ng-content>
                </div>
            </ng-container>

            <div *ngIf="isLoading" aria-busy="true"
                class="w-full animate-pulse rounded-xl bg-emerald-50"
                [ngClass]="heightClass"></div>

            <div *ngIf="!isLoading && !hasData" class="w-full" [ngClass]="heightClass">
                <app-analytics-empty-state [icon]="emptyIcon" [title]="emptyTitle" [message]="emptyMessage"></app-analytics-empty-state>
            </div>
        </div>
    `,
})
export class AnalyticsChartCardComponent {
    CARD_CLASS = CARD_CLASS;

    @Input() title = '';
    @Input() subtitle = '';
    @Input() height: AnalyticsChartHeight = 'standard';
    @Input() isLoading = false;
    @Input() hasData = false;

    @Input() emptyIcon = 'fa-solid fa-chart-column';
    @Input() emptyTitle = 'No data yet';
    @Input() emptyMessage = 'Analytics will appear here once data is available.';

    get heightClass(): string {
        return CHART_HEIGHT_CLASS[this.height];
    }
}