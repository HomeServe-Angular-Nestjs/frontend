import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerScheduleBookingDetailsComponent } from "../../../shared/components/customer/scheduling/booking-details/customer-schedule-booking-details.component";
import { CustomerScheduleOrderSummaryComponent } from "../../../shared/components/customer/scheduling/order-summary/customer-schedule-order-summary.component";
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { ActivatedRoute } from '@angular/router';
import { OfferedServicesService } from '../../../../core/services/service-management.service';
import { forkJoin } from 'rxjs';
import { IOfferedService, ISubService } from '../../../../core/models/offeredService.model';
import { NotificationService } from '../../../../core/services/public/notification.service';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';
import { SelectedServiceIdsType, SelectedServiceType } from '../booking-1-pick-service/customer-pick-a-service.component';

@Component({
  selector: 'app-customer-service-schedule',
  standalone: true,
  imports: [
    CommonModule,
    CustomerScheduleBookingDetailsComponent,
    CustomerScheduleOrderSummaryComponent,
    CustomerBreadcrumbsComponent
  ],
  templateUrl: './customer-service-schedule.component.html',
})
export class CustomerServiceScheduleComponent {
  private readonly serviceOfferedServices = inject(OfferedServicesService);
  private readonly notyf = inject(NotificationService);

  selectedServiceData: SelectedServiceType[] = [];
  preparedDataForCalculation: SelectedServiceIdsType[] = [];

  constructor(private readonly sharedDataService: SharedDataService) {
    this.selectedServiceData = this.sharedDataService.getSelectedServiceData();

    this.preparedDataForCalculation = this.prepareTheDataForPriceCalculation(this.selectedServiceData);
  }

  fetchServices(serviceIds: string[]): void {
    const observables = serviceIds.map(id =>
      this.serviceOfferedServices.fetchSubservice(id)
    );

    // forkJoin(observables).subscribe({
    //   next: (services) => {
    //     this.serviceData = services
    //   },
    //   error: (err) => this.notyf.error(err)
    // });
  }

  private prepareTheDataForPriceCalculation(data: SelectedServiceType[]): SelectedServiceIdsType[] {
    return this.selectedServiceData.map(item => ({
      id: item.id,
      selectedIds: item.subService.map(s => s.id)
    }));
  }
}
