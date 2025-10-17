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

@Component({
    selector: 'app-area-analytics-page',
    templateUrl: './area-page.component.html',
    imports: [
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

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Area Analytics');
    }
}