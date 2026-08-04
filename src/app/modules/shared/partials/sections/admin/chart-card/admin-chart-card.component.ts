import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-admin-chart-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-chart-card.component.html',
    host: { class: 'h-full flex flex-col' },
})
export class AdminChartCardComponent {
    @Input({ required: true }) title!: string;
    @Input() subtitle?: string;
    @Input() icon?: string;
    @Input() iconBg: string = 'bg-indigo-50';
    @Input() iconColor: string = 'text-indigo-500';
    @Input() loading: boolean = false;
}
