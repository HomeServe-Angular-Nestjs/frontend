import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsSkeletonComponent } from "../../../partials/sections/provider/analytics-skeleton/analytics-skeleton.component";
import { AnalyticsEmptyStateComponent } from '../analytics-empty-state/analytics-empty-state.component';
import { AnalyticsErrorStateComponent } from '../analytics-error-state/analytics-error-state.component';

@Component({
    selector: 'app-analytics-page',
    standalone: true,
    imports: [CommonModule, AnalyticsSkeletonComponent, AnalyticsEmptyStateComponent, AnalyticsErrorStateComponent],
    template: `
        <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
            <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">

                <!-- Loading -->
                <app-analytics-skeleton *ngIf="status === 'loading'"
                    [cards]="skeletonCards"
                    [chartsColumnA]="skeletonColumnA"
                    [chartsFull]="skeletonFull"></app-analytics-skeleton>

                <!-- Error -->
                <app-analytics-error-state *ngIf="status === 'error'" (retry)="retry.emit()"></app-analytics-error-state>

                <!-- Success -->
                <ng-container *ngIf="status === 'success'">
                    <app-analytics-empty-state *ngIf="isEmpty"
                        [icon]="emptyIcon"
                        [title]="emptyTitle"
                        [message]="emptyMessage"></app-analytics-empty-state>

                    <ng-container *ngIf="!isEmpty">
                        <ng-content></ng-content>
                    </ng-container>
                </ng-container>

            </main>
        </div>
    `,
})
export class AnalyticsPageComponent {
    @Input() status: 'loading' | 'error' | 'success' = 'loading';
    @Input() isEmpty = false;

    @Input() emptyIcon = 'fa-solid fa-chart-column';
    @Input() emptyTitle = 'No data yet';
    @Input() emptyMessage = 'Analytics will appear here once data is available.';

    @Input() skeletonCards: unknown[] = [0, 1, 2, 3];
    @Input() skeletonColumnA: unknown[] = [0, 1];
    @Input() skeletonFull: unknown[] = [0];

    @Output() retry = new EventEmitter<void>();
}