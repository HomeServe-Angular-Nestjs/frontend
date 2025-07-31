import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedDataService } from '../../../../../../core/services/public/shared-data.service';
import { AdminService } from '../../../../../../core/services/admin.service';
import { AdminDashboardOverviewComponent } from '../dashboard-overview/dashboard-overview.component';
import { AdminRevenueChartComponent } from "../revenue-chart/revenue-chart.component";
import { SubscriptionPieChartComponent } from "../subscription-pie-chart/subscription-pie-chart.component";
import * as echarts from 'echarts/core';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { provideEchartsCore } from 'ngx-echarts';
import { UserTrackingBarChartComponent } from "../user-tracking-bar-chart/user-tracking-bar-chart.component";
import { AdminTopProvidersBarChartComponent } from "../top-earning-providers-bar-chart/top-earning-providers-bar-chart.component";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  PieChart,
  CanvasRenderer,
  BarChart
]);

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  imports: [
    CommonModule,
    AdminDashboardOverviewComponent,
    AdminRevenueChartComponent,
    SubscriptionPieChartComponent,
    UserTrackingBarChartComponent,
    AdminTopProvidersBarChartComponent
  ],
  providers: [provideEchartsCore({ echarts })],
})
export class AdminDashboardComponent implements OnInit {
  private readonly _sharedData = inject(SharedDataService);

  ngOnInit(): void {
    this._sharedData.setAdminHeader('Dashboard');
  }
}
