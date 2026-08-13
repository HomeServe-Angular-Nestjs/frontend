import { Component } from "@angular/core";

@Component({
    selector: 'app-chart-empty-state',
    standalone: true,
    imports: [],
    template: `
        <div role="img" aria-label="No data available"
            class="flex flex-col items-center justify-center h-full min-h-[12rem] text-center px-4 py-8">
            <div class="text-3xl mb-3">📊</div>
            <p class="text-sm font-medium text-slate-500">No data available yet</p>
            <p class="text-xs text-slate-400 mt-1">This chart will populate once data is available.</p>
        </div>
    `,
})
export class ChartEmptyStateComponent { }