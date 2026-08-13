import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard-skeleton',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard-skeleton.component.html',
})
export class DashboardSkeletonComponent {
    kpis = [0, 1, 2, 3];
    actions = [0, 1, 2, 3];
}
