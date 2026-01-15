import { Component, effect, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize, first, map, Observable, of, Subject, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { SelectedServiceIdsType, SelectedServiceType } from '../../../../../../core/models/cart.model';
import { IBooking, IPriceBreakupData } from '../../../../../../core/models/booking.model';
import { BookingService } from '../../../../../../core/services/booking.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { IBookingOrder, RazorpayOrder, RazorpayPaymentResponse } from '../../../../../../core/models/payment.model';
import { RazorpayWrapperService } from '../../../../../../core/services/public/razorpay-wrapper.service';
import { LoadingCircleAnimationComponent } from "../../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";
import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '../../../../../../core/enums/enums';
import { ReservationSocketService } from '../../../../../../core/services/socket-service/reservation-socket.service';
import { OrderSummarySectionComponent } from '../../../../partials/sections/customer/order-summary-section/order-summary-section.component';
import { ISelectedSlot } from '../../../../../../core/models/availability.model';

@Component({
  selector: 'app-customer-schedule-order-summary',
  templateUrl: './customer-schedule-order-summary.component.html',
  imports: [CommonModule, LoadingCircleAnimationComponent, OrderSummarySectionComponent],
  providers: [PaymentService, RazorpayWrapperService]
})
export class CustomerScheduleOrderSummaryComponent implements OnInit, OnDestroy {
  private readonly _reservationService = inject(ReservationSocketService);
  private readonly _razorpayWrapper = inject(RazorpayWrapperService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _bookingService = inject(BookingService);
  private readonly _paymentService = inject(PaymentService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private _destroy$ = new Subject<void>();

  @Input({ required: true }) selectedServiceData: SelectedServiceType[] = [];

  providerId: string | null = null;
  selectedSlot = signal<ISelectedSlot | null>(null);
  selectedPaymentSource!: PaymentSource;

  isLoading = false;
  isProcessing = false;

  priceBreakup: IPriceBreakupData = {
    subTotal: 0.00,
    tax: 0.00,
    total: 0.00,
  };

  get getServiceIds(): SelectedServiceIdsType[] {
    return this.selectedServiceData.map((item: SelectedServiceType) => {
      return {
        id: item.id,
        selectedIds: item.services.map((s) => s.id)
      }
    });
  }

  constructor() {
    effect(() => {
      const slot = this._bookingService.selectedSlot();
      this.selectedSlot.set(slot);
    });
  }

  ngOnInit(): void {
    this._route.paramMap
      .pipe(
        takeUntil(this._destroy$),
        tap(params => {
          this.providerId = params.get('id')!;
        })
      )
      .subscribe(() => this._fetchPriceBreakup());
  }

  initiatePayment() {
    this.isProcessing = true;

    const slotData = this.selectedSlot();

    if (!slotData) {
      this._toastr.error('Please select a scheduled time slot.');
      this.isProcessing = false;
      return;
    }

    const totalAmount = this.priceBreakup.total;
    const reservationData = { ...slotData, providerId: this.providerId as string };

    // Start reservation process via socket
    this._reservationService.createReservation(reservationData);

    // Listen for reservation status
    this._reservationService.reservationStatus$.pipe(
      takeUntil(this._destroy$),
      first(),
      switchMap((isReserved) => {
        if (!isReserved) {
          this._toastr.error('Slot is already reserved. Please select another.');
          this.isProcessing = false;
          return throwError(() => new Error('Slot already reserved'));
        }

        // Proceed to save booking once reserved
        return this._saveBooking();
      }),
      switchMap((res) => {
        if (!res?.data) {
          return throwError(() => new Error('Failed to confirm booking.'));
        }

        return of(res.data);
      }),
      switchMap((bookingResponse: IBooking) => {
        if (!bookingResponse?.id) {
          return throwError(() => new Error('Failed to confirm booking.'));
        }

        return this._paymentService.createRazorpayOrder(totalAmount).pipe(
          map(order => ({ order, bookingId: bookingResponse.id })),
          tap({
            error: () => this._paymentService.unlockPayment().pipe(takeUntil(this._destroy$)).subscribe()
          })
        );
      }),
      switchMap(({ order, bookingId }) =>
        new Observable<void>((observer) => {
          this._razorpayWrapper.openCheckout(
            order,
            (paymentResponse: RazorpayPaymentResponse) => {
              this._verifyPaymentAndConfirmBooking(paymentResponse, order, bookingId)
                .pipe(takeUntil(this._destroy$))
                .subscribe({
                  next: () => {
                    observer.next();
                    observer.complete();
                  },
                  error: (err) => {
                    observer.error(err);
                  },
                });
            },
            () => {
              this.isProcessing = false;
              this._paymentService.unlockPayment().pipe(takeUntil(this._destroy$)).subscribe();
              observer.complete();
            }
          );
        })
      ),
      finalize(() => (this.isProcessing = false))
    ).subscribe({
      error: (err) => {
        console.error('Payment initiation failed:', err);
        this.isProcessing = false;
      }
    });
  }

  private _fetchPriceBreakup(): void {
    this.isLoading = true;

    this._bookingService.fetchPriceBreakup()
      .pipe(
        takeUntil(this._destroy$),
        map(res => res.data ?? this.priceBreakup),
        tap(priceBreakup => { this.priceBreakup = priceBreakup }),
        finalize(() => this.isLoading = false)
      )
      .subscribe();
  }

  private _verifyPaymentAndConfirmBooking(response: RazorpayPaymentResponse, order: RazorpayOrder, bookingId: string) {
    const orderData: IBookingOrder = {
      id: order.id,
      bookingId,
      transactionType: TransactionType.BOOKING_PAYMENT,
      amount: order.amount,
      status: TransactionStatus.SUCCESS,
      direction: PaymentDirection.DEBIT,
      source: PaymentSource.RAZORPAY,
      receipt: order.receipt,
    };

    return this._paymentService.verifyBookingPayment(response, orderData).pipe(
      tap(() => {
        this._router.navigate(['profile', 'bookings']);
        this._toastr.success('Booking confirmed successfully.');
      })
    );
  }

  private _saveBooking() {
    const { isAvailable, ...slotData } = this.selectedSlot()!;

    return this._bookingService.saveBooking(slotData, this.providerId!).pipe(
      finalize(() => this.isProcessing = false)
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
