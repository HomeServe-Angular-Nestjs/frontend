import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISubService } from '../../../../../../core/models/offeredService.model';

@Component({
  selector: 'app-customer-pick-service-selected-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-pick-service-selected-list.component.html',
})
export class CustomerServiceSelectedListComponent {
  @Input({ required: true }) purchasedServiceList: ISubService[] = [];
  @Output() serviceRemoveFromListEvent = new EventEmitter<string>();


  removeFromSelectedList(id: string): void {
    this.serviceRemoveFromListEvent.emit(id);
  }
} 
