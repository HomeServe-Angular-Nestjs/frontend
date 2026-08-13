import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SegmentedOption<T> {
    value: T;
    label: string;
}

@Component({
    selector: 'app-analytics-segmented-control',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="inline-flex rounded-lg bg-slate-100 p-1">
            <button
                *ngFor="let option of options"
                type="button"
                (click)="select(option.value)"
                class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
                [class.bg-white]="value === option.value"
                [class.text-emerald-700]="value === option.value"
                [class.shadow-sm]="value === option.value"
                [class.text-slate-500]="value !== option.value">
                {{ option.label }}
            </button>
        </div>
    `,
})
export class AnalyticsSegmentedControlComponent<T = unknown> {
    @Input() options: SegmentedOption<T>[] = [];
    @Input() value: T | null = null;
    @Output() change = new EventEmitter<T>();

    select(v: T): void {
        if (v !== this.value) {
            this.change.emit(v);
        }
    }
}