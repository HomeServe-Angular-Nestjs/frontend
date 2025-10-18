import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { RevenueOverviewComponent } from "../../../../shared/components/provider/revenue-analytics/overview.component";
import { RevenueTrendChartComponent } from "../../../../shared/components/provider/revenue-analytics/trends-chart.component";
import * as echarts from 'echarts/core';
import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { BarChart, HeatmapChart, LineChart, PieChart } from "echarts/charts";
import { provideEchartsCore } from "ngx-echarts";
import { CanvasRenderer } from "echarts/renderers";
import { RevenueCompositionChartsComponent } from "../../../../shared/components/provider/revenue-analytics/composition.component";
import { RevenueTopServicesChartComponent } from "../../../../shared/components/provider/revenue-analytics/top-services-chart.component";
import { RevenueRepeatVsNewCustomersChartComponent } from "../../../../shared/components/provider/revenue-analytics/repeat-vs-new-customers-chart.component";
import { RevenueEarningsForecastChartComponent } from "../../../../shared/components/provider/revenue-analytics/monthly-growth-rate-chart.component";
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
    CanvasRenderer
]);

@Component({
    selector: 'app-revenue-analytics-page',
    templateUrl: './revenue-page.component.html',
    imports: [
        CommonModule,
        RevenueOverviewComponent,
        RevenueTrendChartComponent,
        RevenueCompositionChartsComponent,
        RevenueTopServicesChartComponent,
        RevenueRepeatVsNewCustomersChartComponent,
        RevenueEarningsForecastChartComponent
    ],
    providers: [provideEchartsCore({ echarts })]
})
export class ProviderRevenueAnalyticsComponent implements OnInit {
    private readonly _sharedService = inject(SharedDataService); 

    ngOnInit(): void { 
        this._sharedService.setProviderHeader('Revenue Analytics');
    }
}