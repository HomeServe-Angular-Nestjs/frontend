import { Component } from '@angular/core';

@Component({
    selector: 'app-analytics-chart-toolbar',
    standalone: true,
    template: `
        <div class="flex items-center gap-2">
            <ng-content></ng-content>
        </div>
    `,
})
export class AnalyticsChartToolbarComponent { }