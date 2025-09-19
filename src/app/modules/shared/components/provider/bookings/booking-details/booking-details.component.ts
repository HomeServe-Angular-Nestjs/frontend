import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Observable, filter, map, of, switchMap } from "rxjs";

import { IBookingDetailProvider } from "../../../../../../core/models/booking.model";
import { BookingService } from "../../../../../../core/services/booking.service";
import { formatFullDateWithTimeHelper } from "../../../../../../core/utils/date.util";
import { BookingStatus, PaymentStatus } from "../../../../../../core/enums/enums";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { ReportModalComponent } from "../../../../partials/shared/report-modal/report-modal.component";
import { IReportSubmit, ReportService } from "../../../../../../core/services/report.service";
import { SharedDataService } from "../../../../../../core/services/public/shared-data.service";

@Component({
    selector: 'app-provider-view-booking-details',
    templateUrl: './booking-details.component.html',
    imports: [CommonModule, FormsModule, ButtonComponent, ReportModalComponent],
    providers: [ReportService]
})
export class ProviderViewBookingDetailsComponents implements OnInit {
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _bookingService = inject(BookingService);
    private readonly _sharedData = inject(SharedDataService);
    private readonly _reportService = inject(ReportService);
    private readonly _route = inject(ActivatedRoute);

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

    showReportModal = signal(false);

    ngOnInit(): void {
        this._sharedData.setProviderHeader('Bookings');

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

    toggleReportModal() {
        this.showReportModal.update(v => v = !v);
    }

    submitReport(report: Omit<IReportSubmit, 'targetId'>, customerId: string) {
        if (!customerId) {
            console.error('[ERROR] Provider ID is missing.');
            return;
        };

        const reportData = {
            ...report,
            targetId: customerId,
        }

        this._reportService.submit(reportData).subscribe({
            next: (res) => {
                if (res.success) this._toastr.success('Report has been submitted.')
            },
            complete: () => this.toggleReportModal()
        });
    }
}
