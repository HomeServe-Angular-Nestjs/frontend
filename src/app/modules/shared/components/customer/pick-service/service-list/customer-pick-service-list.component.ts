import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedServiceType } from '../../../../../pages/customer/booking-1-pick-service/customer-pick-a-service.component';

export type SelectedServiceIdType = { id: string, selectedId: string }

@Component({
  selector: 'app-customer-pick-service-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-pick-service-list.component.html',
})
export class CustomerPickServiceListComponent {
  @Input({ required: true }) selectedServices!: SelectedServiceType;
  @Output() serviceSelectEvent = new EventEmitter<SelectedServiceIdType>();


  addService(data: SelectedServiceIdType): void {
    this.serviceSelectEvent.emit(data);
  }
}
