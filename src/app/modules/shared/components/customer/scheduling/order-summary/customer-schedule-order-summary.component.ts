import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedServiceIdsType, SelectedServiceType } from '../../../../../pages/customer/booking-1-pick-service/customer-pick-a-service.component';
import { CustomerBookingService } from '../../../../../../core/services/booking.service';
import { CustomerLocationType, IBookingData, IPriceBreakup, IPriceBreakupData } from '../../../../../../core/models/booking.model';
import { NotificationService } from '../../../../../../core/services/public/notification.service';
import { ISlotSource } from '../../../../../../core/models/schedules.model';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../../../core/services/public/alert.service';

@Component({
  selector: 'app-customer-schedule-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-schedule-order-summary.component.html',
})
export class CustomerScheduleOrderSummaryComponent implements OnInit, OnDestroy {
  private readonly _bookingService = inject(CustomerBookingService);
  private readonly _notyf = inject(NotificationService);
  private _route = inject(ActivatedRoute);
  private _alertService = inject(AlertService);

  private _subscriptions: Subscription[] = [];


  @Input({ required: true }) selectedServiceData: SelectedServiceType[] = [];

  providerId: string | null = null;
  priceBreakup: IPriceBreakupData = {
    subTotal: 0.00,
    tax: 0.00,
    visitingFee: 0.00,
    total: 0.00
  };
  location: CustomerLocationType | null = null;
  selectedSlot: ISlotSource | null = null;

  /**
    * Angular lifecycle hook that initializes component logic,
    * sets subscriptions to services and route, and fetches price breakdown.
    */
  ngOnInit() {
    const routeSub = this._route.paramMap.subscribe(params => {
      this.providerId = params.get('id');
    });

    const locationSub = this._bookingService.address$.subscribe(address => {
      this.location = address;
    });

    const slotSub = this._bookingService.slot$.subscribe(slotData => {
      this.selectedSlot = slotData;
    });

    this._subscriptions.push(routeSub, locationSub, slotSub);

    const priceData = this._prepareDataForPriceBreakup(this.selectedServiceData);
    this._fetchPriceBreakup(priceData);
  }

  /**
   * Confirms booking if all required data is valid.
   * Otherwise, displays an error notification.
   */
  confirmBooking() {
    if (!this._isAllDataAvailable()) {
      this._notyf.error('Incomplete booking information. Please check services, slot, or location.');
      return;
    }

    if (!this.location || this.location.address === '' || !Array.isArray(this.location.coordinates)) {
      this._notyf.error('Please select a location.');
      return;
    }

    const serviceIds: SelectedServiceIdsType[] = this.selectedServiceData.map(item => {
      return {
        id: item.id,
        selectedIds: item.subService.map(sub => sub.id)
      }
    })

    const bookingData: IBookingData = {
      providerId: this.providerId!,
      total: Number(this.priceBreakup.total.toFixed()),
      location: this.location,
      slotData: this.selectedSlot!,
      serviceIds
    };

    console.log(bookingData)
    this._bookingService.postBookingData(bookingData).subscribe({
      next: (success) => {
        if (success) {
          this._alertService.showToast('Service booked successfully!', 'success');
          localStorage.removeItem('selectedServiceData');
        } else {
          // TODO - write an alert confirm.
          console.log('Sorry, booking failed due to some technical issues. If occurs again contact the admin.')
          this._alertService.showToast('Sorry, booking failed due to some technical issues. If occurs again contact the admin.', 'error', 'center')

        }
      },
      error: (err) => {
        this._alertService.showToast(err, 'error');
        console.log(err)
      }
    })
  }

  /**
   * Angular lifecycle hook to clean up subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe());
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
      this._notyf.error('Cannot fetch price without services or provider.');
      return;
    }

    this._bookingService.fetchPriceBreakup(data).subscribe({
      next: (priceBreakup) => this.priceBreakup = priceBreakup,
      error: (err) => this._notyf.error(err)
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
  private _isValidLocation(location: CustomerLocationType | null): boolean {
    return !!location && location.address !== '' && Array.isArray(location.coordinates);
  }
}
