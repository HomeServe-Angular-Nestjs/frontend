import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-dashboard-availability-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard-availability-card.component.html',
})
export class DashboardAvailabilityCardComponent {
    @Input() workingHours: { time: { from: string; to: string } } | null = null;
    @Input() activeServiceCount = 0;
    @Input() nextBookingTime: string | null = null;

    get workingHoursLabel(): string {
        const wh = this.workingHours?.time;
        if (!wh?.from || !wh?.to) return 'Not set';
        return `${this._fmtTime(wh.from)} – ${this._fmtTime(wh.to)}`;
    }

    private _fmtTime(value: string): string {
        if (!value) return '';
        const [h, m] = value.split(':');
        if (!h) return value;
        const date = new Date();
        date.setHours(Number(h), Number(m || 0), 0, 0);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
}
