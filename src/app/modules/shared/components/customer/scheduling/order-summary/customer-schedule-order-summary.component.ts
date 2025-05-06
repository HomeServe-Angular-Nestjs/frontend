import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedServiceType } from '../../../../../pages/customer/booking-1-pick-service/customer-pick-a-service.component';
import { CustomerBookingService } from '../../../../../../core/services/booking.service';
import { IPriceBreakup, IPriceBreakupData } from '../../../../../../core/models/booking.model';
import { NotificationService } from '../../../../../../core/services/public/notification.service';

@Component({
  selector: 'app-customer-schedule-order-summary',
  standalone: true,
  imports: [CommonModule],
  providers: [CustomerBookingService],
  templateUrl: './customer-schedule-order-summary.component.html',
})
export class CustomerScheduleOrderSummaryComponent implements OnInit {
  private readonly _bookingService = inject(CustomerBookingService);
  private readonly _notyf = inject(NotificationService);

  @Input({ required: true }) selectedServiceData: SelectedServiceType[] = [];

  priceBreakup: IPriceBreakupData = {
    subTotal: 0.00,
    tax: 0.00,
    visitingFee: 0.00,
    total: 0.00
  };

  ngOnInit() {
    const preparedDataForThePriceBreakup = this._prepareDataForPriceBreakup(this.selectedServiceData);
    this._fetchPriceBreakup(preparedDataForThePriceBreakup);
  }

  private _prepareDataForPriceBreakup(data: SelectedServiceType[]): IPriceBreakup[] {
    return data
      .filter(item => item.subService?.length)
      .map(item => ({
        serviceId: item.id,
        subServiceIds: item.subService.map(sub => sub.id)
      }));
  }

  private _fetchPriceBreakup(data: IPriceBreakup[]) {
    this._bookingService.fetchPriceBreakup(data).subscribe({
      next: (priceBreakup) => this.priceBreakup = priceBreakup,
      error: (err) => this._notyf.error(err)
    })
  }
}
