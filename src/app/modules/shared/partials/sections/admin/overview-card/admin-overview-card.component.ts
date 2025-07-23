import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface IAdminOverViewCard {
    title: string;
    value: string | number;
    icon: string;
    iconBg: string;
    subtext?: string;
}

@Component({
    selector: 'app-admin-overview-card',
    templateUrl: './admin-overview-card.component.html',
    imports: [CommonModule]
})
export class OverviewCardComponent {
    @Input({ required: true }) title!: string;
    @Input({ required: true }) value!: string | number;
    @Input() icon?: string; // e.g., 'fas fa-calendar'
    @Input() iconBg?: string = 'bg-blue-100 text-blue-700'; // Tailwind classes
    @Input() subtext?: string;
}