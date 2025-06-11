import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';
import { ISchedule } from '../../../../core/models/schedules.model';
import { CustomerScheduleBookingDetailsComponent } from "../../../shared/components/customer/scheduling/booking-details/customer-schedule-booking-details.component";
import { CustomerScheduleOrderSummaryComponent } from "../../../shared/components/customer/scheduling/order-summary/customer-schedule-order-summary.component";
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { SelectedServiceIdsType, SelectedServiceType } from '../booking-1-pick-service/customer-pick-a-service.component';
import { selectAllSchedules } from '../../../../store/schedules/schedule.selector';
import { scheduleActions } from '../../../../store/schedules/schedule.action';
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';

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
  private readonly _toastr = inject(ToastNotificationService);
  private _router = inject(Router);

  schedules$!: Observable<ISchedule[]> | null;
  providerId!: string | null;
  selectedServiceData: SelectedServiceType[] = [];
  preparedDataForCalculation: SelectedServiceIdsType[] = [];

  constructor(
    private _store: Store,
    private _route: ActivatedRoute,
    private readonly _sharedDataService: SharedDataService,
  ) {
    // Extract provider ID from URL
    this._route.paramMap.subscribe(param => {
      this.providerId = param.get('id');

      if (this.providerId) {
        // Dispatch schedule fetch action only when provider ID is available
        this._store.dispatch(scheduleActions.fetchSchedules({ providerId: this.providerId }));
        this.schedules$ = this._store.select(selectAllSchedules);
      }
    });
  }

  /**
    * Angular lifecycle hook that runs after component is initialized.
    * It loads selected service data, validates the state, and prepares calculation data.
    */
  ngOnInit(): void {
    // Try fetching from shared data service
    this.selectedServiceData = this._sharedDataService.getSelectedServiceData();

    // If nothing in shared state, try localStorage
    if (this.selectedServiceData.length <= 0) {
      const savedData = localStorage.getItem('selectedServiceData');
      if (savedData) {
        try {
          this.selectedServiceData = JSON.parse(savedData);
        } catch (e) {
          console.error('Error parsing selectedServiceData from localStorage', e);
          localStorage.removeItem('selectedServiceData');
        }
      }
    }

    // If still empty, notify user and redirect
    if (this.selectedServiceData.length <= 0) {
      this._toastr.error('Your cart is empty. Pick a service');
      this._router.navigate(['homepage']);
      return;
    }

    // Persist data for session continuity
    localStorage.setItem('selectedServiceData', JSON.stringify(this.selectedServiceData));

    // Prepare data structure needed for calculation
    this.preparedDataForCalculation = this.prepareTheDataForPriceCalculation(this.selectedServiceData);
  }

  /**
    * Transforms selected service data into a simplified ID structure
    * for downstream calculations (pricing, scheduling).
    * 
    * @param data Array of selected services
    * @returns Array of objects containing service ID and associated sub-service IDs
    */
  private prepareTheDataForPriceCalculation(data: SelectedServiceType[]): SelectedServiceIdsType[] {
    return data.map(item => ({
      id: item.id,
      selectedIds: item.subService.map(s => s.id)
    }));
  }
}
