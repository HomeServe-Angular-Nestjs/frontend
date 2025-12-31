import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';
import { ISchedule } from '../../../../core/models/schedules.model';
import { CustomerScheduleBookingDetailsComponent } from "../../../shared/components/customer/scheduling/booking-details/customer-schedule-booking-details.component";
import { CustomerScheduleOrderSummaryComponent } from "../../../shared/components/customer/scheduling/order-summary/customer-schedule-order-summary.component";
import { SelectedServiceIdsType, SelectedServiceType } from '../../../../core/models/cart.model';
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';
import { ReservationSocketService } from '../../../../core/services/socket-service/reservation-socket.service';
import { CartService } from '../../../../core/services/cart.service';
import { IProviderService } from '../../../../core/models/provider-service.model';

@Component({
  selector: 'app-customer-service-schedule',
  standalone: true,
  imports: [
    CommonModule,
    CustomerScheduleBookingDetailsComponent,
    CustomerScheduleOrderSummaryComponent,
  ],
  templateUrl: './customer-service-schedule.component.html',
})
export class CustomerServiceScheduleComponent implements OnInit, OnDestroy {
  private readonly _reservationService = inject(ReservationSocketService);
  private readonly _sharedDataService = inject(SharedDataService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _cartService = inject(CartService);
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

    // If nothing in shared state, fetch from CartService
    if (this.selectedServiceData.length <= 0) {
      this._cartService.getCart()
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this.selectedServiceData = this._processCartData(res.data.items);
              if (this.selectedServiceData.length > 0) {
                this.preparedDataForCalculation = this.prepareTheDataForPriceCalculation(this.selectedServiceData);
              } else {
                this._handleEmptyCart();
              }
            } else {
              this._handleEmptyCart();
            }
          },
          error: () => this._handleEmptyCart()
        });
    } else {
      // Prepare data structure needed for calculation
      this.preparedDataForCalculation = this.prepareTheDataForPriceCalculation(this.selectedServiceData);
    }
  }

  private _processCartData(items: IProviderService[]): SelectedServiceType[] {
    const categoryMap = new Map<string, SelectedServiceType>();
    items.forEach(service => {
      if (!categoryMap.has(service.category.id)) {
        categoryMap.set(service.category.id, {
          id: service.category.id,
          name: service.category.name,
          services: [service]
        });
      } else {
        categoryMap.get(service.category.id)?.services.push(service);
      }
    });
    return Array.from(categoryMap.values());
  }

  private _handleEmptyCart() {
    this._toastr.error('Your cart is empty. Pick a service');
    this._router.navigate(['homepage']);
  }


  private prepareTheDataForPriceCalculation(data: SelectedServiceType[]): SelectedServiceIdsType[] {
    return data.map(item => ({
      id: item.id,
      selectedIds: item.services.map(s => s.id)
    }));
  }

  ngOnDestroy(): void {
    if (this._lastJoinedId) {
      this._reservationService.onLeaveProviderRoom(this._lastJoinedId);
      this._lastJoinedId = null;
    }

    this._destroy$.next();
    this._destroy$.complete();
  }
}
