import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';
import { ISchedule } from '../../../../core/models/schedules.model';
import { CustomerScheduleBookingDetailsComponent } from "../../../shared/components/customer/scheduling/booking-details/customer-schedule-booking-details.component";
import { CustomerScheduleOrderSummaryComponent } from "../../../shared/components/customer/scheduling/order-summary/customer-schedule-order-summary.component";
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { SelectedServiceIdsType, SelectedServiceType } from '../booking-1-pick-service/customer-pick-a-service.component';
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';
import { ReservationSocketService } from '../../../../core/services/socket-service/reservation-socket.service';

@Component({
  selector: 'app-customer-service-schedule',
  standalone: true,
  imports: [
    CommonModule,
    CustomerScheduleBookingDetailsComponent,
    CustomerScheduleOrderSummaryComponent,
    CustomerBreadcrumbsComponent,
  ],
  templateUrl: './customer-service-schedule.component.html',
})
export class CustomerServiceScheduleComponent implements OnInit, OnDestroy {
  private readonly _reservationService = inject(ReservationSocketService);
  private readonly _sharedDataService = inject(SharedDataService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  private readonly _destroy$ = new Subject<void>();
  private _lastJoinedId: string | null = null;
  schedules$!: Observable<ISchedule[]> | null;
  selectedServiceData: SelectedServiceType[] = [];
  preparedDataForCalculation: SelectedServiceIdsType[] = [];
  providerId$ = new BehaviorSubject<string | null>(null);

  // It loads selected service data, validates the state, and prepares calculation data.
  ngOnInit(): void {
    this._route.paramMap
      .pipe(takeUntil(this._destroy$))
      .subscribe(paramMap => {
        const id = paramMap.get('id');
        if (id) {
          this.providerId$.next(id);
        } else {
          this.providerId$.next(null);
        }
      });

    this.providerId$
      .pipe(takeUntil(this._destroy$))
      .subscribe(id => {
        if (id) {
          if (this._lastJoinedId && this._lastJoinedId !== id) {
            this._reservationService.onLeaveProviderRoom(this._lastJoinedId);
          }

          this._reservationService.onJoinProviderRoom(id);
          this._lastJoinedId = id;
        } else if (this._lastJoinedId) {
          this._reservationService.onLeaveProviderRoom(this._lastJoinedId);
          this._lastJoinedId = null;
        }
      });


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

  ngOnDestroy(): void {
    if (this._lastJoinedId) {
      this._reservationService.onLeaveProviderRoom(this._lastJoinedId);
      this._lastJoinedId = null;
    }
    
    this._destroy$.next();
    this._destroy$.complete();
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
