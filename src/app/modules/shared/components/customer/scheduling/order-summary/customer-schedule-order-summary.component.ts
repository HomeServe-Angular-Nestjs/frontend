import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { combineLatest, finalize, map, Observable, Subject, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { SelectedServiceIdsType, SelectedServiceType } from '../../../../../pages/customer/booking-1-pick-service/customer-pick-a-service.component';
import { IBookingData, IPriceBreakup, IPriceBreakupData } from '../../../../../../core/models/booking.model';
import { BookingService } from '../../../../../../core/services/booking.service';
import { IAddress } from '../../../../../../core/models/schedules.model';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { IBookingOrder, RazorpayOrder, RazorpayPaymentResponse } from '../../../../../../core/models/payment.model';
import { RazorpayWrapperService } from '../../../../../../core/services/public/razorpay-wrapper.service';
import { ITransaction } from '../../../../../../core/models/transaction.model';
import { LoadingCircleAnimationComponent } from "../../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";
import { PaymentDirection, PaymentSource, PaymentStatus, TransactionStatus, TransactionType } from '../../../../../../core/enums/enums';
import { customerActions } from '../../../../../../store/customer/customer.actions';
import { IAvailableSlot } from '../../../../../../core/models/slot-rule.model';
import { ReservationSocketService } from '../../../../../../core/services/socket-service/reservation-socket.service';

@Component({
  selector: 'app-customer-schedule-order-summary',
  templateUrl: './customer-schedule-order-summary.component.html',
  imports: [CommonModule, LoadingCircleAnimationComponent],
  providers: [PaymentService, RazorpayWrapperService]
})
export class CustomerScheduleOrderSummaryComponent implements OnInit, OnChanges, OnDestroy {
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
  priceBreakup: IPriceBreakupData = {
    subTotal: 0.00,
    tax: 0.00,
    fee: 0.00,
    total: 0.00
  };
  location!: IAddress;
  selectedSlot: IAvailableSlot | null = null;
  selectedPaymentSource!: PaymentSource;

  isLoading = true;
  isProcessing = false;

  get getServiceIds(): SelectedServiceIdsType[] {
    return this.selectedServiceData.map(item => {
      return {
        id: item.id,
        selectedIds: item.subService.map(sub => sub.id)
      }
    });
  }

  ngOnInit() {
    combineLatest([
      this._route.paramMap,
      this._bookingService.address$,
      this._bookingService.slot$
    ])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([params, address, slotData]) => {
        this.providerId = params.get('id')!;
        if (address) this.location = address;
        this.selectedSlot = slotData;

        // Prepare price only when selectedServiceData exists
        if (this.selectedServiceData) {
          const priceData = this._prepareDataForPriceBreakup(this.selectedServiceData);
          this._fetchPriceBreakup(priceData);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedServiceData'] && !changes['selectedServiceData'].firstChange) {
      const priceData = this._prepareDataForPriceBreakup(this.selectedServiceData);
      this._fetchPriceBreakup(priceData);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _prepareDataForPriceBreakup(data: SelectedServiceType[]): IPriceBreakup[] {
    return data
      .filter(item => item.subService?.length)
      .map(item => ({
        serviceId: item.id,
        subServiceIds: item.subService.map(sub => sub.id)
      }));
  }

  private _fetchPriceBreakup(data: IPriceBreakup[]): void {
    if (!data.length || !this.providerId) {
      this._toastr.error('Cannot fetch price without services or provider.');
      return;
    }

    this._bookingService.fetchPriceBreakup(data).subscribe({
      next: (priceBreakup) => this.priceBreakup = priceBreakup,
      error: (err) => this._toastr.error(err),
      complete: () => this.isLoading = false
    });
  }

  private _isAllDataAvailable(): boolean {
    return (
      !!this.priceBreakup.total &&
      this.selectedServiceData.length > 0 &&
      !!this.providerId &&
      !!this.selectedSlot &&
      !!this._isValidLocation(this.location)
    );
  }

  private _isValidLocation(location: IAddress | null): boolean {
    return !!location && location.address !== '' && Array.isArray(location.coordinates);
  }

  private _verifyPaymentAndConfirmBooking(response: RazorpayPaymentResponse, order: RazorpayOrder, bookingId: string) {
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

    return this._paymentService.verifyBookingPayment(response, orderData).pipe(
      switchMap((verificationResponse) => {
        const { verified, bookingId, transaction } = verificationResponse;

        if (!transaction || !bookingId || !transaction.id || !verified) {
          this._toastr.error('Payment verification failed or transaction missing.');
          return throwError(() => new Error('Payment verification failed'));
        }

        return this._bookingService.updatePaymentStatus({
          transactionId: transaction.id,
          bookingId,
          paymentStatus: PaymentStatus.PAID
        });
      }),
      tap(() => {
        this._toastr.success('Booking confirmed and payment successful!');
        this._router.navigate(['profile', 'bookings']);
      }));
  }

  private _saveBooking(transactionData?: ITransaction): Observable<any> {
    const serviceIds: SelectedServiceIdsType[] = this.getServiceIds;

    if (!this.selectedSlot) {
      this._toastr.error('Please select a slot.');
      return throwError(() => new Error('Slot not selected'));
    }

    const { status, ...slotData } = this.selectedSlot;

    const phoneNumber = this._bookingService.getSelectedPhoneNumber();

    if (!phoneNumber || phoneNumber.length !== 10 || isNaN(Number(phoneNumber))) {
      this._toastr.error('Please enter a valid phone number.');
      return throwError(() => new Error('Phone number is invalid.'));
    }

    const bookingData: IBookingData = {
      providerId: this.providerId!,
      total: Number(this.priceBreakup.total.toFixed(2)),
      location: this.location,
      slotData,
      serviceIds,
      transactionId: transactionData?.id ?? null,
      phoneNumber,
    };

    return this._bookingService.postBookingData(bookingData).pipe(
      tap(() =>
        this._store.dispatch(customerActions.changeReviewedStatus({ status: false }))
      ),
      finalize(() => this.isProcessing = false)
    );
  }

  initiatePayment() {
    this.isProcessing = true;

    if (!this._isAllDataAvailable()) {
      this._toastr.info('Incomplete booking information.');
      this.isProcessing = false;
      return;
    }

    const slotData = this._bookingService.getSelectedSlot();
    if (!slotData) {
      this._toastr.error('Please select a slot.');
      this.isProcessing = false;
      return;
    }

    const totalAmount = this.priceBreakup.total;
    const reservationData = { ...slotData, providerId: this.providerId as string };

    this._reservationService.canInitiatePayment = true;
    this._reservationService.checkReservationUpdates(reservationData);

    if (!this._reservationService.canInitiatePayment) {
      this._toastr.error('Slot is already reserved. Please select another.');
      this.isProcessing = false;
      return;
    }

    this._reservationService.createReservation(reservationData);

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
}
