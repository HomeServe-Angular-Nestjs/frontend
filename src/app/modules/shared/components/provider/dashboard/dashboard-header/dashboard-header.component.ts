import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-dashboard-header',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard-header.component.html',
})
export class DashboardHeaderComponent {
    @Input() providerName = 'Provider';
    @Input() upcomingCount = 0;
    @Input() nextBookingTime: string | null = null;

    today = new Date();

    get greeting(): string {
        const hour = this.today.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }

    get formattedDate(): string {
        return this.today.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }
}
