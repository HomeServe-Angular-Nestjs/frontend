import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { API_KEY } from '../../../../../../environments/api.environments';
import { MapboxMapComponent } from "../../../../partials/shared/map/map.component";
import { ISchedule, ISlotData } from '../../../../../../core/models/schedules.model';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../../../core/services/public/notification.service';
import { OtpService } from '../../../../../../core/services/public/otp.service';
import { BookingService } from '../../../../../../core/services/booking.service';
import { CustomerLocationType } from '../../../../../../core/models/booking.model';

@Component({
  selector: 'app-customer-schedule-booking-details',
  standalone: true,
  imports: [CommonModule, MapboxMapComponent, FormsModule],
  templateUrl: './customer-schedule-booking-details.component.html',
  providers: [OtpService]
})
export class CustomerScheduleBookingDetailsComponent {
  private readonly _notyf = inject(NotificationService);
  private readonly _otpService = inject(OtpService);
  private readonly _bookingService = inject(BookingService)

  @Input({ required: true }) schedules!: ISchedule[] | null;

  mapVisible = false;
  center: [number, number] = [76.9560, 8.5010];
  zoom = 12;
  selectedAddress: string | null = null;
  selectedDate: string = '';
  slotData: ISlotData = { scheduleId: '', slots: [] };
  selectedSlot: string | null = null;

  readonly mapboxToken = API_KEY.mapbox;

  phoneNumber: number | null = null;

  toggleMap() {
    this.mapVisible = !this.mapVisible;
  }

  handleDateChange() {
    const formattedDate = new Date(this.selectedDate).toDateString();
    const matchedSchedule = this.schedules?.find(
      (schedule: ISchedule) => schedule.scheduleDate === formattedDate
    );

    if (matchedSchedule) {
      this.slotData = {
        scheduleId: matchedSchedule.id,
        slots: matchedSchedule.slots
      };
    }
  }

  selectSlot(slotId: string, scheduleId: string) {
    this.selectedSlot = slotId;
    this._bookingService.setSelectedSlot({ slotId, scheduleId });
  }

  isSelectedSlot(slotId: string): boolean {
    return this.selectedSlot === slotId;
  }

  sendOtp() {
    if (this.phoneNumber && this.phoneNumber.toString().length === 10) {
      this._otpService.sendOtpToPhone(this.phoneNumber).subscribe({
        next: (isSent) => {
          console.log(isSent)
        },
        error: (err) => {
          this._notyf.error(err);
        }
      })
    } else {
      this._notyf.error('Invalid phone number');
    }
  }

  async onMapLocationChanged(newCenter: [number, number]) {
    this.center = newCenter;
    const [lng, lat] = newCenter;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxToken}`
    );
    const data = await response.json();
    this.selectedAddress = data.features[0]?.place_name || 'No address found';

    const location: CustomerLocationType = {
      address: this.selectedAddress ?? '',
      coordinates: this.center,
    }
    this._bookingService.setSelectedAddress(location);
  }
}
