import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { API_KEY } from '../../../../../../environments/env';
import { MapboxMapComponent } from "../../../../partials/shared/map/map.component";
import { ISchedules, } from '../../../../../../core/models/schedules.model';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../../../../core/services/booking.service';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { map, Observable, switchMap } from 'rxjs';
import { ScheduleService } from '../../../../../../core/services/schedule.service';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectLocation, selectPhoneNumber } from '../../../../../../store/customer/customer.selector';
import { MapboxLocationService } from '../../../../../../core/services/public/location.service';
import { IAddress } from '../../../../../../core/models/user.model';

@Component({
  selector: 'app-customer-schedule-booking-details',
  standalone: true,
  imports: [CommonModule, MapboxMapComponent, FormsModule],
  templateUrl: './customer-schedule-booking-details.component.html',
  providers: [MapboxLocationService]
})
export class CustomerScheduleBookingDetailsComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _bookingService = inject(BookingService);
  private readonly _scheduleService = inject(ScheduleService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _store = inject(Store);
  private readonly _locationService = inject(MapboxLocationService);

  schedules$!: Observable<ISchedules[]>;

  mapVisible = false;
  center!: [number, number];
  selectedAddress: string | null = null;
  selectedDate: string = '';
  phoneNumber: string | null = null;
  selectedSlot: string = '';

  ngOnInit(): void {
    this.schedules$ = this._route.paramMap.pipe(
      map(params => params.get('id') ?? ''),
      switchMap(providerId =>
        this._scheduleService.fetchSchedules(providerId).pipe(
          map(response => response.data ?? [])
        )
      )
    );

    this._store.select(selectPhoneNumber).subscribe(phoneNumber => {
      if (phoneNumber) {
        this.phoneNumber = phoneNumber;
      }
    });

    this._store.select(selectLocation).subscribe(location => {
      if (location) {
        this.selectedAddress = location.address;
        this.center = location.coordinates;
        this._bookingService.setSelectedAddress(location);
      }
    });
  }

  getMonth(dateStr: string): string {
    return dateStr?.slice(0, 7);
  }

  toggleMap() {
    this.mapVisible = !this.mapVisible;
  }

  afterSlotSelection(slotId: string, dayId: string, scheduleId: string) {
    this.selectedSlot = slotId;
    this._bookingService.setSelectedSlot({
      slotId,
      dayId,
      month: this.getMonth(this.selectedDate),
      scheduleId
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
