import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-analytics-empty-state',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div role="status" class="flex h-full min-h-[12rem] flex-col items-center justify-center text-center px-4 py-8">
            <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <i class="{{ icon }} text-xl"></i>
            </div>
            <p class="text-sm font-semibold text-slate-700">{{ title }}</p>
            <p class="mt-1 max-w-xs text-xs text-slate-400">{{ message }}</p>
        </div>
    `,
})
export class AnalyticsEmptyStateComponent {
    @Input() icon = 'fa-solid fa-chart-column';
    @Input() title = 'No data yet';
    @Input() message = 'Analytics will appear here once data is available.';
}