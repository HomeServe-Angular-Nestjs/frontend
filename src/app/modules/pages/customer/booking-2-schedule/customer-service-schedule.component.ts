import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { CustomerScheduleBookingDetailsComponent } from "../../../shared/components/customer/scheduling/booking-details/customer-schedule-booking-details.component";
import { CustomerScheduleOrderSummaryComponent } from "../../../shared/components/customer/scheduling/order-summary/customer-schedule-order-summary.component";
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { ActivatedRoute, Router } from '@angular/router';
import { OfferedServicesService } from '../../../../core/services/service-management.service';
import { forkJoin, Observable } from 'rxjs';
import { IOfferedService, ISubService } from '../../../../core/models/offeredService.model';
import { NotificationService } from '../../../../core/services/public/notification.service';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';
import { SelectedServiceIdsType, SelectedServiceType } from '../booking-1-pick-service/customer-pick-a-service.component';
import { ISchedule } from '../../../../core/models/schedules.model';
import { Store } from '@ngrx/store';
import { selectAllSchedules } from '../../../../store/schedules/schedule.selector';
import { scheduleActions } from '../../../../store/schedules/schedule.action';

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
export class CustomerServiceScheduleComponent implements OnInit {
  private readonly _serviceOfferedServices = inject(OfferedServicesService);
  private readonly _notyf = inject(NotificationService);
  private _router = inject(Router);

  schedules$!: Observable<ISchedule[]> | null;
  providerId!: string | null;
  selectedServiceData: SelectedServiceType[] = [];
  preparedDataForCalculation: SelectedServiceIdsType[] = [];

  constructor(
    private store: Store,
    private readonly sharedDataService: SharedDataService,
    private route: ActivatedRoute
  ) {
    this.route.paramMap.subscribe(param => {
      this.providerId = param.get('id');
    });

    this.store.dispatch(scheduleActions.fetchSchedules({ providerId: this.providerId as string }));
    this.schedules$ = this.store.select(selectAllSchedules);
    this.preparedDataForCalculation = this.prepareTheDataForPriceCalculation(this.selectedServiceData);
  }

  ngOnInit(): void {
    this.selectedServiceData = this.sharedDataService.getSelectedServiceData();
    if (this.selectedServiceData.length <= 0) {
      this._notyf.error('Your cart is empty. Pick a service');
    }
  }

  fetchServices(serviceIds: string[]): void {
    const observables = serviceIds.map(id =>
      this._serviceOfferedServices.fetchSubservice(id)
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
