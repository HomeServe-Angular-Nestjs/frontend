import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITransaction } from '../../../../../core/models/transaction.model';
import { TransactionType } from '../../../../../core/enums/enums';

@Component({
    selector: 'app-transaction-history-timeline',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './transaction-history-timeline.component.html'
})
export class TransactionHistoryTimelineComponent {
    @Input() transactions: ITransaction[] = [];

    get sortedTransactions(): ITransaction[] {
        return [...(this.transactions ?? [])].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    displayType(type: TransactionType): string {
        switch (type) {
            case TransactionType.BOOKING_PAYMENT:
                return 'Booking Payment';
            case TransactionType.BOOKING_REFUND:
                return 'Booking Refund';
            case TransactionType.BOOKING_RELEASE:
                return 'Booking Release';
            case TransactionType.CANCELLATION_FEE:
                return 'Cancellation Fee';
            case TransactionType.GST:
                return 'GST';
            case TransactionType.PROVIDER_COMMISSION:
                return 'Provider Commission';
            case TransactionType.CUSTOMER_COMMISSION:
                return 'Customer Commission';
            default:
                return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
    }
}
