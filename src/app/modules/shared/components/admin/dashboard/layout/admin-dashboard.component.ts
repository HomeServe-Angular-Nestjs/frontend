import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedDataService } from '../../../../../../core/services/public/shared-data.service';
import { AdminService } from '../../../../../../core/services/admin.service';
import { AdminDashboardOverviewComponent } from '../dashboard-overview/dashboard-overview.component';
import { AdminRevenueChartComponent } from "../revenue-chart/revenue-chart.component";


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  imports: [CommonModule, AdminDashboardOverviewComponent, AdminRevenueChartComponent],
})
export class AdminDashboardComponent implements OnInit {
  private readonly _sharedData = inject(SharedDataService);
  private readonly _adminService = inject(AdminService);

  ngOnInit(): void {
    this._sharedData.setTitle('Admin Dashboard');
  }
}
