import { Component, effect, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { finalize, map, Observable, Subject, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { SelectedServiceIdsType, SelectedServiceType } from '../../../../../../core/models/cart.model';
import { IBookingData, IPriceBreakupData } from '../../../../../../core/models/booking.model';
import { BookingService } from '../../../../../../core/services/booking.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { IBookingOrder, RazorpayOrder, RazorpayPaymentResponse } from '../../../../../../core/models/payment.model';
import { RazorpayWrapperService } from '../../../../../../core/services/public/razorpay-wrapper.service';
import { LoadingCircleAnimationComponent } from "../../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";
import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '../../../../../../core/enums/enums';
import { ReservationSocketService } from '../../../../../../core/services/socket-service/reservation-socket.service';
import { OrderSummarySectionComponent } from '../../../../partials/sections/customer/order-summary-section/order-summary-section.component';
import { ILocationData } from '../../../../../../core/models/user.model';
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
  private readonly _store = inject(Store);
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
        selectedIds: item.services.map((s: any) => s.id)
      }
    });
  }

  constructor() {
    effect(() => {
      const slot = this._bookingService.getSelectedSlot();
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

    if (!this._isAllDataAvailable()) {
      this.isProcessing = false;
      return;
    }

    const slotData = this.selectedSlot;
    const totalAmount = this.priceBreakup.total;
    const reservationData = { ...slotData, providerId: this.providerId as string };

    this._reservationService.canInitiatePayment = true;
    // this._reservationService.checkReservationUpdates(reservationData);

    if (!this._reservationService.canInitiatePayment) {
      this._toastr.error('Slot is already reserved. Please select another.');
      this.isProcessing = false;
      return;
    }

    // this._reservationService.createReservation(reservationData);
    return;
    this._saveBooking().pipe(
      takeUntil(this._destroy$),
      switchMap((bookingResponse) => {
        if (!bookingResponse?.data?.id) {
          return throwError(() => new Error('Failed to confirm booking.'));
        }

        return this._paymentService.createRazorpayOrder(totalAmount).pipe(
          map(order => ({ order, bookingId: bookingResponse.data.id }))
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
                    observer.complete()
                  },
                  error: (err) => {
                    observer.error(err)
                  },
                });
            },
            () => {
              observer.complete();
            }
          );
        })
      )
    ).subscribe({
      error: (err) => {
        console.error(err);
        this._toastr.error(err.message || err);
        this.isProcessing = false;
      },
      complete: () => {
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


  private _isAllDataAvailable(): boolean {
    if (!this.providerId) {
      this._toastr.error('Provider information is missing.');
      return false;
    }

    if (!this.selectedSlot()) {
      this._toastr.error('Please select a scheduled time slot.');
      return false;
    }

    const address = this._bookingService.getSelectedAddress();
    if (!this._isValidLocation(address)) {
      this._toastr.error('Please provide a valid service delivery address.');
      return false;
    }

    const phoneNumber = this._bookingService.getSelectedPhoneNumber();
    if (!phoneNumber || phoneNumber.length !== 10 || isNaN(Number(phoneNumber))) {
      this._toastr.error('Please enter a valid 10-digit contact number.');
      return false;
    }

    if (!this.priceBreakup.total || this.priceBreakup.total <= 0) {
      this._toastr.error('Price calculation is unavailable.');
      return false;
    }

    return true;
  }

  private _isValidLocation(location: ILocationData | null): boolean {
    return !!location
      && location.address !== ''
      && Array.isArray(location.coordinates)
      && location.coordinates.length === 2;
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

  private _saveBooking(): Observable<any> {
    const serviceIds: SelectedServiceIdsType[] = this.getServiceIds;

    const { isAvailable, ...slotData } = this.selectedSlot()!;
    const phoneNumber = this._bookingService.getSelectedPhoneNumber()!;

    const bookingData: IBookingData = {
      providerId: this.providerId!,
      total: Number(this.priceBreakup.total.toFixed(2)),
      location: this._bookingService.getSelectedAddress()!,
      slotData,
      serviceIds,
      phoneNumber,
    };

    return this._bookingService.preBookingData(bookingData).pipe(
      finalize(() => this.isProcessing = false)
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
