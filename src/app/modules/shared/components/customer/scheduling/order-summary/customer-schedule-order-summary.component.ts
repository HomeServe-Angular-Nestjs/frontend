import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectedServiceIdsType, SelectedServiceType } from '../../../../../pages/customer/booking-1-pick-service/customer-pick-a-service.component';
import { CustomerLocationType, IBookingData, IPriceBreakup, IPriceBreakupData } from '../../../../../../core/models/booking.model';
import { BookingService } from '../../../../../../core/services/booking.service';
import { ISelectedSlot } from '../../../../../../core/models/schedules.model';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { RazorpayOrder, RazorpayPaymentResponse } from '../../../../../../core/models/payment.model';
import { RazorpayWrapperService } from '../../../../../../core/services/public/razorpay-wrapper.service';
import { ITransaction } from '../../../../../../core/models/transaction.model';
import { IAddress } from '../../../../../../core/models/user.model';
import { LoadingCircleAnimationComponent } from "../../../../partials/shared/loading-Animations/loading-circle/loading-circle.component";

@Component({
  selector: 'app-customer-schedule-order-summary',
  standalone: true,
  templateUrl: './customer-schedule-order-summary.component.html',
  imports: [CommonModule, LoadingCircleAnimationComponent],
  providers: [PaymentService, RazorpayWrapperService]
})
export class CustomerScheduleOrderSummaryComponent implements OnInit, OnDestroy {
  private readonly _bookingService = inject(BookingService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _paymentService = inject(PaymentService);
  private readonly _razorpayWrapper = inject(RazorpayWrapperService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  private _subscriptions: Subscription[] = [];

  @Input({ required: true }) selectedServiceData: SelectedServiceType[] = [];

  providerId: string | null = null;
  priceBreakup: IPriceBreakupData = {
    subTotal: 0.00,
    tax: 0.00,
    visitingFee: 0.00,
    total: 0.00
  };
  location!: Omit<IAddress, 'type'>;
  selectedSlot: ISelectedSlot | null = null;

  isLoading = true;
  isProcessing = false;

  /**
    * Angular lifecycle hook that initializes component logic,
    * sets subscriptions to services and route, and fetches price breakdown.
    */
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

  /**
   * Angular lifecycle hook to clean up subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }

  InitiatePayment() {
    this.isProcessing = true;

    if (!this._isAllDataAvailable()) {
      this._toastr.info('Incomplete booking information.');
      return;
    }

    const totalAmount = this.priceBreakup.total;
    this._paymentService.createRazorpayOrder(totalAmount).subscribe(({
      next: (order) => {
        this._razorpayWrapper.openCheckout(order,
          (paymentResponse: RazorpayPaymentResponse) => this._verifyPaymentAndConfirmBooking(paymentResponse, order),
          () => this._toastr.warning('payment dismissed')
        );
      },
      error: (err) => this._toastr.error('payment failed')
    }));
  }


  /**
   * Confirms booking if all required data is valid.
   * Otherwise, displays an error notification.
   */
  saveBooking(transactionData: ITransaction) {
    const serviceIds: SelectedServiceIdsType[] = this.selectedServiceData.map(item => {
      return {
        id: item.id,
        selectedIds: item.subService.map(sub => sub.id)
      }
    });

    const bookingData: IBookingData = {
      providerId: this.providerId!,
      total: Number(this.priceBreakup.total.toFixed()),
      location: this.location,
      slotData: this.selectedSlot!,
      serviceIds,
      transactionId: transactionData.id ? transactionData.id : null
    };

    this._bookingService.postBookingData(bookingData).subscribe({
      next: (response) => {
        if (response.success) {
          this._toastr.success('Service booked successfully!');
          localStorage.removeItem('selectedServiceData');
          this._router.navigate(['profile', 'bookings'])
        } else {
          this._toastr.success('Sorry, booking failed due to some technical issues. Contact the admin for further steps.');
        }
      },
      error: (err) => {
        console.log(err)
        this._toastr.error(err);
      },
      complete: () => this.isProcessing = false
    });
  }

  private _verifyPaymentAndConfirmBooking(response: RazorpayPaymentResponse, order: RazorpayOrder) {
    const orderData: RazorpayOrder = {
      id: order.id,
      entity: order.entity,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      method: 'debit',
      receipt: order.receipt,
      offer_id: order.offer_id,
      created_at: order.created_at,
    };

    this._paymentService.verifyPaymentSignature(response, orderData, 'customer').subscribe({
      next: (response) => {
        if (response.verified) {
          this.saveBooking(response.transaction);
        } else {
          this._toastr.error('Payment verification failed');
        }
      },
      error: (err) => this._toastr.error('Server verification failed.')
    })
  }

  /**
   * Prepares the selected service and sub-service data for price calculation.
   * @param data - List of selected services and their sub-services
   * @returns Array formatted for backend pricing request
   */
  private _prepareDataForPriceBreakup(data: SelectedServiceType[]): IPriceBreakup[] {
    return data
      .filter(item => item.subService?.length)
      .map(item => ({
        serviceId: item.id,
        subServiceIds: item.subService.map(sub => sub.id)
      }));
  }

  /**
   * Calls the service to fetch the price breakdown for selected services.
   * @param data - The service and sub-service ID list for pricing
   */
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

  /**
   * Verifies that all essential data is available to proceed with booking.
   * @returns True if all required fields are properly set
   */
  private _isAllDataAvailable(): boolean {
    return (
      !!this.priceBreakup.total &&
      this.selectedServiceData.length > 0 &&
      !!this.providerId &&
      !!this.selectedSlot &&
      !!this._isValidLocation(this.location)
    );
  }

  /**
   * Validates the user's selected location.
   * @param location - Location object to validate
   * @returns True if the location has a non-empty address and valid coordinates
   */
  private _isValidLocation(location: Omit<IAddress, "type"> | null): boolean {
    return !!location && location.address !== '' && Array.isArray(location.coordinates);
  }
}
