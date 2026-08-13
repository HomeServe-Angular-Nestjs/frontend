import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type InsightTone = 'info' | 'positive' | 'negative';

const TONE_CLASS: Record<InsightTone, { box: string; icon: string; text: string }> = {
    info: {
        box: 'bg-emerald-50/60 ring-emerald-100',
        icon: 'bg-emerald-100 text-emerald-600',
        text: 'text-emerald-900',
    },
    positive: {
        box: 'bg-emerald-50/60 ring-emerald-100',
        icon: 'bg-emerald-100 text-emerald-600',
        text: 'text-emerald-900',
    },
    negative: {
        box: 'bg-red-50/60 ring-red-100',
        icon: 'bg-red-100 text-red-600',
        text: 'text-red-900',
    },
};

@Component({
    selector: 'app-analytics-insight-card',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="flex items-start gap-3 rounded-2xl p-4 ring-1"
            [ngClass]="classes.box" role="status">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                [ngClass]="classes.icon">
                <i class="{{ icon }} text-sm"></i>
            </div>
            <p class="text-sm leading-snug" [ngClass]="classes.text">{{ text }}</p>
        </div>
    `,
})
export class AnalyticsInsightCardComponent {
    @Input() text = '';
    @Input() icon = 'fa-solid fa-lightbulb';
    @Input() tone: InsightTone = 'info';

    get classes() {
        return TONE_CLASS[this.tone];
    }
}