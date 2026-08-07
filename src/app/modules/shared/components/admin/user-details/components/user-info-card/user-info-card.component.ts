import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface IInfoCardItem {
    label: string;
    value: string | number;
}

@Component({
    selector: 'app-user-details-info-card',
    standalone: true,
    host: { class: 'block' },
    imports: [CommonModule],
    templateUrl: './user-info-card.component.html'
})
export class UserDetailsInfoCardComponent {
    @Input() title = '';
    @Input() subtitle = '';
    @Input() items: IInfoCardItem[] = [];
}
