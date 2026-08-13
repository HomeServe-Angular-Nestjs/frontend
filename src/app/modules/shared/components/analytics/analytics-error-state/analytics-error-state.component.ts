import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-analytics-error-state',
    standalone: true,
    template: `
        <div class="flex min-h-[24rem] flex-col items-center justify-center text-center px-6">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <i class="fa-solid fa-triangle-exclamation text-xl"></i>
            </div>
            <h2 class="mb-2 text-lg font-semibold text-slate-900">Something went wrong</h2>
            <p class="mb-6 text-sm text-slate-500">Unable to load analytics right now.</p>
            <button type="button" (click)="retry.emit()"
                class="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
                Try Again
            </button>
        </div>
    `,
})
export class AnalyticsErrorStateComponent {
    @Output() retry = new EventEmitter<void>();
}