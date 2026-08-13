import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IUpcomingBooking } from '../../../../../../core/models/dashboard.model';

@Component({
    selector: 'app-next-booking-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './next-booking-card.component.html',
})
export class NextBookingCardComponent {
    @Input() nextBooking: IUpcomingBooking | null = null;
    @Input() nextAvailableSlot: { from: string; to: string; date: string } | null = null;

    get hasBooking(): boolean {
        return !!this.nextBooking;
    }

    get bookingDate(): string {
        const d = new Date(this.nextBooking!.slot.date);
        if (isNaN(d.getTime())) return '';
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    get timeRange(): string {
        const slot = this.nextBooking!.slot;
        return `${this._fmtTime(slot.from)} – ${this._fmtTime(slot.to)}`;
    }

    get customerName(): string {
        return this.nextBooking!.customer.fullname || this.nextBooking!.customer.username || 'Customer';
    }

    get serviceName(): string {
        return this.nextBooking!.service.name || this.nextBooking!.service.category || 'Service';
    }

    onAvatarError(event: Event): void {
        (event.target as HTMLImageElement).src = 'assets/images/profile_placeholder.jpg';
    }

    private _fmtTime(value: string): string {        if (!value) return '';
        const [h, m] = value.split(':');
        if (!h) return value;
        const date = new Date();
        date.setHours(Number(h), Number(m || 0), 0, 0);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
}
