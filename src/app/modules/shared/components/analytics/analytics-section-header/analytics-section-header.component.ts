import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-analytics-section-header',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
                <p *ngIf="eyebrow" class="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    {{ eyebrow }}
                </p>
                <h2 class="text-xl font-semibold text-slate-900">{{ title }}</h2>
                <p *ngIf="subtitle" class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
            </div>
            <div class="shrink-0">
                <ng-content></ng-content>
            </div>
        </div>
    `,
})
export class AnalyticsSectionHeaderComponent {
    @Input() eyebrow?: string;
    @Input() title = '';
    @Input() subtitle?: string;
}