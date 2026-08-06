import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ICancellationAnalysis } from '../../../../../../core/models/sales-report.model';
import { AdminChartCardComponent } from '../../../../partials/sections/admin/chart-card/admin-chart-card.component';

@Component({
    selector: 'app-admin-sales-cancellation-analysis',
    standalone: true,
    imports: [CommonModule, AdminChartCardComponent],
    templateUrl: './sales-cancellation-analysis.component.html',
    styleUrls: ['./sales-cancellation-analysis.component.css'],
})
export class AdminSalesCancellationAnalysisComponent {
    @Input() cancellation: ICancellationAnalysis | undefined;
    @Input() loading = false;
}