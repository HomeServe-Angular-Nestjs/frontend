import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISubService } from '../../../../../../core/models/offeredService.model';

@Component({
  selector: 'app-customer-pick-service-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-pick-service-list.component.html',
})
export class CustomerPickServiceListComponent {
  @Input({ required: true }) selectedServices: ISubService[] = [];
  @Output() serviceSelectEvent = new EventEmitter<string>();


  addService(id: string): void {
    this.serviceSelectEvent.emit(id);
  }
}
