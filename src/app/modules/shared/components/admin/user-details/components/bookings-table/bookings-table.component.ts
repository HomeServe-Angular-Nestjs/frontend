import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IBookingOverview, UserBookingStatus } from '../../../../../../../core/models/user-details.model';

@Component({
    selector: 'app-user-bookings-table',
    standalone: true,
    host: { class: 'block' },
    imports: [CommonModule],
    templateUrl: './bookings-table.component.html'
})
export class UserBookingsTableComponent {
    @Input() bookings: IBookingOverview[] = [];
    @Input() title = 'Recent Bookings';

    statusPillClass(status: UserBookingStatus): string {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'confirmed': return 'bg-indigo-100 text-indigo-700';
            case 'in_progress': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    }

    formatStatus(status: UserBookingStatus): string {
        return status.replace('_', ' ').toUpperCase();
    }

    formatCurrency(amount: number): string {
        return `$${amount.toLocaleString()}`;
    }
}
