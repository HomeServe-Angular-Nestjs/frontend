import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Observable, filter, map, of, switchMap } from "rxjs";

import { IBookingDetailProvider } from "../../../../../../core/models/booking.model";
import { BookingService } from "../../../../../../core/services/booking.service";
import { formatFullDateWithTimeHelper } from "../../../../../../core/utils/date.util";
import { BookingStatus, PaymentStatus } from "../../../../../../core/enums/enums";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";

@Component({
    selector: 'app-provider-view-booking-details',
    templateUrl: './booking-details.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class ProviderViewBookingDetailsComponents implements OnInit {
    private readonly _bookingService = inject(BookingService);
    private readonly _toastr = inject(ToastNotificationService);
    private _route = inject(ActivatedRoute);

    bookingData$!: Observable<IBookingDetailProvider>;

    paymentSelectOptions: { value: PaymentStatus; label: string; }[] = [
        { value: PaymentStatus.PAID, label: 'Paid' },
        { value: PaymentStatus.UNPAID, label: 'Unpaid' },
        { value: PaymentStatus.REFUNDED, label: 'Refunded' },
        { value: PaymentStatus.FAILED, label: 'Failed' },
    ];

    bookingSelectOption: { value: BookingStatus; label: string; }[] = [
        { value: BookingStatus.PENDING, label: 'Pending' },
        { value: BookingStatus.IN_PROGRESS, label: 'In Progress' },
        { value: BookingStatus.CONFIRMED, label: 'Confirmed' },
        { value: BookingStatus.COMPLETED, label: 'Completed' },
        { value: BookingStatus.CANCELLED, label: 'Cancelled' },
    ];


    ngOnInit(): void {
        this.bookingData$ = this._route.paramMap.pipe(
            map(param => param.get('id')),
            filter((id): id is string => !!id),
            switchMap(id => this._bookingService.getBookingDetails(id))
        );
    }

    changeBookingStatus(bookingId: string, newStatus: BookingStatus): void {
        this._bookingService.changeBookingStatus(bookingId, newStatus).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.bookingData$ = of(response.data);
                    this._toastr.success(response.message);
                }
            },
            error: (err) => {
                console.error(err);
                this._toastr.error(err);
            }
        });
    }

    formateData(date: string): string {
        return formatFullDateWithTimeHelper(date);
    }

    getBookingBadgeClass(status: string): string {
        const base = 'px-3 py-1 rounded-full text-sm font-medium capitalize';
        switch (status) {
            case 'pending':
                return `${base} bg-yellow-100 text-yellow-800`;
            case 'confirmed':
                return `${base} bg-gray-100 text-gray-700`;
            case 'in_progress':
                return `${base} bg-purple-100 text-purple-800`;
            case 'completed':
                return `${base} bg-green-100 text-green-800`;
            case 'cancelled':
                return `${base} bg-red-100 text-red-800`;
            default:
                return `${base} bg-gray-200 text-gray-700`;
        }
    }

    getPaymentBadgeClass(status: string): string {
        const base = 'px-3 py-1 rounded-full text-sm font-medium capitalize';
        switch (status) {
            case 'paid':
                return `${base} bg-green-100 text-green-800`;
            case 'unpaid':
                return `${base} bg-yellow-100 text-yellow-800`;
            case 'refunded':
                return `${base} bg-blue-100 text-blue-800`;
            case 'failed':
                return `${base} bg-red-100 text-red-800`;
            default:
                return `${base} bg-gray-100 text-gray-700`;
        }
    }

    isStatusDisabled(optionStatus: BookingStatus, currentStatus: BookingStatus): boolean {
        if (currentStatus === BookingStatus.COMPLETED || currentStatus === BookingStatus.CANCELLED) {
            return optionStatus !== currentStatus;
        }

        const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
            [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
            [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
            [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
            [BookingStatus.COMPLETED]: [],
            [BookingStatus.CANCELLED]: []
        };

        const allowed = allowedTransitions[currentStatus];

        return !allowed.includes(optionStatus) && optionStatus !== currentStatus;
    }
}
