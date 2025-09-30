import { Component, inject, OnDestroy, OnInit, } from "@angular/core";
import { BookingService } from "../../../../../../core/services/booking.service";
import { CommonModule } from "@angular/common";
import { FullDateWithTimePipe } from "../../../../../../core/pipes/to-full-date-with-time.pipe";
import { IBookingResponse, IBookingWithPagination } from "../../../../../../core/models/booking.model";
import { CustomerPaginationComponent } from "../../../../partials/sections/customer/pagination/pagination.component";
import { map, Observable, pipe, Subject, takeUntil } from "rxjs";
import { RouterLink } from "@angular/router";
import { LoadingCircleAnimationComponent } from "../../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { FormsModule } from "@angular/forms";
import { BookingStatus, PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from "../../../../../../core/enums/enums";
import { PaymentService } from "../../../../../../core/services/payment.service";
import { RazorpayWrapperService } from "../../../../../../core/services/public/razorpay-wrapper.service";
import { IBookingOrder, RazorpayOrder, RazorpayPaymentResponse } from "../../../../../../core/models/payment.model";
import { ITransaction } from "../../../../../../core/models/transaction.model";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { CancelBookingModalComponent } from "../../../../partials/shared/cancel-booking-modal/cancel-booking-modal.component";

@Component({
    selector: 'app-customer-booking-lists',
    templateUrl: './booking-lists.component.html',
    imports: [CommonModule, FormsModule, FullDateWithTimePipe, CustomerPaginationComponent, RouterLink, LoadingCircleAnimationComponent, ButtonComponent, CancelBookingModalComponent],
    providers: [PaymentService, RazorpayWrapperService]
})
export class CustomerBookingListsComponent implements OnInit, OnDestroy {
    private readonly _bookingService = inject(BookingService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _paymentService = inject(PaymentService);
    private readonly _razorpayWrapperService = inject(RazorpayWrapperService);

    private destroy$ = new Subject<void>();

    bookingsData$!: Observable<IBookingWithPagination>;
    cancellationReasonModal = false;
    cancelReason = '';
    bookingSelectedForCancellation = '';

    ngOnInit(): void {
        this._fetchBookings(1);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private _fetchBookings(page: number) {
        this.bookingsData$ = this._bookingService.fetchBookings(page)
            .pipe(takeUntil(this.destroy$));
    }

    private _updateCancelledBookingData(cancelledBookingId: string) {
        this.bookingsData$ = this.bookingsData$.pipe(
            takeUntil(this.destroy$),
            map(response => {
                return {
                    bookingData: response.bookingData.map(bookings => {
                        if (bookings.bookingId === cancelledBookingId) {
                            return {
                                ...bookings,
                                bookingStatus: BookingStatus.CANCELLED
                            };
                        }
                        return bookings;
                    }),
                    paginationData: response.paginationData,
                }
            })
        );
    }

    private _updateBooking(bookingId: string, transactionData?: ITransaction) {
        const bookingData = {
            bookingId,
            transactionId: transactionData?.id ?? null,
        };

        this._bookingService.updateBooking(bookingData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    console.log(res);
                }
            });
    }

    private _verifyPaymentAndUpdateBooking(response: RazorpayPaymentResponse, order: RazorpayOrder, bookingId: string) {
        const orderData: IBookingOrder = {
            id: order.id,
            bookingId,
            transactionType: TransactionType.BOOKING,
            amount: order.amount,
            status: TransactionStatus.SUCCESS,
            direction: PaymentDirection.DEBIT,
            source: PaymentSource.RAZORPAY,
            receipt: order.receipt,
        };

        this._paymentService.verifyBookingPayment(response, orderData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this._updateBooking(bookingId, response.transaction);
                },
                error: (err) => {
                    console.error(err);
                    this._toastr.error('Server verification failed.')
                }
            });
    }

    private _initiatePayment(totalAmount: number, bookingId: string) {
        this._paymentService.createRazorpayOrder(totalAmount)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (order) => {
                    this._razorpayWrapperService.openCheckout(
                        order,
                        (paymentResponse: RazorpayPaymentResponse) =>
                            this._verifyPaymentAndUpdateBooking(paymentResponse, order, bookingId),
                    );
                }
            });
    }

    canBeCancelled(booking: IBookingResponse): boolean {
        const bookingDate = new Date(booking.createdAt);
        if (isNaN(bookingDate.getTime())) {
            this._toastr.warning(`Invalid scheduled date: , ${booking.createdAt}`);
            return false;
        }

        const now = new Date();
        const timeDiff = now.getTime() - bookingDate.getTime()
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

        const isWithinCancellableWindow = timeDiff < twentyFourHoursInMs;
        const isAlreadyCancelled =
            booking.bookingStatus === 'cancelled' ||
            booking.paymentStatus === 'refunded' ||
            booking.cancelStatus;

        return isWithinCancellableWindow && !isAlreadyCancelled;
    }

    submitCancellation() {
        if (!this.bookingSelectedForCancellation || !this.cancelReason.trim()) {
            this._toastr.warning('Cancellation reason is required.');
            return;
        }

        this._bookingService.cancelBooking(this.bookingSelectedForCancellation, this.cancelReason)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this._updateCancelledBookingData(this.bookingSelectedForCancellation);
                    this.bookingSelectedForCancellation = '';
                    this.cancellationReasonModal = false;
                    this.cancelReason = '';
                    this._toastr.success(res.message);
                },
                error: (err) => {
                    console.error('Cancellation failed:', err);
                    this._toastr.error(err);
                }
            })
    }

    completePayment(booking: IBookingResponse) {
        const totalAmount = booking.totalAmount;

        if (!totalAmount || !booking.bookingId) {
            this._toastr.warning('Invalid booking data. Cannot proceed with payment.');
            return;
        }
        if (booking.paymentSource === PaymentSource.RAZORPAY) {
            this._initiatePayment(totalAmount, booking.bookingId);
        }

    }

    onPageChange(newPage: number) {
        this._fetchBookings(newPage);
    }

    openModal(bookingId: string) {
        this.bookingSelectedForCancellation = bookingId;
        this.cancellationReasonModal = true;
    }

    closeModal() {
        this.bookingSelectedForCancellation = '';
        this.cancellationReasonModal = false;
    }


}