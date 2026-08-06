import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IAvailabilityOverview, IDayAvailability } from '../../../../../../../core/models/user-details.model';

@Component({
    selector: 'app-availability-card',
    standalone: true,
    host: { class: 'block' },
    imports: [CommonModule],
    templateUrl: './availability-card.component.html'
})
export class AvailabilityCardComponent {
    @Input() availability!: IAvailabilityOverview;

    timeRangeLabel(day: IDayAvailability): string {
        if (!day.timeRanges?.length) return '';
        return day.timeRanges.map(r => `${r.startTime} - ${r.endTime}`).join(', ');
    }
}
