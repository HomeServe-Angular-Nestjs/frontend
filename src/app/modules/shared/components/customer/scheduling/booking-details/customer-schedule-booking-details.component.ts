import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, filter, map, Subject, takeUntil, tap, } from 'rxjs';
import { BookingService } from '../../../../../../core/services/booking.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { selectCustomer, selectLocation, selectPhoneNumber } from '../../../../../../store/customer/customer.selector';
import { LocationService } from '../../../../../../core/services/public/location.service';
import { ILocationData } from '../../../../../../core/models/user.model';
import { SlotRuleService } from '../../../../../../core/services/slot-rule.service';
import { ReservationSocketService } from '../../../../../../core/services/socket-service/reservation-socket.service';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { ISlotUI } from '../../../../../../core/models/availability.model';
import { MeridiemPipe } from '../../../../../../core/pipes/meridiem-time.pipe';

@Component({
  selector: 'app-customer-schedule-booking-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MeridiemPipe],
  templateUrl: './customer-schedule-booking-details.component.html',
  providers: [LocationService]
})
export class CustomerScheduleBookingDetailsComponent implements OnInit, OnDestroy {
  private readonly _router = inject(Router);
  private readonly _reservationService = inject(ReservationSocketService);
  private readonly _slotRuleService = inject(SlotRuleService);
  private readonly _providerService = inject(ProviderService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _locationService = inject(LocationService);
  private readonly _bookingService = inject(BookingService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _store = inject(Store);
  private readonly _destroy$ = new Subject<void>();

  selectedAddress: string | null = null;
  selectedDate: string = '';
  phoneNumber: string | null = null;
  fullName: string | null = null;
  email: string | null = null;
  selectedSlot: ISlotUI | null = null;
  providerId: string = '';
  availableSlots: ISlotUI[] = [];

  readonly minDate = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this._initProviderId();
    this._initPhoneNumber();
    this._initCustomerDetails();
    this._initLocation();
  }

  getAvailableSlots() {
    this.selectedSlot = null;

    if (!this.providerId) {
      this._toastr.error('Provider Id is missing.');
      return;
    }

    if (!this.selectedDate) {
      this._toastr.error('Please select a valid date.');
      return;
    }

    this._providerService.fetchAvailableSlots(this.providerId, this.selectedDate)
      .pipe(
        takeUntil(this._destroy$),
        map((res) => {
          const slots: ISlotUI[] = Array.isArray(res) ? res : (res.data || []);
          return slots.map(s => ({ ...s, isAvailable: true }));
        }),
        tap(slots => this.availableSlots = slots)
      ).subscribe();
  }

  selectSlot(slot: ISlotUI) {
    if (!this.selectedDate) {
      this._toastr.error('Date is missing.');
      return;
    }

    this.selectedSlot = slot;

    this._bookingService.setSelectedSlot({
      ...slot,
      date: this.selectedDate
    });
  }

  navigateToProfile() {
    this._router.navigate(['/profile']);
  }

  /* -------------------- Route -------------------- */

  private _initProviderId(): void {
    this._route.paramMap
      .pipe(
        takeUntil(this._destroy$),
        map(params => params.get('id')),
        filter((id): id is string => !!id),
        distinctUntilChanged()
      )
      .subscribe(id => {
        this.providerId = id;
      });
  }

  /* -------------------- Customer Details -------------------- */

  private _initCustomerDetails(): void {
    this._store.select(selectCustomer)
      .pipe(
        takeUntil(this._destroy$),
        filter(customer => !!customer),
        distinctUntilChanged()
      )
      .subscribe(customer => {
        this.fullName = customer?.fullname ?? null;
        this.email = customer?.email ?? null;
      });
  }

  /* -------------------- Phone -------------------- */

  private _initPhoneNumber(): void {
    this._store.select(selectPhoneNumber)
      .pipe(
        takeUntil(this._destroy$),
        filter((phone): phone is string => !!phone),
        distinctUntilChanged()
      )
      .subscribe(phone => {
        this.phoneNumber = phone;
        this._bookingService.setSelectedPhoneNumber(phone);
      });
  }

  /* -------------------- Location -------------------- */

  private _initLocation(): void {
    this._store.select(selectLocation)
      .pipe(
        takeUntil(this._destroy$),
        filter((data): data is ILocationData => data !== null),
        distinctUntilChanged((prev, curr) =>
          prev.address === curr.address &&
          prev.coordinates[0] === curr.coordinates[0] &&
          prev.coordinates[1] === curr.coordinates[1]
        ),
        tap(({ address, coordinates }) => {
          this.selectedAddress = address;

          this._bookingService.setSelectedAddress({
            address,
            coordinates
          });
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
