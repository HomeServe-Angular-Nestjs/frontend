import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, map, } from 'rxjs';
import { MapboxMapComponent } from "../../../../partials/shared/map/map.component";
import { IAddress, } from '../../../../../../core/models/schedules.model';
import { BookingService } from '../../../../../../core/services/booking.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { selectLocation, selectPhoneNumber } from '../../../../../../store/customer/customer.selector';
import { LocationService } from '../../../../../../core/services/public/location.service';
import { ILocation } from '../../../../../../core/models/user.model';
import { SlotRuleService } from '../../../../../../core/services/slot-rule.service';
import { IAvailableSlot } from '../../../../../../core/models/slot-rule.model';
import { ReservationSocketService } from '../../../../../../core/services/socket-service/reservation-socket.service';

@Component({
  selector: 'app-customer-schedule-booking-details',
  standalone: true,
  imports: [CommonModule, MapboxMapComponent, FormsModule],
  templateUrl: './customer-schedule-booking-details.component.html',
  providers: [LocationService]
})
export class CustomerScheduleBookingDetailsComponent implements OnInit {
  private readonly _reservationService = inject(ReservationSocketService);
  private readonly _slotRuleService = inject(SlotRuleService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _locationService = inject(LocationService);
  private readonly _bookingService = inject(BookingService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _store = inject(Store);

  mapVisible = false;
  center!: [number, number];
  selectedAddress: string | null = null;
  selectedDate: string = '';
  phoneNumber: string | null = null;
  selectedSlot: IAvailableSlot | null = null;
  providerId: string = '';
  availableSlots: IAvailableSlot[] = [];

  readonly minDate = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this._route.paramMap.pipe(
      map(params => params.get('id') ?? '')
    ).subscribe(id => this.providerId = id);

    this._store.select(selectPhoneNumber).subscribe(phoneNumber => {
      if (phoneNumber) {
        this.phoneNumber = phoneNumber;
      }
    });

    this._store.select(selectLocation).subscribe(data => {
      if (data && data.coordinates && data.address) {
        this.selectedAddress = data.address;
        this.center = data.coordinates;

        const locationData: IAddress & Omit<ILocation, 'type'> = {
          address: data.address,
          coordinates: data.coordinates
        }

        this._bookingService.setSelectedAddress(locationData);
      }

      this._reservationService.informReservation$
        .pipe(
          distinctUntilChanged((prev, curr) =>
            prev?.from === curr?.from &&
            prev?.to === curr?.to &&
            prev?.date === curr?.date
          )
        )
        .subscribe(slot => {
          if (!slot) return;

          this.availableSlots = this.availableSlots.map(s => {
            const isSameSlot =
              s.from === slot.from &&
              s.to === slot.to &&
              this.selectedDate === slot.date;

            return isSameSlot
              ? { ...s, status: false }
              : s;
          });
        });

      this._slotRuleService._availableSlots$.subscribe(slots => this.availableSlots = slots)
    });
  }

  toggleMap() {
    this.mapVisible = !this.mapVisible;
  }

  getAvailableSlots() {
    if (!this.providerId.trim()) {
      this._toastr.error('Provider Id is missing.');
      return;
    }

    if (!this.selectedDate.trim()) {
      this._toastr.error('Please select a valid date.');
      return;
    }

    this._slotRuleService.fetchAvailableSlots(this.providerId, this.selectedDate);
  }

  selectSlot(slot: IAvailableSlot) {
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

  async onMapLocationChanged(newCenter: [number, number]) {
    this.center = newCenter;
    const [lng, lat] = newCenter;

    this._locationService.getAddressFromCoordinates(lng, lat).subscribe({
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
        this._toastr.error('Oops, something went wrong.');
      }
    });
  }
}
