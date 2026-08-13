import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-dashboard-performance-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard-performance-card.component.html',
})
export class DashboardPerformanceCardComponent {
    @Input() avgRating = 0;
    @Input() completionRate = 0;
    @Input() totalReviews = 0;

    get ratingLabel(): string {
        if (this.avgRating >= 4.5) return 'Excellent customer rating';
        if (this.avgRating >= 4) return 'Great customer rating';
        if (this.avgRating >= 3) return 'Good customer rating';
        if (this.avgRating > 0) return 'Average customer rating';
        return 'No rating yet';
    }

    get completionLabel(): string {
        if (this.completionRate === 0) return 'No bookings completed yet';
        if (this.completionRate >= 90) return 'Strong completion rate';
        return `${this.completionRate.toFixed(1)}% of bookings completed`;
    }
}