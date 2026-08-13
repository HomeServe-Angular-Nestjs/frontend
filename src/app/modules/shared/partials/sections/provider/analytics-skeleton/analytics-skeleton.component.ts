import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
    selector: 'app-analytics-skeleton',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="animate-pulse" aria-busy="true" aria-label="Loading analytics">
            <!-- KPI cards -->
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 mb-12">
                <div *ngFor="let _ of cards"
                    class="bg-white rounded-2xl p-6 ring-1 ring-slate-100">
                    <div class="h-11 w-11 bg-emerald-100 rounded-xl mb-4"></div>
                    <div class="h-4 w-24 bg-slate-200 rounded mb-3"></div>
                    <div class="h-8 w-28 bg-emerald-100 rounded mb-3"></div>
                    <div class="h-3 w-32 bg-slate-100 rounded"></div>
                </div>
            </div>

            <!-- Chart cards -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-12">
                <div *ngFor="let _ of chartsColumnA"
                    class="bg-white rounded-2xl p-6 ring-1 ring-slate-100">
                    <div class="h-5 w-40 bg-slate-200 rounded mb-2"></div>
                    <div class="h-3 w-52 bg-slate-100 rounded mb-6"></div>
                    <div class="h-[400px] bg-emerald-50 rounded-xl"></div>
                </div>
            </div>

            <div *ngFor="let _ of chartsFull"
                class="bg-white rounded-2xl p-6 ring-1 ring-slate-100 mb-12">
                <div class="h-5 w-44 bg-slate-200 rounded mb-6"></div>
                <div class="h-[400px] bg-emerald-50 rounded-xl"></div>
            </div>
        </div>
    `,
})
export class AnalyticsSkeletonComponent {
    @Input() cards: unknown[] = [0, 1, 2, 3];
    @Input() chartsColumnA: unknown[] = [0, 1];
    @Input() chartsFull: unknown[] = [0];
}