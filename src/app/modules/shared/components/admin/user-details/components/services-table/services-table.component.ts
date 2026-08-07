import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IProviderServiceOverview } from '../../../../../../../core/models/user-details.model';

@Component({
    selector: 'app-provider-services-table',
    standalone: true,
    host: { class: 'block' },
    imports: [CommonModule],
    templateUrl: './services-table.component.html'
})
export class ProviderServicesTableComponent {
    @Input() services: IProviderServiceOverview[] = [];

    formatPrice(price: number, unit: string): string {
        return `$${price.toLocaleString()} / ${unit}`;
    }
}
