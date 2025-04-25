import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOfferedService, ISubService } from '../../../../../../core/models/offeredService.model';
import { SelectedServiceType } from '../../../../../pages/customer/booking-1-pick-service/customer-pick-a-service.component';

@Component({
  selector: 'app-customer-schedule-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-schedule-order-summary.component.html',
})
export class CustomerScheduleOrderSummaryComponent {
  @Input({ required: true }) selectedServiceData: SelectedServiceType[] = []
}
