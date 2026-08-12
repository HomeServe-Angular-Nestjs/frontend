import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ServiceDemandHeatmapComponent } from "../../../../shared/components/provider/area-analytics/service-demand-chart.component";
import * as echarts from 'echarts/core';
import { GeoComponent, GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { BarChart, HeatmapChart, LineChart, PieChart, ScatterChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { provideEchartsCore } from "ngx-echarts";
import { RevenueByLocationComponent } from "../../../../shared/components/provider/area-analytics/revenue-by-location.component";
import { TopAreasRevenueComponent } from "../../../../shared/components/provider/area-analytics/top-revenue-by-area.component";
import { UnderperformingAreasComponent } from "../../../../shared/components/provider/area-analytics/uderperforming-service.component";
import { PeakServiceTimesComponent } from "../../../../shared/components/provider/area-analytics/peak-service-time-chart.component";
import { AreaKpiComponent } from "../../../../shared/components/provider/area-analytics/summary.component";
import { SharedDataService } from "../../../../../core/services/public/shared-data.service";
import { AnalyticService } from "../../../../../core/services/analytics.service";
import { IAreaAnalyticsBundle } from "../../../../../core/models/analytics.model";
import { catchError, map, of, shareReplay, startWith } from "rxjs";

echarts.use([
    TooltipComponent,
    TitleComponent,
    GridComponent,
    LegendComponent,
    ToolboxComponent,
    VisualMapComponent,
    BarChart,
    LineChart,
    PieChart,
    HeatmapChart,
    CanvasRenderer,
    ScatterChart,
    GeoComponent
]);

const EMPTY_AREA: IAreaAnalyticsBundle = {
    summary: { areaSummary: { totalBookings: 0, topPerformingArea: 'N/A', underperformingArea: 'N/A', peakBookingHour: 'N/A' } },
    demand: { serviceDemand: [], byLocation: [] },
    revenue: { topAreas: [], underperforming: [] },
    peak: { peakServiceTime: [] },
};

type AreaVM = { status: 'loading' | 'error' | 'success'; data: IAreaAnalyticsBundle };

@Component({
    selector: 'app-area-analytics-page',
    templateUrl: './area-page.component.html',
    imports: [
        CommonModule,
        ServiceDemandHeatmapComponent,
        RevenueByLocationComponent,
        TopAreasRevenueComponent,
        UnderperformingAreasComponent,
        PeakServiceTimesComponent,
        AreaKpiComponent
    ],
    providers: [provideEchartsCore({ echarts })]
})
export class ProviderAreaAnalyticsComponent implements OnInit {
    private readonly _sharedService = inject(SharedDataService);
    private readonly _analyticService = inject(AnalyticService);

    vm$ = this._load();

    private _load() {
        return this._analyticService.getAreaBundle().pipe(
            map(res => ({ status: 'success' as const, data: res?.data ?? EMPTY_AREA })),
            catchError(() => of({ status: 'error' as const, data: EMPTY_AREA })),
            startWith({ status: 'loading' as const, data: EMPTY_AREA }),
            shareReplay(1)
        );
    }

    retry(): void {
        this.vm$ = this._load();
    }

    hasData(vm: AreaVM): boolean {
        return vm.data.summary.areaSummary.totalBookings > 0
            || vm.data.demand.serviceDemand.length > 0
            || vm.data.demand.byLocation.length > 0
            || vm.data.revenue.topAreas.length > 0
            || vm.data.revenue.underperforming.length > 0
            || vm.data.peak.peakServiceTime.length > 0;
    }

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Area Analytics');
    }
}
