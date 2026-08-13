import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type KpiTone = 'positive' | 'negative' | 'neutral' | 'warning' | 'info';

const TONE_BADGE_CLASS: Record<KpiTone, string> = {
    positive: 'bg-emerald-100 text-emerald-700',
    negative: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    neutral: 'bg-slate-100 text-slate-600',
    info: 'bg-emerald-100 text-emerald-700',
};

const TONE_ICON_CLASS: Record<KpiTone, string> = {
    positive: 'from-emerald-400 to-emerald-600',
    negative: 'from-red-400 to-red-600',
    warning: 'from-amber-400 to-amber-600',
    neutral: 'from-slate-400 to-slate-600',
    info: 'from-emerald-400 to-emerald-600',
};

@Component({
    selector: 'app-kpi-card',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="group bg-white rounded-2xl p-6 ring-1 ring-slate-100 shadow-sm transition-shadow duration-300 hover:shadow-md">
            <div class="mb-4 flex items-start justify-between">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
                    [ngClass]="iconColor || TONE_ICON_CLASS[tone]">
                    <i class="{{ icon }} text-white text-base"></i>
                </div>
                <span *ngIf="badge" class="px-2.5 py-1 rounded-full text-xs font-semibold"
                    [ngClass]="badgeClass || TONE_BADGE_CLASS[tone]">
                    {{ badge }}
                </span>
            </div>

            <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">{{ label }}</h3>

            <div class="mb-3 flex items-baseline gap-2">
                <span class="text-3xl font-bold text-slate-900">{{ value }}</span>
                <span *ngIf="unit" class="text-xl font-semibold text-emerald-700">{{ unit }}</span>
            </div>

            <p *ngIf="description" class="flex items-center gap-1 text-xs text-slate-500">
                <svg class="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                {{ description }}
            </p>
        </div>
    `,
})
export class KpiCardComponent {
    TONE_BADGE_CLASS = TONE_BADGE_CLASS;
    TONE_ICON_CLASS = TONE_ICON_CLASS;

    @Input() label = '';
    @Input() value: string | number = '';
    @Input() unit?: string;
    @Input() icon = 'fa-solid fa-chart-simple';
    @Input() iconColor?: string;
    @Input() badge?: string;
    @Input() badgeClass?: string;
    @Input() description?: string;
    @Input() tone: KpiTone = 'info';
}