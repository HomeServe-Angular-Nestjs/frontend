import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IDashboardRecentBooking } from '../../../../../../core/models/dashboard.model';

@Component({
    selector: 'app-recent-bookings-preview',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './recent-bookings-preview.component.html',
})
export class RecentBookingsPreviewComponent {
    @Input() bookings: IDashboardRecentBooking[] = [];

    get hasBookings(): boolean {
        return this.bookings.length > 0;
    }

    getDate(date: string): string {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    getTime(date: string): string {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    statusClass(status: string): string {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'in_progress': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    }

    customerName(b: IDashboardRecentBooking): string {
        return b.customer.fullname || b.customer.username || 'Customer';
    }

    serviceName(b: IDashboardRecentBooking): string {
        return b.service.name || b.service.category || 'Service';
    }

    onAvatarError(event: Event): void {
        (event.target as HTMLImageElement).src = 'assets/images/profile_placeholder.jpg';
    }
}
