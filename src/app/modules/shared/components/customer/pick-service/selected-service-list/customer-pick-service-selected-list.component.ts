import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedServiceType } from '../../../../../pages/customer/booking-1-pick-service/customer-pick-a-service.component';
import { SelectedServiceIdType } from '../service-list/customer-pick-service-list.component';

@Component({
  selector: 'app-customer-pick-service-selected-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-pick-service-selected-list.component.html',
})
export class CustomerServiceSelectedListComponent {
  @Input({ required: true }) purchasedServiceList: SelectedServiceType[] = [];
  @Output() serviceRemoveFromListEvent = new EventEmitter<SelectedServiceIdType>();
  @Output() scheduleEvent = new EventEmitter<boolean>();

  removeFromSelectedList(data: SelectedServiceIdType): void {
    this.serviceRemoveFromListEvent.emit(data);
  }

  triggerSchedule(): void {
    this.scheduleEvent.emit(true);
  }
} 
