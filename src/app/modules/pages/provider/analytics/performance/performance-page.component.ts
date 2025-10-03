import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ProviderPerformanceSummaryComponent } from "../../../../shared/components/provider/performance-analytics/summary/performance-summary.component";
import { SharedDataService } from "../../../../../core/services/public/shared-data.service";
import { AnalyticService } from "../../../../../core/services/analytics.service";

@Component({
    selector: 'app-performance-page',
    templateUrl: './performance-page.component.html',
    imports: [CommonModule, ProviderPerformanceSummaryComponent],
    providers: [AnalyticService]
})
export class ProviderPerformanceLayoutComponent implements OnInit {
    private readonly _sharedService = inject(SharedDataService);
    private readonly _analyticsService = inject(AnalyticService)

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Performance Analytics');
        this._analyticsService.getPerformanceSummary().subscribe();
    }
}