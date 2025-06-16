import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { API_KEY } from '../../../../../../environments/api.environments';
import { MapboxMapComponent } from "../../../../partials/shared/map/map.component";
import { ISchedules, } from '../../../../../../core/models/schedules.model';
import { FormsModule } from '@angular/forms';
import { OtpService } from '../../../../../../core/services/public/otp.service';
import { BookingService } from '../../../../../../core/services/booking.service';
import { CustomerLocationType } from '../../../../../../core/models/booking.model';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { map, Observable, switchMap } from 'rxjs';
import { ScheduleService } from '../../../../../../core/services/schedule.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-customer-schedule-booking-details',
  standalone: true,
  imports: [CommonModule, MapboxMapComponent, FormsModule],
  templateUrl: './customer-schedule-booking-details.component.html',
  providers: [OtpService]
})
export class CustomerScheduleBookingDetailsComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _bookingService = inject(BookingService);
  private readonly _scheduleService = inject(ScheduleService);
  private readonly _toastr = inject(ToastNotificationService);

  readonly mapboxToken = API_KEY.mapbox;

  schedules$!: Observable<ISchedules[]>;

  mapVisible = false;
  center: [number, number] = [76.9560, 8.5010];
  zoom = 12;
  selectedAddress: string | null = null;
  selectedDate: string = '';
  phoneNumber: string | null = null;

  ngOnInit(): void {
    this.schedules$ = this._route.paramMap.pipe(
      map(params => params.get('id') ?? ''),
      switchMap(providerId =>
        this._scheduleService.fetchSchedules(providerId).pipe(
          map(response => response.data ?? [])
        )
      )
    );
  }

  getMonth(dateStr: string): string {
    return dateStr?.slice(0, 7);
  }

  toggleMap() {
    this.mapVisible = !this.mapVisible;
  }

  afterSlotSelection(slotId: string, dayId: string, scheduleId: string) {
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

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxToken}`
    );

    const data = await response.json();
    this.selectedAddress = data.features[0]?.place_name || 'No address found';

    if (!this.selectedAddress) {
      this._toastr.success('Address not found.');
      return;
    }

    const location: CustomerLocationType = {
      address: this.selectedAddress ?? '',
      coordinates: this.center,
      phone: this.phoneNumber ?? ''
    }

    this._bookingService.setSelectedAddress(location);
  }
}
