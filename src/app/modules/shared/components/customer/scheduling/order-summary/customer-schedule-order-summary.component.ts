import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { SelectedServiceIdsType, SelectedServiceType } from '../../../../../pages/customer/booking-1-pick-service/customer-pick-a-service.component';
import { IBookingData, IPriceBreakup, IPriceBreakupData } from '../../../../../../core/models/booking.model';
import { BookingService } from '../../../../../../core/services/booking.service';
import { IAddress } from '../../../../../../core/models/schedules.model';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { RazorpayOrder, RazorpayPaymentResponse } from '../../../../../../core/models/payment.model';
import { RazorpayWrapperService } from '../../../../../../core/services/public/razorpay-wrapper.service';
import { ITransaction } from '../../../../../../core/models/transaction.model';
import { LoadingCircleAnimationComponent } from "../../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";
import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '../../../../../../core/enums/enums';
import { customerActions } from '../../../../../../store/customer/customer.actions';
import { IAvailableSlot } from '../../../../../../core/models/slot-rule.model';
import { ReservationSocketService } from '../../../../../../core/services/socket-service/reservation-socket.service';

@Component({
  selector: 'app-customer-schedule-order-summary',
  templateUrl: './customer-schedule-order-summary.component.html',
  imports: [CommonModule, LoadingCircleAnimationComponent],
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

  private _subscriptions: Subscription[] = [];

  @Input({ required: true }) selectedServiceData: SelectedServiceType[] = [];

  providerId: string | null = null;
  priceBreakup: IPriceBreakupData = {
    subTotal: 0.00,
    tax: 0.00,
    visitingFee: 0.00,
    total: 0.00
  };
  location!: IAddress
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
    const routeSub = this._route.paramMap.subscribe(params => {
      this.providerId = params.get('id');
    });

    const locationSub = this._bookingService.address$.subscribe(address => {
      if (address) {
        this.location = address;
      }
    });

    const slotSub = this._bookingService.slot$.subscribe(slotData => {
      this.selectedSlot = slotData;
    });

    this._subscriptions.push(routeSub, locationSub, slotSub);

    const priceData = this._prepareDataForPriceBreakup(this.selectedServiceData);
    this._fetchPriceBreakup(priceData);
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe());
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

  private _verifyPaymentAndConfirmBooking(response: RazorpayPaymentResponse, order: RazorpayOrder) {
    const orderData: RazorpayOrder = {
      id: order.id,
      transactionType: TransactionType.BOOKING,
      amount: order.amount,
      status: TransactionStatus.SUCCESS,
      direction: PaymentDirection.DEBIT,
      source: PaymentSource.RAZORPAY,
      receipt: order.receipt,
    };

    this._paymentService.verifyPaymentSignature(response, orderData).subscribe({
      next: (response) => {
        this._saveBooking(response.transaction);
      },
      error: () => {
        this._toastr.error('Server verification failed.')
      },
      complete: () => this._paymentService.setOngoingPayment(false)
    });
  }

  private _saveBooking(transactionData?: ITransaction) {
    const serviceIds: SelectedServiceIdsType[] = this.getServiceIds;

    if (!this.selectedSlot) {
      this._toastr.error('Please select a slot.');
      return;
    }

    const { status, ...slotData } = this.selectedSlot;

    const bookingData: IBookingData = {
      providerId: this.providerId!,
      total: Number(this.priceBreakup.total.toFixed(2)),
      location: this.location,
      slotData,
      serviceIds,
      transactionId: transactionData?.id ?? null
    };

    this._bookingService.postBookingData(bookingData).subscribe({
      next: (response) => {
        if (response.success) {
          this._store.dispatch(customerActions.changeReviewedStatus({ status: false }));

          this._toastr.success(transactionData?.id
            ? 'Service booked successfully!'
            : 'Booking saved as pending payment. Please complete the payment from your profile.');

          localStorage.removeItem('selectedServiceData');
          this._router.navigate(['profile', 'bookings'])
        } else {
          this._toastr.success('Sorry, booking failed due to some technical issues. Contact the admin for further steps.');
        }
      },
      error: (err) => {
        this._toastr.error(err);
        console.error(err);
      },
      complete: () => this.isProcessing = false
    });
  }

  initiatePayment() {
    // if (!this.selectedPaymentSource) {
    //   this._toastr.error('Please select a payment source.');
    //   return;
    // }

    if (this._paymentService.checkOngoingPayments()) {
      this._toastr.warning('You already have an ongoing payment!');
      return;
    }
    this._paymentService.setOngoingPayment(true);

    this.isProcessing = true;

    if (!this._isAllDataAvailable()) {
      this._toastr.info('Incomplete booking information.');
      return;
    }

    const slotData = this._bookingService.getSelectedSlot();
    if (!slotData) {
      this._toastr.error('Oops something went wrong.');
      console.error('Slot data is missing.');
      return;
    }

    const totalAmount = this.priceBreakup.total;
    const reservationData = { ...slotData, providerId: this.providerId as string };
    this._reservationService.canInitiatePayment = true;

    // if (this.selectedPaymentSource === PaymentSource.RAZORPAY) {
    this._reservationService.checkReservationUpdates(reservationData);

    if (!this._reservationService.canInitiatePayment) {
      this._toastr.error('Slot is already reserved. Please select another.');
      return;
    }

    this._reservationService.createReservation(reservationData);

    this._paymentService.createRazorpayOrder(totalAmount).subscribe(({
      next: (order) => {
        this._razorpayWrapper.openCheckout(order,
          (paymentResponse: RazorpayPaymentResponse) =>
            this._verifyPaymentAndConfirmBooking(paymentResponse, order),
          () => this._paymentService.setOngoingPayment(false) //// !Todo this._saveBooking()  - handle cancelled payment
        );
      },
      error: (err) => {
        console.error(err);
        this._toastr.error('payment failed');
      }
    }));
    // } else if (this.selectedPaymentSource === PaymentSource.WALLET) {
    //   this._toastr.warning('selected wallet');
    // }
  }

  // selectPaymentSource(source: PaymentSource) {
  //   this.selectedPaymentSource = source;
  // }
}
