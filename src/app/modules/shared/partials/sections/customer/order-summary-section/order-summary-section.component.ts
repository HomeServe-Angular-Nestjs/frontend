import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPriceBreakupData } from '../../../../../../core/models/booking.model';

@Component({
    selector: 'app-customer-order-summary-section',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './order-summary-section.component.html',
})
export class OrderSummarySectionComponent {
    @Input({ required: true }) priceBreakup!: IPriceBreakupData;
    @Input() buttonText: string = 'Checkout';
    @Input() disabled: boolean = false;
    @Input() processing: boolean = false;
    @Input() showBadges: boolean = true;

    @Output() actionClick = new EventEmitter<void>();

    onAction() {
        if (!this.disabled && !this.processing) {
            this.actionClick.emit();
        }
    }
}
