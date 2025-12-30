import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { ICONS } from "../../../../../../../environments/env";
import { PaymentSource } from "../../../../../../core/enums/enums";

interface PaymentOption {
    id: PaymentSource;
    name: string;
    logo: string;
    color: string;
}

@Component({
    selector: 'app-customer-select-payment',
    templateUrl: './select-payment.component.html',
    imports: [CommonModule]
})
export class CustomerSelectPaymentComponent {
    selectedOption: PaymentSource | null = null;

    paymentSources: PaymentOption[] = [
        {
            id: PaymentSource.RAZORPAY,
            name: 'Razorpay',
            logo: 'https://razorpay.com/assets/razorpay-logo.svg',
            color: 'indigo'
        },
        {
            id: PaymentSource.INTERNAL,
            name: 'Wallet',
            logo: 'https://cdn-icons-png.flaticon.com/512/1170/1170678.png',
            color: 'green'
        }
    ];

    @Output() optionSelected = new EventEmitter<PaymentSource>();

    selectOption(optionId: PaymentSource) {
        this.selectedOption = optionId;
        this.optionSelected.emit(optionId);
    }
}
