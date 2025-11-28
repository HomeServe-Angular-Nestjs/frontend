import { Component, inject, OnDestroy, OnInit, } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { BehaviorSubject, finalize, map, Subject, takeUntil, tap, withLatestFrom } from "rxjs";
import { BookingService } from "../../../../../../core/services/booking.service";
import { FullDateWithTimePipe } from "../../../../../../core/pipes/to-full-date-with-time.pipe";
import { IBookingResponse, IPagination, IReview } from "../../../../../../core/models/booking.model";
import { CustomerPaginationComponent } from "../../../../partials/sections/customer/pagination/pagination.component";
import { LoadingCircleAnimationComponent } from "../../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { BookingStatus, CancelStatus, PaymentDirection, PaymentSource, PaymentStatus, TransactionStatus, TransactionType } from "../../../../../../core/enums/enums";
import { PaymentService } from "../../../../../../core/services/payment.service";
import { RazorpayWrapperService } from "../../../../../../core/services/public/razorpay-wrapper.service";
import { IBookingOrder, RazorpayOrder, RazorpayPaymentResponse } from "../../../../../../core/models/payment.model";
import { ITransaction } from "../../../../../../core/models/transaction.model";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { CustomerLeaveAReviewComponent } from "../leave-a-review/leave-a-review.component";
import { ISubmitReview } from "../../../../../../core/models/reviews.model";
import { SubmitCancellationComponent } from "../../../../partials/shared/submit-cancellation/submit-cancellation.component";

@Component({
  selector: 'app-customer-booking-lists',
  templateUrl: './booking-lists.component.html',
  imports: [CommonModule, FormsModule, FullDateWithTimePipe, CustomerPaginationComponent, RouterLink, LoadingCircleAnimationComponent, ButtonComponent, CustomerLeaveAReviewComponent, SubmitCancellationComponent],
  providers: [PaymentService, RazorpayWrapperService]
})
export class CustomerBookingListsComponent implements OnInit, OnDestroy {
  private readonly _bookingService = inject(BookingService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _paymentService = inject(PaymentService);
  private readonly _razorpayWrapperService = inject(RazorpayWrapperService);

  private _destroy$ = new Subject<void>();
  private _bookingsData$ = new BehaviorSubject<IBookingResponse[]>([]);

  bookingData$ = this._bookingsData$.asObservable();
  isReviewModalOpen = false;
  cancellationReasonModal = false;
  selectedBookingIdForReview = '';
  bookingSelectedForCancellation = '';
  prevReview: IReview | null = null;
  pagination: IPagination = {
    limit: 0,
    page: 1,
    total: 0
  };

  ngOnInit(): void {
    this._fetchBookings(1);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _fetchBookings(page: number) {
    this._bookingService.fetchBookings(page)
      .pipe(
        takeUntil(this._destroy$),
        map(res => {
          this.pagination = res.paginationData;
          return res.bookingData ?? []
        })
      )
      .subscribe(bookingData => this._bookingsData$.next(bookingData));
  }

  private _updateCancelledBookingData(cancelledBookingId: string) {
    const bookingData = this._bookingsData$.getValue();
    const updatedBookingData = bookingData.map(bookings => ({
      ...bookings,
      bookingStatus: bookings.bookingId === cancelledBookingId
        ? BookingStatus.CANCELLED
        : bookings.bookingStatus
    }));
    this._bookingsData$.next(updatedBookingData);
  }

  private _updateBooking(bookingId: string, transactionData?: ITransaction) {
    const bookingData = {
      bookingId,
      transactionId: transactionData?.id ?? null,
    };

    this._bookingService.updateBooking(bookingData)
      .pipe(takeUntil(this._destroy$))
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
      .pipe(takeUntil(this._destroy$))
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
      .pipe(takeUntil(this._destroy$))
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
      booking.bookingStatus === 'completed' ||
      booking.cancelStatus;

    return isWithinCancellableWindow && !isAlreadyCancelled;
  }


  handleCancellation(reason: string) {
    if (!this.bookingSelectedForCancellation || !reason.trim()) {
      this._toastr.warning('Cancellation reason is required.');
      return;
    }

    this._bookingService.markBookingCancelledByCustomer(this.bookingSelectedForCancellation, reason)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this._updateCancelledBookingData(this.bookingSelectedForCancellation);
          this.bookingSelectedForCancellation = '';
          this.cancellationReasonModal = false;
          this._toastr.success(res.message);
        },
      });
  }

  openReviewModal(bookingStatus: BookingStatus, review: IReview | null, bookingId: string) {
    const isPossible = bookingStatus === BookingStatus.COMPLETED
      || bookingStatus === BookingStatus.CANCELLED;

    if (!isPossible) {
      this._toastr.info('Please complete the booking to review.');
      return;
    }

    this.selectedBookingIdForReview = bookingId;
    this.prevReview = review ?? null;
    this.isReviewModalOpen = true;
  }

  submitReview(reviewData: ISubmitReview) {
    alert(this.selectedBookingIdForReview)
    this._bookingService.addReview(this.selectedBookingIdForReview, reviewData)
      .pipe(
        takeUntil(this._destroy$),
        tap(res => {
          if (!res.success) {
            this._toastr.error(res.message);
          } else {
            this._toastr.success(res.message);
          }
        }),
        withLatestFrom(this.bookingData$),
        tap(([res, bookings]) => {
          if (!bookings || bookings.length == 0) return;
          const updatedBooking = bookings.map(booking => ({
            ...booking,
            review: {
              desc: reviewData.description,
              rating: reviewData.ratings,
              writtenAt: new Date(),
            } as IReview
          }));

          this._bookingsData$.next(updatedBooking);
        }),

        finalize(() => {
          this.isReviewModalOpen = false;
        }),

      )
      .subscribe();
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

  shouldShowCompletePayment(paymentStatus: PaymentStatus, cancelStatus: CancelStatus | null) {
    return (
      (paymentStatus === PaymentStatus.UNPAID ||
        paymentStatus === PaymentStatus.FAILED) &&
      cancelStatus === null
    );
  }
}
