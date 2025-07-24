import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedDataService } from '../../../../../../core/services/public/shared-data.service';
import { AdminService } from '../../../../../../core/services/admin.service';
import { AdminDashboardOverviewComponent } from '../dashboard-overview/dashboard-overview.component';
import { AdminRevenueChartComponent } from "../revenue-chart/revenue-chart.component";
import { SubscriptionPieChartComponent } from "../subscription-pie-chart/subscription-pie-chart.component";
import * as echarts from 'echarts/core';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { LineChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { provideEchartsCore } from 'ngx-echarts';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  PieChart,
  CanvasRenderer
]);

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  imports: [CommonModule, AdminDashboardOverviewComponent, AdminRevenueChartComponent, SubscriptionPieChartComponent],
  providers: [provideEchartsCore({ echarts })],
})
export class AdminDashboardComponent implements OnInit {
  private readonly _sharedData = inject(SharedDataService);
  private readonly _adminService = inject(AdminService);

  ngOnInit(): void {
    this._sharedData.setTitle('Admin Dashboard');
  }
}
