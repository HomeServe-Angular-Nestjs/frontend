import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, filter, map, Subject, takeUntil, tap, } from 'rxjs';
import { MapboxMapComponent } from "../../../../partials/shared/map/map.component";
import { BookingService } from '../../../../../../core/services/booking.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { selectLocation, selectPhoneNumber } from '../../../../../../store/customer/customer.selector';
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
  imports: [CommonModule, MapboxMapComponent, FormsModule, MeridiemPipe],
  templateUrl: './customer-schedule-booking-details.component.html',
  providers: [LocationService]
})
export class CustomerScheduleBookingDetailsComponent implements OnInit, OnDestroy {
  private readonly _reservationService = inject(ReservationSocketService);
  private readonly _slotRuleService = inject(SlotRuleService);
  private readonly _providerService = inject(ProviderService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _locationService = inject(LocationService);
  private readonly _bookingService = inject(BookingService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _store = inject(Store);
  private readonly _destroy$ = new Subject<void>();

  mapVisible = signal<boolean>(false);
  loadingLocation = signal<boolean>(false);
  center!: [number, number];
  selectedAddress: string | null = null;
  selectedDate: string = '';
  phoneNumber: string | null = null;
  selectedSlot: ISlotUI | null = null;
  providerId: string = '';
  availableSlots: ISlotUI[] = [];

  readonly minDate = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this._initProviderId();
    this._initPhoneNumber();
    this._initLocation();
    this._initReservationListener();
    this._initAvailableSlots();
  }

  toggleMap() {
    if (this.loadingLocation()) {
      return;
    }

    if (this.mapVisible()) {
      this.mapVisible.set(false);
      return;
    }

    if (this.center) {
      this.mapVisible.set(true);
      return;
    }

    this.loadingLocation.set(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.center = [coords.longitude, coords.latitude];

        this.loadingLocation.set(false);
        this.mapVisible.set(true);
      },
      (err) => {
        console.error(err);
        this.loadingLocation.set(false);
        this._toastr.error('Unable to access the location.');
      }
    );
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

  onPhoneNumberChange(phone: string) {
    if (phone.trim().length !== 10) return;

    if (isNaN(Number(phone))) {
      this._toastr.error('Please enter a valid phone number.');
      return;
    }

    this.phoneNumber = phone;
    this._bookingService.setSelectedPhoneNumber(this.phoneNumber);
  }

  async onMapLocationChanged(newCenter: [number, number]) {
    this.center = newCenter;
    const [lng, lat] = newCenter;

    this._locationService.getAddressFromCoordinates(lng, lat)
      .pipe()
      .subscribe({
        next: (response) => {
          this.selectedAddress = response.features[0]?.place_name;

          if (!this.selectedAddress) {
            this._toastr.success('Address not found.');
            return;
          }

          const location = {
            address: this.selectedAddress ?? '',
            coordinates: this.center,
          }

          this._bookingService.setSelectedAddress(location);
        },
        error: (err) => {
          console.error(err);
          this._toastr.error('Failed to fetch coordinates.');
        }
      });
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
          this.center = coordinates;

          this._bookingService.setSelectedAddress({
            address,
            coordinates
          });
        })
      )
      .subscribe();
  }

  /* -------------------- Reservation -------------------- */

  private _initReservationListener(): void {
    // this._reservationService.informReservation$
    //   .pipe(
    //     takeUntil(this._destroy$),
    //     distinctUntilChanged((prev, curr) =>
    //       prev?.from === curr?.from &&
    //       prev?.to === curr?.to &&
    //       prev?.date === curr?.date
    //     ),
    //     filter(Boolean)
    //   )
    //   .subscribe(slot => {
    //     this.availableSlots = this.availableSlots.map(s => {
    //       const isSameSlot =
    //         s.from === slot.from &&
    //         s.to === slot.to &&
    //         this.selectedDate === slot.date;

    //       return isSameSlot ? { ...s, status: false } : s;
    //     });
    //   });
  }

  /* -------------------- Slots -------------------- */

  private _initAvailableSlots(): void {
    // this._slotRuleService._availableSlots$
    //   .pipe(takeUntil(this._destroy$))
    //   .subscribe(slots => {
    //     this.availableSlots = slots;
    // });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
